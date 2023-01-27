import { EntityType } from "../../constants/EntityType";
import { entityTypeToSobject, orCondition, conditions, SObject } from "./jsforceMappings";
import * as queryFields from './queryFields';
import { query, multiSOSL, retrieveSOSLResult } from "./jsforceCore";
import { ISObject, IApiNameAndId, IApiAccount, IWorkOrderForListItem } from "src/models/api/coreApi";
import { queryAssetOpportunities, queryEquipmentContractLines2 } from "./jsforce";
import { OpportunityListItem } from "src/models/feed/Opportunity";
import { createSearchResultGroup, createSearchResultGroupWithSobjects, SOSL_LIMIT } from "../searchActions";
import { ISearchResultGroup } from "src/models/search/ISearchResults";
import { IListItem } from "src/models/list/IListItem";
import { queryAccountsBase, queryTendersBase, queryWorkOrdersBase } from "./jsforceBase";
import * as _ from 'lodash';
import { getAccountsFromContractLines } from "src/models/equipment/Equipment";
import { EntityFieldsData } from "src/components/fields/EntityFieldsData";

export const All = 'All';

export const searchEntities = [
    EntityType.Account,
    EntityType.Audit,
    EntityType.Callout, 
    EntityType.Complaint, 
    EntityType.Equipment, 
    EntityType.Event, 
    EntityType.Lead, 
    EntityType.Opportunity, 
    EntityType.Task, 
    EntityType.Technician,
    EntityType.Tender
]

const searchConfiguration = {
    [EntityType.Account]: {
    },
    [EntityType.Callout]: {
        orderBy: "WorkOrderNumber"
    },
    [EntityType.Complaint]: {
        orderBy: "Subject",
    },
    [EntityType.Equipment]: {
    },
    [EntityType.Event]: {
        orderBy: "Subject"
    },
    [EntityType.Lead]: {
        limit: 50
    },
    [EntityType.Opportunity]: {
        limit: 50
    },
    [EntityType.Task]: {
        orderBy: "Subject"
    },
    [EntityType.Technician]: {
    },
    [EntityType.Tender]: {
    },
} as { [index: string] : {    
    orderBy?: string,
    limit?: number
}}

/*
export function soqlSearch(searchText: string, limit: number, objects: string[]) {
    return objects.map(entity => 
        [entity, soqlSearchPartial(searchText, searchConfiguration[entity].limit || limit, searchConfiguration[entity].orderBy, entity as EntityType)
        ] as [EntityType, Query<any>]
    );
}
*/

function searchOptions(fields: string[], searchText: string) {    
    return { $or: fields.map(field => ({ [field]: { $like: '%'+searchText+'%' } })) };
}

const notSearchableFields = new Set<string>([
    'Id', 'Description', 'OwnerId', 'IsClosed', 'Amount', 'WhoId', 'AssetId',
    'IsWon', 'IsHighPriority',
    'Number_Of_Floors__c',
    'Entrapment__c', 'Probability', 'FSM_Escalated_To__c',
    'FSM_Asset__c', 'Product_Service_Interest__c', 'Version_Number__c', 'Rated_Load__c', 'Rated_speed__c', 'Price_Due_Date__c',
    'Total_Sales_Price__c', 'Workcenter__c', 'Manufacturer__c', 
    'Warranty_Start_Date__c', 'Warranty_End_Date__c', 'FSM_Out_Of_Order_Date__c', 'FSM_Back_In_Order_Date__c', 
    'Main_Work_Center__c', 'Geolocation__Latitude__s', 'Geolocation__Longitude__s'
]);
function soqlSearchPartial(searchText: string, limit: number, orderBy: string, entityType: EntityType) {
    const sobjectName = entityTypeToSobject[entityType];
    const objectFields = listItemFields[sobjectName];
    const searchFields = objectFields.filter((f: string) => 
        !f.endsWith(".Id") && !f.endsWith("Date") && !f.endsWith("DateTime") &&f != "IsClosed" && !notSearchableFields.has(f));//searchConfiguration[entityType].searchFields

    //const wherePart = entityType == EntityType.Complaint ? " WHERE RecordType.Name = 'Customer Query' OR RecordType.Name = 'Customer Complaint'" :  "";
    const queryComplaintFilter = { $or: [{ 'RecordType.Name': { $eq: 'Customer Query'} }, { 'RecordType.Name': {$eq: 'Customer Complaint'} } ] };
    const searchOps = searchOptions(searchFields, searchText);
    return query(entityType == EntityType.Complaint ? { $and: [searchOps, queryComplaintFilter] } : searchOps , sobjectName, objectFields)
        .limit(limit).sort(orderBy == null ? 'Name' : orderBy);
    /*
    return query(searchOptions(searchConfiguration[entityType].searchFields, searchText), sobjectName,  queryFields.listItemFields[sobjectName])
        .then(records => records.map(r => wrapSearchResult(r, entityType, searchConfiguration[entityType].descriptionField)));
        */
}


