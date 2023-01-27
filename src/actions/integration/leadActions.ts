import { asyncHttpActionGeneric } from '../http/httpActions';
import { userIdFromState, plannerGroupIdFromState, activeInFSMFromState } from 'src/models/globalState';
import { queryLeadsBase, queryAssetLeadsBase } from '../http/jsforceBase';
import { itemsStateAsyncActionNames, payloadAction } from '../actionUtils';
import { metricConditionsLeadOwned, metricConditionsLeadCustomersFSM, metricConditionsLeadFSM, metricConditionsLeadCustomersNonFSM, metricConditionsLeadNonFSM } from '../http/jsforceMetrics';
import Lead from 'src/models/feed/Lead';
import { conditions, orCondition } from '../http/jsforceMappings';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import * as _ from 'lodash';
import { joinQueries, multiQuery1 } from '../http/jsforceCore';
import { LeadGrouping } from 'src/models/overview/LeadGrouping';
import { LeadFilter } from 'src/models/overview/LeadFilter';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const LOAD_LEADS = itemsStateAsyncActionNames('LOAD_LEADS');
export const LOAD_LEADS_OWNED = itemsStateAsyncActionNames('LOAD_LEADS_OWNED');
export const LOAD_LEADS_CUSTOMERS = itemsStateAsyncActionNames('LOAD_LEADS_CUSTOMERS');

export const CHANGE_LEADS_GROUPING = 'CHANGE_LEADS_GROUPING';
export const CHANGE_LEADS_FILTER = 'CHANGE_LEADS_FILTER';
export const CHANGE_LEADS_OWNED_GROUPING = 'CHANGE_LEADS_OWNED_GROUPING';
export const CHANGE_LEADS_OWNED_FILTER = 'CHANGE_LEADS_OWNED_FILTER';
export const CHANGE_LEADS_CUSTOMERS_GROUPING = 'CHANGE_LEADS_CUSTOMERS_GROUPING';
export const CHANGE_LEADS_CUSTOMERS_FILTER = 'CHANGE_LEADS_CUSTOMERS_FILTER';

//const metricConditionsLead = activeInFSM ? metricConditionsLeadFSM.queryConditionsAll(serviceTerritoryId, userId) : metricConditionsLeadNonFSM.queryConditionsAll(userId, assetLeadIds);
//const metricConditionsLeadCustomers = activeInFSM ? metricConditionsLeadCustomersFSM.queryConditionsAll(serviceTerritoryId) : metricConditionsLeadCustomersNonFSM.queryConditionsAll(assetLeadIds);

export const queryLeads = asyncHttpActionGeneric(
    state => {
        if(isAndroid()){ firebaseStartTrace('Open Sales Leads trace') }
        const entityFieldsData = entityFieldsDataFromState(state);
        const activeInFSM = activeInFSMFromState(state);
        const serviceTerritoryId = plannerGroupIdFromState(state);
        return activeInFSM ? 
            queryLeadsBase([...metricConditionsLeadFSM.queryConditionsAll(plannerGroupIdFromState(state), userIdFromState(state)), conditions.Lead.open])
            .then(ls => {
                if(isAndroid()){ firebaseStopTrace('Open Sales Leads trace') }
                return ls.map(l => new Lead(l, entityFieldsData))
            })
            :
            queryLeadsMore(serviceTerritoryId)
            .then(assetLeads => {
                let IdsChunk = _.chunk( assetLeads.map(c=>c.Lead__c).filter(a => a!=undefined),500);
                if(IdsChunk.length == 0) IdsChunk = [[]];
                return joinQueries(
                    ...IdsChunk.map( ids => multiQuery1(queryLeadsBase([...metricConditionsLeadNonFSM.queryConditionsAll(userIdFromState(state) , ids) , conditions.Lead.open])))
                ).then( res => {
                    const resUniq = _.uniqBy( res.queries.result[0].filter(l => l!= undefined), 'Id');
                    if(isAndroid()){ firebaseStopTrace('Open Sales Leads trace') }
                    return resUniq.map( l => new Lead(l,entityFieldsData) ) 
                })
                // return queryLeadsBase([...metricConditionsLeadNonFSM.queryConditionsAll(userIdFromState(state), assetLeads.map(al => al.Lead__c)), openOrClosed]).then(ls => ls.map(l => new Lead(l, entityFieldsData)))
                }
            )
        ; 
    },
    LOAD_LEADS
);

export async function queryLeadsMore(serviceTerritoryId: string) {
    const result = await multiQuery1(
        queryAssetLeadsBase([conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId)])
    )    
    return result.queries.result[0]
}

export const queryLeadsOwned = asyncHttpActionGeneric(
    state => {
        const entityFieldsData = entityFieldsDataFromState(state);
        return queryLeadsBase([...metricConditionsLeadOwned.queryConditionsAll(userIdFromState(state)), conditions.Lead.open]).then(ls => ls.map(l => new Lead(l, entityFieldsData)))
    },
    LOAD_LEADS_OWNED
);

export const queryLeadsCustomers = asyncHttpActionGeneric(
    state => {
        const entityFieldsData = entityFieldsDataFromState(state);
        const activeInFSM = activeInFSMFromState(state);
        const serviceTerritoryId = plannerGroupIdFromState(state);
        return activeInFSM ? 
            queryLeadsBase([...metricConditionsLeadCustomersFSM.queryConditionsAll(plannerGroupIdFromState(state)), conditions.Lead.open]).then(ls => ls.map(l => new Lead(l, entityFieldsData)))
            :
            queryAssetLeadsBase([conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId)])
            .then(assetLeads => 
                queryLeadsBase([...metricConditionsLeadCustomersNonFSM.queryConditionsAll(assetLeads.map(al => al.Lead__c)), conditions.Lead.open]).then(ls => ls.map(l => new Lead(l, entityFieldsData)))
            )
        ;
    },
    LOAD_LEADS_CUSTOMERS
);

export const changeLeadsGrouping = payloadAction<LeadGrouping>(CHANGE_LEADS_GROUPING);
export const changeLeadsFilter = payloadAction<LeadFilter>(CHANGE_LEADS_FILTER);

export const changeLeadsCustomersGrouping = payloadAction<LeadGrouping>(CHANGE_LEADS_CUSTOMERS_GROUPING);
export const changeLeadsCustomersFilter = payloadAction<LeadFilter>(CHANGE_LEADS_CUSTOMERS_FILTER);

export const changeLeadsOwnedGrouping = payloadAction<LeadGrouping>(CHANGE_LEADS_OWNED_GROUPING);
export const changeLeadsOwnedFilter = payloadAction<LeadFilter>(CHANGE_LEADS_OWNED_FILTER);