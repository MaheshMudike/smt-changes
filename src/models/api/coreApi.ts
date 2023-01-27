export interface ISalesForceAttributes {
    type: string;
    url: string;
}

export interface SObject {}

export interface ISObject {
    attributes: ISalesForceAttributes;
    Id: string;    
}

export interface IActivityHistory {
    WhatId: string;
}

export interface IApiName {
    Name: string;
}

export interface IApiId {
    Id: string;
}

export interface ILastModifiedDate {
    LastModifiedDate: string;
}

export interface IAssignedResource {
    ServiceResourceId: string;
    ServiceAppointmentId: string;
    ServiceAppointment: { Work_Order__c: string };
}

export interface IAssignedResourceWithRelatedRecordName {
    ServiceResourceId: string, ServiceAppointmentId: string, ServiceResource: { RelatedRecord: { Name: string, Email: string } }
}

export interface Account extends SObject {
    attributes: { type: "Account" }
}

export interface IApiAccountListItem {
    Id: string;
    AccountNumber: string;
    Name: string;  
}

interface IApiAccountBase extends IApiAccountListItem {          
    Phone: string;    

    Street_1__c: string;    
    KONE_City__c: string;
    KONE_Country__c: string;
    KONE_Zip_Postal_Code__c: string;    
}

export interface IApiAccount extends IApiAccountBase{    
    contacts?: IDetailedContact[];    
}

export interface IAccountReport extends IApiAccountBase {
    Owner: {
        Name: string;
        Phone: string;
        MobilePhone: string;
    };
}

export interface IFSM_Work_Center_Assignment__c {
    Work_Center__c: string;
    Work_Center__r: {
        Name: string;
        SAP_Key__c: string;
    };
    Service_Resource__c: string;    
}

export interface ProductConsumed extends IApiId {
    ProductName: string;
    Description: string;
    QuantityConsumed: number;
    Status__c: string;
    Material_SAP_Number__c: string;
}

export interface WorkOrderLineItem extends IApiId {
    Operation_Text__c: string;
}

export interface WorkOrder {}

export interface AssetLocation {
    Geolocation__Latitude__s: number;
    Geolocation__Longitude__s: number;
}

export interface IWorkOrderAssetLocation extends WorkOrder { 
    Id: string,
    Asset: AssetLocation
}

export interface IWorkOrderLocation extends IWorkOrderAssetLocation {
    WorkOrderNumber: string;
    Service_Order_Number__c: string;
}

export interface IWorkOrderEmergency extends WorkOrder { Id: string, Priority: string, Entrapment__c: boolean, Injury__c: boolean, Hazard__c: boolean, Maintenance_Activity_Type__c: string, Failure_Type_Code__c: string, Service_Order_Number__c: string }

export interface IWorkOrderCore extends WorkOrder{
    Id: string;
    Equipment_Condition_On_Departure__c: string;
    Status: string;
    Konect_Status__c: string;
    StartDate: string;//startDate: string;
    CreatedDate: string;
    
    Job_Description__c: string;    
    Description__c: string;
    ServiceContractId: string;
    New_Status_Date__c: string;
    Technician_Name__c: string;
    //Case: { Description: string; }    
}

export interface IWorkOrderBase extends IWorkOrderCore {
    Id: string;
    Response_Time__c: string;
    WorkOrderNumber: string;
    Service_Order_Number__c: string;
    Service_Order_Type__c: string;    
}

export interface IWorkOrderReport extends IWorkOrderBase {    
    Description: string;//description: string;
    EndDate: string;//closeDate: string;    
    AssetId: string;
    Maintenance_Activity_Type__c: string;
    Completed_Date__c: string;    
}


export interface WorkOrderForServiceOrdersReport extends IWorkOrderCore {
    Id: string;
    Asset: { Main_Work_Center__r: { Name: string } },
    WorkType: { Name: string };
    Maintenance_Activity_Type__c: string;
    Service_Order_Type__c: string;
    Earliest_Start_Date__c: string;
    EndDate : string;
    CreatedDate: string;
    Work_Center__r:  IApiNameAndId
}


interface IAddress {
    city: string,
    country: string,
    geocodeAccuracy: string,
    latitude: number,
    longitude: number,
    postalCode: string,
    state: string,
    street: string,
}

export interface IWorkOrderMapItem extends IWorkOrderCore {
    Asset: IEquipmentMapItem;
    Priority: string;
    Id: string;
    Status: string;
    Maintenance_Activity_Type__c: string;
    Service_Order_Type__c: string;
    Service_Order_Number__c: string;
    Entrapment__c: boolean;
    Injury__c: boolean;
    Hazard__c: boolean;

    Failure_Type_Code__c: string;
}

export interface IWorkOrderForListItemAsset {
    Id: string, Name: string, Customer_Asset_Name__c: string,
    Installation_Street__c: string, Installation_Zip_Postal_Code__c: string, Installation_City__c: string, Main_Work_Center__r : { Name : string } 
}

