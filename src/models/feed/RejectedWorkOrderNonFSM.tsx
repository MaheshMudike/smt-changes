
import { IWorkOrderRejectedListItemNonFSM } from '../api/coreApi';
import { conditions } from '../../actions/http/jsforceMappings';
import * as _ from 'lodash';
import * as moment from 'moment';
import Callout, { queryWorkOrderDetail, workorderNumer } from './Callout';
import { SalesforceListItem } from './SalesForceListItem';
import { joinOptionals } from 'src/utils/formatUtils';
import { EntityType } from 'src/constants/EntityType';
import { ModalType } from 'src/constants/modalTypes';
import { maintenanceActivityTypeFilterDescription } from 'src/constants/ServiceOrderType';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { workorderTechnicianNameKonect } from 'src/components/fields/calloutFields';

export class RejectedWorkOrderNonFSMListItem<T extends IWorkOrderRejectedListItemNonFSM> extends SalesforceListItem<T> {

    constructor(value: T, private entityFieldsData: EntityFieldsData) {
        super(value);
    }

    get isHighPriority(): boolean {
        return conditions.WorkOrder.highPriority(this.entityFieldsData.activeInFSM).isFullfilledBy(this.value);
    }

    get title() {
        return joinOptionals(
            [
                this.visitType, 
                workorderNumer(this.entityFieldsData.activeInFSM, this.value)
            ]
            , ' ', true
        );
    }
    
    bodyText() {
        return this.technicianNameForGrouping;
    }

    get entityType() { return EntityType.Callout; }

    get accountApiForTitle() { return null as { Id: string; Name: string; }; }

    get modalType() {
        return null as ModalType;
    }

    get visitType() {
        return maintenanceActivityTypeFilterDescription(this.value.Maintenance_Activity_Type__c, this.value.Service_Order_Type__c);
    }

    get maintenanceActivityType() {
        return this.value.Maintenance_Activity_Type__c;
    }

    get serviceOrderType() {
        return this.value.Service_Order_Type__c;
    }

    public queryDetails = () => queryWorkOrderDetail(this.id, this.entityFieldsData).then(c => new RejectedWorkOrderNonFSM(c, this.entityFieldsData));

    get technicianName() {
        return this.value.Technician_Name__c;
    }

    get technicianNameForGrouping() {
        return workorderTechnicianNameKonect(this.entityFieldsData.serviceResourceEnabled, this);
    }

    get completedBy() {
        return this.value.Completed_By__r;
    }

    get completedByName() {
        return this.value.Completed_By__r && this.value.Completed_By__r.Name;
    }

    get newStatusDate() {
        return moment(this.value.New_Status_Date__c);
    }

    //TODO remove this
    get newStatusDateApi() {
        return this.value.New_Status_Date__c;
    }

}

export default class RejectedWorkOrderNonFSM extends RejectedWorkOrderNonFSMListItem<IWorkOrderRejectedListItemNonFSM> {
    constructor(public workOrder: Callout, entityFieldsData: EntityFieldsData) {
        super(workOrder.value, entityFieldsData);
    }
}