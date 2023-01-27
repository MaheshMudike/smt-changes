import { EntityType } from '../../constants/EntityType';

import { ModalType } from '../../constants/modalTypes';
import { ServiceOrderType, maintenanceActivityTypeFilterDescription } from '../../constants/ServiceOrderType';
import { joinOptionals } from '../../utils/formatUtils';
import  translate, { translateOrDefault } from '../../utils/translate';
import { IWorkOrder, IWorkOrderWithContractLineItems, IHistory, IWorkOrderForListItem, IApiNameAndId, WorkOrderForServiceOrdersReport, IWorkOrderForListItemAsset, WorkOrderForField } from '../api/coreApi';
import { conditions } from '../../actions/http/jsforceMappings';
import * as _ from 'lodash';
import { parseDateToTimestamp } from '../../utils/parse';
import { SalesforceFeedItem, SalesforceListItem } from './SalesForceListItem';
import * as moment from 'moment';
import { CalloutTaskStatus } from './CalloutTaskStatus';
import { queryWorkordersWithServiceAppointments, queryWorkOrderContractLines, queryMapWorkOrders } from '../../actions/http/jsforce';
import { queryWorkOrders } from '../../actions/http/jsforceBase';
import { multiQuery1Extract } from '../../actions/http/jsforceCore';
import { LocatableMapMarker } from '../map/Locatable';
import { equipmentAddress } from '../equipment/Equipment';
import { serviceOrderMarker, transparentMarker } from 'src/containers/pages/markers';
import { WorkOrderMapItem } from '../map/wrappers';
import { IWithLastModification } from './IWithLastModification';
import { ISalesForceEventSource } from './ISObject';
import { IAccountWithType } from '../plan/IPlanCustomerVisitState';
import { IDetailModal } from '../list/IListItem';
import normalizeNameAndId from 'src/services/SalesForce/normalizeNameAndId';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { IGlobalState, activeInFSMFromState } from '../globalState';
import { SMTNotesIconFun } from 'src/components/overview/WorkorderNoteIcon';

export function getCalloutTaskStatus(text: string) {
    const enumObject: _.Dictionary<CalloutTaskStatus> = CalloutTaskStatus as any;
    return enumObject[_.upperFirst(_.camelCase(text))] || CalloutTaskStatus.NonClosable;
}

export function serviceAppointment(value: IWorkOrder) {
    const openServiceAppointments = value.serviceAppointments ? 
        value.serviceAppointments.filter(conditions.ServiceAppointment.open.isFullfilledBy) : [];
    return openServiceAppointments.length > 0 ? openServiceAppointments[0] : null;
}

export function newStatusTime(histories: IHistory[]) {
    //New is the API name of Created/New
    if(histories == null) return null;
    const newHistories = histories.filter(h => h.NewValue === 'New');
    return newHistories.length > 0 && newHistories[0].CreatedDate;
}

function siteName(value: IWorkOrderForListItem) {
    return value.OO_Asset_Site__c || value.Location && value.Location.Name;
}

function konectStatusTranslation(konectStatus: string) {
    if(konectStatus == null) return null;
    return translate('service-order-konect-status.' + konectStatus);
}

export const queryWorkOrderDetails = 
    (ids: string[], entityFieldsData: EntityFieldsData, completedMbmsbAfterServiceNeedCreated: IWorkOrderForListItem[] = []) => 
        multiQuery1Extract(queryWorkOrders([conditions.SObject.ids(ids)]))
        .then(wos => queryWorkordersWithServiceAppointments(wos))
        .then(wos => queryWorkOrderContractLines(wos))
        .then(wos => wos.map(wo => new Callout(wo, entityFieldsData, completedMbmsbAfterServiceNeedCreated)))

export const queryWorkOrderDetail = (id: string, entityFieldsData: EntityFieldsData, completedMbmsbAfterServiceNeedCreated: IWorkOrderForListItem[] = []) => 
    queryWorkOrderDetails([id], entityFieldsData, completedMbmsbAfterServiceNeedCreated).then(wos => wos[0])