export interface IWorkOrderForListItem extends WorkOrder {
    Id: string;
    Asset: IWorkOrderForListItemAsset;
    Location: { Name: string };
    OO_Asset_Site__c: string;
    WorkOrderNumber: string;
    Service_Order_Number__c: string;
    ServiceTerritoryId: string;
    Subject: string;
    Maintenance_Activity_Type__c: string;
    Service_Order_Type__c: string;
    Priority: string;
    Detailed_Reason_For_Rejection__c: string
    Supervisor_Will_Manage_Reason__c:string,

    Entrapment__c: boolean;
    Injury__c: boolean;
    Hazard__c: boolean;

    Status: string;
    Description__c: string;
    New_Status_Date__c: string;
    Konect_Status__c: string;
    CreatedDate: string;
    StartDate: string;
    Earliest_Start_Date__c: string;

    Assembly_SAP__c: string;

    Failure_Type_Code__c: string;

    //SMT_Notes__r: { records: SMT_Notes__c[] };

    Notes: { records: Note[] };
    Work_Center__r:  { Name : string }
}

export interface IWorkOrderForListItemSupervisorWillManage extends IWorkOrderForListItem {
    Supervisor_Will_Manage__c: boolean,
    Case: { FSM_Escalated_To__c: string }
}

export interface Note {
    Id: string, Title: string, Body: string, ParentId: string, OwnerId: string
}

export interface SMT_Notes__c {
    Id: string, Subject__c: string, Description__c: string, Due_Date__c: string, Work_Order__c: string
}

export interface IWorkOrderRejectedListItem {
    Id: string;
    Maintenance_Activity_Type__c: string;
    Service_Order_Type__c: string;
    Asset: { Account: { Id: string, Name: string } };
    WorkOrderNumber: string;
    Service_Order_Number__c: string;
    Priority: string;

    Entrapment__c: boolean;
    Injury__c: boolean;
    Hazard__c: boolean;
    Failure_Type_Code__c: string;
}

export interface IWorkOrderRejectedListItemNonFSM extends IWorkOrderRejectedListItem {
    Technician_Name__c: string;
    New_Status_Date__c: string;
    Completed_By__r: { Id: string, Name: string };
}

export interface IWorkOrderHistory {
    WorkOrderId: string;
}

export interface MbmForListItem extends IWorkOrderForListItem {
    WorkOrderLineItems: { records: { Operation_Text__c: string }[] }
}

export interface IWorkOrderForFeedItem extends IWorkOrderForListItem {
    /*Asset: { Account__r: IApiNameAndId, Workcenter__c: string };*/
    LastModifiedDate: string;
}

export interface IWorkOrder extends IWorkOrderBase {
    //Asset: { Id: string, Name: string, Account__r: IApiNameAndId, Installation_Street__c: string, Workcenter__c: string, Manufacturer_Serial_Number__c: string };
    //this needs to be IAsset because it is used when opening an asset dialog from the workorder dialog
    Asset: IWorkOrderForListItemAsset & { 
        Id: string, 
        Building_Name__c: string, 
        Geolocation__Latitude__s: number, 
        Geolocation__Longitude__s: number, 
        Manufacturer_Serial_Number__c: string, 
        Account: IApiNameAndId 
    };//IAsset;
    Address: IAddress;
    Account: IApiNameAndId;// & { Customer_SAP_Number__c: string };// from lineitem customerNumber: string; seems not used
    Subject: string;
    //workorderItem: IWorkOrderLineItem;
    Caller_Name__c: string;
    Konect_Caller_Name__c: string;
    Caller_Phone_Number__c: string;
    Caller_Phone__c: string;
    System_Calculated_SLA__c: string;
    
    Due_Date__c: string;
    Earliest_Start_Date__c: string;    
    
    Latitude: number;
    Longitude: number;

    Entrapment__c: boolean;
    Injury__c: boolean;
    Hazard__c: boolean;
    Priority: string;
    LastModifiedDate: string;
    ServiceTerritoryId: string;
    ServiceTerritory: IServiceTerritory;
    
    IsClosed: boolean;
    Type__c: string;
    'WorkType.Name': string; //type: string;
    
    //IWorkOrderLineItem fields    
    OO_Asset_Site__c: string;  //siteName: string;    
    Location: {
        Id: string;
        Name: string;
        Street__c: string;
        Zip_Postal_Code__c: string;
        City__c: string;
    };
    Reason_Code__c: string;

    Detailed_Reason_For_Rejection__c: string,
    Supervisor_Will_Manage_Reason__c: string,
            
    Maintenance_Activity_Type__c: string; //visitTypeCode: string;
    Case: { Description: string; FSM_Escalated_To__c: string; FSM_Next_Actions__c: string; }; //failureDesc: string;
    Completed_Date__c: string; //closeDate: string;


