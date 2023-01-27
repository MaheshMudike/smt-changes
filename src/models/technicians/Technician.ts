import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { IServiceResourceWithMetrics, IApiNameAndId, IServiceResourceTechnicianReport, IWorkOrderLocation } from '../api/coreApi';
import { IDialogListItem } from '../list/IListItem';
import { SalesforceListItem } from '../feed/SalesForceListItem';
import WrapperObject from '../WrapperObject';
import { ILatLng } from '../map/LonLat';
import { queryTechnicianAbsences, queryMapServiceResources, queryCurrentTimeSheetServiceOrderAndCodes, queryTechnicianServiceAppointmentWorkOrders } from '../../actions/http/jsforce';
import { queryServiceResources } from '../../actions/http/jsforceBase';
import { conditions } from '../../actions/http/jsforceMappings';
import { TechnicianStatus } from '../../constants/TechnicianStatus';
import { LocatableMapMarker } from '../map/Locatable';
import { technicianMarker, transparentMarker } from 'src/containers/pages/markers';
import { FitterLocation } from '../api/mapApi';
import { IGlobalState, serviceResourceEnabledFromState } from '../globalState';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { coordinatesFromAsset } from '../feed/Callout';
import * as _ from 'lodash';

export function queryTechnicianDetails(ids: string[], entityFieldsData: EntityFieldsData) {
    return queryServiceResources([conditions.SObject.ids(ids), conditions.ServiceResource.ResourceType]).sort('Name','ASC')
        .then(serviceResources => queryCurrentTimeSheetServiceOrderAndCodes(serviceResources))
        .then(tes => queryTechnicianAbsences(tes))
        .then(tes => queryTechnicianServiceAppointmentWorkOrders(tes, entityFieldsData))
        .then(tes => tes.map(t => new Technician(t, entityFieldsData)));
}

export class TechnicianListItem<T extends IServiceResourceWithMetrics> extends SalesforceListItem<T> {
    constructor(t: T, protected entityFieldsData: EntityFieldsData) {
        super(t);
    }

    get entityType() {
        return EntityType.Technician;
    }

    get technicianStatus(){
        return this.value.technicianStatus
    }
    
    bodyText() { return ''; }

    get title() {
        return this.fullName;
        //return joinOptionals([this.getEntityName(), this.fullName], ' - ', true);
    }

    get fullName() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.Name;
        //return joinOptionals([this.value.fitterFirstName, this.value.fitterLastName], ' ', true);
    }
    
    get accountApiForTitle() {
        return null as IApiNameAndId;
    }
    
    get modalType() {
        return ModalType.TechnicianDialog;
    }

    get queryDetails() {
        return () => queryTechnicianDetails([this.id], this.entityFieldsData).then(ts => ts[0]);
    }
}

class Technician extends TechnicianListItem<IServiceResourceWithMetrics> implements IDialogListItem, LocatableMapMarker {

    get coordinates() {
        return {
            lat: this.value.LastKnownLatitude,
            lng: this.value.LastKnownLongitude,
            type: EntityType.Technician
        };
    }

    get assetCoordinates() {
        return coordinatesFromAsset(this.serviceAppointmentWorkOrder && this.serviceAppointmentWorkOrder.Asset, EntityType.Technician);
    }

    get lastKnownLocationDate() {
        return this.value.LastKnownLocationDate;
    }

    marker(state: IGlobalState) {
        const fitterLocation: FitterLocation = state.configuration.fitterLocation;
        return queryMapServiceResources([conditions.ServiceTerritoryMember.serviceResource(this.id)], null, serviceResourceEnabledFromState(state))
            .then(msr => msr.length > 0 ? transparentMarker(technicianMarker(msr[0], this.id, fitterLocation)) : null);
    }

    get id() {
        return this.value.Id;
    }
    
    get telMobile() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.MobilePhone;
    }

    get email() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.Email;
    }

    get fitterNumber() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.EmployeeNumber;
    }

    get roundNumber() {
        // return this.value.Work_Center_Assignments__r && this.value.Work_Center_Assignments__r.records.map(a => a.Work_Center__r.Name).join(', ');
        return _.uniq(this.value.Work_Center_Assignments__r && this.value.Work_Center_Assignments__r.records.map(a => a.Work_Center__r.Name)).join(', ')

    }

    get timeEntryCodes() {
        return this.value.timeEntryCodes;
    }

    get currentTimeSheetServiceOrder() {
        return this.value.currentTimeSheetServiceOrder;
    }

    get serviceAppointmentWorkOrder() {
        return this.value.serviceAppointmentWorkOrder;
    }

    //for service resource enabled territories
    get lastCompletedWorkOrder() {
        return this.value.lastCompletedWorkOrder;
    }

    get nextAbsenceStarts() {
        return this.value.nextAbsenceStarts;
    }

    get absentUntil() {
        return this.value.absentUntil;
    }

    /*
    get openDiscussions() {
        return this.value.openDiscussions;
    }

    get openAudits() {
        return this.value.openAudits;
    }
    */
}

export class TechnicianTechnicianReport extends WrapperObject<IServiceResourceTechnicianReport> {

    constructor(value: IServiceResourceTechnicianReport, public status: TechnicianStatus, public serviceAppointWorkOrder: IWorkOrderLocation) {
        super(value);
    }

    get id() {
        return this.value.Id;
    }

    get fullName() {
        //return this.value.RelatedRecord.Name;
        return this.value.Name;
    }

    get firstName() {
        return this.value.RelatedRecord == null ? this.value.Name : this.value.RelatedRecord.FirstName  ;
    }

    get lastName() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.LastName ;
    }

    get phone() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.MobilePhone ;
    }

    get fitterNumber() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.EmployeeNumber;
    }

    get email() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.Email;
    }

    get workCenterNumbers() {
        return _.uniq(this.value.Work_Center_Assignments__r && this.value.Work_Center_Assignments__r.records.map(a => a.Work_Center__r.Name)).join(', ')
    }

    get position(): ILatLng {
        return this.value.LastKnownLongitude && this.value.LastKnownLatitude && 
        { lng: this.value.LastKnownLongitude, lat: this.value.LastKnownLatitude };
    }

}

export default Technician;
