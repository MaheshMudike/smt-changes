import { IAssetOpportunityWithOpportunity, IAsset_Opportunity_Address__c, IAsset_Opportunity__c } from '../../models/api/coreApi';

import Opportunity, { queryOpportunitiesWithLocationById } from '../../models/feed/Opportunity';
import { OpportunityFilter } from '../../models/overview/OpportunityFilter';
import { OpportunityGrouping } from '../../models/overview/OpportunityGrouping';
import { itemsStateAsyncActionNames, payloadAction } from '../actionUtils';
import { queryOpportunityContactRolesForOpportunity, queryOpportunitiesById, queryAssetOpportunities } from '../http/jsforce';
import { userIdFromState, IGlobalState, plannerGroupIdFromState } from '../../models/globalState';
import { conditions, IConditionAnyResult } from '../http/jsforceMappings';
import { queryAssetsOpportunitiesBase, queryOpportunitiesBase, queryTendersBase, queryAssetsOpportunities } from '../http/jsforceBase';
import { metricConditionsOpportunity, metricConditionsOpportunityOwned, metricConditionsOpportunityCustomers, metricConditionsTenderOpportunities } from '../http/jsforceMetrics';
import { multiQuery1Extract, multiQuery2, multiQuery1, joinQueries } from '../http/jsforceCore';
import { ContactWithRole } from '../../models/accounts/Contact';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { uniq, groupBy } from 'lodash';
import * as fields from "../http/queryFields";
import { queryAndShowDetailsDialogGeneric } from './detailsActions';
import { EntityType } from 'src/constants/EntityType';
import { replaceModalIfIncomplete } from '../modalActions';
import { ModalType } from 'src/constants/modalTypes';
import * as _ from 'lodash';
import * as coreApi from '../../models/api/coreApi';
import { title } from 'src/models/feed/SalesForceListItem';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const LOAD_OPPORTUNITIES = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES');
export const LOAD_OPPORTUNITIES_WITH_TENDERS = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES_WITH_TENDERS');
export const LOAD_OPPORTUNITIES_OWNED = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES_OWNED');
export const LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED');
export const LOAD_OPPORTUNITIES_CUSTOMERS = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES_CUSTOMERS');
export const LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS = itemsStateAsyncActionNames('LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS');
export const LOAD_OPPORTUNITY_CONTACTS = itemsStateAsyncActionNames('LOAD_OPPORTUNITY_CONTACTS');
export const CHANGE_OPPORTUNITIES_GROUPING = 'CHANGE_OPPORTUNITIES_GROUPING';
export const CHANGE_OPPORTUNITIES_FILTER = 'CHANGE_OPPORTUNITIES_FILTER';
export const CHANGE_OPPORTUNITIES_OWNED_GROUPING = 'CHANGE_OPPORTUNITIES_OWNED_GROUPING';
export const CHANGE_OPPORTUNITIES_OWNED_FILTER = 'CHANGE_OPPORTUNITIES_OWNED_FILTER';
export const CHANGE_OPPORTUNITIES_CUSTOMERS_GROUPING = 'CHANGE_OPPORTUNITIES_CUSTOMERS_GROUPING';
export const CHANGE_OPPORTUNITIES_CUSTOMERS_FILTER = 'CHANGE_OPPORTUNITIES_CUSTOMERS_FILTER';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_GROUPING = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_GROUPING';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_FILTER = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_FILTER';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_GROUPING = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_GROUPING';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_FILTER = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_FILTER';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_GROUPING = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_GROUPING';
export const CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_FILTER = 'CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_FILTER';

export const CHANGE_SALES_LEADS_GROUPING = 'CHANGE_SALES_LEADS_GROUPING';
export const CHANGE_SALES_LEADS_FILTER = 'CHANGE_SALES_LEADS_FILTER';
export const CHANGE_SALES_LEADS_OWNED_GROUPING = 'CHANGE_SALES_LEADS_OWNED_GROUPING';
export const CHANGE_SALES_LEADS_OWNED_FILTER = 'CHANGE_SALES_LEADS_OWNED_FILTER';
export const CHANGE_SALES_LEADS_CUSTOMERS_GROUPING = 'CHANGE_SALES_LEADS_CUSTOMERS_GROUPING';
export const CHANGE_SALES_LEADS_CUSTOMERS_FILTER = 'CHANGE_SALES_LEADS_CUSTOMERS_FILTER';

