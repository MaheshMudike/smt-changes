import { query, queryWithConditions, queryWithConditionsSimple } from "./jsforceCore";
import * as coreApi from '../../models/api/coreApi';
import * as userApi from '../../models/api/userApi';
import * as fields from "./queryFields";
import { ICondition, conditions, SObject, orCondition, andCondition, IConditionAnyResult } from "./jsforceMappings";

export function queryAccountsBase<TResult extends coreApi.IApiAccount>(options: ICondition<any, coreApi.Account>[], fieldsToQuery: string[] = fields.IAccount) {
    return queryWithConditions<TResult, coreApi.Account>(options, 'Account', fieldsToQuery);
}

export function querySalesOrganizationConfigurationBase(options: IConditionAnyResult<coreApi.SMT_Sales_Organization_Configuration__c>[], 
    fieldsToQuery: string[] = fields.SMT_Sales_Organization_Configuration__c) {
    return queryWithConditionsSimple<coreApi.SMT_Sales_Organization_Configuration__c>(options, SObject.SMT_Sales_Organization_Configuration__c, fieldsToQuery);
}

export function queryCasesBase<T extends coreApi.Case = coreApi.Case>(options: IConditionAnyResult<coreApi.Case>[], fieldsToQuery: string[] = fields.IComplaint) {
    return queryWithConditions<T, coreApi.Case>(options, SObject.Case, fieldsToQuery);
}

export function queryAssetsBase<T = coreApi.IAsset>(options: IConditionAnyResult<coreApi.IAsset>[], fieldsToQuery: string[] = fields.IAsset) {     
    return queryWithConditions<T, coreApi.IAsset>(options, SObject.Asset, fieldsToQuery);
}

export function queryAssetLeadsBase<T = coreApi.Asset_Lead__c>(options: IConditionAnyResult<coreApi.Asset_Lead__c>[], fieldsToQuery: string[] = fields.Asset_Lead__c) {
    return queryWithConditions<T, coreApi.Asset_Lead__c>(options, SObject.Asset_Lead__c, fieldsToQuery);
}

export function queryAssetsOpportunitiesBase<T extends coreApi.IAsset_Opportunity__c = coreApi.IAsset_Opportunity__c>(
    options: IConditionAnyResult<coreApi.IAsset_Opportunity__c>[], fieldsToQuery: string[] = fields.IAsset_Opportunity__c) {
    return queryWithConditions<T, coreApi.IAsset_Opportunity__c>(options, SObject.Asset_Opportunity__c, fieldsToQuery);
}

export function queryAssetsOpportunities<T extends coreApi.IAsset_Opportunity__c = coreApi.IAsset_Opportunity__c>(
    options: IConditionAnyResult<coreApi.IAsset_Opportunity__c>[], fieldsToQuery: string[] = ['Asset__c']) {
    return queryWithConditions<T, coreApi.IAsset_Opportunity__c>(options, SObject.Asset_Opportunity__c, fieldsToQuery);
}

export function queryAssignedResources<T = coreApi.IAssignedResource>(options: IConditionAnyResult<coreApi.IAssignedResource>[], fieldsToQuery: string[] = fields.IAssignedResource) {
    return queryWithConditions<T, coreApi.IAssignedResource>(options, 'AssignedResource', fieldsToQuery);
}

export function queryContractLinesBase<T = coreApi.IContractLineItem>(options: IConditionAnyResult<coreApi.IContractLineItem>[], fieldsToQuery: string[] = fields.IContractLineItem) {
    return queryWithConditions<T, coreApi.IContractLineItem>(options, SObject.ContractLineItem, fieldsToQuery);
}

export function queryServiceContractBase<T = coreApi.IServiceContractReport>(options: IConditionAnyResult<coreApi.IServiceContractReport>[], fieldsToQuery: string[] = fields.IServiceContractReport) {
    return queryWithConditions<T, coreApi.IServiceContractReport>(options, SObject.ServiceContract, fieldsToQuery);
}

