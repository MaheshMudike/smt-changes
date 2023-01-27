import { asyncActionNames, payloadAction } from '../actionUtils';
//import { ActionStatus, Actions, myAction, ReportSearchAccounts, ReportSearchContracts } from '../actions';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { GetGlobalState, activeInFSMFromState } from 'src/models/globalState';
import * as jsforce from '../http/jsforce';
import { query, multiQuery1, multiQuery3, multiQuery11, multiQuery1Extract, multiQuery12 } from '../http/jsforceCore';
import { Dispatch } from 'redux';
import * as fields from 'src/actions/http/queryFields';
import * as coreApi from '../../models/api/coreApi';
import translate from 'src/utils/translate';
import { replace } from 'react-router-redux';
import { paths } from 'src/config/paths';
import { queryOpportunitiesBase, queryEventsBase, queryWorkCenterAssignmentsBase, queryWorkOrdersBase, queryLeadsBase, queryServiceResourcesBase, queryAssetsBase, queryContractLinesBase, queryVersionBase, queryNpxSurveyRecordsBase, queryServiceContractBase } from '../http/jsforceBase';
import { conditions, ICondition, SObject } from '../http/jsforceMappings';
import INameAndId from '../../models/INameAndId';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ThunkAction } from '../thunks';
import { hideAllModals } from '../modalActions';
import { IAccountReportPayload } from 'src/models/api/reports/accountReportApi';
import { SfDate } from 'jsforce';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

/*
export const SEARCH_LOAD_REPORT = asyncActionNames('SEARCH_LOAD_REPORT');
export const POST_GENERATE_REPORT = asyncActionNames('POST_GENERATE_REPORT');
*/

export const GENERATE_REPORT = asyncActionNames('GENERATE_REPORT');
export const CLOSE_REPORT = 'CLOSE_REPORT';
export const SELECT_ACCOUNT_REPORT = 'SELECT_ACCOUNT_REPORT';

function wrapPartialReport<ApiObject, UiObject>(accountId: string, query: () => Promise<ApiObject[]> ) {
    return () => query().then(records => { return { accountId, records } } )
}

export function downloadReport(account: INameAndId): ThunkAction<void> {
    return (dispatch, getState) => {
        //selectAccount(dispatch, accountId);        
        dispatch(asyncHttpActionGeneric(() => queryReportData(account, activeInFSMFromState(getState()), getState().authentication.currentUser.defaultCurrencyIsoCode), GENERATE_REPORT, [],
            { 
                onFail: translate('layout.report-item.empty-title'),
                onSucceed: translate('layout.report-item.button.view-report'),
                action: () => { dispatch(showReport(account.id)) },
                actionTitle: account.name
            }//, _.identity, { accountId: account.id, accountName: account.name }
        )
        );
    }
}

