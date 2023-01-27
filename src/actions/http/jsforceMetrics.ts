
import { IMetric } from '../../models/metrics/IMetric';
import { queryComplaintsBase, queryQueriesBase, queryAssetsForTerritoryStopped, queryKffBase, filterKffFieldAudits, filterKffMonthlyDiscussions, filterKffOpen, queryHelpdeskCasesBase, queryTransactionalSurveyBase, filterKffMonth, filterAudits, filterMonthlyDiscussions, filterKff90Days } from 'src/actions/http/jsforce';
import { QueryType, StatusWrapper, multiQueryCoreWithTypes, multiQuery14, multiQuery3, multiQuery4, multiQuery1, multiQuery5, multiQuery1Extract, joinQueries } from 'src/actions/http/jsforceCore';
import { conditions, orCondition } from 'src/actions/http/jsforceMappings';
import * as coreApi from '../../models/api/coreApi';
import { queryOpportunitiesBase, queryWorkOrdersBase, queryEventsBase, queryServiceTerritoryMemberBase, queryTimesheetEntriesBase, queryAssetsOpportunitiesBase, queryTaskBase, queryServiceAppointmentsBase, queryLeadsBase, queryAssetLeadsBase, queryTendersBase } from './jsforceBase';
import { uniq } from 'lodash';
import * as fields from "./queryFields";
import { ThunkDispatch } from '../thunks';
import { IMetricSetOthers, IMetricSetWorkOrders, IMetricSetKff } from 'src/reducers/MetricsReducer';
import DiscussionListItem from 'src/models/audits/Discussion';
import { AuditListItem } from 'src/models/audits/Audit';
import { LOAD_DISCUSSIONS } from '../integration/discussionActions';
import { LOAD_AUDITS } from '../integration/auditActions';
import { payloadAction } from '../actionUtils';
import { IGlobalState } from 'src/models/globalState';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import * as _ from 'lodash';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

function metricNoProgressBar(open: number, closedThisMonth: number) {
    return {
        closedThisMonth,
        fraction: null as number,
        open
    } as IMetric
}

function metricRepairs(open: number, subtitleValue: number, subtitleKey: string, amount: number) {
    const metrics = metricNoProgressBar(open, subtitleValue);
    return ({ ...metrics, subtitleKey } as IMetric)
}

function metric(open: number, closed: number, closedThisMonth: number) {
    const total = open + closed;
    return {
        closedThisMonth,
        fraction: closed === 0 && total === 0 ? 1 : closed / total,
        open
    } as IMetric
}

function metricLeads(open: number, subtitleValue: number, subtitleKey: string) {
    const metrics = metricNoProgressBar(open, subtitleValue);
    return ({ ...metrics, subtitleKey } as IMetric)
}

function metricOpportunities(open: number, closed: number, subtitleValue: number, subtitleKey: string, amount: number) {
    const metrics = metricNoProgressBar(open, subtitleValue);
    return ({ ...metrics, subtitleKey, amount } as IMetric)
}

function metricOpportunitiesWithTenders(open: number, openAmount: number, closed: number, subtitleValue: number, subtitleKey: string, amount: number) {
    const metrics = metricNoProgressBar(open, subtitleValue);
    return ({ ...metrics, openAmount, subtitleKey, amount } as IMetric)
}

// function computeMetricsDataFun<T>(ts: T[], closedCondition: (t: T) => boolean): IMetric {    
//     const closed = ts.filter(closedCondition).length;
//     const total = ts.length;
//     return metricNoProgressBar(total - closed, closed);
// }

function computeMetricsDataFun(audits : coreApi.IAuditApi[]): IMetric {    
    const total = filterKff90Days(audits).filter(a => a.status != coreApi.AuditStatus.Completed).length;
    const closedThisMonth = filterKffMonth(audits).filter(a => a.status == coreApi.AuditStatus.Completed).length;
    return metricNoProgressBar(total,closedThisMonth);
}

export const metricConditionsLeadFSM = {
    queryConditionsAll: (serviceTerritoryId: string, userId: string) => [
        conditions.SObject.createdDateLast24Months(),
        conditions.Lead.notConverted,
        orCondition<{}, coreApi.Lead>(
            conditions.Lead.serviceTerritoryFSM(serviceTerritoryId),
            conditions.Lead.owner(userId),
        )
    ]
}

export const metricConditionsLeadNonFSM = {
    queryConditionsAll: (userId: string, leadIds: string[]) => [
        conditions.SObject.createdDateLast24Months(),
        conditions.Lead.notConverted,
        orCondition<{}, coreApi.Lead>(
            conditions.Lead.ids(leadIds),
            conditions.Lead.owner(userId),
        )
    ]
}

export const metricConditionsLeadOwned = {
    get queryConditionsAll() { 
        return (userId: string) => [
            conditions.SObject.createdDateLast24Months(),
            conditions.Lead.notConverted,
            conditions.Lead.owner(userId)
        ];
    }
}

