import * as _ from 'lodash';
import * as moment from 'moment';
import { EntityType } from 'src/constants/EntityType';
import { momentToSfDateTime, momentToSfDate } from './jsforceCore';
import * as coreApi from '../../models/api/coreApi';
import * as userApi from '../../models/api/userApi';
import { IGeoBounds } from '../../models/feed/state';
import { SfDate } from 'jsforce';


export enum SObject {
    Account = 'Account',
    AccountContactRelation = 'AccountContactRelation',
    Asset = 'Asset',
    Asset_Lead__c = 'Asset_Lead__c',
    Asset_Opportunity__c = 'Asset_Opportunity__c',
    AssignedResource = 'AssignedResource',
    Attachment = 'Attachment',
    Case = 'Case',
    Contact = 'Contact',
    ContractContactRole = 'ContractContactRole',
    ContactServiceContractJunction__c = 'ContactServiceContractJunction__c',
    ContentVersion = 'ContentVersion',
    ContentDocumentLink = 'ContentDocumentLink',
    ContentDocument = 'ContentDocument',
    ContractLineItem = 'ContractLineItem'  ,
    Event = 'Event',
    EventRelation = 'EventRelation',
    FSM_Work_Center_Assignment__c = 'FSM_Work_Center_Assignment__c',
    Lead = 'Lead',
    Location_Contact__c = 'Location_Contact__c',
    Note = 'Note',
    NPX_Survey_Record__c = 'NPX_Survey_Record__c',
    Opportunity = 'Opportunity',
    ResourceAbsence = 'ResourceAbsence',
    PermissionSetAssignment = 'PermissionSetAssignment',
    Task = 'Task',
    ServiceAppointment = 'ServiceAppointment',
    FSM_Site_Visit_History__c = 'FSM_Site_Visit_History__c',
    ServiceResource = 'ServiceResource',
    SMT_Sales_Organization_Configuration__c = 'SMT_Sales_Organization_Configuration__c',
    SMT_Configuration__mdt = 'SMT_Configuration__mdt',
    SMT_User_Info__c = 'SMT_User_Info__c',
    Direct_Time_Entry__c = 'Direct_Time_Entry__c',
    ServiceContract = 'ServiceContract',
    ServiceTerritory = 'ServiceTerritory',
    ServiceTerritoryMember = 'ServiceTerritoryMember',
    SMT_Notification__c = 'SMT_Notification__c',
    SMT_Notification_Read__c = 'SMT_Notification_Read__c',
    SMT_Automation_Rule__c = 'SMT_Automation_Rule__c',
    Tender__c = 'Tender__c',
    TimeSheetEntry = 'TimeSheetEntry',
    User = 'User',
    Version__c = 'Version__c',
    WorkOrder = 'WorkOrder',
    WorkOrderHistory = 'WorkOrderHistory',
    ProductConsumed = 'ProductConsumed',
    WorkOrderLineItem = 'WorkOrderLineItem',
    OpportunityContactRole = 'OpportunityContactRole',
    ServiceVisitHistory = 'ServiceVisitHistory',
    //SMT_Note__c = 'SMT_Note__c'
}

enum SoqlOperator {
    "=",
    "$eq",
    "!="  ,
    "$ne" ,
    ">"   ,
    "$gt" ,
    "<"   ,
    "$lt" ,
    ">="  ,
    "$gte",
    "<="  ,
    "$lte",
    "$like",
    "$nlike",
    "$in",
    "$nin",
    "$includes",
    "$excludes",
    "$exists",
}

const SoqlOperatorOpposite: _.Dictionary<SoqlOperator> = {
    //SoqlOperator.
}

export const entityBaseOptions = {
    [EntityType.Account]: {},
    [EntityType.Audit]: {},
    [EntityType.Callout]: {  },
    [EntityType.Complaint]: { 'RecordType.Name': { $eq: 'Complaint'} },
    [EntityType.Query]: { 'RecordType.Name': { $eq: 'Query'} },
    [EntityType.Tender]: {},
    [EntityType.Technician]: {},
    [EntityType.Timesheet]: {},
}

export const entityTypeToSobject: _.Dictionary<SObject> = {
    [EntityType.Account]: SObject.Account,
    [EntityType.Audit]: SObject.WorkOrder,
    [EntityType.Callout]: SObject.WorkOrder,
    [EntityType.Complaint]: SObject.Case,
    [EntityType.Contact]: SObject.Contact,
    [EntityType.Equipment]: SObject.Asset,
    [EntityType.Event]: SObject.Event,
    [EntityType.Lead]: SObject.Lead,
    [EntityType.Opportunity]: SObject.Opportunity,
    [EntityType.Query]: SObject.Case,
    [EntityType.Task]: SObject.Task,
    [EntityType.Tender]: SObject.Tender__c,
    [EntityType.Technician]: SObject.ServiceResource,
    [EntityType.Timesheet]: SObject.Direct_Time_Entry__c,
    [EntityType.User]: SObject.User,
    [EntityType.ServiceContract]: SObject.ServiceContract
}

export const sobjectToEntityType = _.invert(entityTypeToSobject) as _.Dictionary<EntityType>

export interface ICondition<TRecord, TSObject> {
    queryOptions: any;
    //queryOptionsNegated: any;
    isFullfilledBy: (record: TRecord) => boolean;
    isNotFullfilledBy: (record: TRecord) => boolean;
    fields: string[];
    emptyQuery: boolean;

    negate: () => ICondition<TRecord, TSObject>
}

export interface IConditionSimple<TRecord> extends ICondition<TRecord, TRecord> {}
export interface IConditionAnyResult<TRecord> extends ICondition<any, TRecord> {}

function fieldValue<T>(t: T, field: string) { return _.get(t, field); }

abstract class ConditionBase<T, TSObject> implements ICondition<T, TSObject>{

    public queryOptions: any;
    //public queryOptionsNegated: any;
    public emptyQuery = false;

    constructor() {
        this.queryOptions = {};
        //this.queryOptionsNegated = {};
    }

    fields: string[];
    isFullfilledBy: (record: T) => boolean
    isNotFullfilledBy = (record: T) => !this.isFullfilledBy(record);

    negate: () => ICondition<T, TSObject>
}

class ConditionFieldValueCore<TFields, TValues, TSObject> extends ConditionBase<TFields, TSObject>{

    public valuesSet: Set<TValues>

    constructor(public field: string, public values: TValues[]) {
        super();
        this.queryOptions[field] = values.length == 1 ? { $eq: values[0] } : { $in: values };
        //this.queryOptionsNegated[field] = values.length == 1 ? { $ne: values[0] } : { $nin: values };
        this.valuesSet = new Set(values);
        this.emptyQuery = values.length <= 0;
    }

    //https://www.athiemann.net/2015/07/19/typescript-class-method-this.html
    isFullfilledBy = (record: TFields): boolean => {
        return this.valuesSet.has(fieldValue(record, this.field));
    }

    isFullfilledByValue = (value: TValues) => this.valuesSet.has(value);

    fields = [this.field]
    negate = () => new ConditionFieldValueDifferentCore<TFields, TValues, TSObject>(this.field, this.values)
}

class ConditionFieldValueDifferentCore<T, TValues, TSObject> extends ConditionBase<T, TSObject>{

    public valuesSet: Set<TValues>

    constructor(public field: string, public values: TValues[]) {
        super();
        this.queryOptions[field] = values.length == 1 ? { $ne: values[0] } : { $nin: values };
        //this.queryOptionsNegated[field] = values.length == 1 ? { $eq: values[0] } : { $in: values };
        this.valuesSet = new Set(values);
    }

