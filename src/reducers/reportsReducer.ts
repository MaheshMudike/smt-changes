import { IAccountReportPayload } from "src/models/api/reports/accountReportApi";
import { IPayloadAction } from "src/actions/actionUtils";
import { ActionStatus } from "src/actions/actions";
import { combineReducers } from "redux";
import { GENERATE_REPORT, CLOSE_REPORT, SELECT_ACCOUNT_REPORT } from "../actions/integration/reportActions";

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