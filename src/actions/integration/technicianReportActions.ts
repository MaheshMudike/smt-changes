import { itemsStateAsyncActionNames, payloadAction } from '../actionUtils';
import { queryServiceAppointmentTechnicianStatus, queryCurrentServiceAppointmentWorkOrderLocationByTechnician, queryWorkOrdersCompletedByTechnician, technicianStatusFromWorkOrder } from '../http/jsforce';
import { queryServiceTerritoryMemberBase, queryServiceResources } from '../http/jsforceBase';
import { conditions } from '../http/jsforceMappings';
import { TechnicianTechnicianReport } from '../../models/technicians/Technician';
import { plannerGroupIdFromState, activeInFSMFromState, serviceResourceEnabledFromState } from '../../models/globalState';
import * as _ from 'lodash';
import * as fields from "../http/queryFields";
import { asyncHttpActionGeneric } from '../http/httpActions';
import { TechnicianStatus } from 'src/constants/TechnicianStatus';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const LOAD_TECHNICIAN_REPORT = itemsStateAsyncActionNames('LOAD_TECHNICIAN_REPORT');
export const FILTER_TECHNICIAN_REPORT = 'FILTER_TECHNICIAN_REPORT';
export const SET_UOM_TECHNICIAN_REPORT = 'SET_UOM_TECHNICIAN_REPORT';
export const SORT_TECHNICIAN_REPORT = 'SORT_TECHNICIAN_REPORT';

export function queryTechnicianReport() {
    if(isAndroid()){ firebaseStartTrace('Technician Report trace') }
    return asyncHttpActionGeneric(
        async state => {
            const members = await queryServiceTerritoryMemberBase([conditions.ServiceTerritoryMember.serviceTerritory(plannerGroupIdFromState(state)),conditions.ServiceTerritoryMember.effectiveEndDate()], ['ServiceResourceId']);
            const serviceResources = await queryServiceResources([conditions.ServiceResource.ids(_.uniq(members.map(m => m.ServiceResourceId))), conditions.ServiceResource.ResourceType], fields.IServiceResourceTechnicianReport);
            const serviceResourceIds = serviceResources.map(sr => sr.Id);

            //* Real-time geolocation, Konect (live Israel)
            if(serviceResourceEnabledFromState(state)) {
                const workOrdersByTechnician = await queryWorkOrdersCompletedByTechnician(serviceResourceIds);
                return serviceResources.map(t => {
                    const workOrders = workOrdersByTechnician[t.Id];
                    const workOrder = workOrders != null && workOrders.length > 0 ? workOrders[0] : null;
                    if(isAndroid()){ firebaseStopTrace('Technician Report trace') }
                    return new TechnicianTechnicianReport(t, technicianStatusFromWorkOrder(workOrder), workOrder)
                });
            //*Last backreported geolocation, FSM (live Belgium)
            } else {
                const workorderLocationByServiceResourceId = await queryCurrentServiceAppointmentWorkOrderLocationByTechnician(serviceResourceIds);
                const statusById =  await queryServiceAppointmentTechnicianStatus(serviceResourceIds, state.configuration.technicianInactivityLimitInDays);
                if(isAndroid()){ firebaseStopTrace('Technician Report trace') }
                return serviceResources.map(t => new TechnicianTechnicianReport(t, statusById[t.Id], workorderLocationByServiceResourceId[t.Id]));
            }
        },
        LOAD_TECHNICIAN_REPORT
    );
}

export function filterTechnicianReport(filterTechnicians: boolean) {
    return payloadAction(FILTER_TECHNICIAN_REPORT)(filterTechnicians);
}

/*
export function setUnitOfMeasure(uom: UnitOfMeasure | UnitOfMeasure[]) {
    return payloadAction(SET_UOM_TECHNICIAN_REPORT)(uom);
}
*/

export function sortTechnicianReport(sortBy: string) {
    return payloadAction(SORT_TECHNICIAN_REPORT)(sortBy);
}