import * as coreApi from 'src/models/api/coreApi';
import { Action } from 'redux';
import { IAccountReportPartialPayload } from 'src/models/api/reports/accountReportApi';

export enum ActionStatus {
    //todo rename to IN_PROGRESS
    START = "START",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}

export interface IActionStatus { status: ActionStatus }

export enum Actions {
    QUERY_REPORT_INIT = "QUERY_REPORT_INIT",
    QUERY_REPORT_ACCOUNTS = "QUERY_REPORT_ACCOUNTS",
    QUERY_REPORT_CONTRACTS = "QUERY_REPORT_CONTRACTS",
    QUERY_REPORT_EQUIPMENT = "QUERY_REPORT_EQUIPMENT",
    QUERY_REPORT_EVENTS = "QUERY_REPORT_EVENTS",
    QUERY_REPORT_LEADS = "QUERY_REPORT_LEADS",
    QUERY_REPORT_QUERIES = "QUERY_REPORT_QUERIES",
    QUERY_REPORT_COMPLAINTS = "QUERY_REPORT_COMPLAINTS",
    QUERY_REPORT_OPPORTUNITIES = "QUERY_REPORT_OPPORTUNITIES",
    QUERY_REPORT_INVOICES = "QUERY_REPORT_INVOICES",
    QUERY_REPORT_NOTES = "QUERY_REPORT_NOTES",
    QUERY_REPORT_SURVEYS = "QUERY_REPORT_SURVEYS",
    QUERY_REPORT_VERSIONS = "QUERY_REPORT_VERSIONS",
    QUERY_REPORT_SELECT_ACCOUNT = "QUERY_REPORT_SELECT_ACCOUNT",
    QUERY_REPORT_TECHNICIANS = "QUERY_REPORT_TECHNICIANS",
    OTHER_ACTION = "__any_other_action_type__"
}

export interface MyAction<T, U extends Actions> extends Action {
    status: ActionStatus;
    payload: T;
    readonly type: U;
}

abstract class PayLoadAction<T> {
    constructor(public status: ActionStatus = ActionStatus.START, public payload: T = null) {}
    readonly abstract type: Actions
}

export class ReportSearchAccounts {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IAccountReport[]>) {}
    readonly type = Actions.QUERY_REPORT_ACCOUNTS;
}
export class ReportQueryEvents {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IEventReport[]>) {}
    readonly type = Actions.QUERY_REPORT_EVENTS;
}
export class ReportSearchEquipment {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IAssetReport[]>) {}
    readonly type = Actions.QUERY_REPORT_EQUIPMENT;
}
export class ReportSearchInvoices {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IInvoiceReport[]>) {}
    readonly type = Actions.QUERY_REPORT_INVOICES;
}
export class ReportQueryLeads {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.ILeadReport[]>) {}
    readonly type = Actions.QUERY_REPORT_LEADS;
}
export class ReportQueryNotes {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.INote[]>) {}
    readonly type = Actions.QUERY_REPORT_NOTES;
}
export class ReportQuerySurveys {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IFlowSurvey[]>) {}
    readonly type = Actions.QUERY_REPORT_SURVEYS;
}
export class ReportQueryContracts {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IServiceContractReport[]>) {}
    readonly type = Actions.QUERY_REPORT_CONTRACTS;
}

export class ReportQueryVersions {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IVersionReport[]>) {}
    readonly type = Actions.QUERY_REPORT_VERSIONS;
}
export class ReportQueryOpportunities {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IOpportunity[]>) {}
    readonly type = Actions.QUERY_REPORT_OPPORTUNITIES;
}
export class ReportQueryQueries {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IQuery[]>) {}
    readonly type = Actions.QUERY_REPORT_QUERIES;
}
export class ReportQueryComplaints {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IComplaint[]>) {}
    readonly type = Actions.QUERY_REPORT_COMPLAINTS;
}
export class ReportQueryTechnicians {
    constructor(public status: ActionStatus, public payload: IAccountReportPartialPayload<coreApi.IServiceResourceReport[]>) {}
    readonly type = Actions.QUERY_REPORT_TECHNICIANS;
}

export class ReportSelectAccount {
    constructor(public payload: string) {}
    readonly type = Actions.QUERY_REPORT_SELECT_ACCOUNT;
}

export type ReportQueryTypes = ReportSearchAccounts | ReportQueryContracts | ReportQueryEvents 
    | ReportSearchEquipment | ReportQueryQueries | ReportQueryComplaints | ReportQueryOpportunities | ReportQueryLeads | ReportSearchInvoices
    | ReportQueryNotes | ReportQuerySurveys | ReportQueryVersions | ReportQueryTechnicians;

export type ReportActionTypes = ReportQueryTypes | ReportSelectAccount
export type AllActionTypes = ReportActionTypes;