/*
export function extractOpportunities(assetOpportunities: IAsset_Opportunity__c[]) {
    return uniqBy(assetOpportunities, 'Opportunity__c').map(j => j.Opportunity__r);
}
*/

export const downloadAndShowOpportunity = (id: string, accountName: string) => queryAndShowDetailsDialogGeneric(
    title(EntityType.Opportunity, accountName),
    () => queryOpportunitiesWithLocationById([id]).then(opps => opps[0]),// queryAccountDetail(id),
    item => dispatch => dispatch(replaceModalIfIncomplete(ModalType.OpportunityModal, item))
)

export const downloadOpportunities = asyncHttpActionGeneric(
    async state => {
        if(isAndroid()){ firebaseStartTrace('Tenders to be Created trace') }
        const assetOpportunityIds = await queryAssetOpportunityIdsForServiceTerritory(state.authentication.currentPlannerGroup.id);
        const ktocTendersOpportunityIds = await queryKtocTendersOpportunityIds(assetOpportunityIds, userIdFromState(state));
        const defaultCurrencyIsoCode = state.authentication.currentUser.defaultCurrencyIsoCode;
        if(isAndroid()){ firebaseStopTrace('Tenders to be Created trace') }
        return queryOpportunities([
            ...metricConditionsOpportunity.queryConditionsAll(assetOpportunityIds, userIdFromState(state)),
            conditions.Opportunity.open, conditions.Opportunity.ids(ktocTendersOpportunityIds).negate()
        ],defaultCurrencyIsoCode);
    },
    LOAD_OPPORTUNITIES
);

export const downloadOpportunitiesOwned = asyncHttpActionGeneric(
    async state => {
        const assetOpportunityIds = await queryAssetOpportunityIdsForServiceTerritory(state.authentication.currentPlannerGroup.id);
        const ktocTendersOpportunityIds = await queryKtocTendersOpportunityIds(assetOpportunityIds, userIdFromState(state));
        const defaultCurrencyIsoCode = state.authentication.currentUser.defaultCurrencyIsoCode;
        return queryOpportunities([
            ...metricConditionsOpportunityOwned.queryConditionsAll(userIdFromState(state)),
            conditions.Opportunity.open, conditions.Opportunity.ids(ktocTendersOpportunityIds).negate()
        ],defaultCurrencyIsoCode)
}   ,
    LOAD_OPPORTUNITIES_OWNED
);

export const downloadOpportunitiesCustomers = asyncHttpActionGeneric(
    async state => {
        const assetOpportunityIds = await queryAssetOpportunityIdsForServiceTerritory(state.authentication.currentPlannerGroup.id);
        const ktocTendersOpportunityIds = await queryKtocTendersOpportunityIds(assetOpportunityIds, userIdFromState(state));
        const defaultCurrencyIsoCode = state.authentication.currentUser.defaultCurrencyIsoCode;
        return queryOpportunities([
            ...metricConditionsOpportunityCustomers.queryConditionsAll(assetOpportunityIds),
            conditions.Opportunity.open, conditions.Opportunity.ids(ktocTendersOpportunityIds).negate()
        ],defaultCurrencyIsoCode)
    },
    LOAD_OPPORTUNITIES_CUSTOMERS
);

async function queryAssetOpportunityIdsForServiceTerritory(serviceTerritoryId: string) {
    const assetOpps = await multiQuery1Extract(queryAssetsOpportunitiesBase([conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId)]));
    return assetOpps.map(ao => ao.Opportunity__c);
}