export function queryEventsBase<T extends coreApi.IApiCoreEvent = coreApi.IApiEvent>(options: IConditionAnyResult<coreApi.Event>[], fieldsToQuery: string[] = fields.Event) {
    return queryWithConditions<T, coreApi.Event>(options, SObject.Event, fieldsToQuery);
}

export function queryOpportunitiesBase<T = coreApi.IOpportunity>(options: IConditionAnyResult<coreApi.Opportunity>[], fieldsToQuery: string[] = fields.IOpportunity) {
    return queryWithConditions<T, coreApi.Opportunity>(options, SObject.Opportunity, fieldsToQuery);
}

export function queryContentVersionsBase(options: IConditionAnyResult<coreApi.ContentVersionCore>[], fieldsToQuery: string[] = fields.ContentVersionCore) {
    return queryWithConditions<coreApi.ContentVersionCore, coreApi.ContentVersionCore>(options, SObject.ContentVersion, fieldsToQuery);
}

export function queryContentDocumentLinkBase<T extends coreApi.ContentDocumentLink>(options: IConditionAnyResult<T>[], fieldsToQuery: string[] = fields.ContentDocumentLink) {
    return queryWithConditions<T, coreApi.ContentDocumentLink>(options, SObject.ContentDocumentLink, fieldsToQuery);
}

export function queryContentDocumentBase<T extends coreApi.ContentDocument>(options: IConditionAnyResult<T>[], fieldsToQuery: string[] = fields.ContentDocument) {
    return queryWithConditions<T, coreApi.ContentDocument>(options, SObject.ContentDocument, fieldsToQuery);
}

export function queryContactsBase<TResult extends coreApi.IContactSobject = coreApi.IDetailedContact>(
    options: IConditionAnyResult<coreApi.IContactSobject>[], queryFields: string[] = fields.IApiContactDetailed
) {
    return queryWithConditions<TResult, coreApi.IContactSobject>(options, SObject.Contact, queryFields);
}

export function queryLocationContactsBase<T = coreApi.Location_Contact__c>(options: IConditionAnyResult<coreApi.Location_Contact__c>[], queryFields: string[] = fields.Location_Contact__c) {
    return queryWithConditions<T, coreApi.Location_Contact__c>(options, SObject.Location_Contact__c, queryFields);
}

export function queryContactServiceContractJunctionBase<T = coreApi.ContactServiceContractJunction__c>(options: IConditionAnyResult<T>[], queryFields: string[] = fields.ContactServiceContractJunction__c) {
    return queryWithConditionsSimple<T>(options, SObject.ContactServiceContractJunction__c, queryFields);
}

export function queryContractContactRoleBase<T = coreApi.ContractContactRole>(options: IConditionAnyResult<T>[], queryFields: string[] = fields.ContractContactRole) {
    return queryWithConditionsSimple<T>(options, SObject.ContractContactRole, queryFields);
}

export function queryFSMServiceVisitHistoryBase<T = coreApi.IServiceAppointmentVisitHistory>(options: IConditionAnyResult<coreApi.IServiceAppointmentVisitHistory>[], queryFields: string[] = fields.IServiceAppointmentVisitHistory) {
    return queryWithConditions<T, coreApi.IServiceAppointmentVisitHistory>(options, SObject.FSM_Site_Visit_History__c, queryFields);
}

export function queryLeadsBase<T = coreApi.IApiLead>(options: ICondition<any, coreApi.Lead>[], queryFields: string[] = fields.ILead) {
    return queryWithConditions<T, coreApi.ILeadBase>(options, SObject.Lead, queryFields);
}

export function queryPermissionSetAssignments<T = coreApi.IPermissionSetAssignment>(options: IConditionAnyResult<coreApi.IPermissionSetAssignment>[], queryFields: string[] = fields.IPermissionSetAssignment) {
    return queryWithConditions<T, coreApi.IPermissionSetAssignment>(options, SObject.PermissionSetAssignment, queryFields);
}