async function queryReportData(account: INameAndId, activeInFSM: boolean, defaultCurrencyIsoCode: string): Promise<IAccountReportPayload> {
    if(isAndroid()){ firebaseStartTrace('Account Report trace') }
    const accountOptionsCustom = { Customer__c: { $eq: account.id } };
    const accountOptions = [conditions.Case.account(account.id)]
    const accountId = account.id;
    const accountName = account.name;

    const results = await multiQuery12(
        query<coreApi.IAccountReport>({ Id: { $eq: accountId } }, 'Account', fields.IAccountReport),
        queryOpportunitiesBase<coreApi.IOpportunityReport>([conditions.Opportunity.account(accountId),conditions.Opportunity.open,conditions.Opportunity.lastModified12Months()], fields.IOpportunityReport),
        queryLeadsBase<coreApi.ILeadReport>([conditions.Lead.account(accountId), conditions.Lead.notConverted], fields.ILeadReport),
        // queryAssetsBase<coreApi.IAssetReport>([conditions.Asset.account(accountId), conditions.Asset.active], fields.IAssetReport),
        //IN00717215 hard limiting Asset count to 100
        queryAssetsBase<coreApi.IAssetReport>([conditions.Asset.account(accountId), conditions.Asset.active], fields.IAssetReport).sort('CreatedDate','DESC').limit(100),
        query<coreApi.IInvoiceReport>({ ...accountOptionsCustom, Transfer_to_Accounting_Status__c: 'Not Cleared' }, 'Invoice__c', fields.IInvoiceReport),
        // query<coreApi.INote>({ ParentId: { $eq: accountId } }, 'Note', fields.INote).sort('CreatedDate','DESC'),
        //IN00717215 showing last 10 records
        query<coreApi.INote>({ ParentId: { $eq: accountId } }, 'Note', fields.INote).sort('CreatedDate','DESC').limit(10),
        query<coreApi.IFlowSurvey>({ Related_Account__c: { $eq: accountId } }, 'Flow_Survey__c', fields.IFlowSurvey),
        queryNpxSurveyRecordsBase<coreApi.NPX_Survey_Record__c>(
            [conditions.NPX_Survey_Record__c.account(accountId), conditions.NPX_Survey_Record__c.npiNotNull],
            fields.NPX_Survey_Record
        ).sort('Response_Received_Date__c', 'DESC').limit(10),
        //Show only active and expired past 12months + sort by active on top
        queryServiceContractBase<coreApi.IServiceContractReport>(
            [conditions["ServiceContract"].account(account.id),conditions["ServiceContract"].activeAndExpired12months],fields.IServiceContractReport).sort('Status','ASC'),
        // query<coreApi.IServiceContractReport>({ AccountId: { $eq: account.id }, 
        //                                         Status: { $in: ['Active','Expired'] },
        //                                         EndDate: { $gte: SfDate.toDateLiteral(moment().startOf('month').subtract(12,'months').format('YYYY-MM-DD')) } }, 
        //                                         SObject.ServiceContract, fields.IServiceContractReport).sort('Status','ASC'),
        queryEventsBase<coreApi.IEventReport>([conditions.Event.whatId(accountId)], fields.EventReport),
        jsforce.queryQueriesBase<coreApi.IQueryReport>(accountOptions, fields.IQueryReport).sort('CreatedDate','DESC').limit(10),
        jsforce.queryComplaintsBase<coreApi.IComplaintReport>(accountOptions, fields.IComplaintReport).sort('CreatedDate','DESC').limit(10),
        //queryServiceResourcesBase<coreApi.IServiceResourceReport>([], fields.IServiceResourceReport)
    );

    const [accounts, opportunities, leads, assets, unpaidInvoices, notes, customerSurveys, transactionalSurveys, contracts, customerVisits, queries, complaints] = results.queries.result;

    const opportunityIds = opportunities.map(o => o.Id);
    const { tenderOpportunities, active, tenderActive, open } = conditions.Version__c;
    const versionsWithTenderData = await multiQuery1Extract(
        queryVersionBase<coreApi.IVersionReport>([tenderOpportunities(opportunityIds), active, tenderActive, open], fields.IVersionReport).sort('CreatedDate', 'DESC')
    );

    const mainWorkCenters = assets.map(a => a.Main_Work_Center__c).filter(wc => wc != null);

    const results2 = await multiQuery3(
        assets.length > 0 ? queryWorkOrdersBase<coreApi.IWorkOrderReport>(
            [conditions.WorkOrder.asset(assets.map(a => a.Id)), conditions.WorkOrder.startDateLast12Months(), conditions.WorkOrder.Y99.negate(), conditions.WorkOrder.RecordType ], 
            fields.IWorkOrderReport
        ).sort('Completed_Date__c', 'ASC').limit(10000) : null,
        //queryWorkCenterAssignmentsBase([conditions.FSM_Work_Center_Assignment__c.serviceResources(technicians.map(t => t.Id))]),
        queryWorkCenterAssignmentsBase([conditions.FSM_Work_Center_Assignment__c.workCenters(mainWorkCenters)]),
        queryContractLinesBase<coreApi.IContractLineItemReport>([conditions.ContractLineItem.assets(assets.map(a => a.Id))], fields.IContractLineItemReport),
        )

    const [workOrders, workCenterAssignments, equipmentContractLines] = results2.queries.result;
        
    const ordersByAsset = _.groupBy(workOrders, 'AssetId');
    assets.forEach(a => createEquipmentServiceOrdersHistogram(a, ordersByAsset[a.Id], activeInFSM));

    const results3 = await multiQuery1(
        queryServiceResourcesBase<coreApi.IServiceResourceReport>(
            [conditions.SObject.ids(workCenterAssignments.map(wca => wca.Service_Resource__c))], 
            fields.IServiceResourceReport
        )
    )

    const [technicians] = results3.queries.result;
    const workCenterAssignmentsByServiceResource = _.groupBy(workCenterAssignments, 'Service_Resource__c');
    technicians.forEach(
        t => {
            const assignments = workCenterAssignmentsByServiceResource[t.Id] || [];
            t.roundNumber = assignments.map(assignment => assignment.Work_Center__r.Name).join(', ');
        }
    );
    unpaidInvoices.forEach(i => i.DefaultCurrencyIsoCode = defaultCurrencyIsoCode);
    opportunities.forEach(o => o.DefaultCurrencyIsoCode = defaultCurrencyIsoCode);
    versionsWithTenderData.forEach(t => t.DefaultCurrencyIsoCode = defaultCurrencyIsoCode);
    if(isAndroid()){ firebaseStopTrace('Account Report trace') }
    return { accountId, accountName, createdDate: new Date(), accounts, contracts, customerVisits, complaints, queries, opportunities, 
        unpaidInvoices, notes, customerSurveys, transactionalSurveys, leads, tenders: versionsWithTenderData, equipments: assets, technicians, 
        equipmentContractLines, status } as IAccountReportPayload;

}