export function workorderNumer(activeInFSM: boolean, workOrder: { Service_Order_Number__c: string, WorkOrderNumber: string }) {
    return activeInFSM ? workOrder.WorkOrderNumber : workOrder.Service_Order_Number__c;
}

export class WorkOrderField implements IDetailModal<Callout> {
    constructor(public value: WorkOrderForField, private entityFieldsData: EntityFieldsData) {}

    get id() { return this.value.Id }

    get status() {
        return this.value.Status;
    }

    get konectStatus() {
        return konectStatusTranslation(this.value.Konect_Status__c);
    }

    get entityType() { return EntityType.Callout; }

    get modalType() {
        return ModalType.CalloutDetailsModal;
    }

    get completedByName() {
        return this.value.Completed_By__r && this.value.Completed_By__r.Name;
    }

    get reasonCode() {
        return this.value.Reason_Code__c;
    }

    get number() {
        return this.value && this.value.Service_Order_Number__c
        // return workorderNumer(this.entityFieldsData.activeInFSM, this.value);
    }

    get title() {
        //return '';
        return joinOptionals([joinOptionals([this.visitType, this.number], ' ', true), this.description], ' - ', true,);
    }

    get visitType(): string {
        return maintenanceActivityTypeFilterDescription(this.value.Maintenance_Activity_Type__c, this.value.Service_Order_Type__c);
    }

    get description() {
        return this.value.Description__c;
    }

    public queryDetails = () => queryWorkOrderDetail(this.id, this.entityFieldsData)
}

export function workOrderStatus(callout: { status: string, konectStatus: string }, activeInFSM: boolean) {
    if(activeInFSM || callout.konectStatus == null || callout.status == 'Finished' || callout.status == 'Completed') return callout.status;
    return callout.konectStatus;
}

export class CalloutListItem<T extends IWorkOrderForListItem> extends SalesforceListItem<T> {

    constructor(t: T, protected entityFieldsData: EntityFieldsData, public completedMbmsbAfterServiceNeedCreated: IWorkOrderForListItem[] = null) {
        super(t);
    }

    get title() {
        return joinOptionals([joinOptionals([this.visitType, this.number], ' ', true), this.description], ' - ', true,);
    }
/*
    get title() {
        return joinOptionals([joinOptionals([this.getEntityName(), this.number(getActiveInFSM())], ' ', true), this.siteName], ' - ', true,);
    }
*/
    bodyText(entityFieldsData: EntityFieldsData) {
        return joinOptionals([
            workOrderStatus(this, this.activeInFSM),
            this.assetListItem.Customer_Asset_Name__c, this.assemblyCode
        ], '|', true);
    }

    get bodySecondLine() {
        return joinOptionals([this.value.Asset && this.value.Asset.Name, equipmentAddress(this.assetListItem)]);
    }

    get buttons() {
        const hasNotes = this.notes != null && this.notes.Id != null;
        if(!hasNotes) return null;
        return SMTNotesIconFun({ item: this, workOrderId: this.id, className: 'container--horizontal button--flat button--fa button--flat--standard margin-left--small' });
    }

    get workOrderNumber() {
        return this.value.WorkOrderNumber;
    }

    get activeInFSM() {
        return this.entityFieldsData.activeInFSM;
    }

    get isHighPriority(): boolean {
        return conditions.WorkOrder.highPriority(this.activeInFSM).isFullfilledBy(this.value);
    }

    get maintenanceActivityType() {
        return this.value.Maintenance_Activity_Type__c;
    }

    get visitType(): string {
        return maintenanceActivityTypeFilterDescription(this.value.Maintenance_Activity_Type__c, this.value.Service_Order_Type__c);
    }

    //have tested and Assembly_SAP__c and Assembly__c have the same values for the codes present in the translation file
    get assemblyCodeDescription() {
        return this.value.Assembly_SAP__c == null ? '' : translateOrDefault('assembly-code.' + this.value.Assembly_SAP__c, this.value.Assembly_SAP__c);
    }

    get assemblyCode() {
        return this.value.Assembly_SAP__c;
    }

    get siteName() {
        return siteName(this.value);
    }