export const metricConditionsLeadCustomersFSM = {
    get queryConditionsAll() { 
        return (serviceTerritoryId: string) => [
            conditions.SObject.createdDateLast24Months(),
            conditions.Lead.notConverted,
            conditions.Lead.serviceTerritoryFSM(serviceTerritoryId)
        ];
    }
}

export const metricConditionsLeadCustomersNonFSM = {
    get queryConditionsAll() { 
        return (leadIds: string[]) => [
            conditions.SObject.createdDateLast24Months(),
            conditions.Lead.notConverted,
            conditions.Lead.ids(leadIds)
        ];
    }
}

export const metricConditionsOpportunity = {
    get queryConditionsAll() { 
        return (opportunityIds: string[], userId: string) => [
            conditions.SObject.createdDateLast24Months(),
            orCondition(
                conditions.Opportunity.ids(opportunityIds),
                conditions.Opportunity.owner(userId),
            )
        ];
    }
}

export const metricConditionsOpportunityOwned = {
    get queryConditionsAll() { 
        return (userId: string) => [conditions.SObject.createdDateLast24Months(), conditions.Opportunity.owner(userId)];
    }
}

export const metricConditionsOpportunityCustomers = {
    get queryConditionsAll() {
        return (opportunityIds: string[]) => [conditions.SObject.createdDateLast24Months(), conditions.Opportunity.ids(opportunityIds)];
    }
}

export const metricConditionsTenderOpportunities = {
    get queryConditionsAll() { 
        return (opportunityIds: string[], userId: string) => [
            conditions.Tender__c.ktoc,
            conditions.Tender__c.active,
            conditions.Tender__c.opportunityCreated24Months(),
            orCondition(
                conditions.Tender__c.opportunities(opportunityIds),
                conditions.Tender__c.opportunityOwner(userId)
            )
        ];
    }
}

export const metricConditionsCustomerVisits = {    
    queryConditionsAll: (userId: string) => [conditions.SObject.createdDateLast13Months(), conditions.Event.owner(userId), conditions.Event.eventTileType],
    get queryConditionsOpen() { return (userId: string) => [...this.queryConditionsAll(userId), conditions.Event.open]; }
}

export const metricConditionsComplaint = {
    queryConditionsAll: (userId: string) => [conditions.SObject.createdDateLast13Months(), conditions.Case.owner(userId)],    
    get queryConditionsOpen() { return (userId: string) => [...this.queryConditionsAll(userId), conditions.Case.open]; }
}

export const metricConditionsHelpdeskCases = {
    queryConditionsAll: (serviceTerritory: string) => [conditions.SObject.createdDateLast13Months(), conditions.Case.serviceTerritory(serviceTerritory)],
    get queryConditionsOpen() { return (serviceTerritory: string) => [...this.queryConditionsAll(serviceTerritory), conditions.Case.open]; }
}

export const metricConditionsDetractorCases = {
    queryConditionsAll: (userId: string) => [conditions.SObject.createdDateLast13Months(), conditions.Case.owner(userId), conditions.Case.npxNpiLte6],
    get queryConditionsOpen() { return (userId: string) => [...this.queryConditionsAll(userId), conditions.Case.open]; }
}

export const metricConditionsQueries = {
    queryConditionsAll: (userId: string) => [conditions.SObject.createdDateLast13Months(), conditions.Case.owner(userId)],    
    get queryConditionsOpen() { return (userId: string) => [...this.queryConditionsAll(userId), conditions.Case.open]; }
}

export const metricConditionsTasks = {    
    queryConditionsAll: (userId: string) => [conditions.SObject.createdDateLast13Months(), conditions.Task.owner(userId)],    
    get queryConditionsOpen() { return (userId: string) => [...this.queryConditionsAll(userId), conditions.Task.open]; }
}

export const metricConditionsRejectedServiceAppointments = {
    queryConditionsAll: (serviceTerritoryId: string) => 
        [conditions.SObject.createdDateLast13Months(), conditions.ServiceAppointment.serviceTerritory(serviceTerritoryId), 
            conditions.ServiceAppointment.rejected, conditions.ServiceAppointment.newStatusDate24h],
    /*
    get queryConditions24h() {
        return (serviceTerritoryId: string) => [...this.queryConditionsAll(serviceTerritoryId), conditions.ServiceAppointment.newStatusDate24h];
    }
    */
}

type AggregateResult<T> = { expr0: T }[]
type AggregateExpr2<T> = { expr0: T, expr1: T };
type AggregateResult2<T> = AggregateExpr2<T>[]

