import { EntityType } from '../../constants/EntityType';

import { joinOptionals } from '../../utils/formatUtils';
import { IWorkOrder, IWorkOrderRejectedListItem, IServiceAppointmentRejectedListItem, IServiceAppointmentRejected, IServiceAppointment } from '../api/coreApi';
import { conditions } from '../../actions/http/jsforceMappings';
import * as _ from 'lodash';
import { SalesforceListItem } from './SalesForceListItem';
import { queryWorkordersWithServiceAppointments, queryWorkOrderContractLines } from '../../actions/http/jsforce';
import { queryServiceAppointmentsBase, queryWorkOrders } from '../../actions/http/jsforceBase';
import { multiQuery2 } from '../../actions/http/jsforceCore';
import { ModalType } from 'src/constants/modalTypes';
import * as moment from 'moment';
import * as fields from "../../actions/http/queryFields";
import Callout, { workorderNumer } from './Callout';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { maintenanceActivityTypeFilterDescription } from 'src/constants/ServiceOrderType';


//- on the left hand side: list of work orders with header 'WO number' - 
//'SA number (the one that has been rejected)' and 'technician name' below
export class RejectedServiceOrderListItem<T extends IWorkOrderRejectedListItem> extends SalesforceListItem<T> {

    constructor(t: T, public serviceAppointment: IServiceAppointmentRejectedListItem, private entityFieldsData: EntityFieldsData) {
        super(t);
    }

    get activeInFSM() {
        return this.entityFieldsData.activeInFSM;
    }

    get isHighPriority(): boolean {
        return conditions.WorkOrder.highPriority(this.activeInFSM).isFullfilledBy(this.value);
    }

    get title() {
        return joinOptionals(
            [
                this.visitType, 
                workorderNumer(this.activeInFSM, this.value),
                this.serviceAppointment && this.serviceAppointment.AppointmentNumber
            ]
            , ' ', true
        );
    }
    
    bodyText() {
        return this.serviceAppointmentAssignedServiceResourceName;
    }

    get serviceAppointmentAssignedServiceResourceName() {
        return this.serviceAppointment.Assigned_Service_Resource__r && this.serviceAppointment.Assigned_Service_Resource__r.Name;
    }

    get technicianNameForGrouping() {
        return this.serviceAppointmentAssignedServiceResourceName;
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

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Callout(c, userId));
        return multiQuery2(
            queryWorkOrders<IWorkOrder>([conditions.SObject.id(this.id)]),
            queryServiceAppointmentsBase<IServiceAppointmentRejected>(
                [conditions.SObject.id(this.serviceAppointment.Id)], 
                fields.IServiceAppointmentRejected
            )
        )
        .then(wosSapps => 
            queryWorkordersWithServiceAppointments(wosSapps.queries.result[0])
            .then(wos => queryWorkOrderContractLines(wos))
            .then(wos => new RejectedServiceOrder(new Callout(wos[0], this.entityFieldsData), wosSapps.queries.result[1][0], this.entityFieldsData))
            //TODO check queryDetails maybe add state param
        )
    }

    get newStatusDate() {
        return moment(this.serviceAppointment.New_Status_Date__c);
    }

    get newStatusDateApi() {
        return this.serviceAppointment.New_Status_Date__c;
    }

    get whatForEvent() {
        const account = { id: this.value.Asset.Account.Id, name: this.value.Asset.Account.Name };
        return { ...account, title: account.name, entityType: EntityType.Account };
    }

}

//- on the right hand side details of the selected WO, including: 'Technician name who rejected' + 'SA number rejected' + "
//Time of rejection" + "Reason for rejection" + WO details;
class RejectedServiceOrder extends RejectedServiceOrderListItem<IWorkOrderRejectedListItem> {
    constructor(public workOrder: Callout, public serviceAppointment: IServiceAppointmentRejected, entityFieldsData: EntityFieldsData) {
        super(workOrder.value, serviceAppointment, entityFieldsData);
    }
}

export default RejectedServiceOrder;
