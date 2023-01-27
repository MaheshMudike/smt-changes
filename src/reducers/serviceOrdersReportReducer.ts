import { IPayloadAction } from "../actions/actionUtils";
import { ActionStatus } from "../actions/actions";
import * as moment from 'moment';
import { SELECT_SERVICE_ORDERS_REPORT_TAB, QUERY_SERVICE_ORDERS_REPORT, SELECT_SERVICE_ORDERS_REPORT_TYPES, SELECT_SERVICE_ORDERS_REPORT_WORKCENTERS } from "../actions/integration/serviceOrdersReportActions";
import { WorkOrderServiceOrderReport } from "../models/feed/Callout";
import { MaintenanceActivityTypeReportFilter } from "src/components/reports/ServiceOrdersReport";

export enum ServiceOrderReportTab {
    Type = "Type", 
    Workcenter = "Workcenter"
}

const defaultServiceOrdersReport = {
    serviceOrders: [] as WorkOrderServiceOrderReport[],
    workcenters: [] as string[],
    serviceOrderTypes: [] as MaintenanceActivityTypeReportFilter[],
    currentTab: ServiceOrderReportTab.Type,
    //startDate: moment().startOf('year'),
    //endDate: moment().endOf('year'),
    startDate24Months: moment().subtract(24, 'months'),
    startDate6Months: moment().subtract(7, 'months'),
    startDate: moment().subtract(6, 'months'),
    endDate: moment().add(3, 'months'),
    actionStatus: ActionStatus.SUCCESS
}

export type IServiceOrdersReport = typeof defaultServiceOrdersReport;


export function serviceOrdersReportReducer(state = defaultServiceOrdersReport, action: IPayloadAction<any>): IServiceOrdersReport {
    switch (action.type) {

        case QUERY_SERVICE_ORDERS_REPORT.start: return { ...state, actionStatus: ActionStatus.START };
        case QUERY_SERVICE_ORDERS_REPORT.success: return { ...state, serviceOrders: action.payload, actionStatus: ActionStatus.SUCCESS };
        case QUERY_SERVICE_ORDERS_REPORT.failure: return { ...state, actionStatus: ActionStatus.FAILURE };
        case SELECT_SERVICE_ORDERS_REPORT_TAB: return { ...state, currentTab: action.payload };
        case SELECT_SERVICE_ORDERS_REPORT_TYPES: return { ...state, serviceOrderTypes: action.payload };
        case SELECT_SERVICE_ORDERS_REPORT_WORKCENTERS: return { ...state, workcenters: action.payload };
        default: return state;
    }
}