    get number() {
        return workorderNumer(this.activeInFSM, this.value);
    }

    get entityType() { return EntityType.Callout; }

    get accountApiForTitle() { return null as { Id: string; Name: string; }; }
    
    get modalType() {
        return ModalType.CalloutDetailsModal;
    }

    get description() {
        //looks like FSM is copying the case description to Description__c
        return this.value.Description__c;
            //this.value.Case && this.value.Case.Description ||                 
            //this.getCalloutItemValue(c => c.failureDesc)
            //|| this.getCalloutItemValue(c => c.Operation_Text__c);//mbm01ModuleDescription);
    }

    public queryDetails = () => queryWorkOrderDetail(this.id, this.entityFieldsData, this.completedMbmsbAfterServiceNeedCreated)

    get earliestStartDate() {
        return this.value.Earliest_Start_Date__c;
        //return this.serviceAppointment && this.serviceAppointment.EarliestStartTime;
    }

    get newStatusDateTime() {
        return this.value.New_Status_Date__c;//Histories && newStatusTime(this.value.Histories.records);        
    }

    get startDate() {
        return this.value.StartDate;        
    }

    get startDateMs() {
        return this.startDate == null ? 
            (this.value.CreatedDate == null ? null : new Date(this.value.CreatedDate).getTime()) 
            : new Date(this.startDate).getTime();
    }

    get assetListItem(): IWorkOrderForListItemAsset {
        return this.value.Asset || {
            Id: null as string,
            Name: null as string,
            Customer_Asset_Name__c: null,
            Installation_Street__c: null, 
            Installation_Zip_Postal_Code__c: null, 
            Installation_City__c: null,
            // Workcenter__c: null as string,
            Main_Work_Center__r: { Name : null as string },
        };
    }
    
    get workCenter() {
        return(this.value.Work_Center__r==undefined||this.value.Work_Center__r==null) ? null : this.value.Work_Center__r.Name
        // return (this.assetListItem.Main_Work_Center__r == undefined || this.assetListItem.Main_Work_Center__r == null) ? null : this.assetListItem.Main_Work_Center__r.Name;
    }

    get status() {
        return this.value.Status;
    }

    get konectStatus() {
        return konectStatusTranslation(this.value.Konect_Status__c);
    }

    /*
    get smtNotes() {
        return this.value.SMT_Notes__r && this.value.SMT_Notes__r.records && 
            this.value.SMT_Notes__r.records.length > 0 ? this.value.SMT_Notes__r.records[0] : null;
    }
    */

    get notes() {
        const userNotes = this.value.Notes && this.value.Notes.records && this.value.Notes.records.filter(n => n.OwnerId === this.entityFieldsData.userId) || [];
        return userNotes.length > 0 ? userNotes[0] : null;
    }
}

function operationCodesFromWorkOrderLineItemsSubQuery(workorderLineItems: { records: { Operation_Text__c: string }[] }) {
    if(workorderLineItems == null) return '';
    return operationCodesFromWorkOrderLineItems(workorderLineItems.records);
}

function operationCodesFromWorkOrderLineItems(records: { Operation_Text__c: string }[]) {
    return records.map(wol => {
        const parts = wol.Operation_Text__c == null ? [] : wol.Operation_Text__c.split(':');
        return parts.length > 1 ? parts[0] : null
    }).filter(p => p != null).join(" | ");
}

export class MbmListItem<T extends IWorkOrderForListItem> extends CalloutListItem<T> {

    constructor(t: T, entityFieldsData: EntityFieldsData, completedMbmsbAfterServiceNeedCreated: IWorkOrderForListItem[] = null, private operationCodes: { Operation_Text__c: string;}[]) {
        super(t, entityFieldsData, completedMbmsbAfterServiceNeedCreated);
    }

    get title() {
        //const codes = operationCodesFromWorkOrderLineItemsSubQuery(this.value.WorkOrderLineItems);
        const codes = operationCodesFromWorkOrderLineItems(this.operationCodes);
        return joinOptionals([joinOptionals([this.visitType, this.number], ' ', true), codes], ' - ', true,);
    }
}

