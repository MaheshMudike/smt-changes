import * as coreApi from '../coreApi';
import { ActionStatus } from 'src/actions/actions';

export interface IAccountReportPayload {
    createdDate: Date;
    accountId: string;
    accountName: string;
    //lang?: string;
    accounts?: coreApi.IAccountReport[];
    contracts?: coreApi.IServiceContractReport[];
    customerVisits?: coreApi.IEventReport[];
    complaints?: coreApi.IComplaintReport[];
    queries?: coreApi.IQueryReport[];
    opportunities?: coreApi.IOpportunityReport[];
    unpaidInvoices?: coreApi.IInvoiceReport[];
    notes?: coreApi.INote[];
    customerSurveys?: coreApi.IFlowSurvey[];
    transactionalSurveys?: coreApi.NPX_Survey_Record__c[];
    leads?: coreApi.ILeadReport[];
    tenders?: coreApi.IVersionReport[];
    equipments?: coreApi.IAssetReport[];
    technicians?: coreApi.IServiceResourceReport[];
    equipmentContractLines?: coreApi.IContractLineItemReport[];

    accountsStatus?: ActionStatus;
    contractsStatus?: ActionStatus;
    customerVisitsStatus?: ActionStatus;
    complaintsStatus?: ActionStatus;
    queriesStatus?: ActionStatus;
    opportunitiesStatus?: ActionStatus;
    unpaidInvoicesStatus?: ActionStatus;
    notesStatus?: ActionStatus;
    customerSurveysStatus?: ActionStatus;
    transactionalSurveysStatus?: ActionStatus;
    leadsStatus?: ActionStatus;
    tendersStatus?: ActionStatus;
    equipmentsStatus?: ActionStatus;
    techniciansStatus?: ActionStatus;
}

export interface IAccountReportPartialPayload<T> {
    accountId: string;
    accountName: string;
    records: T;
}