/*
these are the search objects from the documentation
https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/125941168/Display+Search+results

Equipment
Complaint
Service Orders
Queries
Tasks
Opportunities
Event
Tenders
Accounts
*/

function soslEntity(entityType: EntityType, limit: number, orderBy: string) {
    const sobject = entityTypeToSobject[entityType];
    return soslEntityFields(entityType, limit, orderBy, listItemFields[sobject]);
}

function soslEntityFields(entityType: EntityType, limit: number, orderBy: string, fields: string[]) {
    const sobject = entityTypeToSobject[entityType];
    const orderByPart = orderBy == null ? " ORDER BY Name" : " ORDER BY " + orderBy;
    const wherePart = entityType == EntityType.Complaint ? " WHERE RecordType.Name = 'Customer Query' OR RecordType.Name = 'Customer Complaint'" : entityType == EntityType.Callout ? " WHERE RecordType.Name != 'Site Visit Work Order' " : "";

    //sub queries don't work with SOSL (see IWorkOrderForListItem)...
    const fieldsWithoutSubqueries = fields.filter(f => !f.startsWith('('));
    return sobject + "(" + fieldsWithoutSubqueries.join(',') + wherePart + orderByPart + " LIMIT " + limit + ")";
}

/*
const soslQueryString = (search: string, limit: number, objects: string[]) => {    
    const soslParts = objects.map(entity => soslEntity(entity as EntityType, limit, searchConfiguration[entity].orderBy)).join(', ');
    return "FIND {"+search+"} IN ALL FIELDS RETURNING " + soslParts;
}

export const soslQuery = (search: string, limit: number) => {    
    const conn = connection as any;    
    return conn.search(soslQueryString(search, limit)) as Promise<any>;
}
*/

export async function soslQuery<T = ISObject>(search: string, limit: number, entity: string) {
    const soslFields = soslEntity(entity as EntityType, searchConfiguration[entity].limit || limit, searchConfiguration[entity].orderBy);
    return soslQueryFields<T>(search, soslFields);
}

async function soslQueryIdOnly<T = ISObject>(search: string, limit: number, entity: string) {
    const soslFields = soslEntityFields(entity as EntityType, searchConfiguration[entity].limit || limit, searchConfiguration[entity].orderBy, ['Id']);
    return soslQueryFields<T>(search, soslFields)
}

async function soslQueryFields<T>(search: string, soslFields: string) {
    const sosl = "FIND {*"+search+"*} IN ALL FIELDS RETURNING " + soslFields;
    return await multiSOSL<T>(sosl).then(results => retrieveSOSLResult(results));
}

