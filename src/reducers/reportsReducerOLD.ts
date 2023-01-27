import { IAccountReportPayload } from "src/models/api/reports/accountReportApi";
import { IPayloadAction } from "src/actions/actionUtils";
import { Actions, ActionStatus, ReportActionTypes, ReportQueryTypes } from "src/actions/actions";
import { combineReducers } from "redux";
import { GENERATE_REPORT, CLOSE_REPORT, SELECT_ACCOUNT_REPORT } from "../actions/integration/reportActions";

//this reducer handles each section separately and uses type-checked actions, maybe useful in the future

function handleReportsReducerAction(state:  _.Dictionary<IAccountReportPayload>, action: ReportQueryTypes, 
    buildNewReport: (iarp: IAccountReportPayload, status: ActionStatus) => IAccountReportPayload) {

    const { accountId, accountName } = action.payload;
    const currentReport = state[accountId] || { accountId, accountName, createdDate: new Date() };
    
    switch (action.status) {
        case ActionStatus.START:
            state[accountId] = buildNewReport(currentReport, ActionStatus.START);
            return state;
        case ActionStatus.FAILURE:
            state[accountId] = buildNewReport(currentReport, ActionStatus.FAILURE);
            return state;
        case ActionStatus.SUCCESS:                   
            state[accountId] = buildNewReport(currentReport, ActionStatus.SUCCESS);
            return state;
    }
}

function reportBuilder(action: ReportActionTypes): (ar: IAccountReportPayload, status: ActionStatus) => IAccountReportPayload {
    switch (action.type) {        
        case Actions.QUERY_REPORT_ACCOUNTS: return (ar, s) => { return { ...ar, accounts: action.payload.records, accountsStatus: s } };
        case Actions.QUERY_REPORT_CONTRACTS: return (ar, s) => { return { ...ar, contracts: action.payload.records, contractsStatus: s } };
        case Actions.QUERY_REPORT_EQUIPMENT: return (ar, s) => { return { ...ar, equipments: action.payload.records, equipmentsStatus: s } };
        case Actions.QUERY_REPORT_EVENTS: return (ar, s) => { return { ...ar, events: action.payload.records, eventsStatus: s} };

        case Actions.QUERY_REPORT_LEADS: return (ar, s) => { return { ...ar, leads: action.payload.records, leadsStatus: s } };
        case Actions.QUERY_REPORT_COMPLAINTS: return (ar, s) => { return { ...ar, complaints: action.payload.records, complaintsStatus: s } };
        case Actions.QUERY_REPORT_INVOICES: return (ar, s) => { return { ...ar, unpaidInvoices: action.payload.records, unpaidInvoicesStatus: s } };
        case Actions.QUERY_REPORT_NOTES: return (ar, s) => { return { ...ar, notes: action.payload.records, notesStatus: s } };
        case Actions.QUERY_REPORT_SURVEYS: return (ar, s) => { return { ...ar, customerSurveys: action.payload.records, customerSurveysStatus: s } };
        case Actions.QUERY_REPORT_VERSIONS: return (ar, s) => { return { ...ar, tenders: action.payload.records, tendersStatus: s} };

        case Actions.QUERY_REPORT_OPPORTUNITIES: return (ar, s) => { return { ...ar, opportunities: action.payload.records, opportunitiesStatus: s } };
        case Actions.QUERY_REPORT_QUERIES: return (ar, s) => { return { ...ar, queries: action.payload.records, queriesStatus: s } };
        case Actions.QUERY_REPORT_COMPLAINTS: return (ar, s) => { return { ...ar, complaints: action.payload.records, complaintsStatus: s } };        
        case Actions.QUERY_REPORT_TECHNICIANS: return (ar, s) => { return { ...ar, technicians: action.payload.records, techniciansStatus: s } };        
    }
    return null;
}
/*
function reportsReducer(state:  _.Dictionary<IAccountReportPayload> = {}, action: ReportQueryTypes): _.Dictionary<IAccountReportPayload> {
    var buildNewReport = reportBuilder(action);
    if(buildNewReport != null) return handleReportsReducerAction(state, action, buildNewReport);
    return state;
}
*/
const defaultReportState = {
    createdDate: null as Date,
    accounts: null,
    contracts: null,
    customerVisits: null,
    complaints: null,
    queries: null,
    opportunities: null,
    unpaidInvoices: null,
    notes: null,
    customerSurveys: null,
    leads: null,
    tenders: null,
    equipments: null,
    technicians: null,
    status: null
} as IAccountReportPayload & IActionStatus;

interface IActionStatus { status: ActionStatus }

export function reportsReducerSimple(state = defaultReportState, action: IPayloadAction<IAccountReportPayload>): IAccountReportPayload & IActionStatus {
    switch (action.type) {
        case GENERATE_REPORT.start: return { ...state, status: ActionStatus.START }
        case GENERATE_REPORT.success: return { ...state, ...action.payload, status: ActionStatus.SUCCESS };
        case GENERATE_REPORT.failure: return { ...state, status: ActionStatus.FAILURE };
        default: return state;
    }
}

function reportsReducerNew(state: _.Dictionary<IAccountReportPayload & IActionStatus> = {}, action: IPayloadAction<any>) {    
    if(action.payload == null || action.payload.accountId == null) return state;

    const changeReport = (accountId: string, newAccountReportState: IAccountReportPayload) => ({ ...state, [accountId]: newAccountReportState });
    var newAccountReportState = {};
    switch (action.type) {
        case CLOSE_REPORT:            
            const newState = { ...state };
            delete newState[action.payload.accountId];
            return newState;
        case GENERATE_REPORT.start:
            newAccountReportState = { ...defaultReportState, status: ActionStatus.START, createdDate: new Date() };
            return { ...state, [action.payload.accountId]: newAccountReportState }
        case GENERATE_REPORT.failure:
            newAccountReportState = { ...state[action.payload.accountId], status: ActionStatus.FAILURE }
            return { ...state, [action.payload.accountId]: newAccountReportState }
        case GENERATE_REPORT.success:
            newAccountReportState = { ...state[action.payload.accountId], ...action.payload, status: ActionStatus.SUCCESS }
            return { ...state, [action.payload.accountId]: newAccountReportState }
    }
    return state;
    
}

//state:  { accountId: string, reports: _.Dictionary<IAccountReportPayload> } = { accountId: null, reports: {} }, action: ReportActionTypes) {
function reportAccountReducer(accountId: string = null, action: IPayloadAction<any>) {
    switch(action.type) {
        case SELECT_ACCOUNT_REPORT:
            return action.payload
    }
    return accountId;
}

export default combineReducers({
    accountId: reportAccountReducer,
    reports: reportsReducerNew
});