async function queryOpportunities(options: IConditionAnyResult<coreApi.Opportunity>[],defaultCurrencyIsoCode:string) {

    const opps = await multiQuery1Extract(queryOpportunitiesBase(options));
    const oppIds = opps.map(o => o.Id);
    const assetOpportunitesTenders = await multiQuery2(
        queryAssetsOpportunitiesBase<IAsset_Opportunity_Address__c>(
            [conditions.Asset_Opportunity__c.opportunities(oppIds)],
            fields.IAsset_Opportunity_Address__c
        ),
        queryTenderNumbersForOpportunityIds(oppIds)
    )
    const [assetOpportunites, tenders] = assetOpportunitesTenders.queries.result;

    const assetOppsByOppId = groupBy(assetOpportunites, 'Opportunity__c');
    const tendersByOpportunity = _.groupBy(tenders, 'Opportunity__c');
    opps.forEach(i => i.DefaultCurrencyIsoCode = defaultCurrencyIsoCode);
    return opps.map(o => new Opportunity(o, assetOppsByOppId[o.Id], tendersByOpportunity[o.Id]));
}


export interface ITenderForOpportunity {
    FLTenderNumber__c: string, Opportunity__c: string
}

export function queryTenderNumbersForOpportunityIds(opportunityIds: string[]) {
    return queryTendersBase<ITenderForOpportunity>([conditions.Tender__c.opportunities(opportunityIds), conditions.Tender__c.active], ['FLTenderNumber__c', 'Opportunity__c']);
}

export const downloadOpportunitiesWithTenders = asyncHttpActionGeneric(
    state => queryOpportunitiesWithTendersOptions(
        state,
        (assetOpportunityIds: string[]) => [
            ...metricConditionsOpportunity.queryConditionsAll(assetOpportunityIds, userIdFromState(state))
        ]
    )
    , 
    LOAD_OPPORTUNITIES_WITH_TENDERS
);

export const downloadOpportunitiesWithTendersOwned = asyncHttpActionGeneric(
    state => queryOpportunitiesWithTendersOptions(
        state,
        (assetOpportunityIds: string[]) => [...metricConditionsOpportunityOwned.queryConditionsAll(userIdFromState(state))]
    ),
    LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED
);

export const downloadOpportunitiesWithTendersCustomers = asyncHttpActionGeneric(
    state => queryOpportunitiesWithTendersOptions(
        state,
        (assetOpportunityIds: string[]) => [...metricConditionsOpportunityCustomers.queryConditionsAll(assetOpportunityIds)]
    ),
    LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS
);

async function queryKtocTendersOpportunityIds(assetOpportunityIds: string[], userId: string) {
    const ktocTenders = await multiQuery1Extract(
        queryTendersBase<{ Opportunity__c: string }>(
            metricConditionsTenderOpportunities.queryConditionsAll(assetOpportunityIds, userId),
            ['Opportunity__c']
        )
    );
    return ktocTenders.map(t => t.Opportunity__c);
}

async function queryOpportunitiesWithTendersOptions(state: IGlobalState, options: (assetOpportunityIds: string[]) => IConditionAnyResult<coreApi.Opportunity>[]) {
    if(isAndroid()){ firebaseStartTrace('Tenders without Order trace') }
    const plannerGroupId = plannerGroupIdFromState(state);
    const defaultCurrencyIsoCode = state.authentication.currentUser.defaultCurrencyIsoCode
    
    let assetIds = await multiQuery1Extract(
        queryAssetsOpportunities([conditions.Asset_Opportunity__c.assetServiceTerritory(plannerGroupId)])
    )
    const IdsChunk = _.chunk(assetIds.map(asset => asset.Asset__c),200);
    const assetOpportunites = await joinQueries(
        ...IdsChunk.map(ids =>
            multiQuery1(queryAssetsOpportunitiesBase<IAsset_Opportunity_Address__c>(
                [conditions.Asset_Opportunity__c.assets(ids)], 
                fields.IAsset_Opportunity_Address__c)
            ))).then(
        res => res.queries.result[0]
    )
    // const assetOpportunites = await multiQuery1Extract(
    //     queryAssetsOpportunitiesBase<IAsset_Opportunity_Address__c>(
    //         [conditions.Asset_Opportunity__c.assetServiceTerritory(plannerGroupId)], 
    //         fields.IAsset_Opportunity_Address__c
    //     )
    // );
    const assetOppsByOppId = groupBy(assetOpportunites, 'Opportunity__c');
    const assetOpportunityIds = assetOpportunites.map(ao => ao.Opportunity__c);

    const ktocTendersOpportunityIds = await queryKtocTendersOpportunityIds(assetOpportunityIds, userIdFromState(state));

    const opps = await multiQuery1Extract(
        queryOpportunitiesBase([...options(assetOpportunityIds), conditions.Opportunity.openWithoutOrders, conditions.Opportunity.ids(ktocTendersOpportunityIds)])
    );

    const tenders = await multiQuery1Extract(
        queryTenderNumbersForOpportunityIds(assetOpportunites.map(ao => ao.Opportunity__c))
    );

    const tendersByOpportunity = _.groupBy(tenders, 'Opportunity__c');
    opps.forEach(o => o.DefaultCurrencyIsoCode = defaultCurrencyIsoCode);
    if(isAndroid()){ firebaseStopTrace('Tenders without Order trace') }
    return opps.map(o => new Opportunity(o, assetOppsByOppId[o.Id], tendersByOpportunity[o.Id]))
}