    //Histories: { records: IHistory[] };
    /*
    ServiceAppointments: { records: 
        { 
            Owner: IApiName, Status: string, EarliestStartTime: string, DueDate: string, SchedStartTime: string, 
            SchedEndTime: string 
        }[] 
    };
    */

    serviceAppointments: IServiceAppointment[];
    assignedResources: { Name: string, Email: string }[];

    Assembly_SAP__c: string; //mbmAssemblyCode

    Equipment_Condition_On_Departure__c: string;
    Completed_By__r: { Id: string, Name: string };

    WorkOrderLineItems: { records: { Operation_Text__c: string }[] }
    Notes: { records: Note[] };
    //SMT_Notes__r: { records: SMT_Notes__c[] };
    Work_Center__r:  { Name : string }

    Supervisor_Will_Manage__c: boolean;
    Failure_Type_Code__c: string;
}

export interface SMT_Notification__c {
    Id: string,
    Data__c: string;    
    Description__c: string;
    Record_Id__c: string;
    Service_Territory__c: string;
    SObject_Name__c: string;
    Translation_Key__c: string;
    Type__c: string;
    Operation__c: string;
    User__c: string;
    CreatedDate: string;
}

export interface SMT_Notification_Read__c {
    Id: string,
    SMT_Notification__c: string,
    User__c: string
}

export interface IHistory {
    OldValue: string;
    NewValue: string;
    CreatedDate: string;
}

export interface IServiceAppointmentCore {}

export interface IServiceAppointmentRejectedListItem extends IServiceAppointmentCore {
    Id: string;
    AppointmentNumber: string;
    ParentRecordId: string;
    New_Status_Date__c: string;
    Assigned_Service_Resource__c: string;
    Assigned_Service_Resource__r: {
        Name: string;
    }
}

export interface IServiceAppointmentRejected extends IServiceAppointmentRejectedListItem {
    Rejection_Reason__c: string;
}

export interface IServiceAppointment extends IServiceAppointmentCore {
    Id: string, Owner: IApiName, Status: string, StatusCategory: string,
    Assigned_Service_Resource__c: string,
    EarliestStartTime: string, DueDate: string, SchedStartTime: string, 
    SchedEndTime: string, ParentRecordId: string,
    Work_Order__r : IWorkOrderCore,
    New_Status_Date__c: string
}

export interface IServiceAppointmentForWorkOrder {
    Work_Order__r: IWorkOrderForListItemSupervisorWillManage,
    New_Status_Date__c: string
}

export interface IServiceVisitHistoryNotes {
    Id: string;
    Title: string, 
    Body: string, 
}


interface IServiceAppointmentBase extends IServiceAppointmentCore {
    Id: string;
    ParentRecordId: string,
    Status: string,
    AppointmentNumber: string, 
}

export interface IServiceAppointmentVisitHistory {
    Id: string, Name: string, Service_Appointment__r: IServiceAppointmentBase,
    CreatedDate: string, Owner: IApiName, Notes: { records: { item: IServiceVisitHistoryNotes } };
    Status: string, EarliestStartTime: string, DueDate: string, SchedStartTime: string, 
    SchedEndTime: string, ParentRecordId: string, Work_Order__r: IWorkOrderCore, New_Status_Date__c: string
    //Work_Order__r: { WorkOrderNumber: string; }
}

export interface IContractLineItemRush extends IContractLineItemSobject {
    RUSH_Contract_type__c: string
}
/*
export interface IWorkOrderSvWillManage extends IWorkOrder {    
    svWillManage: boolean;
}
*/
export interface IWorkOrderWithContractLineItems extends IWorkOrder {
    contractLineItems: IContractLineItemRush[];
}

//TODO FSM there is Contract line item and work order line item
//many fields here don't seem to have corresponding
/*
export interface IWorkOrderLineItem {
    Address: string;//addressLine: string;
    ServiceTerritory: string;//branch: string;
    calculatedResponseTime: number;    
    //callerName: string;
    //callerTel: string;
    Caller_Name__c: string;
    Caller_Phone_Number__c: string;
    
    Asset: IAsset;
        
    failureType: string;    
    //jobDescription: string;
    Job_Description__c: string;
        
    Operation_Text__c: string; //mbm01ModuleDescription: string;
}
*/
/*
interface ILocation {
    Latitude: string,
    Longitude: string,
    Zip_Postal_Code__c: string,
    VisitorAddress: string;
    City__c: string;
    Name: string;
}
*/
interface IServiceTerritory {
    Planner_Group_SAP_Key__c: string
}

export interface IAssetSobject {}

export interface IEquipmentMapItem extends IAssetSobject {
    Id: string,    
    Geolocation__Longitude__s: number;
    Geolocation__Latitude__s: number;
    FSM_Equipment_Condition__c: string;
    Main_Work_Center__r: { Id: string, Name: string, Description__c: string };
    RecordType: { Name: string };
    activeContractLines: IContractLineItem[];
    contractLines: IContractLineItem[];
}