function createEquipmentServiceOrdersHistogram(asset: coreApi.IAssetReport, workOrders: coreApi.IWorkOrderReport[], activeInFSM: boolean) {
    workOrders = workOrders || [];
    
const { callout, mbm, openFSMandKonect, closedFSMandKonect } = conditions.WorkOrder;
    //System_Calculated_SLA__c, Response_Time__c
    //https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/121799070/Customer+Preparation+Report

    asset.completedCallouts = workOrders.filter(w => callout.isFullfilledBy(w) && closedFSMandKonect.isFullfilledBy(w)).length;
    asset.otherCompletedServiceOrders = workOrders.filter(w => callout.isNotFullfilledBy(w) && closedFSMandKonect.isFullfilledBy(w)).length;
        
    asset.openMBMs = workOrders.filter(w => mbm.isFullfilledBy(w) && openFSMandKonect.isFullfilledBy(w)).length;
    asset.openServiceOrders = workOrders.filter(w => mbm.isNotFullfilledBy(w) && openFSMandKonect.isFullfilledBy(w))

    asset.closedServiceOrders = workOrders.filter(w => closedFSMandKonect.isFullfilledBy(w));

    const histogram = {} as any;
    //const year = moment().year();
    //for(let i = 0; i < 12; i++) histogram[(i + 1 ) + '.' + year] = 0;
    for(let i = 11; i >= 0; i--){
        histogram[(moment().subtract(i,"months").month()+1) + '.' + moment().subtract(i,"months").year()] = 0;
    }
    const callouts = workOrders.filter(w => callout.isFullfilledBy(w)&& closedFSMandKonect.isFullfilledBy(w)) ;
    callouts.forEach(wo => {
        var date = null;
        if(wo.Completed_Date__c != null && wo.Completed_Date__c != undefined){
            date = moment(wo.Completed_Date__c);
        }
        else{
            date = moment(wo.EndDate);
        }
        const index = (date.month() + 1 ) + '.' + date.year();
        if(histogram.hasOwnProperty(index)){
            histogram[index] = histogram[index] + 1;
        }
    });

    asset.serviceOrdersHistogram = histogram;
}

function selectAccount(dispatch: Dispatch<any>, accountId: string) {    
    //dispatch(toPlainObject(new actions.ReportSelectAccount(accountId)));
    dispatch(payloadAction(SELECT_ACCOUNT_REPORT)(accountId));
}

export function showReport(accountId: string) {
    return (dispatch: Dispatch<any>, getState: GetGlobalState) => {
        selectAccount(dispatch, accountId);
        dispatch(replace(paths.ACCOUNT_REPORT));
        dispatch(hideAllModals());
    }
}

export function closeReport(accountId: string) { 
    return (dispatch: Dispatch<any>, getState: GetGlobalState) => {
        const previousIndex = Object.keys(getState().reports.reports).indexOf(accountId);
        dispatch(payloadAction(CLOSE_REPORT)({ accountId }));
        const reportKeys = Object.keys(getState().reports.reports);
        if(reportKeys.length <= 0){ 
            dispatch(replace(paths.OVERVIEW));
            getState().reports.accountId = null;
        }
        else dispatch(payloadAction(SELECT_ACCOUNT_REPORT)(reportKeys[previousIndex <= 0 ? 0 : previousIndex - 1]));
    }
}