export function queryOpportunitiesForEquipment(equipmentId: string) {
    return multiQuery1Extract(
        queryAssetsOpportunitiesBase<IAsset_Opportunity_Address__c & IAssetOpportunityWithOpportunity>(
            [conditions.Asset_Opportunity__c.assets([equipmentId]), conditions.Asset_Opportunity__c.open ], 
            uniq([...fields.IAsset_Opportunity_Detailed__c, ...fields.IAssetOpportunityWithOpportunity])
        )
    )
    .then(assetOpportunities => 
        queryTenderNumbersForOpportunityIds(assetOpportunities.map(ao => ao.Opportunity__c))
        .then(tenders => {
            const assetOppsByOppId = groupBy(assetOpportunities, 'Opportunity__c');
            const tendersByOpportunity = _.groupBy(tenders, 'Opportunity__c');
            return assetOpportunities.map(j => j.Opportunity__r).filter(opp => opp != null).map(o => new Opportunity(o, assetOppsByOppId[o.Id], tendersByOpportunity[o.Id]))
        })
    );
}

export const queryOpportunityContactRoles = (opportunityId: string) =>
    asyncHttpActionGeneric(
        () => queryOpportunityContactRolesForOpportunity([opportunityId]).then(data => data.map(c => new ContactWithRole(c.Contact, c.Role))), 
        LOAD_OPPORTUNITY_CONTACTS
    );


export const changeOpportunitiesGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_GROUPING);
export const changeOpportunitiesFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_FILTER);

export const changeOpportunitiesCustomersGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_CUSTOMERS_GROUPING);
export const changeOpportunitiesCustomersFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_CUSTOMERS_FILTER);

export const changeOpportunitiesOwnedGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_OWNED_GROUPING);
export const changeOpportunitiesOwnedFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_OWNED_FILTER);

export const changeOpportunitiesWithTendersGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_WITH_TENDERS_GROUPING);
export const changeOpportunitiesWithTendersFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_WITH_TENDERS_FILTER);

export const changeOpportunitiesWithTendersOwnedGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_GROUPING);
export const changeOpportunitiesWithTendersOwnedFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_FILTER);

export const changeOpportunitiesWithTendersCustomersGrouping = payloadAction<OpportunityGrouping>(CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_GROUPING);
export const changeOpportunitiesWithTendersCustomersFilter = payloadAction<OpportunityFilter>(CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_FILTER);


export const changeSalesLeadsGrouping = payloadAction<OpportunityGrouping>(CHANGE_SALES_LEADS_GROUPING);
export const changeSalesLeadsFilter = payloadAction<OpportunityFilter>(CHANGE_SALES_LEADS_FILTER);

export const changeSalesLeadsCustomersGrouping = payloadAction<OpportunityGrouping>(CHANGE_SALES_LEADS_CUSTOMERS_GROUPING);
export const changeSalesLeadsCustomersFilter = payloadAction<OpportunityFilter>(CHANGE_SALES_LEADS_CUSTOMERS_FILTER);

export const changeSalesLeadsOwnedGrouping = payloadAction<OpportunityGrouping>(CHANGE_SALES_LEADS_OWNED_GROUPING);
export const changeSalesLeadsOwnedFilter = payloadAction<OpportunityFilter>(CHANGE_SALES_LEADS_OWNED_FILTER);

