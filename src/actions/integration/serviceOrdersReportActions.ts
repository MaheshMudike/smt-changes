import { itemsStateAsyncActionNames, payloadAction } from '../actionUtils';
import { getJsforceCollectionAction } from '../http/jsforce';
import { queryWorkOrdersBase } from '../http/jsforceBase';
import { conditions } from '../http/jsforceMappings';
import { plannerGroupIdFromState, activeInFSMFromState } from '../../models/globalState';
import * as fields from "../http/queryFields";
import { Moment } from 'moment';
import { ServiceOrderReportTab } from '../../reducers/serviceOrdersReportReducer';
import { WorkOrderForServiceOrdersReport } from '../../models/api/coreApi';
import { WorkOrderServiceOrderReport } from '../../models/feed/Callout';
import { multiQuery1Extract, multiQuery1, joinQueries } from '../http/jsforceCore';
import * as _ from 'lodash';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const QUERY_SERVICE_ORDERS_REPORT = itemsStateAsyncActionNames('QUERY_SERVICE_ORDERS_REPORT');

export const SELECT_SERVICE_ORDERS_REPORT_TAB = 'SELECT_SERVICE_ORDERS_REPORT_TAB';
export const SELECT_SERVICE_ORDERS_REPORT_TYPES = 'SELECT_SERVICE_ORDERS_REPORT_TYPES';
export const SELECT_SERVICE_ORDERS_REPORT_WORKCENTERS = 'SELECT_SERVICE_ORDERS_REPORT_WORKCENTERS';

// function queryServiceOrdersForReport(serviceTerritoryId: string, activeInFSM: boolean, startDate: Moment, endDate: Moment) {
//     const { earliestStartDateBetween, serviceTerritory, open, notSiteVisitWorkOrder, Y99, endDateBetween } = conditions.WorkOrder;
//     return multiQuery1Extract(queryWorkOrdersBase<WorkOrderForServiceOrdersReport>(
//         [serviceTerritory(serviceTerritoryId), endDateBetween(startDate, endDate), open(activeInFSM), notSiteVisitWorkOrder, Y99.negate() ], fields.IWorkOrderForServiceOrdersReport).sort('Earliest_Start_Date__c', 'ASC')
//     );
// }
async function queryServiceOrdersForReport(serviceTerritoryId: string, activeInFSM: boolean, startDate: Moment, endDate: Moment) {
    const { earliestStartDateBetween, serviceTerritory, open, openFSMandKonect, notSiteVisitWorkOrder, Y99, endDateBetween } = conditions.WorkOrder;
    const IdsChunk = await multiQuery1(queryWorkOrdersBase<WorkOrderForServiceOrdersReport>(
        [serviceTerritory(serviceTerritoryId), endDateBetween(startDate, endDate), openFSMandKonect, notSiteVisitWorkOrder, Y99.negate() ], ['Id'])
         ).then(res => {             
             return _.chunk(res.queries.result[0].map(wo=> wo.Id),200);
         });
         const wos = await joinQueries(
            ...IdsChunk.map(ids =>
                multiQuery1(queryWorkOrdersBase<WorkOrderForServiceOrdersReport>(
                    [ conditions.WorkOrder.ids(ids), serviceTerritory(serviceTerritoryId), endDateBetween(startDate, endDate), openFSMandKonect, notSiteVisitWorkOrder, Y99.negate() ], 
                    fields.IWorkOrderForServiceOrdersReport).sort('Earliest_Start_Date__c', 'ASC'))
                )).then(
                    res => res.queries.result[0]
                )
            if(isAndroid()){ firebaseStopTrace('Open Work Orders Report trace') }
        return wos; 
}

export function queryServiceOrdersReport() {
    if(isAndroid()){ firebaseStartTrace('Open Work Orders Report trace') }
    return getJsforceCollectionAction(
        state => queryServiceOrdersForReport(
            plannerGroupIdFromState(state), activeInFSMFromState(state), state.serviceOrdersReport.startDate24Months, state.serviceOrdersReport.endDate
        ),
        WorkOrderServiceOrderReport, QUERY_SERVICE_ORDERS_REPORT
    );
}

export function selectServiceOrdersReportTab(tab: ServiceOrderReportTab) {
    return payloadAction(SELECT_SERVICE_ORDERS_REPORT_TAB)(tab);
}

export function selectServiceOrderTypes(types: string[]) {
    return payloadAction(SELECT_SERVICE_ORDERS_REPORT_TYPES)(types);
}

export function selectServiceOrderWorkcenters(workcenters: string[]) {
    return payloadAction(SELECT_SERVICE_ORDERS_REPORT_WORKCENTERS)(workcenters);
}