interface IWorkOrderSupervisorWillManage {
    Supervisor_Will_Manage__c: boolean,
    Case: { FSM_Escalated_To__c: string }
}

export function svWillManage(value: IWorkOrderSupervisorWillManage, userId: string, activeInFSM: boolean) {
    if(!activeInFSM) return value.Supervisor_Will_Manage__c;
    return value.Case && conditions.Case.escalatedTo(userId).isFullfilledBy(value.Case);
}

export class CalloutFeedItem<T extends IWorkOrderForListItem & IWorkOrderSupervisorWillManage> extends SalesforceFeedItem<T, CalloutListItem<T>> {
    
    constructor(t: T, private entityFieldsData: EntityFieldsData) {
        super(new CalloutListItem(t, entityFieldsData));

        //this.isClosed = conditions.WorkOrder.closed(entityFieldsData.activeInFSM).isFullfilledBy(this.value);

        //https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/125982380/Display+My+Tasks+feed+-+Open+tasks
        /*
        Grouping - Service Orders
            Unplanned - new status time
            Planned - start date
        */
        //this.sortDate = this.value.Histories && newStatusTime(this.value.Histories.records);
        this.sortDate = this.value.New_Status_Date__c;
        this.svWillManage = svWillManage(this.value, this.entityFieldsData.userId, entityFieldsData.activeInFSM);
        this.isRejected = conditions.WorkOrder.rejected.isFullfilledBy(this.value);
    }

    get number() {
        return workorderNumer(this.entityFieldsData.activeInFSM, this.value);
    }

    /*
    get title() {
        return joinOptionals([joinOptionals([this.listItem.getEntityName(), this.value.Maintenance_Activity_Type__c, this.number(getActiveInFSM())], ' ', true), 
            siteName(this.listItem.value)], ' - ', true,);
    }
    */

    bodyText(entityFieldsData: EntityFieldsData) {
        return joinOptionals([
            entityFieldsData.activeInFSM ? this.listItem.status : this.listItem.konectStatus, 
            siteName(this.listItem.value), 
            this.listItem.value.Asset.Installation_City__c
        ], '|', true);
    }

    get bodySecondLine() {
        return joinOptionals([this.value.Asset && this.value.Asset.Name, equipmentAddress(this.assetListItem)]);
    }

    get assetListItem(): IWorkOrderForListItemAsset {
        return this.value.Asset || {
            Id: null as string,
            Name: null as string,
            Customer_Asset_Name__c: null,
            Installation_Street__c: null, 
            Installation_Zip_Postal_Code__c: null, 
            Installation_City__c: null,
            Main_Work_Center__r: { Name: null },
        };
    }

}

export class PlannedWorkorderFeedItem<T extends IWorkOrderForListItem & IWorkOrderSupervisorWillManage> extends CalloutFeedItem<T> {    
    constructor(t: T, entityFieldsData: EntityFieldsData) {
        super(t, entityFieldsData);
        this.sortDate = this.value.New_Status_Date__c;//StartDate;
        //this.sortDate = serviceAppointment(this.value) && serviceAppointment(this.value).EarliestStartTime;
    }
}


export class WorkOrderServiceOrderReport {

    // public workCenter: string;
    //public serviceOrderType: string;
    public startDate: string;
    public earliestStartDate: string;
    public isCallout: boolean;
    public maintenanceActivityType: string;
    public serviceOrderType: string;
    public id: string;
    public workCenter : IApiNameAndId;  
    public endDate: string;
    public createdDate: string;

    constructor(workOrder: WorkOrderForServiceOrdersReport) {
        // this.workCenter = workOrder.Asset && workOrder.Asset.Main_Work_Center__r && workOrder.Asset.Main_Work_Center__r.Name;
        this.startDate = workOrder.StartDate;
        this.earliestStartDate = workOrder.Earliest_Start_Date__c;
        //this.serviceOrderType =  workOrder.WorkType && workOrder.WorkType.Name;
        this.isCallout = conditions.WorkOrder.callout.isFullfilledBy(workOrder);
        this.maintenanceActivityType = workOrder.Maintenance_Activity_Type__c;
        this.serviceOrderType = workOrder.Service_Order_Type__c;
        this.id = workOrder.Id;
        this.endDate = workOrder.EndDate;
        this.createdDate = workOrder.CreatedDate;
        this.workCenter = workOrder.Work_Center__r;
    }
    