    isFullfilledBy = (record: T): boolean => {
        return !this.valuesSet.has(fieldValue(record, this.field));
    }

    fields = [this.field]
}


export class ConditionFieldValue<T, TSObject> extends ConditionFieldValueCore<T, string, TSObject>{}
class ConditionFieldValueDifferent<T, TSObject> extends ConditionFieldValueDifferentCore<T, string, TSObject>{}
/*
class ConditionFieldBoolean<T = any> extends ConditionBase<T>{

    constructor(public field: string, public value: boolean) {
        super();
        this.queryOptions[field] = { '=': value };
    }

    isFullfilledBy = (record: T): boolean => {
        return fieldValue(record, this.field) == this.value;
    }

    negate = () => new ConditionFieldBoolean(this.field, !this.value);

    fields = [this.field]
}
*/

class ConditionFieldLike<T, TSObject> extends ConditionBase<T, TSObject>{

    constructor(public field: string, public value: string) {
        super();
        this.queryOptions[field] = { $like: value };
        //this.queryOptionsNegated[field] = values.length == 1 ? { $eq: values[0] } : { $in: values };
    }

    isFullfilledBy = (record: T): boolean => {
        throw new Error('Not implemented');
    }

    fields = [this.field]
}

abstract class ConditionFieldGtBase<T, U, TSObject> extends ConditionBase<T, TSObject>{

    constructor(public field: string, public value: U) {
        super();
        this.queryOptions[field] = { $gt: value};
        //this.queryOptionsNegated[field] = { $lte: value}
    }

    fields = [this.field]
}

abstract class ConditionFieldLteBase<T, U, TSObject> extends ConditionBase<T, TSObject>{

    constructor(public field: string, public value: U) {
        super();
        this.queryOptions[field] = { $lte: value};
        //this.queryOptionsNegated[field] = { $gt: value}
    }

    fields = [this.field]
}


class ConditionFieldNumberGt<T, TSObject> extends ConditionFieldGtBase<T, number, TSObject>{
    constructor(field: string, value: number) {
        super(field, value);
    }

    isFullfilledBy = (record: T): boolean => {
        const recordFieldValue = fieldValue(record, this.field);
        return typeof recordFieldValue == 'number' && recordFieldValue > this.value;
    }

    //this would need to include null values
    //negate = () => new ConditionFieldNumberLte<T>(this.field, this.value)
}


class ConditionFieldNumberLte<T, TSObject> extends ConditionFieldLteBase<T, number, TSObject>{
    constructor(field: string, value: number) {
        super(field, value);
    }


    isFullfilledBy = (record: T): boolean => {
        const recordFieldValue = fieldValue(record, this.field);
        return typeof recordFieldValue == 'number' && recordFieldValue <= this.value;
    }

    //this would need to include null values
    //negate = () => new ConditionFieldNumberGt<T>(this.field, this.value)
}


abstract class ConditionFieldDate<T, TSObject> extends ConditionBase<T, TSObject> {

    public sfDate: SfDate;

    constructor(public field: string, public momentValue: moment.Moment, public isDate = false) {
        super();
        this.sfDate = isDate ? momentToSfDate(momentValue) : momentToSfDateTime(momentValue);
        if(isDate) this.momentValue = this.momentValue.startOf('day');
    }

    fields = [this.field]

    isFullfilledBy = (record: T): boolean => {
        const recordFieldValue = fieldValue(record, this.field);
        return recordFieldValue != null && this.compare(moment(recordFieldValue));
    }

    abstract compare(recordFieldValueMoment: moment.Moment): boolean;

}


class ConditionFieldDateGt<T, TSObject> extends ConditionFieldDate<T, TSObject>{

    constructor(field: string, momentValue: moment.Moment, isDate = false) {
        super(field, momentValue, isDate);
        this.queryOptions[field] = { $gt: this.sfDate };
    }

    compare = (recordFieldValueMoment: moment.Moment) => {
        return recordFieldValueMoment.isAfter(this.momentValue);
    }

}

class ConditionFieldDateGte<T, TSObject> extends ConditionFieldDate<T, TSObject>{

    constructor(field: string, momentValue: moment.Moment, isDate = false) {
        super(field, momentValue, isDate);
        this.queryOptions[field] = { $gte: this.sfDate };
    }

    compare = (recordFieldValueMoment: moment.Moment) => {
        return recordFieldValueMoment.isSameOrAfter(this.momentValue);
    }

}

class ConditionFieldDateLte<T, TSObject> extends ConditionFieldDate<T, TSObject>{


    constructor(field: string, momentValue: moment.Moment, isDate = false) {
        super(field, momentValue, isDate);
        this.queryOptions[field] = { $lte: this.sfDate };
    }

    compare = (recordFieldValueMoment: moment.Moment) => {
        return recordFieldValueMoment.isSameOrBefore(this.momentValue);
    }

    negate = () => new ConditionOr([new ConditionFieldDateGt<T, TSObject>(this.field, this.momentValue, this.isDate), condition(this.field, [null])])
/*
    constructor(field: string, private momentValue: moment.Moment, private isDate = false) {
        super(field, isDate ? momentToSfDate(momentValue) : momentToSfDateTime(momentValue));
        if(isDate) this.momentValue = this.momentValue.startOf('day');
    }

    isFullfilledBy = (record: T): boolean => {
        const recordFieldValue = fieldValue(record, this.field);
        return recordFieldValue != null && moment(recordFieldValue).isSameOrBefore(this.momentValue);
    }


    */
}

class ConditionFieldDateLt<T, TSObject> extends ConditionFieldDate<T, TSObject>{

    constructor(field: string, momentValue: moment.Moment, isDate = false) {
        super(field, momentValue, isDate);
        this.queryOptions[field] = { $lt: this.sfDate };
    }

    compare = (recordFieldValueMoment: moment.Moment) => {
        return recordFieldValueMoment.isBefore(this.momentValue);
    }

    negate = () => new ConditionOr([new ConditionFieldDateGte<T, TSObject>(this.field, this.momentValue, this.isDate), condition(this.field, [null])])

}

class ConditionOr<T, TSObject> extends ConditionBase<T, TSObject>{

    constructor(public conditions: ICondition<T, TSObject>[]) {
        super();
        this.queryOptions = or(conditions);
    }

    isFullfilledBy = (record: T): boolean => {
        for(var i = 0; i < this.conditions.length; i++) {
            if(this.conditions[i].isFullfilledBy(record)) return true;
        }
        return false;
    }

    fields = _.flatten(this.conditions.map(c => c.fields))

    negate = () => new ConditionAnd<T, TSObject>(this.conditions.map(c => c.negate()))
}

class ConditionAnd<T, TSObject> extends ConditionBase<T, TSObject>{

    constructor(public conds: ICondition<T, TSObject>[]) {
        super();
        this.queryOptions = and(...conds);
    }

    isFullfilledBy = (record: T): boolean => {
        return conditionsAnd(...this.conds)(record);
    }

    fields = _.flatten(this.conds.map(c => c.fields))


    negate = () => new ConditionOr<T, TSObject>(this.conds.map(c => c.negate()))
}

export function andCondition<T, U>(...cs: ICondition<T, U>[]) {
    return new ConditionAnd(cs);
}

function and<T, U>(...c1: ICondition<T, U>[]) {
    return { $and: c1.map(c => c.queryOptions) };
}

export function orCondition<TRecord, TSObject>(...cs: ICondition<TRecord, TSObject>[]) {
    return new ConditionOr<TRecord, TSObject>(cs);
}