export interface Asset_Lead__c {
    Asset__c: string;
    Lead__c: string;
}

export interface IHistogram {
    [key: string]: number;
}

export interface IAssetBase extends IApiNameAndId, IAssetSobject {
    Name: string;
    Installation_Street__c: string; //siteAddress: string;
    Installation_District__c: string;
    Installation_City__c: string; //siteCity: string;
    Installation_State_Provice__c_: string; //sitePostCode: string;
    Installation_Zip_Postal_Code__c: string
    
    Manufacturer__c: string;//manuf: string;
    Status: string; //status: string; Purchased, Shipped....
    FSM_Equipment_Condition__c: string; //Out-Of-Order , Back-In-Order
    Equipment_Type__c: string;//equipmentTypeCode: string;
    
    Manufacturer_Serial_Number__c: string;//SerialNumber: string; liftSerialNumber: string;
    
    Visiting_Hours__r: { Id: string; Name: string; TimeZone: string; Hours_Key__c: string; }    
    //Service_hours__c: string;//TODO not found contractServiceHours: string;
    Response_time_outside_office_hours__c: number;//TODO not found contractResponseTime: number;
    Response_time_office_hours__c: number;//TODO not found contractResponseTimeOutsideOfficeHours: number;
    
}

export interface IAssetReport extends IAssetBase {
    Main_Work_Center__c: string;

    completedCallouts: number;
    otherCompletedServiceOrders: number;
    missedVisits: number;
    openMBMs: number;
    openServiceOrdersCount: number;
    closedServiceOrders: IWorkOrderReport[];
    openServiceOrders: IWorkOrderReport[];

    serviceOrdersHistogram: IHistogram;
}

export interface IAsset extends IAssetBase {
    //added for technician report
    Geolocation__Longitude__s: number;
    Geolocation__Latitude__s: number;

    Customer_Asset_Name__c: string;
    Account: IApiNameAndId; //matched by FSM team, this is the facility management company
    /*
    EquipmentDecidedByAccountId: string;
    EquipmentDecidedByAccountName: string;
    */

    //Sold_to_SFDC_id__r: IApiNameAndId;
    /*
    EquipmentSoldToAccountId: string;
    EquipmentSoldToAccountName: string;
    */
    
    Company_Code__c: string;//companyNumber: string;
    //these fields are obsolete
    //Contract_Type__c: string;//maybe Contract_Type_Description__c contractType: string;    
    //Contract_End_Date__c: string;//contractEndDate: string;
    //Contract_Start_Date__c: string;//contractStartDate: string;
    FSM_Equipment_Condition__c: string;
    
    Construction_Month__c: string;//constructionMonth: number;
    Construction_Year__c: number;//constructionYear: number;

    /*
    EquipmentAccountId: string;
    EquipmentAccountName: string;
    */

    Id: string,
    LastModifiedDate: string;//lastModification: string;
    //Assetitude__c: string, //Assetitude: number;
    //liftId: string;
    Location__c: string;
    
    Main_Work_Center__c: string;
    Main_Work_Center__r: {
        Name: string;
        Description__c: string;
    }
    Manufacturing_Country__c: string;
    Market_segment__c: string;
    Number_Of_Floors__c: number;
    Rated_Load__c: number;
    Rated_Speed__c: number;
    Rated_Speed_Imperial__c: number;
    Rated_Load_Imperial__c: number;
    
    //latitude: longitude: number;

    //Location: ILocation;
    Building_Name__c: string; //siteName: string;
    Building_Name_2__c: string;
       
    //TODO not used superiorEquipment: string;
    Elevator_Technical_Platform__c: string;//technicalPlatform: string;
    //tripCounter: number;    
    Warranty_End_Date__c: string;//warrantyEnd: string;
    Warranty_Start_Date__c: string;//warrantyStart: string;

    //statusInfo fields
    FSM_Out_Of_Order_Date__c: string;//stopDate: string;
    FSM_Condition_Reason_Code__c: string;//stopReason: string;
    FSM_Back_In_Order_Date__c: string;//startDate: string;

    Workcenter__c: string;

    Location: ILocation;
}

export interface IAsset_Opportunity__c {
    Asset__c: string;
    Opportunity__c: string;
    //Opportunity__r: IOpportunity;
}

export interface IAsset_Opportunity_Address__c extends IAsset_Opportunity__c {
    Asset__r: {
        Id: string;
        Name: string;
        Geolocation__Longitude__s: number, 
        Geolocation__Latitude__s: number, 
        Installation_Street__c: string, 
        Installation_Zip_Postal_Code__c: string, 
        Installation_City__c: string
    }
}

export interface IAsset_Opportunity_Detailed__c extends IAsset_Opportunity__c {
    Asset__r: IEquipmentMapItem
    Opportunity__r: IOpportunity;
}