    get workcenter(){
        return (this.workCenter == undefined || this.workCenter == null) ? null : this.workCenter.Name
    }

}

export function coordinatesFromAsset(asset: { Geolocation__Latitude__s: number, Geolocation__Longitude__s: number }, entityType: EntityType) {
    return asset && asset.Geolocation__Latitude__s && asset.Geolocation__Longitude__s && {
        lat: asset.Geolocation__Latitude__s,
        lng: asset.Geolocation__Longitude__s,
        type: entityType
    };
}

class Callout extends CalloutListItem<IWorkOrderWithContractLineItems> implements ISalesForceEventSource, IWithLastModification, LocatableMapMarker {

    constructor(t: IWorkOrderWithContractLineItems, entityFieldsData: EntityFieldsData, completedMbmsbAfterServiceNeedCreated: IWorkOrderForListItem[] = []) {
        super(t, entityFieldsData, completedMbmsbAfterServiceNeedCreated);
    }

    get lastModifiedDate() {
        return parseDateToTimestamp(this.value.LastModifiedDate);
    }

    isClosed(activeInFSM: boolean) {
        return conditions.WorkOrder.closed(activeInFSM).isFullfilledBy(this.value);
    }

    get address() {
        const c = this.value.Address;
        return c == null ? null : joinOptionals([c.street, c.city, c.postalCode], ', ', true)        
    }

    get locationAddress() {
        return this.value.Location && [this.value.Location.Street__c, this.value.Location.Zip_Postal_Code__c, this.value.Location.City__c].join(', ');
    }

    //have tested and Assembly_SAP__c and Assembly__c have the same values for the codes present in the translation file
    get assemblyCodeDescription() {
        return this.value.Assembly_SAP__c == null ? '' : translateOrDefault('assembly-code.' + this.value.Assembly_SAP__c, this.value.Assembly_SAP__c);
    }

    get assemblyCode() {
        return this.value.Assembly_SAP__c;
    }

    get callerName() {
        return this.value.Caller_Name__c;
    }

    get konectCallerName() {
        return this.value.Konect_Caller_Name__c;
    }

    get callerPhone() {
        return this.value.Caller_Phone_Number__c;
    }

    get  konectCallerPhone() {
        return this.value.Caller_Phone__c;
    }

    get coordinates() {
        return coordinatesFromAsset(this.asset, EntityType.Callout);
    }

    marker(state: IGlobalState) {
        const activeInFSM = activeInFSMFromState(state);
        return queryMapWorkOrders([conditions.WorkOrder.ids([this.id]), conditions.WorkOrder.open(activeInFSM)])
            .then(wos => wos.map(wo => new WorkOrderMapItem(wo, activeInFSM)))
            .then(wos => wos.length > 0 ? transparentMarker(serviceOrderMarker(wos[0], this.id)) : null)
    }

    get createdDate() {
        return this.value.CreatedDate;
    }
    
    get contractType() {
        return this.value.contractLineItems && this.value.contractLineItems.length > 0 && this.value.contractLineItems[0].RUSH_Contract_type__c;        
    }

    /*
    get contractResponseTime() {
        return "TODO";//return formatNumber(this.asset.Response_time_office_hours__c);
    }
    */

    get calculatedResponseTime() {
        return this.value.System_Calculated_SLA__c;
            //this.value.System_Calculated_SLA__c;//"TODO";//this.getCalloutItemValue(c => formatNumber(c.calculatedResponseTime));
    }

    
    get serviceAppointment() {
        return serviceAppointment(this.value);        
    }

    get dueDate() {
        return this.value.Due_Date__c;
        //return this.serviceAppointment && this.serviceAppointment.DueDate;
    }

    get scheduledStartDate() {
        return this.serviceAppointment && this.serviceAppointment.SchedStartTime;
    }