export function queryServiceAppointmentsBase<T = coreApi.IServiceAppointment>(options: IConditionAnyResult<coreApi.IServiceAppointmentCore>[], fieldsToQuery: string[] = fields.IServiceAppointment) {
    return queryWithConditions<T, coreApi.IServiceAppointmentCore>(options, SObject.ServiceAppointment, fieldsToQuery);
}

export function queryServiceResourcesBase<T = coreApi.IApiNameAndId>(options: IConditionAnyResult<coreApi.IServiceResourceBase>[], fieldsToQuery: string[] = fields.IApiNameAndId) {
    return queryWithConditions<T, coreApi.IServiceResourceBase>(options, SObject.ServiceResource, fieldsToQuery);
}

export function queryServiceResources<T extends coreApi.IServiceResource>(options: IConditionAnyResult<coreApi.IServiceResource>[], fieldsToQuery: string[] = fields.IServiceResource) {
    return queryWithConditions<T, coreApi.IServiceResource>(options, SObject.ServiceResource, fieldsToQuery);
}

export function queryServiceTerritoryMemberBase<TResult extends userApi.IServiceTerritoryMember>(options: ICondition<TResult, userApi.IServiceTerritoryMember>[], fieldsToQuery: string[] = fields.IServiceTerritoryMember) {
    return queryWithConditions<TResult, userApi.IServiceTerritoryMember>(options, SObject.ServiceTerritoryMember, fieldsToQuery);    
}

export function querySMTAutomationRuleBase<TResult extends coreApi.SMT_Automation_Rule__c>(options: ICondition<TResult, coreApi.SMT_Automation_Rule__c>[], fieldsToQuery: string[] = fields.SMT_Automation_Rule__c) {
    return queryWithConditions<TResult, coreApi.SMT_Automation_Rule__c>(options, SObject.SMT_Automation_Rule__c, fieldsToQuery);    
}

export function queryVersionBase<TResult = coreApi.IVersion>(options: IConditionAnyResult<coreApi.Version>[], fieldsToQuery: string[] = fields.IVersion) {
    return queryWithConditions<TResult, coreApi.Version>(options, SObject.Version__c, fieldsToQuery);
};

export function queryTendersBase<TResult = coreApi.ITender>(options: IConditionAnyResult<coreApi.ITender>[], fieldsToQuery: string[] = fields.ITender) {
    return queryWithConditions<TResult, coreApi.Tender__c>(options, SObject.Tender__c, fieldsToQuery);
};

export function queryUsersBase(options: IConditionAnyResult<userApi.User>[]) {
    return queryWithConditions<userApi.IUser, userApi.User>(options, SObject.User, fields.IUser)
}

export function querySMTConfiguration(environment: string) {
    return query<userApi.SMT_Configuration__mdt>({ DeveloperName: { $like: environment } }, 'SMT_Configuration__mdt', fields.SMT_Configuration__mdt);    
}

export function querySMTSalesorgConfiguration(salesorgCode: string) {
    return query<userApi.SMT_Sales_Organization_Configuration__c>({ Sales_Organization__c: { $eq: salesorgCode }}, 
        SObject.SMT_Sales_Organization_Configuration__c, fields.SMT_Sales_Organization_Configuration__c);
}

export function querySMTNotifications<TResult extends coreApi.SMT_Notification__c = coreApi.SMT_Notification__c>(
    options: IConditionAnyResult<coreApi.SMT_Notification__c>[], 
    fieldsToQuery: string[] = fields.SMT_Notification__c
) {
    return queryWithConditions<TResult, coreApi.SMT_Notification__c>(options, SObject.SMT_Notification__c, fieldsToQuery);
}

export function querySMTNotificationReads<TResult extends coreApi.SMT_Notification_Read__c = coreApi.SMT_Notification_Read__c>(
    options: IConditionAnyResult<coreApi.SMT_Notification_Read__c>[], 
    fieldsToQuery: string[] = fields.SMT_Notification_Read__c
) {
    return queryWithConditions<TResult, coreApi.SMT_Notification_Read__c>(options, SObject.SMT_Notification_Read__c, fieldsToQuery);
}