export const soslQueryGroup = async (search: string, limit: number, entity: string, entityFieldsData: EntityFieldsData): Promise<ISearchResultGroup<IListItem>> => {
    const entityType = entity as EntityType;
    const soslq = soslQuery(search, limit, entity);
    switch(entityType) {
        case EntityType.Tender:
            const opportunitySosl = "FIND {" + search + "} IN Name FIELDS RETURNING " + soslEntityFields(EntityType.Opportunity, SOSL_LIMIT, 'Name', ['Id']);
            const oppsForTenders = await multiSOSL<{ Id: string }>(opportunitySosl).then(results => retrieveSOSLResult(results));
            const oppIds = oppsForTenders.map(opp => opp.Id);

            const tenders = await soslQuery(search, limit, EntityType.Tender);
            const oppTenders = await queryTendersBase([conditions.Tender__c.opportunities(oppIds)], listItemFields[SObject.Tender__c]);

            return createSearchResultGroupWithSobjects(search, entityType, [...tenders, ...oppTenders].slice(0, SOSL_LIMIT), entityFieldsData);
        case EntityType.Opportunity:
            const opps = await soslq;
            const { Asset_Opportunity__c } = conditions;
            const assetOpps = await queryAssetOpportunities([
                Asset_Opportunity__c.opportunities(opps.map(o => o.Id))
            ]);
            const groupResults = opps.map(opp => new OpportunityListItem(opp as any, assetOpps[opp.Id]));
            return createSearchResultGroup(search, EntityType.Opportunity, groupResults);
        case EntityType.Callout:
            //sosl cannot query sub-relations, we need a second query
            const wosSosl = await soslQueryIdOnly(search, limit, entity);
            const ids = wosSosl.map(wo => wo.Id);
            const wos = await queryWorkOrdersBase<IWorkOrderForListItem>([conditions.SObject.ids(ids)], listItemFields[SObject.WorkOrder]);
            return createSearchResultGroupWithSobjects(search, entityType, wos, entityFieldsData);
        default:
            const sobjects = await soslq;
            const result = createSearchResultGroupWithSobjects(search, entityType, sobjects, entityFieldsData);
            return result;
    }
    
}

export async function searchAccounts(search: string, limit: number) {
    const equipmentSosl = "FIND {*"+search+"*} IN Name FIELDS RETURNING " + soslEntityFields(EntityType.Equipment, SOSL_LIMIT, 'Name', ['Id']);
    const equipment = await multiSOSL<{ Id: string }>(equipmentSosl).then(results => retrieveSOSLResult(results));
    const equipmentWithContractLines = await queryEquipmentContractLines2(equipment);
    const contractLineAccounts = _.uniq(_.flatMap(equipmentWithContractLines, ecl => getAccountsFromContractLines(ecl.activeContractLines, ecl.contractLines)));
    const equipmentAccountIds = _.uniq(_.flatMap(contractLineAccounts, cla => [cla.billedToAccount.id, cla.decidedByAccount.id, cla.soldToAccount.id]));

    const accounts = await soslQuery<IApiAccount>(search, limit, EntityType.Account);
    const equipmentAccounts = await queryAccountsBase([conditions.Account.ids(equipmentAccountIds)], listItemFields[SObject.Account]);
    return [...accounts, ...equipmentAccounts].slice(0, SOSL_LIMIT);
}

//TODO this should only map fields to query the listitems
const listItemFields = {
    [SObject.Account]: queryFields.IAccountListItem,
    [SObject.Asset]: queryFields.IAsset,
    [SObject.Case]: queryFields.IComplaint,
    [SObject.Contact]: queryFields.IContactCore,
    [SObject.Event]: queryFields.Event,
    [SObject.Lead]: queryFields.ILead,
    [SObject.Opportunity]: queryFields.IOpportunity,
    [SObject.Task]: queryFields.ITask,
    [SObject.ServiceResource]: ['Id', 'RelatedRecord.Name'],//IServiceResource,
    [SObject.User]: queryFields.IUser,
    [SObject.Version__c]: queryFields.IVersion,
    [SObject.Tender__c]: queryFields.ITender,
    [SObject.WorkOrder]: queryFields.IMbmForListItem
}