    get scheduledEndDate() {
        return this.serviceAppointment && this.serviceAppointment.SchedEndTime;
    }

    get equipmentId() {
        return this.asset && this.asset.Id;
    }

    get equipmentAccountName() {
        return this.assetAccount.Name;
    }

    get equipmentAccountId() {
        return this.assetAccount.Id;
    }

    get equipmentSiteAddress() {
        return this.asset.Installation_Street__c;
    }

    get isRejected() {
        return conditions.WorkOrder.rejected.isFullfilledBy(this.value);
    }

    get closeDate() {
        return this.value.Completed_Date__c;
    }

    get svWillManage() {
        return svWillManage(this.value, this.entityFieldsData.userId, this.entityFieldsData.activeInFSM);
    }

    get supervisorComment() {
        //TODO need to check if escalated user is supervisor
        return this.value.Case && this.value.Case.FSM_Escalated_To__c != null && this.value.Case.FSM_Next_Actions__c;
    }

    get asset() {
        return this.value.Asset || {
            Id: null as string,
            Name: null as string,
            Workcenter__c: null as string,
            Account: null as IApiNameAndId,
            Installation_Street__c: null as string,
            Manufacturer_Serial_Number__c: null as string,
            Geolocation__Latitude__s: null as number,
            Geolocation__Longitude__s: null as number
        };
    }

    get assetAccount() {
        return this.asset && this.asset.Account || { Id: null as string, Name: null as string };
    }

    get equipmentNumber() {
        return this.asset.Name;
    }

    get accountId() {
        return this.assetAccount.Id;
    }

    get equipmentSerialNumber() {
        return this.asset.Manufacturer_Serial_Number__c;
    }

    get jobDescription() {
        return this.value.Job_Description__c;
    }

    get assignedResources() {
        return this.value.assignedResources;
    }

    get lastTechnicianAssigned() {
        return this.value.assignedResources == null || this.value.assignedResources.length <= 0 ? null : _.uniq(this.value.assignedResources.map(r => r.Name)).join(', ');
    }

    get technicianName() {
        return this.value.Technician_Name__c;
    }

    get failureType(): string {
        if(this.entityFieldsData.activeInFSM) return this.value.Type__c;

        return this.value.Failure_Type_Code__c == null ? null : translate("service-order-failure-type-code." + this.value.Failure_Type_Code__c);
    }

    get serviceOrderType() {
        return ServiceOrderType[this.value.Service_Order_Type__c];
        /*
        const dict: { [index: string]: ServiceOrderType } = ServiceOrderType as any;
        return dict[this.value['WorkType.Name']];
        */
    }


    get calloutTaskStatus() {
        return getCalloutTaskStatus(this.value.Status);//getCalloutTaskStatus(this.value.taskStatus);
    }

    get accountsForEventCreation() {
        //return downloadEquipment(this.id).then(eq => eq.accountsForEventCreation);
        //there is a special rule for Callouts in EventCreationDialog
        return Promise.resolve([] as IAccountWithType[]);
    }

    get whatForEvent() {
        const account = normalizeNameAndId(this.assetAccount);//normalizeNameAndId(this.value.Account);
        return { ...account, title: account.name, entityType: EntityType.Account };
    }

    
    get equipmentConditionOnDeparture() {
        return this.value.Equipment_Condition_On_Departure__c;
    }

    get completedBy() {
        return this.value.Completed_By__r;
    }

    get completedByName() {
        return this.value.Completed_By__r && this.value.Completed_By__r.Name;
    }

    get reasonCode() {
        return this.value.Reason_Code__c;
    }

    get description(){
        return this.value.Description__c;
    }

    get workOrderLinesOperationCodes() {
        return operationCodesFromWorkOrderLineItemsSubQuery(this.value.WorkOrderLineItems);
    }

    get detailedReasonForRejection() {
        return this.value.Detailed_Reason_For_Rejection__c
    }

    get SupervisorWillManageReason(){
        return this.value.Supervisor_Will_Manage_Reason__c
    }
}

export default Callout;
