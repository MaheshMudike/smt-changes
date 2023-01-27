import { TRACTION_CONTROL_REPORT_DOWNLOAD, TRACTION_CONTROL_REPORTS_QUERY, TRACTION_CONTROL_REPORT_SELECT, TRACTION_CONTROL_REPORT_QUERY, TRACTION_CONTROL_REPORT_SELECT_MONTH } from "../actions/tractionControlActions";
import { ActionStatus } from "../actions/actions";
import { IPayloadAction } from "../actions/actionUtils";
import { ContentDocument } from "../models/api/coreApi";
import { IdentifiableTitleBodyHighPriority } from "src/models/list/IListItem";

const defaultState = { htmlContent: null as string, status: ActionStatus.START }

export type ITractionControlReportState = typeof defaultState;

export function tractionControlReducer(state: ITractionControlReportState = defaultState, action: IPayloadAction<string>): ITractionControlReportState {
    switch (action.type) {
        case TRACTION_CONTROL_REPORT_DOWNLOAD.start:
            return defaultState;
        case TRACTION_CONTROL_REPORT_DOWNLOAD.failure:
            return { ...state, status: ActionStatus.FAILURE };
        case TRACTION_CONTROL_REPORT_DOWNLOAD.success:                   
            return { htmlContent: action.payload, status: ActionStatus.SUCCESS };
    }
    return state;    
}

export interface ITractionControlReport extends IdentifiableTitleBodyHighPriority {
    versionData: string, fileType: string, fileExtension: string
}

const defaultTractionControlReports = {
    reports: [] as ContentDocument[],
    actionStatus: ActionStatus.SUCCESS,
    selectedYearMonth: null as string,
    selectedReportDownloadStatus: ActionStatus.SUCCESS,
    selectedReport: null as ITractionControlReport,
    selectedReportData: null as { data: string, dataBinary?: Blob }
}

export type ITractionControlReports = typeof defaultTractionControlReports;

export function tractionControlReportsReducer(state: ITractionControlReports = defaultTractionControlReports, action: IPayloadAction<any>): ITractionControlReports {
    switch (action.type) {
        case TRACTION_CONTROL_REPORTS_QUERY.start:
            return defaultTractionControlReports;
        case TRACTION_CONTROL_REPORTS_QUERY.failure:
            return { ...state, actionStatus: ActionStatus.FAILURE };
        case TRACTION_CONTROL_REPORTS_QUERY.success:                   
            return { ...state, reports: action.payload, actionStatus: ActionStatus.SUCCESS };

        case TRACTION_CONTROL_REPORT_QUERY.start:
            return { ...state, selectedReportData: null, selectedReportDownloadStatus: ActionStatus.START };
        case TRACTION_CONTROL_REPORT_QUERY.failure:
            return { ...state, selectedReportDownloadStatus: ActionStatus.FAILURE };
        case TRACTION_CONTROL_REPORT_QUERY.success:
            return { ...state, selectedReportData: action.payload, selectedReportDownloadStatus: ActionStatus.SUCCESS };
    
        case TRACTION_CONTROL_REPORT_SELECT:
            return { ...state, selectedReport: action.payload }
        case TRACTION_CONTROL_REPORT_SELECT_MONTH:
            return { ...state, selectedYearMonth: action.payload }
    }
    return state;    
}