export interface IAssetOpportunityWithOpportunity extends IAsset_Opportunity__c {
    Opportunity__r: IOpportunity;
}

interface IAssetLocation {
    Id: string;
    Location: ILocation;
}

export interface WorkOrderForField {//extends IWorkOrderCore{ 
    WorkOrderNumber: string,
    Service_Order_Number__c: string,
    Id: string, 
    Status: string, 
    Asset: { Id: string },
    Reason_Code__c: string, 
    Equipment_Condition_On_Departure__c: string,
    Maintenance_Activity_Type__c: string,
    Service_Order_Type__c: string;
    StartDate: string,
    Completed_By__r: { Name: string },
    Konect_Status__c: string,
    Description__c: string
}

export interface IAssetExtended extends IAsset {
    activeContractLines: IContractLineItem[];
    contractLines: IContractLineItem[];
    lastServiceOrder?: WorkOrderForField;
    lastEquipmentStoppedOrder?: WorkOrderForField;
    lastEquipmentStartedOrder?: WorkOrderForField;
    nextMbm?: WorkOrderForField;
    /*
    billToAccount: IApiNameAndId;
    decidedByAccount: IApiNameAndId;
    validContractNumber: number;
    soldToAccount: IApiNameAndId;
    */
    //FSM, statusinfo is not being captured currently
    //statusInfo?: IApiEquipmentStatusInfo;
}

interface IServiceContract {
    ContractNumber: number;
}

export interface IContractLineItemSobject {

}

export interface IContractLineItem extends IContractLineItemSobject {
    AssetId: string;
    Status: string;
    Bill_To__r: IApiNameAndId;
    Decided_By__r: IApiNameAndId;
    Payer__r: IApiNameAndId;
    RUSH_Contract_type__c: string;
    ServiceContract: { Id: string; ContractNumber: number; EndDate: string; StartDate: string; Contract_Type__c: string; Bill_To__r: IApiNameAndId; Decided_By__r: IApiNameAndId;Sold_To__r: IApiNameAndId;Contract_SAP_Number__c:string};
    StartDate: string;
    Service_hours__c: string;
    Response_time_office_hours__c: string;
    Response_time_outside_office_hours__c: string;
    EndDate: string;
    Characteristics__r: { records: { Id:string, Name: string } [] };
}

export interface IApiEquipmentStatusInfo {
    dispatchNumber?: string;
    lastModification?: string;
    stoppedBy?: string;
    startedBy?: string;
}

export interface IApiNameAndId extends IApiName {
    Id: string;
    //attributes: IAttributes
}

export interface IContactSobject {}

export interface IContactAccount extends IApiId, IContactSobject {
    AccountId: string;
}

export interface IContactCore extends IApiNameAndId, IContactSobject {
    Phone?: string;
}

export interface IAccountContactRelation {
    ContactId: string;
    AccountId: string;
    Relationship_Function__c: string;
    Roles: string;
}

export interface IContactListItem extends IContactCore, IContactSobject {
    Id: string;
    Email?: string;
    Phone?: string;
    FirstName?: string;
    LastName?: string;
    Name: string;
    Account?: IApiNameAndId;
}

export interface IDetailedContact extends IContactListItem {
    AccountId?: string;
    MobilePhone?: string;
    Fax?: string;
    Function__c?: string;
    Primary_Contact__c?: boolean;
    Title?: string;
    Phone?: string;
    LastModifiedDate?: string;
}

export interface ISObjectExtended { //extends ISObject {
    //attributes: ISalesForceAttributes;
    Id: string;
    OwnerId: string;
    IsClosed: boolean;
    Description: string;
    LastModifiedDate: string;
    CreatedDate: string;
}

interface ILocation {
    Name: string;
    Id: string;
}

export interface SMT_Sales_Organization_Configuration__c {
    Configuration_JSON__c: string;
    Id: string;
    Sales_Organization__c: string;
    LastModifiedDate: string;
    Description__c: string;
    LastModifiedBy: IApiNameAndId;    
}

export interface Location_Contact__c {
    Id: string,
    Location_Roles__c: string,
    Contact__r: IDetailedContact
}

export interface ContactServiceContractJunction__c {
    Id: string,
    Role__c: string,
    Contact__r: IDetailedContact
}

export interface ContractContactRole {
    Id: string,
    Role: string,
    Contact: IDetailedContact
}

export type Case = {};

export interface IComplaint extends ISObjectExtended, Case {
    Priority: string;
    Status: string;
    Subject: string;

    Account: IApiNameAndId;
    RecordType: { Name: string };
    CaseNumber: string;
    Contact: IContactCore;
    Entrapment__c: boolean;
    Origin: string;
    Reason: string;
    Asset: IAssetLocation;
    AssetId: string;
    Asset_Location_Name__c: string;
    Type: string;
}

export interface IComplaintReport extends Case {
    Id: string;
    LastModifiedDate: string;
    CaseNumber: string;
    Subject: string;
    Reason: string;
    Type: string;
}