function or<T, U>(cs: ICondition<T, U>[]) {
    return { $or: cs.map(c => c.queryOptions) };
}

export function conditionsAnd<T, U>(...conditions: ICondition<T, U>[]) {
    return (t: T) => {
        for(var i = 0; i < conditions.length; i++) {
            if(!conditions[i].isFullfilledBy(t)) return false;
        }
        return true;
    }
}

export function conditionsFilter<T, U extends T, TSObject>(ts: T[], ...conditions: ICondition<U, TSObject>[]) {
    return ts.filter(conditionsAnd(...conditions));
}

export function conditionsFields<T, U>(...conditions: ICondition<T, U>[]) {
    var allfields = [] as string[];
    conditions.forEach(c => allfields = allfields.concat(c.fields));
    return _.uniq(allfields);
}

export function condition<TFields, TSObject>(field: string, values: string[]) {
    return new ConditionFieldValue<TFields, TSObject>(field, values);
}

function conditionSimple<T>(field: string, values: string[]) {
    return new ConditionFieldValue<T, T>(field, values);
}

const geoBounds = <T, TSObject>(longitudefield: string, latitudefield: string) =>
    (geoBounds: IGeoBounds) =>
        geoBounds == null ? null :
        new ConditionAnd<T, TSObject>([
            new ConditionFieldNumberGt<T, TSObject>(longitudefield, geoBounds.southWest.longitude),
            new ConditionFieldNumberLte<T, TSObject>(longitudefield, geoBounds.northEast.longitude),
            new ConditionFieldNumberGt<T, TSObject>(latitudefield, geoBounds.southWest.latitude),
            new ConditionFieldNumberLte<T, TSObject>(latitudefield, geoBounds.northEast.latitude),
        ])

const statuses = {
    [SObject.Opportunity]: {
        openWithoutTender: ['Prospecting/Design Assist','Budget Price','On Hold','RFQ'],
        openWithTender: ['Tender/Proposal','Negotiation/Review','Order Agreed'],
    }
}

const openWorkorderStatuses = ['Accepted', 'Arrived', 'On Route', 'In Progress', 'New', 'Dispatched', 'Released', 'On Hold']
const openWorkOrderKonectStatuses = [
    '0', '1', '2', '3', '4','5', '6', '7', '8', '9', '10', '11', '12', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'
]