export async function queryOtherMetrics(userId: string, serviceTerritoryId: string, activeInFSM: boolean) {
    if(isAndroid()){ firebaseStartTrace('Metrics trace') }
    const assetOpps = await multiQuery1Extract(
        queryAssetsOpportunitiesBase(
            [conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId), conditions.Asset_Opportunity__c.opportunityCreatedDateLast24Months()]
        )
    );
    const assetOpportunityIds = uniq(assetOpps.map(ao => ao.Opportunity__c));

    const results = await multiQuery4(
        queryServiceTerritoryMemberBase([conditions.ServiceTerritoryMember.serviceTerritory(serviceTerritoryId)], ['ServiceResourceId']),
        queryAssetLeadsBase([conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId)]),
        queryTendersBase<{ Opportunity__c: string }>(metricConditionsTenderOpportunities.queryConditionsAll(assetOpportunityIds, userId), ['Opportunity__c']),
        queryTendersBase<{ Opportunity__c: string }>(
            [
                ...metricConditionsTenderOpportunities.queryConditionsAll(assetOpportunityIds, userId),
                conditions.Tender__c.vaRepair,
                conditions.Tender__c.createdCurrentMonth()
            ],
            ['Opportunity__c']
        )
    )

    const [stms, assetLeads, tenderOpps, tenderOppsCurrentMonth] = results.queries.result;
    const serviceResourceIds = stms.map(stm => stm.ServiceResourceId);
    const serviceResourceIdsChunk = _.chunk( stms.map(s=>s.ServiceResourceId) ,200);
    const ktocTenderOpportunityIds = uniq(tenderOpps.map(flt => flt.Opportunity__c));

    const withKtocTenderOpportunityCreatedThisMonth = conditions.Opportunity.ids(tenderOppsCurrentMonth.map(flt => flt.Opportunity__c));

    const withKTOCTender = conditions.Opportunity.ids(ktocTenderOpportunityIds);
    const withoutKTOCTender = conditions.Opportunity.ids(ktocTenderOpportunityIds).negate();

    const count = ['Count()'];
    //currency conversion doesn't work in aggregate fields, it always returns the company currency, in this case EUR
    const amountSum = ['SUM(Amount)'];
    const countAndAmountSum = ['COUNT(Id), SUM(Amount)'];

    const opportunityConditions = [...metricConditionsOpportunity.queryConditionsAll(assetOpportunityIds, userId), conditions.Opportunity.vaRepairOrDoorwithOpportunityCategory];
    const opportunityConditionsOwned = [...metricConditionsOpportunityOwned.queryConditionsAll(userId), conditions.Opportunity.vaRepairOrDoorwithOpportunityCategory];
    const opportunityConditionsCustomers = [...metricConditionsOpportunityCustomers.queryConditionsAll(assetOpportunityIds), conditions.Opportunity.vaRepairOrDoorwithOpportunityCategory];
    const evendConditions = metricConditionsCustomerVisits.queryConditionsAll(userId);
    const serviceAppointmentConditions = metricConditionsRejectedServiceAppointments.queryConditionsAll(serviceTerritoryId);

    const opportunityOrderReceivedWonThisMonthConditions = [
        conditions.Opportunity.receivedWonStage(), conditions.Opportunity.receivedWonThisMonth()
    ];
    const caseClosedConditions = [conditions.Case.closed, conditions.Case.closedDateThisMonth()];
    const eventClosedConditions = [conditions.Event.closed, conditions.Event.endDateTimeThisMonth()];
    const taskClosedConditions = [conditions.Task.closed, conditions.Task.activityDateThisMonth()];
    const leadCreatedThisMonthConditions = [conditions.SObject.createdThisMonth()];

    const assetLeadIds = assetLeads.map(al => al.Lead__c).filter(a => a!=undefined);
    const metricConditionsLead = activeInFSM ? metricConditionsLeadFSM.queryConditionsAll(serviceTerritoryId, userId) : metricConditionsLeadNonFSM.queryConditionsAll(userId, assetLeadIds);
    const metricConditionsLeadCustomers = activeInFSM ? metricConditionsLeadCustomersFSM.queryConditionsAll(serviceTerritoryId) : metricConditionsLeadCustomersNonFSM.queryConditionsAll(assetLeadIds);
    

    const resultWrapper = await multiQueryCoreWithTypes<{ 
            queries: StatusWrapper<[
                AggregateResult2<number>, AggregateResult2<number>, AggregateResult2<number>,
                AggregateResult2<number>, AggregateResult2<number>, AggregateResult2<number>,
                AggregateResult2<number>, AggregateResult2<number>, AggregateResult2<number>,
                coreApi.TimeSheetEntryMetrics[],
                Array<{Amount:string}>,Array<{Amount:string}>,Array<{Amount:string}>,
                Array<{Amount:string}>,Array<{Amount:string}>,Array<{Amount:string}>,
                Array<{Amount:string}>,Array<{Amount:string}>,Array<{Amount:string}>,
            ]>, 
            countQueries: StatusWrapper<[
                number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,
                number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number
            ]> 
        }>([

        [queryServiceAppointmentsBase(serviceAppointmentConditions, count), QueryType.COUNT],

        [queryOpportunitiesBase([...opportunityConditions, conditions.Opportunity.open, withoutKTOCTender], count), QueryType.COUNT],
        [queryOpportunitiesBase([...opportunityConditions, withKtocTenderOpportunityCreatedThisMonth], countAndAmountSum), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsOwned, conditions.Opportunity.open, withoutKTOCTender], count), QueryType.COUNT],
        [queryOpportunitiesBase([...opportunityConditionsOwned, withKtocTenderOpportunityCreatedThisMonth], countAndAmountSum), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsCustomers, conditions.Opportunity.open, withoutKTOCTender], count), QueryType.COUNT],
        [queryOpportunitiesBase([...opportunityConditionsCustomers, withKtocTenderOpportunityCreatedThisMonth], countAndAmountSum), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditions, conditions.Opportunity.openWithoutOrders, withKTOCTender], countAndAmountSum), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditions, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], countAndAmountSum), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsOwned, conditions.Opportunity.openWithoutOrders, withKTOCTender], countAndAmountSum), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsOwned, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], countAndAmountSum), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsCustomers, conditions.Opportunity.openWithoutOrders, withKTOCTender], countAndAmountSum), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsCustomers, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], countAndAmountSum), QueryType.SOQL],

        [queryLeadsBase([...metricConditionsLead, conditions.Lead.open, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],
        [queryLeadsBase([...metricConditionsLead, ...leadCreatedThisMonthConditions, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],

        [queryLeadsBase([...metricConditionsLeadOwned.queryConditionsAll(userId), conditions.Lead.open, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],
        [queryLeadsBase([...metricConditionsLeadOwned.queryConditionsAll(userId), ...leadCreatedThisMonthConditions, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],

        [queryLeadsBase([...metricConditionsLeadCustomers, conditions.Lead.open, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],
        [queryLeadsBase([...metricConditionsLeadCustomers, ...leadCreatedThisMonthConditions, conditions.Lead.vaRepairOrDoor], count), QueryType.COUNT],

        [queryEventsBase([...evendConditions, conditions.Event.open], count), QueryType.COUNT],
        [queryEventsBase([...evendConditions, conditions.Event.closed], count), QueryType.COUNT],
        [queryEventsBase([...evendConditions, ...eventClosedConditions], count), QueryType.COUNT],

        [queryComplaintsBase([...metricConditionsComplaint.queryConditionsAll(userId), conditions.Case.open], count), QueryType.COUNT],
        [queryComplaintsBase([...metricConditionsComplaint.queryConditionsAll(userId), conditions.Case.closed], count), QueryType.COUNT],
        [queryComplaintsBase([...metricConditionsComplaint.queryConditionsAll(userId), ...caseClosedConditions], count), QueryType.COUNT],

        [queryQueriesBase([...metricConditionsQueries.queryConditionsAll(userId), conditions.Case.open], count), QueryType.COUNT],
        [queryQueriesBase([...metricConditionsQueries.queryConditionsAll(userId), conditions.Case.closed], count), QueryType.COUNT],
        [queryQueriesBase([...metricConditionsQueries.queryConditionsAll(userId), ...caseClosedConditions], count), QueryType.COUNT],

        [queryHelpdeskCasesBase([...metricConditionsHelpdeskCases.queryConditionsAll(serviceTerritoryId), conditions.Case.open], count), QueryType.COUNT],
        [queryHelpdeskCasesBase([...metricConditionsHelpdeskCases.queryConditionsAll(serviceTerritoryId), conditions.Case.closed], count), QueryType.COUNT],
        [queryHelpdeskCasesBase([...metricConditionsHelpdeskCases.queryConditionsAll(serviceTerritoryId), ...caseClosedConditions], count), QueryType.COUNT],

        [queryTransactionalSurveyBase([...metricConditionsDetractorCases.queryConditionsAll(userId), conditions.Case.open], count), QueryType.COUNT],
        [queryTransactionalSurveyBase([...metricConditionsDetractorCases.queryConditionsAll(userId), conditions.Case.closed], count), QueryType.COUNT],
        [queryTransactionalSurveyBase([...metricConditionsDetractorCases.queryConditionsAll(userId), ...caseClosedConditions], count), QueryType.COUNT],

        [queryTaskBase([...metricConditionsTasks.queryConditionsAll(userId), conditions.Task.open], count), QueryType.COUNT],
        [queryTaskBase([...metricConditionsTasks.queryConditionsAll(userId), conditions.Task.closed], count), QueryType.COUNT],
        [queryTaskBase([...metricConditionsTasks.queryConditionsAll(userId), ...taskClosedConditions], count), QueryType.COUNT],

        [queryAssetsForTerritoryStopped(serviceTerritoryId, count), QueryType.COUNT],

        [
            queryTimesheetEntriesBase(
                [conditions.TimeSheetEntry.serviceResources(serviceResourceIds), conditions.TimeSheetEntry.status('New')],
                fields.TimeSheetEntry
            ).limit(1), 
            QueryType.SOQL
        ],
        // Querying Amount instead of using aggregating.
        [queryOpportunitiesBase([...opportunityConditions, withKtocTenderOpportunityCreatedThisMonth], ['convertCurrency(Amount)']), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsOwned, withKtocTenderOpportunityCreatedThisMonth], ['convertCurrency(Amount)']), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsCustomers, withKtocTenderOpportunityCreatedThisMonth], ['convertCurrency(Amount)']), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditions, conditions.Opportunity.openWithoutOrders, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditions, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsOwned, conditions.Opportunity.openWithoutOrders, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsOwned, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],

        [queryOpportunitiesBase([...opportunityConditionsCustomers, conditions.Opportunity.openWithoutOrders, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],
        [queryOpportunitiesBase([...opportunityConditionsCustomers, ...opportunityOrderReceivedWonThisMonthConditions, withKTOCTender], ['convertCurrency(Amount)']), QueryType.SOQL],
    ]);

    const [ 
        rejectedServiceAppointments,

        opportunitiesWithoutTenderOpen,
        opportunitiesWithoutTenderOpenOwned,
        opportunitiesWithoutTenderOpenCustomers,

        leadsOpen, leadsCreatedThisMonth,
        leadsOwnedOpen, leadsOwnedCreatedThisMonth,
        leadsCustomersOpen, leadsCustomersCreatedThisMonth, 
        eventsOpen, eventsClosed, eventsClosedThisMonth,
        complaintsOpen, complaintsClosed, complaintsClosedThisMonth,
        queriesOpen, queriesClosed, queriesClosedThisMonth,
        helpdeskCasesOpen, helpdeskCasesClosed, helpdeskCasesClosedThisMonth,
        detractorCasesOpen, detractorCasesClosed, detractorCasesClosedThisMonth,
        tasksOpen, tasksClosed, tasksClosedThisMonth, 
        stoppedEquipments
    ] = resultWrapper.countQueries.result;
    const [
        [opportunitiesWithTenderCreatedThisMonthAggregation], [opportunitiesWithoutTenderCreatedThisMonthOwnedAggregation], [opportunitiesWithoutTenderCreatedThisMonthCustomersAggregation],
        [opportunitiesWithTenderOpenAndAmount], [opportunitiesWithTenderOrderWonNumberAndAmount],
        [opportunitiesWithTenderOpenAndAmountOwned], [opportunitiesWithTenderOrderWonAndAmountOwned],
        [opportunitiesWithTenderOpenAndAmountCustomers], [opportunitiesWithTenderOrderWonAndAmountCustomers],
        timesheets
    ] = resultWrapper.queries.result;
    
    const opportunitieswithTenderCreatedThisMonthAmount = _.map(resultWrapper.queries.result[10],'Amount');
    const opportunitieswithoutTenderCreatedThisMonthOwnedAmount = _.map(resultWrapper.queries.result[11],'Amount');
    const opportunitieswithoutTenderCreatedThisMonthCustomersAmount = _.map(resultWrapper.queries.result[12],'Amount');
    const opportunitieswithTenderAmount = _.map(resultWrapper.queries.result[13],'Amount');
    const opportunitieswithTenderOrderWonNumberAndAmount = _.map(resultWrapper.queries.result[14],'Amount');
    const opportunitieswithTenderOpenAndAmountOwned =_.map(resultWrapper.queries.result[15],'Amount');
    const opportunitieswithTenderOrderWonAndAmountOwned =_.map(resultWrapper.queries.result[16],'Amount');
    const opportunitieswithTenderOpenAndAmountCustomers =_.map(resultWrapper.queries.result[17],'Amount');
    const opportunitieswithTenderOrderWonAndAmountCustomers =_.map(resultWrapper.queries.result[18],'Amount');
    let leadopen = leadsOpen!= undefined ? leadsOpen : 0

    
    const expr0 = (expr: AggregateExpr2<number>) => { return expr && expr.expr0 || 0; }
    const expr1 = (expr: AggregateExpr2<number>) => { return expr && expr.expr1 || 0; }

    const opportunitiesWithTenderCreatedThisMonth = expr0(opportunitiesWithTenderCreatedThisMonthAggregation);
    // const opportunitiesWithTenderCreatedThisMonthAmount = expr1(opportunitiesWithTenderCreatedThisMonthAggregation);
    const opportunitiesWithTenderCreatedThisMonthAmount = _.sum(opportunitieswithTenderCreatedThisMonthAmount);


    const opportunitiesWithoutTenderCreatedThisMonthOwned = expr0(opportunitiesWithoutTenderCreatedThisMonthOwnedAggregation);
    // const opportunitiesWithoutTenderCreatedThisMonthOwnedAmount = expr1(opportunitiesWithoutTenderCreatedThisMonthOwnedAggregation);
    const opportunitiesWithoutTenderCreatedThisMonthOwnedAmount = _.sum(opportunitieswithoutTenderCreatedThisMonthOwnedAmount);


    const opportunitiesWithoutTenderCreatedThisMonthCustomers = expr0(opportunitiesWithoutTenderCreatedThisMonthCustomersAggregation);
    // const opportunitiesWithoutTenderCreatedThisMonthCustomersAmount = expr1(opportunitiesWithoutTenderCreatedThisMonthCustomersAggregation);
    const opportunitiesWithoutTenderCreatedThisMonthCustomersAmount = _.sum(opportunitieswithoutTenderCreatedThisMonthCustomersAmount);


    const opportunitiesWithTenderOpen = expr0(opportunitiesWithTenderOpenAndAmount);
    // const opportunitiesWithTenderOpenAmount = expr1(opportunitiesWithTenderOpenAndAmount);
    const opportunitiesWithTenderOpenAmount = _.sum(opportunitieswithTenderAmount);
    const opportunitiesWithTenderOrderWon = expr0(opportunitiesWithTenderOrderWonNumberAndAmount);
    // const opportunitiesWithTenderOrderWonAmount = expr1(opportunitiesWithTenderOrderWonNumberAndAmount);
    const opportunitiesWithTenderOrderWonAmount = _.sum(opportunitieswithTenderOrderWonNumberAndAmount);

    const opportunitiesWithTenderOpenOwned = expr0(opportunitiesWithTenderOpenAndAmountOwned);
    // const opportunitiesWithTenderOpenOwnedAmount = expr1(opportunitiesWithTenderOpenAndAmountOwned);
    const opportunitiesWithTenderOpenOwnedAmount = _.sum(opportunitieswithTenderOpenAndAmountOwned);
    const opportunitiesWithTenderOrderWonOwned = expr0(opportunitiesWithTenderOrderWonAndAmountOwned);
    // const opportunitiesWithTenderOrderWonOwnedAmount = expr1(opportunitiesWithTenderOrderWonAndAmountOwned);
    const opportunitiesWithTenderOrderWonOwnedAmount = _.sum(opportunitieswithTenderOrderWonAndAmountOwned);


    const opportunitiesWithTenderOpenCustomers = expr0(opportunitiesWithTenderOpenAndAmountCustomers);
    // const opportunitiesWithTenderOpenCustomersAmount = expr1(opportunitiesWithTenderOpenAndAmountCustomers);
    const opportunitiesWithTenderOpenCustomersAmount = _.sum(opportunitieswithTenderOpenAndAmountCustomers);
    const opportunitiesWithTenderOrderWonCustomers = expr0(opportunitiesWithTenderOrderWonAndAmountCustomers);
    // const opportunitiesWithTenderOrderWonCustomersAmount = expr1(opportunitiesWithTenderOrderWonAndAmountCustomers);
    const opportunitiesWithTenderOrderWonCustomersAmount = _.sum(opportunitieswithTenderOrderWonAndAmountCustomers);

    const TimeSheetEntries = await joinQueries(
        ...serviceResourceIdsChunk.map(ids =>
            multiQuery1(queryTimesheetEntriesBase(
                [conditions.TimeSheetEntry.serviceResources(ids),conditions.TimeSheetEntry.status('New')],fields.TimeSheetEntry)
                ))
        ).then(res => res.queries.result[0])

    if(isAndroid()){ firebaseStopTrace('Metrics trace') }

    return {
        leadMetrics: {
            leads: metricLeads(leadopen, leadsCreatedThisMonth, 'overview-page.tile-info.created-this-month'),
            leadsOwned: metricLeads(leadsOwnedOpen, leadsOwnedCreatedThisMonth, 'overview-page.tile-info.created-this-month'),
            leadsCustomers: metricLeads(leadsCustomersOpen, leadsCustomersCreatedThisMonth, 'overview-page.tile-info.created-this-month')
        },
        opportunityMetrics: {
            //
            opportunities: metricOpportunities(
                opportunitiesWithoutTenderOpen, 0, opportunitiesWithTenderCreatedThisMonth, 'overview-page.tile-info.tenders-created-this-month', opportunitiesWithTenderCreatedThisMonthAmount
            ),
            opportunitiesOwned: metricOpportunities(
                opportunitiesWithoutTenderOpenOwned, 0, opportunitiesWithoutTenderCreatedThisMonthOwned, 'overview-page.tile-info.created-this-month', opportunitiesWithoutTenderCreatedThisMonthOwnedAmount
            ),
            opportunitiesCustomers: metricOpportunities(
                opportunitiesWithoutTenderOpenCustomers, 0, opportunitiesWithoutTenderCreatedThisMonthCustomers, 'overview-page.tile-info.created-this-month', opportunitiesWithoutTenderCreatedThisMonthCustomersAmount
            ),
            //
            opportunitiesWithTenders: metricOpportunitiesWithTenders(
                opportunitiesWithTenderOpen, opportunitiesWithTenderOpenAmount, 0, opportunitiesWithTenderOrderWon, 'overview-page.tile-info.orders-received-this-month', opportunitiesWithTenderOrderWonAmount
            ),
            opportunitiesWithTendersOwned: metricOpportunitiesWithTenders(
                opportunitiesWithTenderOpenOwned, opportunitiesWithTenderOpenOwnedAmount, 0, opportunitiesWithTenderOrderWonOwned, 'overview-page.tile-info.orders-received-this-month', opportunitiesWithTenderOrderWonOwnedAmount
            ),
            opportunitiesWithTendersCustomers: metricOpportunitiesWithTenders(
                opportunitiesWithTenderOpenCustomers, opportunitiesWithTenderOpenCustomersAmount, 0, opportunitiesWithTenderOrderWonCustomers, 'overview-page.tile-info.orders-received-this-month', opportunitiesWithTenderOrderWonCustomersAmount
            )
        },
        events: metric(eventsOpen, eventsClosed, eventsClosedThisMonth),
        complaints: metric(complaintsOpen, complaintsClosed, complaintsClosedThisMonth),
        queries: metric(queriesOpen, queriesClosed, queriesClosedThisMonth),
        helpdeskCases: metric(helpdeskCasesOpen, helpdeskCasesClosed, helpdeskCasesClosedThisMonth),
        detractorCases: metric(detractorCasesOpen, detractorCasesClosed, detractorCasesClosedThisMonth),
        tasks: metric(tasksOpen, tasksClosed, tasksClosedThisMonth),
        stoppedEquipments: stoppedEquipments,

        /*
        Timesheet metrics:
        The tile shows the number of technicians for which timesheets (more precisely: timesheet line items) are pending approval . 

        In more detail:

            Query all timesheet line items that are relevant for the supervisor
            Then check how many different service resources these line items are for. Let this be X technicians.
            Display number X in your UI.
        */
        submittedTimesheets: uniq(TimeSheetEntries.map(t => t.Service_Resource_Id__c)).length,
        rejectedServiceAppointments: rejectedServiceAppointments//uniq(serviceAppointments.map(t => t.ParentRecordId)).length
    } as IMetricSetOthers;
}


export const metricConditionsOpenStartDate13Months = {
    get queryConditionsAll() { return (serviceTerritoryId: string, activeInFSM: boolean) => 
        [conditions.WorkOrder.serviceTerritory(serviceTerritoryId),
            conditions.WorkOrder.open(activeInFSM),
            //only necessary if open and closed dont include all possible statuses
            //orCondition(conditions.WorkOrder.open, conditions.WorkOrder.closed), 
            // conditions.WorkOrder.startDateLast13Months(),
            conditions.WorkOrder.earliestStartDateLast12Months(),
            conditions.WorkOrder.earliestStartDateNext3Months()] }
}

export const metricConditionsOpenStartDate24Months = {
    get queryConditionsAll() { return (serviceTerritoryId: string, activeInFSM: boolean) => 
        [conditions.WorkOrder.serviceTerritory(serviceTerritoryId),
            conditions.WorkOrder.open(activeInFSM),
            conditions.WorkOrder.earliestStartDateLast24Months(),
            conditions.WorkOrder.earliestStartDateNext3Months()] }
}

export const metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth = {
    queryConditionsAll: (serviceTerritoryId: string, activeInFSM: boolean) => 
        [conditions.WorkOrder.serviceTerritory(serviceTerritoryId),
            //only necessary if open and closed dont include all possible statuses
            //orCondition(conditions.WorkOrder.open, conditions.WorkOrder.closed), 
            // conditions.WorkOrder.startDateLast13Months(),
            conditions.WorkOrder.earliestStartDateLast12Months(),
            //this was added by Infosys, dont understand why
            // conditions.WorkOrder.earliestStartDatePresentMonth()
        ],
    get queryConditionsOpen() {
        return (serviceTerritoryId: string, activeInFSM: boolean) => [...this.queryConditionsAll(serviceTerritoryId, activeInFSM), conditions.WorkOrder.open(activeInFSM),];
    },
    get queryConditionsClosed() {
        return (serviceTerritoryId: string, activeInFSM: boolean) => [...this.queryConditionsAll(serviceTerritoryId, activeInFSM), conditions.WorkOrder.closed(activeInFSM),];
    }
}

//this is the "rejected service appointment" implementation for non fsm  territories as they don't use service appointments
export const metricConditionsRejectedWorkordersNonFSM = {
    get queryConditionsAll() { 
        return (serviceTerritoryId: string) => [
            orCondition(conditions.WorkOrder.newStatusDate24h, conditions.WorkOrder.createdDate24h), 
            conditions.WorkOrder.rejectedNonFSM, conditions.WorkOrder.serviceTerritory(serviceTerritoryId)
        ] 
    }
}

export function queryWorkorderMetrics(userId: string, serviceTerritoryId: string, activeInFSM: boolean) {
    const { inspectionPoint, open, inspection, callout, packagedServiceRepair, mbm, closed, serviceNeeds, earliestStartDateNext3Months, serviceTerritory, earliestStartDateLast12Months, earliestStartDatePresentMonth,
            completedThisMonth} = conditions.WorkOrder;

    const serviceTerritoryOpenStartDate13Months = metricConditionsOpenStartDate13Months.queryConditionsAll(serviceTerritoryId, activeInFSM);
    const serviceTerritoryOpenStartDate24Months = metricConditionsOpenStartDate24Months.queryConditionsAll(serviceTerritoryId, activeInFSM);
    const serviceTerritoryCompletedThisMonth = [serviceTerritory(serviceTerritoryId), completedThisMonth(), closed(activeInFSM)];

    return multiQueryCoreWithTypes<{
        queries: StatusWrapper<[AggregateResult2<number>]>, 
        countQueries: StatusWrapper<[
            number,number,number,number,number,number,number,
            number,number,number,number,number,number,number,
        ]> 
    }>([
        //inspectionPoints, inspections, openRepairs
        [queryWorkOrdersBase([...serviceTerritoryOpenStartDate13Months, inspectionPoint], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, inspectionPoint], ['Count()']), QueryType.COUNT],

        [queryWorkOrdersBase([...serviceTerritoryOpenStartDate13Months, inspection], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, inspection], ['Count()']), QueryType.COUNT],

        [queryWorkOrdersBase([...serviceTerritoryOpenStartDate24Months, packagedServiceRepair], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, packagedServiceRepair], ['Count(Id), SUM(Invoiced_Amount__c)']), QueryType.SOQL],

        //callouts, completedCalloutsCurrentMonth
        [queryWorkOrdersBase([...serviceTerritoryOpenStartDate13Months, callout], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, callout], ['Count()']), QueryType.COUNT],
        
        //mbm, serviceNeeds
        [queryWorkOrdersBase([...metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth.queryConditionsOpen(serviceTerritoryId, activeInFSM), mbm], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth.queryConditionsClosed(serviceTerritoryId, activeInFSM), mbm], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, mbm], ['Count()']), QueryType.COUNT], 

        [queryWorkOrdersBase([...serviceTerritoryOpenStartDate13Months, serviceNeeds], ['Count()']), QueryType.COUNT],
        [queryWorkOrdersBase([...serviceTerritoryCompletedThisMonth, serviceNeeds], ['Count()']), QueryType.COUNT], 

        [queryWorkOrdersBase([...metricConditionsRejectedWorkordersNonFSM.queryConditionsAll(serviceTerritoryId)], ['Count()']), QueryType.COUNT], 
    ]).then(resultWrapper => {
        const [openInspectionPoints, inspectionPointsCompleted, 
                openInspections, inspectionsCompleted,
                openRepairs,
                openCallouts, completedCalloutsCurrentMonth, 
                mbmOpen, mbmClosed, mbmClosedThisMonth, serviceNeedsOpen, serviceNeedsClosed, rejectedWorkOrdersNonFSM] = resultWrapper.countQueries.result;
        const [[repairsCompletedCountAndAmount]] = resultWrapper.queries.result;
        const repairsCompleted = repairsCompletedCountAndAmount.expr0 || 0;
        const repairsCompletedAmount = repairsCompletedCountAndAmount.expr1 || 0;
        const metrics = {
            workOrdersMetrics: {
                inspectionPoints: metricNoProgressBar(openInspectionPoints, inspectionPointsCompleted),
                inspections: metricNoProgressBar(openInspections, inspectionsCompleted),
                openRepairs: metricRepairs(openRepairs, repairsCompleted, 'overview-page.tile-info.or-repairs-completed', repairsCompletedAmount),

                callouts: metricNoProgressBar(openCallouts, completedCalloutsCurrentMonth),

                mbm: metric(mbmOpen, mbmClosed, mbmClosedThisMonth),
                serviceNeeds: metricNoProgressBar(serviceNeedsOpen , serviceNeedsClosed),
                rejectedWorkOrdersNonFSM
            }

        } as IMetricSetWorkOrders;
        return metrics;
    });
}