export interface IHelpdeskCase extends Case {
    Id: string;
    CaseNumber: string;
    thd_SLA_Status__c: string;
    Account: IApiNameAndId;
    Owner: IApiNameAndId;
    Contact: IApiNameAndId;
    Status: string;
    Status_Translated: string;
    Priority: string;
    CreatedDate: string;
    thd_Case_Type__c: string;
    LastModifiedDate: string;
    Subject: string;
    Description: string;
    Employee__r: IApiNameAndId;
    Asset: {
        Id: string;
        Name: string;
        Manufacturer_Serial_Number__c: string;
        Building_Name__c: string;
        Installation_Street__c: string;
        Installation_Zip_Postal_Code__c: string;
        Installation_City__c: string;
    }
}

export interface IQueryReport {
    Id: string;
    LastModifiedDate: string;
    CaseNumber: string;
    Subject: string;
    Query_category__c: string;
    Query_Classification__c: string;
}

export interface IQuery extends IComplaint {
    Query_category__c: string;
    Query_Classification__c: string;
    Parent: IParentQuery;

    Account: IApiNameAndId;
}

export interface ITransactionalSurveyCase extends Case {
    Id: string;
    NPX_NPI__c: string;
    NPX_Response_Survey_Name__c: string;
    Subject: string;
    Description: string;
    Contact: { Name: string, Phone: string };
    NPX_Response_Due_Date__c: string;    
    CreatedDate: string;
    Priority: string;
    Status: string;
    Additional_Comment__c: string;

    Account: IApiNameAndId;
}

export interface IParentQuery {
    CaseNumber: string;
    Subject: string;
}

export interface Opportunity extends SObject {
    attributes: { type: "Opportunity" }
}

export interface IOpportunityReport extends Opportunity {
    DefaultCurrencyIsoCode?: string;
    Id: string;
    KONE_Opportunity_Number__c: string;
    Business_Type__c: string;
    Amount: number;
    CurrencyIsoCode: string;
    Description: string;
    Name: string;
    StageName: string;
}

export interface IOpportunity extends ISObjectExtended, Opportunity {
    CurrencyIsoCode: string;
    DefaultCurrencyIsoCode?: string;
    IsWon: boolean;
    Name: string;
    Probability: number;
    Account: IApiNameAndId;
    Amount: number;
    Business_Type__c: string;
    KONE_Opportunity_Number__c: string;
    LastActivityDate: string;
    Owner: IApiNameAndId;//OwnerName: string;
    StageName: string;
    CloseDate: string;
    Industry_Segment__c: string;//MarketSegment: string;
    CreatedDate: string;
    LeadSource: string;
    Technician_Name__c: string;
    Opportunity_Category__c: string;
}

export interface IOpportunityContactRole {
    Id: string;
    OportunityId: string;
    Contact: IDetailedContact;
    Role: string;
}

/*
export interface IReAssetion<T> {
    done: boolean;
    totalSize: number;
    records: T[];
}
*/

//TODO check this interface
export interface ISalesForceEquipment extends IApiNameAndId {
    AccountId: string;
    Latitude__c: string;
    Longitude__c: string;
    plannerGroup: string;
}

export interface Task extends SObject {}

export interface ITaskListItem extends ISObjectExtended, Task {
    Subject: string;
    Account: IApiNameAndId;
    Priority: string;
}

export interface ITask extends ITaskListItem {
    Status: string;
    Type: string;
    ActivityDate: string;    
    What: IWhatType & { Location_Description__c: string };// { Location: ILocation };
    Who: IApiNameAndId;
    IsHighPriority: boolean;
}

export interface ITaskExtended extends ITask {
    Who: IContactCore;
}

export interface ITimeSheetEntryBase {
    Status: string;
}

export interface IResourceAbsence {    
    Start: string;
    End: string;
    ResourceId: string;
}

export interface TimeSheetEntryMetrics extends ITimeSheetEntryBase {
    Service_Resource_Id__c: string;    
}

export interface ITimeSheetEntry extends ITimeSheetEntryBase {
    Status: string;
    StartTime: string;
    EndTime: string;
    Service_Resource_Id__c: string;
    FSM_TimeEntryCode__r: { Activity_Type_Code__c: string; Code__c: string; };
    WorkOrderId: string;
}

export interface IWhatType extends IApiNameAndId {
    Type?: string;
}

export interface ISyncable {
    isDeleted: boolean;
    dataType: string;
}

interface IUserServiceResource {    
    Name: string;
    FirstName: string;//fitterFirstName: string;
    LastName: string;//fitterLastName: string;
    MobilePhone: string;//telMobile: string;
    Email: string;//email: string;
    EmployeeNumber: string;//fitterNumber: string;
}

export interface ITechnicianServiceOrderMetrics {
    completedToday: number;
    mbm: number;
    openOthers: number;
    openCallouts: number;
}
/*
export interface ITechnicianMetrics {    
    openDiscussions: number;
    openAudits: number;
}
*/