export function querySMTUserInfo(options: IConditionAnyResult<userApi.SMT_User_Info__c>[]) {
    return queryWithConditionsSimple<userApi.SMT_User_Info__c>(options, SObject.SMT_User_Info__c, fields.SMT_User_Info__c);
}

export function queryTaskBase(options: IConditionAnyResult<coreApi.Task>[], fieldsToQuery: string[] = fields.ITask) {
    return queryWithConditions<coreApi.ITask, coreApi.Task>(options, SObject.Task, fieldsToQuery);
}

export function queryTimesheetEntriesBase<TResult extends coreApi.TimeSheetEntryMetrics>(options: IConditionAnyResult<coreApi.TimeSheetEntryMetrics>[], fieldsToQuery: string[] = fields.ITimeSheetEntry) {
    return queryWithConditions<TResult, coreApi.TimeSheetEntryMetrics>(options, SObject.TimeSheetEntry, fieldsToQuery);
}

export function queryResourceAbsenceBase<TResult extends coreApi.IResourceAbsence>(options: IConditionAnyResult<TResult>[], fieldsToQuery: string[] = fields.IResourceAbsence) {
    return queryWithConditions<TResult, coreApi.IResourceAbsence>(options, SObject.ResourceAbsence, fieldsToQuery);
}

export function queryWorkOrdersBase<TResult = coreApi.IWorkOrderCore>(options: IConditionAnyResult<coreApi.WorkOrder>[], fieldsToQuery: string[] = fields.IWorkOrderCore) {
    return queryWithConditions<TResult, coreApi.WorkOrder>(options, SObject.WorkOrder, fieldsToQuery);
}

export function queryWorkOrders<TResult extends coreApi.WorkOrder = coreApi.IWorkOrder>(options: IConditionAnyResult<coreApi.WorkOrder>[], fieldsToQuery: string[] = fields.IWorkOrder) {
    return queryWithConditions<TResult, coreApi.WorkOrder>(options, SObject.WorkOrder, fieldsToQuery);
}

export function queryWorkOrderHistory<TResult extends coreApi.IWorkOrderHistory>(options: IConditionAnyResult<TResult>[], fieldsToQuery: string[] = fields.IWorkOrderHistory) {
    return queryWithConditions<TResult, coreApi.WorkOrder>(options, SObject.WorkOrderHistory, fieldsToQuery);
}

export function queryWorkorderLineItemBase<TResult extends coreApi.WorkOrderLineItem>(options: IConditionAnyResult<coreApi.WorkOrderLineItem>[], fieldsToQuery: string[] = fields.WorkOrderLineItem) {
    return queryWithConditions<TResult, coreApi.WorkOrderLineItem>(options, SObject.WorkOrderLineItem, fieldsToQuery);
}

export function queryProductConsumedBase<TResult extends coreApi.ProductConsumed>(options: IConditionAnyResult<coreApi.ProductConsumed>[], fieldsToQuery: string[] = fields.ProductConsumed) {
    return queryWithConditions<TResult, coreApi.ProductConsumed>(options, SObject.ProductConsumed, fieldsToQuery);
}

export function queryWorkCenterAssignmentsBase(options: IConditionAnyResult<coreApi.IFSM_Work_Center_Assignment__c>[], 
    fieldsToQuery: string[] = fields.IFSM_Work_Center_Assignment__c) {
    return queryWithConditionsSimple<coreApi.IFSM_Work_Center_Assignment__c>(options, SObject.FSM_Work_Center_Assignment__c, fieldsToQuery);
}

export function queryNpxSurveyRecordsBase<TResult extends coreApi.NPX_Survey_Record__c = coreApi.NPX_Survey_Record_Report>(
    options: IConditionAnyResult<coreApi.NPX_Survey_Record__c>[],
    fieldsToQuery: string[] = fields.NPX_Survey_Record
) {
    return queryWithConditions<TResult, coreApi.NPX_Survey_Record__c>(options, SObject.NPX_Survey_Record__c, fieldsToQuery);
}