export function filterKffFieldAuditsOpen(audits: coreApi.IAuditApi[]) {
    return filterKffFieldAudits(filterKffOpen(audits));
}

export function filterKffMonthlyDiscussionsOpen(audits: coreApi.IAuditApi[]) {    
    return filterKffMonthlyDiscussions(filterKffOpen(audits));    
}

export function queryMetricsFromKff(dispatch: ThunkDispatch, state: IGlobalState) {  
    return queryKffBase().then(audits => {
        const entityFieldsData = entityFieldsDataFromState(state);
        //optmization for the kff synching      
        const auditsOrEmpty =  audits == null ? [] : audits;
        dispatch(payloadAction(LOAD_DISCUSSIONS.success)(filterKffMonthlyDiscussionsOpen(auditsOrEmpty).map(d => new DiscussionListItem(d))));
        dispatch(payloadAction(LOAD_AUDITS.success)(filterKffFieldAuditsOpen(auditsOrEmpty).map(d => new AuditListItem(d, entityFieldsData))));

        const errorMetric = {
            closedThisMonth: 0,
            fraction: 0,
            open: -2,
            total: 0
        } as IMetric

        if(audits == null) return {
            audit: errorMetric,
            discussion: errorMetric
        };

        const openAndClosedAudits = audits.filter(audit => audit.status === coreApi.AuditStatus.Open || audit.status === coreApi.AuditStatus.InProgress || audit.status === coreApi.AuditStatus.Completed)
        const fieldAudits = filterKffFieldAudits(audits);
        const monthlyDiscussions = filterKffMonthlyDiscussions(audits);

        return {
            // audit: computeMetricsDataFun(fieldAudits, (audit) => audit.status === coreApi.AuditStatus.Completed),
            // discussion: computeMetricsDataFun(monthlyDiscussions, (audit) => audit.status === coreApi.AuditStatus.Completed),
            audit: computeMetricsDataFun(filterAudits(audits)),
            discussion: computeMetricsDataFun(filterMonthlyDiscussions(audits)),

        } as IMetricSetKff;
    });
}