export interface IServiceResourceMapItem {
    Id: string;
    Name: string;
    LastKnownLongitude: number;
    LastKnownLatitude: number;    
}

export interface IServiceResourceBase extends IApiNameAndId {}

export interface IServiceTerritoryMember extends IApiId {
    ServiceResourceId: string;
}

export interface IServiceResourceReport extends IServiceResourceBase {
    RelatedRecord: { FirstName: string, LastName: string, MobilePhone: string };
    roundNumber: string;  
}

export type WorkOrderForServiceResourceField = WorkOrderForField & { Asset: AssetLocation & { Installation_Street__c: string }, LastModifiedDate: string };

export interface IServiceResourceTechnicianReport extends IServiceResourceBase {
    RelatedRecord: { 
        Name: string,
        FirstName: string,
        LastName: string,
        MobilePhone: string,
        EmployeeNumber: string; 
        Email: string; 
    };
    Work_Center_Assignments__r: { records: { Work_Center__r: { Name: string } }[] }
    LastKnownLongitude: number;
    LastKnownLatitude: number;
}

export interface IServiceResource extends IServiceResourceBase {
    RelatedRecord: IUserServiceResource;
    Work_Center_Assignments__r: { records: { Work_Center__r: { Name: string } }[] }
    RelatedRecordId: string;
    LastKnownLatitude: number;
    LastKnownLongitude: number;
    LastKnownLocationDate: string;
}

export interface IServiceResourceWithMetrics extends IServiceResource {
    currentTimeSheetServiceOrder: WorkOrderForServiceResourceField;
    lastCompletedWorkOrder: WorkOrderForServiceResourceField;
    absentUntil?: string;
    nextAbsenceStarts?: string;
    timeEntryCodes: string;
    technicianStatus?: string;
    serviceAppointmentWorkOrder: WorkOrderForServiceResourceField;
}

export interface SMT_Automation_Rule__c {
    Id: string,
    Asset__c: string;
    Notification_Enabled__c: boolean;
    Task_Enabled__c: boolean;
    User__c: string;
}

export interface Lead extends SObject {
    attributes: { type: "Lead" }
}

export interface ILeadBase extends Lead {
    Business_Type__c: string;
    Name: string;
    LeadSource: string;
    Status: string;
}

export interface ILeadReport extends ILeadBase {
    Business_Stage__c: string;
    Description: string;
    OwnerId: string;
    Owner: {
        Name: string;
    };
}

type LeadAsset = IAssetLocation & { Account: IApiNameAndId } & { Name: string, Installation_Street__c: string; Installation_Zip_Postal_Code__c: string; Installation_City__c: string };
export interface IApiLead extends ISObjectExtended, ILeadBase {
    CreatedBy: IApiNameAndId;
    Account__r: IApiNameAndId;
    FSM_Asset__c: string,
    Company: string;
    FirstName: string;
    LastName: string;
    Phone: string;
    MobilePhone: string;
    Product_Service_Interest__c: string;
    Customer_Type__c: string;
    Urgency__c: string;
    Technician_Name__c: string;
    FSM_Asset__r: LeadAsset;
    Asset_Leads__r: { records: LeadAsset[] };
}

/*
interface IOwner {
    Email: string;
    Id: string;
    Name: string;
    Phone: string;
}
*/

export interface IPermissionSetAssignment {
    AssigneeId: string;
    PermissionSetId: string;
}

export interface Version extends SObject {}

interface IVersionBase extends Version {
    Total_Sales_Price__c: number;
    Stage__c: string;
    Version_Number__c: string;
    Owner: IApiNameAndId;
    Tender__r: ITenderListItem;
}

export interface IVersionReport extends IVersionBase {
    CurrencyIsoCode: string;
    DefaultCurrencyIsoCode: string;
}

export interface IVersion extends IVersionBase {
    Id: string;
    LastModifiedDate: string;
    Name: string;

    CreatedDate: string;
    Description__c: string;
    Price_Due_Date__c: string;
    Tender__r: ITenderListItem;

    Opportunity_Name__c: string;

    Account__r: IApiAccountListItem;
}

export interface Tender__c extends SObject {}

export interface ITenderListItem extends Tender__c {
    CreatedDate: string;
    CurrencyIsoCode: string;
    Description__c: string;
    FLTenderNumber__c: string;
    
    Id: string;
}

export interface ITender extends ITenderListItem {
    Opportunity__r: {
        Id: string;
        Name: string;
        Account: {
            AccountNumber: string;
            Name: string;
            Id: string;
        }
    }
}

export interface IVersionForTender {
    Owner: IApiNameAndId;
    Total_Sales_Price__c: number;
    Stage__c: string;
    CurrencyIsoCode: string;
}

export interface Event {}