export const conditions = {
    'SObject': {
        ids: (ids: string[]) => condition<coreApi.IApiId, coreApi.SObject>('Id', ids),
        id: (id: string) => condition<coreApi.IApiId, coreApi.SObject>('Id', [id]),
        createdDate: (moment: moment.Moment) => new ConditionFieldDateGt<{ CreatedDate: string }, coreApi.SObject>('CreatedDate', moment),
        createdDateLast13Months: () => {
            const thirteenMonthsAgo = moment().startOf('month').subtract(13, 'months');
            return conditions.SObject.createdDate(thirteenMonthsAgo);
        },
        createdDateLast24Months: () => {
            const twentyfourMonthsAgo = moment().startOf('month').subtract(24, 'months');
            return conditions.SObject.createdDate(twentyfourMonthsAgo);
        },
        createdThisMonth: <T>() => new ConditionFieldDateGt<{ CreatedDate: string }, T>('CreatedDate', moment().startOf('month'))
    },
    [SObject.Account]: {
        ids: (ids: string[]) => condition<coreApi.IApiAccount, coreApi.Account>('Id', ids),
        nameLike: (search: string) => new ConditionFieldLike('Name', search),
        salesorg: (salesorg: string) => new ConditionFieldLike('Sales_Organizations__c', salesorg),
        modifiedAfter: (moment: moment.Moment) => new ConditionFieldDateGt<{ LastModifiedDate: string }, coreApi.Account>('LastModifiedDate', moment),
        isDeleted: new  ConditionFieldValueCore<coreApi.IApiAccount, boolean, coreApi.IApiAccount>('IsDeleted', [true]),
        //serviceTerritory: (serviceTerritoryId: string) => ({ Maintenance_Planner_Group__c: { $eq: serviceTerritoryId } })
    },
    [SObject.AccountContactRelation]: {
        ids: (ids: string[]) => condition<coreApi.IAccountContactRelation, coreApi.IAccountContactRelation>('Id', ids),
        accountIds: (ids: string[]) => condition<coreApi.IAccountContactRelation, coreApi.IAccountContactRelation>('AccountId', ids),
    },
    [SObject.Asset]: {
        ids: (ids: string[]) => condition<coreApi.IAssetSobject, coreApi.IAssetSobject>('Id', _.uniq(ids)),
        account: (accountId: string) => condition<coreApi.IAssetBase, coreApi.IAssetBase>('AccountId', [accountId]),
        geoBounds: geoBounds<coreApi.IAsset, coreApi.IAssetSobject>('Geolocation__Longitude__s', 'Geolocation__Latitude__s'),
        active: condition('Status__c', [null]),
        stopped: condition('FSM_Equipment_Condition__c', ['Out-Of-Order']),
        serviceTerritory: (serviceTerritoryId: string) => condition('Maintenance_Planner_Group__c', [serviceTerritoryId]),
        serviceTerritoryAny: (serviceTerritoryId: string) => ({ Maintenance_Planner_Group__c: { $eq: serviceTerritoryId } })
    },
    [SObject.Asset_Lead__c]: {
        assetServiceTerritory: (groupId: string) => condition<coreApi.Asset_Lead__c, coreApi.Asset_Lead__c>('Asset__r.Maintenance_Planner_Group__c', [groupId]),
    },
    [SObject.Asset_Opportunity__c]: {
        assets:  (assetIds: string[]) => condition<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>('Asset__c', assetIds),
        assetServiceTerritory: (groupId: string) => condition<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>('Asset__r.Maintenance_Planner_Group__c', [groupId]),
        geoBounds: geoBounds<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>('Asset__r.Geolocation__Longitude__s', 'Asset__r.Geolocation__Latitude__s'),
        opportunities:  (oppIds: string[]) => condition<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>('Opportunity__c', oppIds),
        //opportunityOwner: (userId: string) => condition<coreApi.IAsset_Opportunity__c>('Opportunity__r.OwnerId', [userId]),
        openWithoutTender: condition('Opportunity__r.StageName', statuses[SObject.Opportunity].openWithoutTender),
        openWithTender: condition('Opportunity__r.StageName', statuses[SObject.Opportunity].openWithTender),
        open: condition<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>("Opportunity__r.StageName", [...statuses[SObject.Opportunity].openWithoutTender, ...statuses[SObject.Opportunity].openWithTender]),
        opportunityCreatedDateLast24Months: () => {
            const twentyfourMonthsAgo = moment().startOf('month').subtract(24, 'months');
            return new ConditionFieldDateGt<{ Opportunity__r: { CreatedDate: string } }, coreApi.IAsset_Opportunity__c>(
                'Opportunity__r.CreatedDate', twentyfourMonthsAgo
            );
        }
    },
    [SObject.AssignedResource]: {
        serviceAppointmentIds: (serviceAppointmentIds: string[]) => condition<any, coreApi.IAssignedResource>('ServiceAppointmentId', serviceAppointmentIds),
        serviceResourceIds: (serviceResourceIds: string[]) => condition<coreApi.IAssignedResource, coreApi.IAssignedResource>('ServiceResourceId', serviceResourceIds),
    },
    [SObject.Case]: {
        ids: (ids: string[]) => condition<coreApi.IApiId, coreApi.Case>('Id', _.uniq(ids)),
        account: (accountId: string) => condition('AccountId', [accountId]),

        get open() { return this.closed.negate() },
        closed: condition<{ Status: string }, coreApi.Case>(
            'Status',
            ['Closed', 'Closed - Resolved', 'Closed - Unresolved', 'Closed.', 'Closed - Resolved.', 'Closed - Unresolved.', 'Completed', 'Interim Closed', 'Cancelled']
        ),

        closedDateThisMonth: () => new ConditionFieldDateGt<coreApi.Case, coreApi.Case>('ClosedDate', moment().startOf('month')),

        escalatedTo: (userId: string) => condition('FSM_Escalated_To__c', [userId]),
        complaint: condition('RecordType.Name', ['Customer Complaint']),
        complaintClosed: condition('RecordType.Name', ['Customer Closed Complaint']),
        helpDeskCase: condition('RecordType.Name', ['THD Case']),
        serviceTerritory: (serviceTerritory: string) => condition('Asset.Maintenance_Planner_Group__c', [serviceTerritory]),

        highPriority: condition<{ Priority: string }, coreApi.Case>('Priority', ['Very high','High', 'Safety / Legal']),

        geoBounds: geoBounds<coreApi.Case, coreApi.Case>('Asset.Geolocation__Longitude__s', 'Asset.Geolocation__Latitude__s'),

        asset: (assetId: string) => condition<coreApi.Case, coreApi.Case>('AssetId', [assetId]),
        assets: (assetIds: string[]) => condition<coreApi.Case, coreApi.Case>('AssetId', assetIds),
        emergency: new ConditionFieldValueDifferent('Emergency_Type__c', [null]),
        entrapment: new ConditionFieldValueCore<coreApi.Case, boolean, coreApi.Case>('Entrapment__c', [true]),
        // condition('Emergency_Type__c', []),
        query: condition('RecordType.Name', ['Customer Query']),
        compliment: condition('RecordType.Name', ['Compliment']),
        fieldService: condition('RecordType.Name', ['Field Service']),
        owner: (ownerId: string) => condition<{ OwnerId: string }, coreApi.Case>('OwnerId', [ownerId]),

        surveyResponse: condition<{ RecordType: { Name: string } }, coreApi.Case>('RecordType.Name', ['Survey Response']),
        npxNpiLte6: condition<{ RecordType: { Name: string } }, coreApi.Case>('NPX_NPI__c', ['0', '1', '2', '3', '4', '5', '6']),
    },
    [SObject.Contact]: {
        ids: (ids: string[]) => condition<coreApi.IApiId, coreApi.IContactSobject>('Id', _.uniq(ids)),
        names: (names: string[]) => condition<{ Name: string }, coreApi.IContactSobject>('Name', _.uniq(names)),
        email: (email: string) => condition<{ Email: string }, coreApi.IContactSobject>('Email', [email]),
        isPortalUser: new ConditionFieldValueCore('Is_Portal_User__c', [true]),
        //account: (ids: string[]) => condition<coreApi.IDetailedContact>('AccountId', _.uniq(ids))
    },
    [SObject.ContentVersion]: {
        firstPublishLocation: (id: string) => condition<coreApi.ContentVersionCore, coreApi.ContentVersionCore>('FirstPublishLocationId', [id]),
        titleLike: (title: string) => new ConditionFieldLike<coreApi.ContentVersionCore, coreApi.ContentVersionCore>('Title', title)
    },
    [SObject.ContentDocumentLink]: {
        linkedEntityId : (id: string) => condition<coreApi.ContentDocumentLink, coreApi.ContentDocumentLink>('LinkedEntityId ', [id]),
    },
    [SObject.ContentDocument]: {
        id: (id: string) => condition<coreApi.ContentDocument, coreApi.ContentDocument>('Id', [id]),
    },
    [SObject.ContractLineItem]: {
        asset: (assetId: string) => condition<coreApi.IContractLineItemSobject, coreApi.IContractLineItemSobject>('AssetId', [assetId]),
        assets: (assetIds: string[]) => condition<coreApi.IContractLineItemSobject, coreApi.IContractLineItemSobject>('AssetId', assetIds),
        status: (status: string) => condition<coreApi.IContractLineItemSobject, coreApi.IContractLineItemSobject>('Status', [status]),
        active: condition<coreApi.IContractLineItemSobject, coreApi.IContractLineItemSobject>('Status', ['Active']),
        contracts: (contractIds: string[]) => condition<coreApi.IContractLineItemSobject, coreApi.IContractLineItemSobject>('ServiceContractId', contractIds)
    },
    [SObject.ServiceContract]: {
        account: (accountId: string) => condition<coreApi.IApiCoreEvent, coreApi.Event>('AccountId', [accountId]),
        activeAndExpired12months : orCondition( 
            condition<coreApi.IServiceContractReport, coreApi.IServiceContractReport>('Status', ['Active']),
            andCondition(condition<coreApi.IServiceContractReport, coreApi.IServiceContractReport>('Status', ['Expired']),
            new ConditionFieldDateGte<coreApi.IServiceContractReport,coreApi.IServiceContractReport>('EndDate',moment().startOf('month').subtract(12,'months'), true)))
    },
    [SObject.Event]: {
        account: (accountId: string) => condition<coreApi.IApiCoreEvent, coreApi.Event>('AccountId', [accountId]),
        whatId: (id: string) => condition<coreApi.IApiCoreEvent, coreApi.Event>('WhatId', [id]),
        closed: condition<coreApi.IApiEvent, coreApi.Event>('Event_Status__c', ['Completed']),
        customerVisit: condition<coreApi.IApiEvent, coreApi.Event>('Type', ['Customer Visit']),
        eventTileType: condition<coreApi.IApiEvent, coreApi.Event>('Type', ['Customer Visit', 'Prospecting Visit (Cold Call)', 'Customer Event', 'Phone Visit']),
        get open() { return this.closed.negate() },
        completed: condition<coreApi.IApiEvent, coreApi.Event>('Event_Status__c', ['Completed']),
        ids: (ids: string[]) => condition<coreApi.IApiEvent, coreApi.Event>('Id', ids),
        auditNumbers: (auditNumbers: string[]) => condition<coreApi.IApiEvent, coreApi.Event>('Audit_Number__c', auditNumbers),
        owner: (ownerId: string) => condition<coreApi.IApiEvent, coreApi.Event>('OwnerId', [ownerId]),
        createdBy: (id: string) => condition<coreApi.IApiCoreEvent, coreApi.Event>('CreatedById', [id]),
        endDateTimeThisMonth: () => new ConditionFieldDateGt<coreApi.Event, coreApi.Event>('EndDateTime', moment().startOf('month')),
    },
    [SObject.EventRelation]: {
        event: (ids: string[]) => conditionSimple<coreApi.EventRelation>('EventId', ids)
    },
    [SObject.FSM_Work_Center_Assignment__c]: {
        serviceResource: (srId: string) => conditionSimple<coreApi.IFSM_Work_Center_Assignment__c>('Service_Resource__c', [srId]),
        serviceResources: (srIds: string[]) => conditionSimple<coreApi.IFSM_Work_Center_Assignment__c>('Service_Resource__c', srIds),
        workCenters: (srIds: string[]) => conditionSimple<coreApi.IFSM_Work_Center_Assignment__c>('Work_Center__c', srIds),
    },
    [SObject.Lead]: {
        ids: (ids: string[]) => condition<coreApi.IApiId, coreApi.Lead>('Id', _.uniq(ids)),
        account: (accountId: string) => condition<{ Account__c: string }, coreApi.Lead>('Account__c', [accountId]),
        assets: (assetIds: string[]) => condition<{ FSM_Asset__c: string }, coreApi.Lead>('FSM_Asset__c', assetIds),
        serviceTerritoryFSM: (serviceTerritoryId: string) => 
            condition<{ FSM_Asset__r:  { Maintenance_Planner_Group__c: string } }, coreApi.Lead>(
                'FSM_Asset__r.Maintenance_Planner_Group__c', [serviceTerritoryId]
            ),
        notConverted: new ConditionFieldValueCore<{ IsConverted: boolean }, boolean, coreApi.Lead>('IsConverted', [false]),
        owner: (ownerId: string) => condition<{ OwnerId: string }, coreApi.Lead>('OwnerId', [ownerId]),
        geoBounds: geoBounds<coreApi.Lead, coreApi.Lead>('FSM_Asset__r.Geolocation__Longitude__s', 'FSM_Asset__r.Geolocation__Latitude__s'),

        open: condition<{ Status: string }, coreApi.Lead>('Status', ['New', 'In Process', 'Postponed', 'Qualified']),
        statusQualifiedThisMonth: () => new ConditionFieldDateGt<coreApi.Lead, coreApi.Lead>('Status_Qualified__c', moment().startOf('month')),
        vaRepairOrDoor: condition<{ Business_Type__c: string }, coreApi.Lead>('Business_Type__c', ['VA Repairs', 'Doors'])
    },
    [SObject.ContactServiceContractJunction__c]: {
        contract: (contractId: string) => condition<coreApi.ContactServiceContractJunction__c, coreApi.ContactServiceContractJunction__c>('Service_Contract__c', [contractId]),
    },
    [SObject.ContractContactRole]: {
        contract: (contractId: string) => condition<coreApi.ContractContactRole, coreApi.ContractContactRole>('ContractId', [contractId]),
    },
    [SObject.Location_Contact__c]: {
        location: (locationId: string) => condition<{ Location__c: string }, coreApi.Location_Contact__c>('Location__c', [locationId]),
    },
    [SObject.OpportunityContactRole]: {
        opportunityId: (oppId: string[]) => condition<{ OpportunityId: string }, coreApi.IOpportunityContactRole>('OpportunityId', oppId)
    },
    [SObject.Opportunity]: {
        ids: (ids: string[]) => condition<coreApi.IApiId, coreApi.IOpportunity>('Id', ids),
        //openWithoutTender: condition<coreApi.IOpportunity, coreApi.Opportunity>('StageName', statuses[SObject.Opportunity].openWithoutTender),
        //openWithTender: condition<coreApi.IOpportunity, coreApi.IOpportunity>('StageName', statuses[SObject.Opportunity].openWithTender),

        get openWithoutTender() { return andCondition(this.open, this.withoutTender) },
        get openWithTenderWithoutOrders() { return andCondition(this.open, this.withTender, this.withoutOrders) },
        get openWithoutOrders() { return andCondition(this.open, this.withoutOrders) },

        open: condition<coreApi.IOpportunity, coreApi.IOpportunity>('StageName', [...statuses[SObject.Opportunity].openWithoutTender, ...statuses[SObject.Opportunity].openWithTender]),
        //closed: condition<coreApi.IOpportunity>('StageName', ['No Bid','Lost','Order Received (Won)','Cancelled','Alternative Declined']),
        get closed() { return this.open.negate() },

        withTender: new ConditionFieldNumberGt('FL_Tender_Count__c', 0),
        withoutTender: new ConditionFieldNumberLte('FL_Tender_Count__c', 0),

        //count of FL orders
        withoutOrders: new ConditionFieldNumberLte('Order_Count__c', 0),

        owner: (ownerId: string) => condition<coreApi.IOpportunity, coreApi.IOpportunity>('OwnerId', [ownerId]),
        account: (accountId: string) => condition<coreApi.IOpportunity, coreApi.IOpportunity>('AccountId', [accountId]),

        closedDateThisMonth: () => new ConditionFieldDateGt<coreApi.IOpportunity, coreApi.IOpportunity>('CloseDate', moment().startOf('month'), true),
        receivedWonStage: () => condition<coreApi.IOpportunity, coreApi.IOpportunity>('StageName', ['Order Received (Won)']),
        receivedWonThisMonth: () => new ConditionFieldDateGt<coreApi.IOpportunity, coreApi.IOpportunity>('Order_Received_Won_DateTime__c', moment().startOf('month'), false),
        lastModified12Months: () => new ConditionFieldDateGte<coreApi.IOpportunity, coreApi.IOpportunity>('LastModifiedDate',moment().startOf('month').subtract(12, 'months')),

        vaRepairOrDoor: condition<{ Business_Type__c: string }, coreApi.IOpportunity>('Business_Type__c', ['VA Repairs', 'Doors']),
        
        vaRepairOrDoorwithOpportunityCategory: orCondition(
            condition('Business_Type__c',['VA Repairs']),
            andCondition(
                condition('Business_Type__c',['Doors']),
                condition('Opportunity_Category__c',['Repair/Modernization'])
            )
        )
    },
    [SObject.PermissionSetAssignment]: {
        name: (name: string) => condition<coreApi.IPermissionSetAssignment, coreApi.IPermissionSetAssignment>('PermissionSet.Name', [name]),
        assignee: (id: string) => condition<coreApi.IPermissionSetAssignment, coreApi.IPermissionSetAssignment>('AssigneeId', [id]),
    },
    [SObject.Task]: {
        ids: (ids: string[]) => condition<{ Id: string }, coreApi.ITaskListItem>('Id', _.uniq(ids)),
        highPriority: condition<{ Priority: string }, coreApi.ITaskListItem>('Priority', ['High']), //condition<coreApi.ITask>('IsHighPriority', [true]),

        open: condition<{ Status: string }, coreApi.ITask>('Status', ['Not Started','In Progress','Waiting On Someone Else','Deferred', 'Open']),
        get closed() { return this.open.negate(); },
        //closed: condition<coreApi.ITask>('Status', ['Completed', 'Cancelled', 'Closed']),
        get overdue() {
            const now = moment();
            //return new ConditionFieldDateLte<coreApi.ITask>('ActivityDate', now, true)

            return new ConditionAnd<coreApi.ITask, coreApi.Task>([
                this.open,
                new ConditionFieldDateLt<coreApi.ITask, coreApi.Task>('ActivityDate', now, true)
            ]);
        },
        owner:  (ownerId: string) => condition<{ OwnerId: string }, coreApi.ITask>('OwnerId', [ownerId]),
        completed: 'Completed',
        activityDateThisMonth: () => new ConditionFieldDateGt<coreApi.ITask, coreApi.ITask>('ActivityDate', moment().startOf('month'), true)
    },
    [SObject.ServiceResource]: {
        ids: (ids: string[]) => condition<{ Id: string }, coreApi.IServiceResource>('Id', ids),
        ResourceType: condition('ResourceType', ['T']),
        //serviceTerritory: (id: string) => condition('ServiceTerritoryId', [id]),
        //account: (accountId: string) => condition<coreApi.IServiceResource>('AccountId', [accountId]),
    },
    [SObject.ServiceTerritoryMember]: {
        serviceTerritory: (id: string) => condition('ServiceTerritoryId', [id]),
        serviceResource: (id: string) => condition('ServiceResource', [id]),
        effectiveEndDate:() =>  orCondition(
            condition('EffectiveEndDate',[null]), 
            new ConditionFieldDateGt('EffectiveEndDate', moment().startOf('day'))
        )
    },
    [SObject.ServiceAppointment]: {
        owners:  (ownerIds: string[]) => condition<{ OwnerId: string }, coreApi.IServiceAppointment>('OwnerId', ownerIds),
        parentRecord: (ids: string[]) => condition<{ ParentRecordId: string }, coreApi.IServiceAppointment>('ParentRecordId', ids),
        assignedServiceResources: (serviceResourceIds: string[]) => conditionSimple<coreApi.IServiceAppointment>('Assigned_Service_Resource__c', serviceResourceIds),
        statusCategory: (statusCategory: string[]) => condition<{ StatusCategory: string }, coreApi.IServiceAppointmentCore>('StatusCategory', statusCategory),
        open:  condition<any, coreApi.IServiceAppointment>('Status', ['New', 'Scheduled', 'Dispatched', 'On Route', 'Arrived', 'Start Work', 'Stop Work', 'Backreport', 'Signature', 'Completed']),
        actualStartTime: (moment: moment.Moment) => new ConditionFieldDateGt<any, coreApi.IServiceAppointment>('ActualStartTime', moment),
        rejected: condition<coreApi.IServiceAppointmentRejectedListItem, coreApi.IServiceAppointmentCore>('Status', ['Rejected']),
        newStatusDate24h: new ConditionFieldDateGt<coreApi.IServiceAppointmentRejectedListItem, coreApi.IServiceAppointmentCore>('New_Status_Date__c', moment().subtract(1, 'days')),
        serviceTerritory: (id: string) => condition<any,coreApi.IServiceAppointment>('Work_Order__r.ServiceTerritoryId', [id]),
        openWOFSM: condition<any,coreApi.IServiceAppointment>('Work_Order__r.Status', openWorkorderStatuses),
        openWOKonect: condition<any,coreApi.IServiceAppointment>('Work_Order__r.Konect_Status__c', openWorkOrderKonectStatuses),
        get openWO() { return (activeInFSM: boolean) => activeInFSM ? this.openWOFSM : this.openWOKonect },

        newWOFSM: condition<coreApi.IServiceAppointment, coreApi.IServiceAppointment>('Work_Order__r.Status', ['New']),
        newWOKonect: condition<coreApi.IServiceAppointment, coreApi.IServiceAppointment>('Work_Order__r.Konect_Status__c', ['0']),

        get closedWO() { return this.open.negate() },
        emergency: andCondition(condition('Work_Order__r.Priority', ['Critical', 'High']), orCondition(
            new ConditionFieldValueCore<any,boolean,coreApi.IServiceAppointment>('Work_Order__r.Entrapment__c', [true]),
            new ConditionFieldValueCore<any,boolean,coreApi.IServiceAppointment>('Work_Order__r.Injury__c', [true]),
            new ConditionFieldValueCore<any,boolean,coreApi.IServiceAppointment>('Work_Order__r.Hazard__c', [true])
            )   
        ),
        callout: condition('Work_Order__r.Maintenance_Activity_Type__c', ['Y01', 'Y02', 'Y21']),
        newStatusDate72hours: () => new ConditionFieldDateGt<any,coreApi.IServiceAppointment>('New_Status_Date__c', moment().subtract(3, 'days')),
        newStatusDateNull: condition('New_Status_Date__c', [null]),
        get newStatusDateNotNull() { return this.newStatusDateNull.negate() },
        geoBounds: geoBounds<any,coreApi.IServiceAppointment>('Work_Order__r.Asset.Geolocation__Longitude__s', 'Work_Order__r.Asset.Geolocation__Latitude__s')
    },
    [SObject.FSM_Site_Visit_History__c]: {
        serviceAppointmentParentRecordId: (ids: string[]) => conditionSimple<coreApi.IServiceAppointmentVisitHistory>('Service_Appointment__r.ParentRecordId', ids),
    },
    [SObject.SMT_Notification__c]: {
        serviceTerritory: (id: string) => condition('Service_Territory__c', [id]),
        createdDateAfter: (moment: moment.Moment) => new ConditionFieldDateGt<any, coreApi.SMT_Notification__c>('CreatedDate', moment),
        userId: (id: string) => condition('User__c', [id])
    },
    [SObject.SMT_Notification_Read__c]: {
        user: (id: string) => condition('User__c', [id]),
        notifications: (ids: string[]) => condition('SMT_Notification__c', ids),
    },
    //Direct_Time_Entry__c
    [SObject.ResourceAbsence]: {
        futureEntries: () => new ConditionFieldDateGt<coreApi.IResourceAbsence, coreApi.IResourceAbsence>('Start', moment()),
        serviceResources: (ids: string[]) => condition<{ ResourceId: string }, coreApi.IResourceAbsence>('ResourceId', ids),
    },
    [SObject.TimeSheetEntry]: {
        ids: (ids: string[]) => condition<coreApi.ITimeSheetEntryBase, coreApi.ITimeSheetEntryBase>('Id', ids),
        //serviceResources: (ids: string[]) => condition<coreApi.ITimeSheetEntryBase>('Service_Resource_Id__c', ids),

        //modifiedLast72hours: () => new ConditionFieldDateGt<coreApi.IWorkOrder>('LastModifiedDate', moment().subtract(3, 'days')),

        activeNow: () => {
            const now = moment();
            return [new ConditionFieldDateLte<coreApi.ITimeSheetEntryBase, coreApi.ITimeSheetEntryBase>('StartTime', now),
                       new ConditionFieldDateGt<coreApi.ITimeSheetEntryBase, coreApi.ITimeSheetEntryBase>('EndTime', now)]
        },
        futureEntries: () => new ConditionFieldDateGt<coreApi.ITimeSheetEntryBase, coreApi.ITimeSheetEntryBase>('StartTime', moment()),
        serviceResources: (ids: string[]) => conditionSimple<coreApi.ITimeSheetEntryBase>('TimeSheet.ServiceResourceId', ids),
        status: (status: string) => conditionSimple<coreApi.ITimeSheetEntryBase>('Status', [status])
    },
    [SObject.SMT_Sales_Organization_Configuration__c]: {
        salesorgCodes: (salesorgCodes: string[]) => conditionSimple<userApi.SMT_Sales_Organization_Configuration__c>('Sales_Organization__c', salesorgCodes)
    },
    [SObject.SMT_User_Info__c]: {
        user:  (userId: string) => conditionSimple<userApi.SMT_User_Info__c>('User__c', [userId]),
        users: (userIds: string[]) => conditionSimple<userApi.SMT_User_Info__c>('User__c', userIds)
    },
    [SObject.SMT_Automation_Rule__c]: {
        user:  (userId: string) => conditionSimple<coreApi.SMT_Automation_Rule__c>('User__c', [userId]),
        assets: (assetIds: string[]) => condition<{ Asset__c: string }, coreApi.SMT_Automation_Rule__c>('Asset__c', assetIds),
    },
    [SObject.User]: {
        ids: (ids: string[]) => conditionSimple<userApi.IUser>('Id', ids),
        smtProfiles: conditionSimple<userApi.IUser>('Profile.Name', ['System Administrator', 'KONE: System Administrator']),
        nameLike: (search: string) => new ConditionFieldLike('Name', search)
     },
     [SObject.Tender__c]: {
        ids: (ids: string[]) => conditionSimple<coreApi.Tender__c>('Id', ids),
        //Tender__c has no OnwerId field!
        //owner:  (ownerId: string) => conditionSimple<coreApi.Tender__c>('OwnerId', [ownerId]),
        opportunities: (ids: string[]) => conditionSimple<coreApi.Tender__c>('Opportunity__c', ids),
        account: (accountId: string) => condition<{ Opportunity__r: { AccountId: string } }, coreApi.Tender__c>('Opportunity__r.AccountId', [accountId]),
        active: new ConditionFieldValueCore<{ Active__c: boolean }, boolean, coreApi.Tender__c>('Active__c', [true]),
        opportunityOwner: (id: string) => conditionSimple<coreApi.Tender__c>('Opportunity__r.OwnerId', [id]),
        opportunityCreated: (moment: moment.Moment) =>
            new ConditionFieldDateGt<{ Opportunity__r: { CreatedDate: string } }, coreApi.Tender__c>('Opportunity__r.CreatedDate', moment),
        get opportunityCreated24Months() {
            const twentyfourMonthsAgo = moment().startOf('month').subtract(24, 'months');
            return () => this.opportunityCreated(twentyfourMonthsAgo);
        },
        get opportunityCreatedCurrentMonth() {
            const currentMonth = moment().startOf('month');
            return () => this.opportunityCreated(currentMonth);
        },
        createdCurrentMonth: () => new ConditionFieldDateGt<{ CreatedDate: string }, coreApi.Tender__c>('CreatedDate', moment().startOf('month')),
        ktoc: condition('RecordType.Name', ['KTOC']),
        vaRepair: conditionSimple<coreApi.Tender__c>('Opportunity__r.Business_Type__c', ['VA Repairs'])
    },
    [SObject.Version__c]: {
        ids: (ids: string[]) => conditionSimple<coreApi.Version>('Id', ids),
        open: condition('Stage__c', ['Prospecting/Design Assist','Budget Price','RFQ', 'Tender/Proposal', 'Negotiation/Review', 'Order Agreed']),
        owner:  (ownerId: string) => conditionSimple<coreApi.Version>('OwnerId', [ownerId]),
        opportunities: (assetIds: string[]) => conditionSimple<coreApi.Version>('Tender__r.Opportunity__c', assetIds),
        account: (accountId: string) => condition<{ Account__c: string }, coreApi.Version>('Account__c', [accountId]),
        tenderOpportunities: (opportunityIds: string[]) => condition<{ Tender__r: { Opportunity__c: string }}, coreApi.Version>('Tender__r.Opportunity__c', opportunityIds),
        tender: (id: string) => condition<{ Tender__c: string }, coreApi.Version>('Tender__c', [id]),
        tenderActive: new ConditionFieldValueCore<{ Tender__r: { Active__c: boolean } }, boolean, coreApi.Version>('Tender__r.Active__c', [true]),
        active: new ConditionFieldValueCore<{ Active__c: boolean }, boolean, coreApi.Version>('Active__c', [true])
    },
    [SObject.ProductConsumed]: {
        workorder: (workorderId: string) => condition<coreApi.ProductConsumed, coreApi.ProductConsumed>('WorkOrderId', [workorderId]),
    },
    [SObject.WorkOrderLineItem]: {
        workorders: (workorderIds: string[]) => condition<coreApi.WorkOrderLineItem, coreApi.WorkOrderLineItem>('WorkOrderId', workorderIds),
        workorder: (workorderId: string) => condition<coreApi.WorkOrderLineItem, coreApi.WorkOrderLineItem>('WorkOrderId', [workorderId]),
    },
    [SObject.WorkOrder]: {
        completedBy: (serviceResourceIds: string[]) => condition<coreApi.IWorkOrderBase, coreApi.WorkOrder>('Completed_By__c', serviceResourceIds),
        asset: (assetIds: string[]) => condition<coreApi.IWorkOrderBase, coreApi.WorkOrder>('AssetId', assetIds),
        escalatedTo: (userId: string) => condition('Case.FSM_Escalated_To__c', [userId]),
        geoBounds: geoBounds<coreApi.IWorkOrder, coreApi.WorkOrder>('Asset.Geolocation__Longitude__s', 'Asset.Geolocation__Latitude__s'),
        completedThisMonth: () => new ConditionFieldDateGt<coreApi.IWorkOrder, coreApi.WorkOrder>('Completed_Date__c', moment().startOf('month')),
        completedToday: () => new ConditionFieldDateGt('Completed_Date__c', moment().startOf('day')),
        callout: condition<{ Maintenance_Activity_Type__c: string }, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y01', 'Y02', 'Y21']),

        highPriorityFSM: condition<{ Priority: string }, coreApi.WorkOrder>('Priority', ['Critical', 'High']),
        get highPriority() {
            return (activeInFSM: boolean) => activeInFSM ? this.highPriorityFSM : this.emergencyKonect
        },

        emergencyFSM: andCondition<coreApi.IWorkOrderEmergency, coreApi.WorkOrder>(
            condition('Priority', ['Critical', 'High']), 
            orCondition(
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Entrapment__c', [true]),
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Injury__c', [true]),
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Hazard__c', [true])
            )
        ),
        emergencyKonect: orCondition<coreApi.IWorkOrderEmergency, coreApi.WorkOrder>(
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Entrapment__c', [true]),
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Injury__c', [true]),
                new ConditionFieldValueCore<any, boolean, coreApi.WorkOrder>('Hazard__c', [true]),
                condition<{ Failure_Type_Code__c: string }, coreApi.WorkOrder>('Failure_Type_Code__c', ['KM-AA'])
        ),

        get emergency() {
            return (activeInFSM: boolean) => { 
                return activeInFSM ? this.emergencyFSM : this.emergencyKonect 
            } 
        },

        ids: (ids: string[]) => condition<coreApi.IWorkOrderBase, coreApi.WorkOrder>('Id', ids),
        mbm: condition<{ Maintenance_Activity_Type__c: string }, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y03', 'Z03']),
        modifiedLast72hours: () => new ConditionFieldDateGt<coreApi.IWorkOrder, coreApi.WorkOrder>('LastModifiedDate', moment().subtract(3, 'days')),
        newStatusDate72hours: () => new ConditionFieldDateGt<coreApi.IWorkOrder, coreApi.WorkOrder>('New_Status_Date__c', moment().subtract(3, 'days')),
        repair: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y04', 'Z04']),
        packagedServiceRepair: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Service_Order_Type__c', ['YSM6']),
        inspection: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y06', 'Z06']),
        inspectionPoint: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y07', 'Z07']),
        Y99: condition<{ Maintenance_Activity_Type__c: string }, coreApi.WorkOrder>('Maintenance_Activity_Type__c',['Y99']),
        RecordType: condition<coreApi.WorkOrder, coreApi.WorkOrder>('RecordType.DeveloperName',['Default_Work_Order']),

        //see 2.0 documentation https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/126300788/Entity+-+Work+Order
        completed: 'Completed',

        //cancelled: condition<coreApi.IWorkOrderBase>('Status', ['Rejected', 'Interrupted', 'Canceled', 'Cannot Complete']),
        //closed: condition<coreApi.IWorkOrderBase>('Status', ['Completed', 'Closed']),

        newFSM: condition<{ Status: string }, coreApi.WorkOrder>('Status', ['New']),
        newKonect: condition<{ Konect_Status__c: string }, coreApi.WorkOrder>('Konect_Status__c', ['0', null]),

        statusCompleted: condition<{ Status: string }, coreApi.WorkOrder>('Status', ['Completed']),

        openFSM: condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Status', openWorkorderStatuses),
        openKonect: condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Konect_Status__c', openWorkOrderKonectStatuses),
        technicianCurrentWO: condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Konect_Status__c', ['6','7','12','13','24']),

        newStatusDateNull: condition('New_Status_Date__c', [null]),
        get newStatusDateNotNull() { return this.newStatusDateNull.negate() },

        completedOrFinished : condition<{ Status: string }, coreApi.WorkOrder>('Status', ['Finished','Completed','Cancelled']),
        closedKonectStatus: condition('Konect_Status__c',['13','14']),

        get open() { 
            return (activeInFSM: boolean) => { 
                return activeInFSM ? this.openFSM : 
                    orCondition( andCondition(this.openKonect,this.completedOrFinished.negate()), andCondition(this.openFSM, condition('Konect_Status__c', [null])) ) 
            }
        },
        // get closed() { return (activeInFSM: boolean) => { 
        //     return this.open(activeInFSM).negate(); 
        // } },

        // get openFSMandKonect() { 
        //    return orCondition(
        //        condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Status', ['In Progress', 'New', 'On Hold']),
        //         this.openKonect)
        //     },

        get openFSMandKonect() { 
            return andCondition( 
                andCondition(condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Status', ['Completed']).negate(), condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Status', ['In Progress', 'New', 'On Hold'])),
                condition('Konect_Status__c',['13','14','16']).negate()
             )
        },

        get closedFSMandKonect() {
            return orCondition(
                condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Status', ['Completed']),
                condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Konect_Status__c', ['13','14']))
        },

        get closed() { 
            return (activeInFSM: boolean) => { 
                return activeInFSM ? this.statusCompleted : orCondition(this.closedKonectStatus, this.statusCompleted) 
            }
        },

        rejected: condition<{ Status: string }, coreApi.WorkOrder>('Status', ['Rejected']),   
        serviceNeeds: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Maintenance_Activity_Type__c', ['Y09']),
        createdDate24h: new ConditionFieldDateGt<coreApi.IWorkOrder, coreApi.IWorkOrder>('CreatedDate', moment().subtract(1, 'days')),
        newStatusDate24h: new ConditionFieldDateGt<coreApi.IWorkOrder, coreApi.IWorkOrder>('New_Status_Date__c', moment().subtract(1, 'days')),
        rejectedNonFSM: condition<coreApi.IWorkOrder, coreApi.WorkOrder>('Konect_Status__c', ['19']),
        startDateLast12Months: () => {
            const twelveMonthsAgo = moment().startOf('month').subtract(12, 'months');
            return conditions.WorkOrder.startDateAfter(twelveMonthsAgo);
        },
        startDateLast13Months: () => {
            const thirteenMonthsAgo = moment().startOf('month').subtract(13, 'months');
            return conditions.WorkOrder.startDateAfter(thirteenMonthsAgo);
        },
        completedDateLast12Months: () => {
            const twelveMonthsAgo = moment().startOf('month').subtract(13, 'months');
            return conditions.WorkOrder.completedDateAfter(twelveMonthsAgo);
        },
        lastModified30Days: () => {
            const thirtyDaysAgo = moment().subtract(30, 'days');
            return new ConditionFieldDateGt<any,coreApi.IWorkOrderCore>('LastModifiedDate', thirtyDaysAgo)
        },

        startDateBetween: (start: moment.Moment, end: moment.Moment) => {
            return andCondition(conditions.WorkOrder.startDateAfter(start), conditions.WorkOrder.startDateBefore(end));
        },

        startDateBefore: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('StartDate', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('StartDate', [null]),
                new ConditionFieldDateLte('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2);
        },

        startDateAfter: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateGt<coreApi.IWorkOrderCore, coreApi.WorkOrder>('StartDate', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('StartDate', [null]),
                new ConditionFieldDateGt('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2);
        },

        earliestStartDateBetween: (start: moment.Moment, end: moment.Moment) => {
            return andCondition(conditions.WorkOrder.earliestStartDateAfter(start), conditions.WorkOrder.earliestStartDateBefore(end));
        },

        earliestStartDateBefore: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('Earliest_Start_Date__c', [null]),
                new ConditionFieldDateLte('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2);  
        },

        earliestStartDateAfter: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateGt<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('Earliest_Start_Date__c', [null]),
                new ConditionFieldDateGt('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2);  
        },

        endDateBetween: (start: moment.Moment, end: moment.Moment) => {
            return andCondition(conditions.WorkOrder.endDateAfter(start), conditions.WorkOrder.endDateBefore(end));
        },

        endDateAfter: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateGt<coreApi.IWorkOrderCore, coreApi.WorkOrder>('EndDate', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('EndDate', [null]),
                new ConditionFieldDateGt('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2); 
        },

        endDateBefore: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('EndDate', date)
            const cond2 = new ConditionAnd<coreApi.IWorkOrderCore, coreApi.WorkOrder>([
                condition('EndDate', [null]),
                new ConditionFieldDateLte('CreatedDate', date)
            ]);
            return orCondition(cond1, cond2);  
        },

        earliestStartDateLast12Months: () => {
            const twelveMonthsAgo = moment().startOf('month').subtract(12, 'months');
            return new ConditionFieldDateGte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', twelveMonthsAgo);    
        },

        earliestStartDateLast24Months: () => {
            const twelveMonthsAgo = moment().startOf('month').subtract(24, 'months');
            return new ConditionFieldDateGte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', twelveMonthsAgo);    
        },

        earliestStartDatePresentMonth: () => {
            const currentMonths = moment().endOf('month');
            return new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', currentMonths);    
        },

        earliestStartDateNext3Months: () => {
            const threeMonthsAfter = moment().endOf('month').add(3, 'months');
            return new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Earliest_Start_Date__c', threeMonthsAfter);    
        },

        completedDateAfter: (date: moment.Moment) => {
            const cond1 = new ConditionFieldDateGt<any,coreApi.IWorkOrderCore>('Completed_Date__c', date)
            const cond2 = new ConditionAnd<any,coreApi.IWorkOrderCore>([
                condition('Completed_Date__c', [null]),
                new ConditionFieldDateGt('EndDate', date)
            ]);
            return orCondition(cond1, cond2);  
        },

        overdue: () => {
            const now = moment();
            return new ConditionFieldDateLte<coreApi.IWorkOrderCore, coreApi.WorkOrder>('Due_Date__c', now)
        },

        serviceTerritory: (id: string) => condition<coreApi.IWorkOrderCore, coreApi.WorkOrder>('ServiceTerritoryId', [id]),
        siteVisitWorkOrder: condition('RecordType.Name', ['Site Visit Work Order']),
        get notSiteVisitWorkOrder() { return this.siteVisitWorkOrder.negate() },

        technicianNameNotNull: condition('Technician_Name__c', [null]).negate()
    },
    [SObject.WorkOrderHistory]: {
        isNotDeleted: new ConditionFieldValueCore('isDeleted',[false]),
        Created30DaysAgo: () => {
            const thirtyDaysAgo = moment().subtract(30, 'days');
            return new ConditionFieldDateGt<any,coreApi.IWorkOrderCore>('CreatedDate', thirtyDaysAgo)
        },
        serviceTerritory: (id: string) => condition('workorder.ServiceTerritoryId', [id]),
        ModifiedStatus: condition('Field',['Status','Konect_Status__c']),
    },
    [SObject.NPX_Survey_Record__c]: {
        account: (accountId: string) => condition<{ Account__c: string }, coreApi.NPX_Survey_Record__c>('Account__c', [accountId]),
        npiNotNull: condition<{ NPI__c: string }, coreApi.NPX_Survey_Record__c>('NPI__c', [null]).negate()
    }
    
}