export interface IApiCoreEvent extends Event {
    Id: string;
    StartDateTime: string;
    EndDateTime: string;
    Subject: string;
    Type: string;
    Who: IApiNameAndId;
}

export interface EventForAudit extends IApiCoreEvent {
    Audit_Number__c: string;
}

export interface EventRelation {
    EventId: string;
    RelationId: string;
    IsInvitee: boolean;
}

export interface IApiEvent extends IApiCoreEvent {
    CreatedDate: string;
    Event_Status__c: string;
    OwnerId: string;
    Objectives__c: string;
    Location: string;
    Description: string;
    What: IWhatType;
    WhoId: string;
    Audit_Number__c: string;
    contacts: IContactCore[];
    invitees: IContactCore[];
}

export interface IEventReport extends IApiCoreEvent {
    Owner: {
        Id: string;
        Name: string;
    };
}

export interface IInvoiceReport {
    Id: string;
    Contract__r: {
        Name: string;
    };
    Name: string;
    Invoice_Date__c: string;
    Due_Date__c: string;
    Customer_PO__c: string;
    Invoice_Type__c: string;
    Document_Type__c: string;
    Total_Amount__c: number;
    CurrencyIsoCode: string;
    DefaultCurrencyIsoCode: string;
}

export interface INote {
    Title: string;
    Body: string;
    CreatedDate: string;
    ParentId: string;
}

export interface IFlowSurvey {
    Id: string;
    LastModifiedDate: string;
    Name: string;
    Flow_Survey_Type__r: {
        Name: string;
    };
    Contact__r: {
        Name: string;
    };
    NPI_Score__c: number;
}

export interface NPX_Survey_Record__c {}
export interface NPX_Survey_Record_Report extends NPX_Survey_Record__c {
    Id: string;
    Response_Received_Date__c: string;
    Name: string;
    Survey_Name__c: string;
    Contact__r: {
        Name: string;
    },
    NPI__c: string;
    NPI_Verbatim__c: string;
}

//used in reports, this is the old object
export interface IContract {
    Id: string;
    Contract_End_Date__c: string;
    Name: string;
    Contract_Type__c: string;
    Number_of_Equipments__c: number;
    Building_Manager_Contact__r: {
        Id: string;
        Name: string;
    };
}

export interface IContractLineItemReport {
    Id: string;
    Status: string;
    AssetId: string,
    Bill_To__r: IApiNameAndId;
    Decided_By__r: IApiNameAndId;
    Payer__r: IApiNameAndId;
    Response_time_office_hours__c: string;
    Service_hours__c: string;
}

export interface IServiceContractReport {
    AccountId: string;
    Id: string;
    EndDate: string;
    Name: string;
    Contract_Type__c: string;
    ContractNumber: string;
    //ContractLineItems: { records: IContractLineItemReport[] };
    // ContractLineItems: { records: { AssetId: string }[] };
    Number_of_Equipments__c: string;
    Risk_Score__c: number; 
    Risk_Score_Date__c: string;
    Risk_Score_Reason__c: string;
    Profit_Verbatim__c: string;
    Rush_Contract_Type_Code__c: string;
    Contract_Type_Code__c: string;
}

export interface ContentVersionCore {
    Title: string;
    Id: string;
}

export interface ContentVersion extends ContentVersionCore{
    VersionData: string;
}

export interface ContentDocumentLink {
    LinkedEntityId: string,
    ContentDocument: ContentDocument;
}

export interface ContentDocument {
    Id: string,
    Title: string,
    LatestPublishedVersion: {
        Id: string,
        Title: string,
        VersionData: string,
        FileType: string,
        FileExtension: string
    }
}

export enum AuditStatus {
    Open = 0,
    InProgress = 1,
    Completed = 2
}

export interface IAuditApi {
    audit_id: number;
    date: string;
    status: AuditStatus,
    technician_id: string;
    technician_name: string;
    template_name: string;
    template_type: string;
    template_id: number;
    //TODO remove this
    Id: string;
}

/*
export interface IAudit {
    "templates": string[],
    "audit_id": number,
    "template_id": number,
    "date": string,
    "date_audit_start": string,
    "date_audit_end": string,
    "technician_id": string,
    "technician_name": string,
    "template_name": string,
    "template_type": string,
    "equipment_id": string,
    "site": string,
    "status": AuditStatus,
    "serviceorder_id": string,
    "customer_id": string,
    "customer_info": string,
    "plant": string,
    "auditor_id": string,
    "auditor_displayname": string,
    "exported_to_sap": false,
    "notes_comments": string,
    "notes_goodpractices": string,
    "notes_practicestobeimproved": string,
    "additional_auditors": string,
    "date_of_creation": string,
    "date_of_last_modification": string,
    "auditor_account": string,
    "sequenz_id": string,
    "callcenter_code": string,
    "branch_code": string,
    "number_of_pictures": number,
    "number_of_comments": number,
    "companyCode": string,
    "review_audit_id": string
}
*/