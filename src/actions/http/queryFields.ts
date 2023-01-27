export const IApiNameAndId = ['Id', 'Name'];
export const IApiName = ['Name'];
export const IWhatType = [...IApiNameAndId, 'Type'];

export const SMT_Notification__c = [
    'Id', 'Data__c', 'Description__c', 'Record_Id__c', 'Service_Territory__c', 'SObject_Name__c', 'Translation_Key__c', 'Type__c', 'Operation__c', 'User__c', 'CreatedDate'
];

export const SMT_Notification_Read__c = [
    'Id', 'User__c', 'SMT_Notification__c'
];

export const SMT_Configuration__mdt = ['Sales_Organizations_For_Admin_Assignment__c', 'Map_Configuration__c'];

export const SMT_Sales_Organization_Configuration__c = [
    ...childToParentQueryFields('LastModifiedBy', IApiNameAndId),
    'Id', 'Sales_Organization__c', 'Description__c', 'LastModifiedDate', 'Configuration_JSON__c'
];

export const SMT_User_Info__c = ['Id', 'Admin_Sales_Organizations__c', 'Admin_Type__c', 'Last_Activity__c', 'Last_Login__c', 'User__c', 'User_id__c']

export const IContactAccount = ['Id', 'AccountId'];

export const IContactCore = [...IApiNameAndId, 'Phone'];

export const IContactListItem = [
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...IContactCore, 'FirstName','LastName','Email'
]

export const IApiContactDetailed = [...IContactListItem,
    'AccountId','MobilePhone','Function__c', 'Primary_Contact__c','Title','LastModifiedDate', 'Fax'
];

export const Location_Contact__c = ['Id', 'Location_Roles__c', ...childToParentQueryFields('Contact__r', IApiContactDetailed)];

export const ContactServiceContractJunction__c = ['Id', 'Role__c', ...childToParentQueryFields('Contact__r', IApiContactDetailed)];

export const ContractContactRole = ['Id', 'Role', ...childToParentQueryFields('Contact', IApiContactDetailed)];

export const IAccountContactRelation = [
    'AccountId', 'ContactId', 'Relationship_Function__c', 'Roles'
]

const ILeadBase = [...IApiNameAndId, 'Business_Type__c', 'LeadSource', 'Status']

export const ILeadReport = [...ILeadBase, 'Owner.Name', 'Description', 'OwnerId', 'Business_Stage__c']

export const IAssetLocation = [    
    ...childToParentQueryFields('Location', ['Name']),
    'Id'
]

const LeadAssetFields = [...IAssetLocation, 'Account.Id', 'Account.Name', 'Name', 'Installation_Street__c', 'Installation_Zip_Postal_Code__c', 'Installation_City__c'];

export const ILead = [
    ...childToParentQueryFields('Account__r', IApiNameAndId),
    ...childToParentQueryFields('CreatedBy', IApiNameAndId),
    ...ILeadBase,
    ...childToParentQueryFields('FSM_Asset__r', LeadAssetFields),
    '(Select '+ childToParentQueryFields('Asset__r', LeadAssetFields).join(',') + ' From Asset_Leads__r)',
    'Description',
    'FSM_Asset__c','Company', 'FirstName','LastName','Phone','MobilePhone','CreatedDate',
    'Product_Service_Interest__c', 'OwnerId',
    'Customer_Type__c', 'Urgency__c', 'Technician_Name__c'
];

export const IPermissionSetAssignment = ['AssigneeId', 'PermissionSetId']

/*
export const IPlannerGroup = ['Code__c','Country__c','SAP_Code__c'];

export const IPlannerGroupAssignment = [
    ...childToParentQueryFields('Planner_Group__r', IPlannerGroup),
    'Planner_Group__c','User__c'
];
*/

export const IServiceTerritory = [    
    ...IApiNameAndId,
    'Active_In_FSM__c', 'SAP_Code__c', 'Sales_Organization__c', 'OwnerId'
]

const IUserServiceResource = [
    ...IApiNameAndId,
    'FirstName', 'LastName', 'MobilePhone', 'Email', 'EmployeeNumber'
]

export const IServiceResourceReport = [
    ...IApiNameAndId,
    ...childToParentQueryFields('RelatedRecord', IUserServiceResource), 
]

export const IServiceResource = [
    ...IServiceResourceReport, 'RelatedRecordId', 'LastKnownLatitude', 'LastKnownLongitude', 'LastKnownLocationDate',
    '(Select Work_Center__r.Name From Work_Center_Assignments__r WHERE Preference_Type__c != \'Excluded\' LIMIT 1000)',
]

export const IServiceResourceTechnicianReport = [
    ...IApiNameAndId,
    ...childToParentQueryFields('RelatedRecord', ['Name', 'FirstName', 'LastName', 'MobilePhone', 'EmployeeNumber', 'Email']),
    '(Select Work_Center__r.Name From Work_Center_Assignments__r WHERE Preference_Type__c != \'Excluded\' LIMIT 1000)',
    'LastKnownLongitude', 'LastKnownLatitude'
]


export const IServiceResourceMapItem = [
    ...IApiNameAndId,    
    'LastKnownLongitude', 'LastKnownLatitude'
]

export const IServiceTerritoryMember = ['ServiceResourceId'];

export const IServiceTerritoryMemberForMap = [
    ...IServiceTerritoryMember, 
    ...childToParentQueryFields('ServiceTerritory', IServiceTerritory),
    ...childToParentQueryFields('ServiceResource', IServiceResourceMapItem),    
];

export const SMT_Automation_Rule__c = [
    'Id', 'Asset__c', 'Notification_Enabled__c', 'Task_Enabled__c', 'User__c'
]

export const IUser = [
    ...IApiNameAndId,
    //...childToParentQueryFields('CallCenter', IApiNameAndId),
    //...childToParentQueryFields('UserRole', IApiName),
    'Username', 'Email', 'Sales_Organization__c', 'CompanyName','User_Country__c', 'LocaleSidKey', 'LanguageLocaleKey','DefaultCurrencyIsoCode'
];

export const IAudit = [
    ...IApiNameAndId,
];

const ISalesForceFeedItem = [
    'Id', 'OwnerId', 'IsClosed', 'Description', 'LastModifiedDate', 'CreatedDate'
];

const IExtendedSalesForceFeedItem = [
    ...ISalesForceFeedItem, 'Priority', 'Status', 'Subject'
];

export const IAccountListItem = [...IApiNameAndId, 'AccountNumber']

export const IAccount = [...IAccountListItem, 'Street_1__c', 'KONE_Zip_Postal_Code__c', 'KONE_City__c', 'Phone'];

export const IAccountReport = [
    ...IAccount,
    ...childToParentQueryFields('Owner', ['Name', 'Phone', 'MobilePhone'])    
]

export const IComplaint = [
    ...IExtendedSalesForceFeedItem,
    ...childToParentQueryFields('Contact', IContactCore),
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Asset', IAssetLocation),
    'AssetId', 'RecordType.Name', 'CaseNumber', 'Origin', 'Reason', 'Entrapment__c', 'Asset_Location_Name__c', 
    'Query_category__c', 'Query_Classification__c', 'FSM_Escalated_To__c', 'Type'
];

export const IComplaintReport = [
'    Id', 'LastModifiedDate', 'CaseNumber', 'Subject', 'Reason', 'Type'
]

export const IHelpdeskCase = [    
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Owner', IApiNameAndId),    
    ...childToParentQueryFields('Contact', IApiNameAndId),
    ...childToParentQueryFields('Employee__r', IApiNameAndId),
    'Id', 'CaseNumber', 'thd_SLA_Status__c', 'Status', 'toLabel(Status) Status_Translated', 'Priority', 'CreatedDate', 
    'toLabel(thd_Case_Type__c)', 'LastModifiedDate', 'Subject', 'Description',
    ...childToParentQueryFields('Asset', ['Id','Building_Name__c', 'Name', 'Manufacturer_Serial_Number__c', 'Installation_Street__c', 'Installation_Zip_Postal_Code__c', 'Installation_City__c'])
]

const IParentQuery = [
    'CaseNumber', 'Subject'
];

export const IQueryReport = [
    'Id', 'LastModifiedDate', 'CaseNumber', 'Subject', 'Query_category__c', 'Query_Classification__c'
]

export const IQuery = [
    ...IComplaint,    
    ...childToParentQueryFields('Parent', IParentQuery),
    //...childToParentQueryFields('Account', IApiNameAndId),
];

export const ITransactionalSurveyCase = [
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Contact', ['Id', 'Name', 'Phone']),
    //'(SELECT Id,CommentBody FROM CaseComments)',
    'Additional_Comment__c',
    'Id', 'NPX_NPI__c', 'NPX_Response_Survey_Name__c', 'Subject', 'Description', 'NPX_Response_Due_Date__c', 'CreatedDate', 'Priority', 'Status'
];

export const ITenderListItem = [
    'CreatedDate','CurrencyIsoCode','Description__c', 'FLTenderNumber__c',
    'Id','LastModifiedDate',
]

export const ITender = [
    ...childToParentQueryFields('Opportunity__r', [
        'Id', 'Name', ...childToParentQueryFields('Account', ['AccountNumber', 'Name', 'Id'])
    ]),
    'CreatedDate','CurrencyIsoCode','Description__c', 'FLTenderNumber__c',
    'Id','LastModifiedDate',
];

//const IOwner = ['Email','Id','Name','Phone'];

const IVersionBase = [
    ...childToParentQueryFields('Owner', IApiNameAndId),
    ...childToParentQueryFields('Tender__r', ITenderListItem),
    'convertCurrency(Total_Sales_Price__c)', 'Version_Number__c','Stage__c'
]

export const IVersionReport = [...IVersionBase, 'CurrencyIsoCode']

export const IVersion = [
    ...IApiNameAndId,
    ...IVersionBase,
    
    'LastModifiedDate', 'Description__c', 'CreatedDate',
    'Price_Due_Date__c','Opportunity_Name__c',
    ...childToParentQueryFields('Account__r', IAccountListItem),
    //'closed','lastModification'
];

export const IVersionForTender = [
    ...childToParentQueryFields('Owner', IApiNameAndId),
    'Total_Sales_Price__c', 'Stage__c', 'CurrencyIsoCode'
];

const ILocation = ['Id', 'Name'];

export const IEquipmentMapItem = [
    ...IApiNameAndId,
    'Geolocation__Longitude__s',
    'Geolocation__Latitude__s',
    'FSM_Equipment_Condition__c',
    'Main_Work_Center__r.Id',
    'Main_Work_Center__r.Name',
    'Main_Work_Center__r.Description__c',
    ...childToParentQueryFields('RecordType', ['Name'])
    //...childToParentQueryFields('Location', ILocation),
    //'Functional_Location__c', 'Equipment_Location__c', 'Longitude__c', 'Latitude__c'
]

const IBuilding = ['Name', 'Address__c', 'City__c', 'Post_Code__c']

//const IServiceTerritory = ['Planner_Group_SAP_Key__c'];

export const WorkorderForField = [ 
    'WorkOrderNumber', 'Service_Order_Number__c', 'Id', 'Status', 'Reason_Code__c',
    'Equipment_Condition_On_Departure__c', 'Asset.Id',
    'Completed_By__r.Id', 'Completed_By__r.Name', 'Maintenance_Activity_Type__c', 'Service_Order_Type__c', 'StartDate',
    'Konect_Status__c', 'Description__c'
]

export const WorkOrderForServiceResourceField = [ 
    ...WorkorderForField, 'Asset.Installation_Street__c', 'LastModifiedDate', 'Asset.Geolocation__Longitude__s','Asset.Geolocation__Latitude__s'
]

const IAssetBase = [
    ...IApiNameAndId,    
    ...childToParentQueryFields('Visiting_Hours__r', ['Id', 'Name', 'TimeZone', 'Hours_Key__c']),
    'Installation_Street__c','Installation_District__c', 
    'Installation_City__c','Installation_State_Provice__c','Installation_Zip_Postal_Code__c',
    'Manufacturer__c', 'Status', 'Equipment_Type__c', 'SerialNumber', 'Manufacturer_Serial_Number__c', 'FSM_Equipment_Condition__c'
]

export const IAssetReport = [
    ...IAssetBase, 'Main_Work_Center__c'
]

export const Asset_Lead__c = ['Asset__c', 'Lead__c'];

export const IAsset = [
    ...IAssetBase,
    //...childToParentQueryFields('Maintenance_Planner_Group__c', IServiceTerritory),,
    ...childToParentQueryFields('Account', IApiNameAndId),
    //...childToParentQueryFields('Sold_to_SFDC_id__r', IApiNameAndId),
    ...childToParentQueryFields('Location', ILocation),
    'Customer_Asset_Name__c', 'Building_Name__c','Building_Name_2__c', 'LastModifiedDate','Company_Code__c', 
    'Construction_Month__c', 'Construction_Year__c',
    'Location__c', 'Manufacturing_Country__c',
    'Technical_identification_number__c',  'Market_segment__c', 'Number_Of_Floors__c', 
    'Rated_Load__c', 'Rated_Speed__c', 'Rated_Speed_Imperial__c', 'Rated_Load_Imperial__c',
    'toLabel(Elevator_Technical_Platform__c)', 'Main_Work_Center__c',
    'Main_Work_Center__r.Name', 'Main_Work_Center__r.Description__c',
    'Warranty_End_Date__c', 'Warranty_Start_Date__c', 
    'FSM_Out_Of_Order_Date__c', 'FSM_Condition_Reason_Code__c', 'FSM_Back_In_Order_Date__c', 'Workcenter__c',
    'Geolocation__Longitude__s','Geolocation__Latitude__s'
]

const IServiceContract = [
    ...childToParentQueryFields('Bill_To__r', IApiNameAndId),
    ...childToParentQueryFields('Decided_By__r', IApiNameAndId),
    ...childToParentQueryFields('Sold_To__r', IApiNameAndId),
    'Id','ContractNumber', 'EndDate', 'StartDate', 'Contract_Type__c','Contract_SAP_Number__c'
]

export const IContractLineItemReport = [
    'Id', 'Status', 'AssetId', 'Response_time_office_hours__c', 'Service_hours__c',
    ...childToParentQueryFields('Bill_To__r', IApiNameAndId),
    ...childToParentQueryFields('Decided_By__r', IApiNameAndId),
    ...childToParentQueryFields('Payer__r', IApiNameAndId),
    ...childToParentQueryFields('ServiceContract', IServiceContract)
];

export const IServiceContractReport = [
    'AccountId',
    'Id', 'EndDate', 'Name', 'Contract_Type__c', 'ContractNumber',
    //"(Select AssetId, Status, Bill_To__r.Name, Decided_By__r.Name, Payer__r.Name From ContractLineItems)",
    // don’t need to query ContractLine item records, Number_of_Equipments__c field instead which is already calculated in SFDC
    'Number_of_Equipments__c',
    // "(Select AssetId From ContractLineItems)",
    'Risk_Score__c', 'Risk_Score_Date__c', 'Risk_Score_Reason__c', 'Profit_Verbatim__c', 
    'Rush_Contract_Type_Code__c', 'toLabel(Contract_Type_Code__c)'
]

export const IContractLineItem = [
    ...childToParentQueryFields('Bill_To__r', IApiNameAndId),
    ...childToParentQueryFields('Decided_By__r', IApiNameAndId),
    ...childToParentQueryFields('Payer__r', IApiNameAndId),
    ...childToParentQueryFields('ServiceContract', IServiceContract),
    '(SELECT Id, Name FROM Characteristics__r)',
    'AssetId', 'Status', 'toLabel(RUSH_Contract_type__c)', 'StartDate','EndDate',
    'toLabel(Service_hours__c)', 'Response_time_office_hours__c', 'Response_time_outside_office_hours__c'
]

export const ITask = [
    ...IExtendedSalesForceFeedItem,
    ...childToParentQueryFields('Who', IContactCore), 
    ...childToParentQueryFields('What', [...IWhatType]),// 'Location_Description__c']),//, ...childToParentQueryFields('Location', ILocation)]), 
    ...childToParentQueryFields('Account', IApiNameAndId),
    'Type','IsHighPriority', 'ActivityDate'];//, 'Priority'];

export const IResourceAbsence = ['Start', 'End', 'ResourceId'];

export const ITimeSheetEntry = [    
    ...childToParentQueryFields('TimeSheet', ['ServiceResourceId']),
    ...childToParentQueryFields('FSM_TimeEntryCode__r', ['Activity_Type_Code__c', 'Code__c']),    
    'Status', 'Service_Resource_Id__c', 'StartTime', 'EndTime', 'WorkOrderId'
]

export const IOpportunityMapItem = ['Id', 'Name','Business_Type__c'];

export const IOpportunityContactRole = ['Contact.Id', 'OpportunityId', 'Role', 'Contact.Email', 'Contact.Phone',
                                        'Contact.MobilePhone', 'Contact.FirstName', 'Contact.LastName', 'Contact.Name', 
                                        'Contact.Title','Contact.Primary_Contact__c'];

export const IOpportunityReport = [
    'Id', 'KONE_Opportunity_Number__c', 'Business_Type__c', 'convertCurrency(Amount)', 'CurrencyIsoCode', 'Description', 'Name', 'StageName'
]

export const IOpportunity = [
    ...ISalesForceFeedItem,
    'CurrencyIsoCode', 'IsWon', 'Name', 'Probability', 'convertCurrency(Amount)', 'Business_Type__c', 'KONE_Opportunity_Number__c', 'LastActivityDate',
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Owner', IApiNameAndId), //OwnerName
    'StageName', 'CloseDate', 
    'Industry_Segment__c',//'MarketSegment',
    'LeadSource', 'Technician_Name__c', 'Opportunity_Category__c'
]

export const IAssignedResource = ['ServiceResourceId', 'ServiceAppointmentId', 'ServiceAppointment.Work_Order__c'];

export const IAsset_Opportunity__c = [
    'Asset__c', 'Opportunity__c',
]

export const IMapOpportunity = [
    ...ISalesForceFeedItem,
    'CurrencyIsoCode', 'IsWon', 'Name', 'Probability', 'Amount', 'Business_Type__c', 'KONE_Opportunity_Number__c', 'LastActivityDate',
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Owner', IApiNameAndId), //OwnerName
    'StageName', 'CloseDate', 
    'Industry_Segment__c',//'MarketSegment',
    'LeadSource', 'Technician_Name__c', 'Opportunity_Category__c'
]

export const IAsset_Opportunity_Detailed__c = [
    ...IAsset_Opportunity__c,
    ...childToParentQueryFields('Asset__r', IEquipmentMapItem),
    ...childToParentQueryFields('Opportunity__r', IMapOpportunity),
]

export const AssetLocation = ['Geolocation__Longitude__s', 'Geolocation__Latitude__s'];

export const IAsset_Opportunity_Address__c = [
    'Asset__c', 'Opportunity__c',
    ...childToParentQueryFields('Asset__r', 
        ['Id', 'Name', 'Geolocation__Longitude__s', 'Geolocation__Latitude__s', 
        'Installation_Street__c', 'Installation_Zip_Postal_Code__c', 'Installation_City__c'
        ]
    )
]

export const IAssetOpportunityWithOpportunity = [
    ...IAsset_Opportunity__c, ...childToParentQueryFields('Opportunity__r', IMapOpportunity)
]

export const ContentVersionCore = ['Id', 'Title']

export const ContentVersion = [...ContentVersionCore, 'VersionData', 'FileType', 'FileExtension']

export const ContentDocument = ['Id', 'Title', ...childToParentQueryFields('LatestPublishedVersion', ContentVersion)]

export const ContentDocumentLink = [
    ...childToParentQueryFields('ContentDocument.LatestPublishedVersion', ContentVersion),
    'ContentDocument.Id', 'ContentDocument.Title', 'LinkedEntityId',
]

export const EventRelation = ['EventId', 'RelationId', 'IsInvitee'];

export const IApiCoreEvent = [    
    'Id',
    'StartDateTime',
    'EndDateTime',
    'Subject',
    'Type',
    ...childToParentQueryFields('Who', IApiNameAndId),
    //contacts: IApiContact[], //EventRelation where Invitee = false?
    //invitees: IApiContact[] //EventRelation where Invitee = true?
]

export const Event = [
    ...IApiCoreEvent,
    'CreatedDate',
    'Event_Status__c',
    'Location',
    'OwnerId', 'Objectives__c', 'toLabel(Objectives__c) Objectives__c__Translated',
    //'lastModification',
    'LastModifiedDate',
    'Description',
    'WhoId',
    'Audit_Number__c',
    ...childToParentQueryFields('What', IWhatType),
]

export const EventForAudit = [
    ...IApiCoreEvent,
    'Audit_Number__c',
]

export const EventReport = [
    ...IApiCoreEvent,
    ...childToParentQueryFields('Owner', IApiNameAndId),
]

export const IFSM_Work_Center_Assignment__c = [
    ...childToParentQueryFields('Work_Center__r', ['Name', 'SAP_Key__c']),
    'Work_Center__c', 'Service_Resource__c'
]

export const ProductConsumed = ['Id', 'Description', 'ProductName', 'QuantityConsumed', 'Status__c', 'Material_SAP_Number__c'];
export const WorkOrderLineItem = ['Id', 'Operation_Text__c'];

export const IWorkOrderLocation = [
    'Id', 'WorkOrderNumber','Service_Order_Number__c',
    ...childToParentQueryFields('Asset', ['Geolocation__Latitude__s', 'Geolocation__Longitude__s'])
];

export const IWorkOrderEmergency = [
    'Id', 'Priority', 'Entrapment__c', 'Injury__c', 'Hazard__c', 'Maintenance_Activity_Type__c', 'Failure_Type_Code__c'
]

export const IWorkOrderCore = [
    'Status', 'Konect_Status__c',
    'StartDate', 'Id',
    'CreatedDate', 
    'Job_Description__c',
    'Description__c', 'ServiceContractId', 'New_Status_Date__c',
    'Equipment_Condition_On_Departure__c',
    'Technician_Name__c'
]

const IWorkOrderBase = [
    ...IWorkOrderCore,

    //...childToParentQueryFields('Case', ['Description']), 
    ...childToParentQueryFields('Completed_By__r', IApiNameAndId),
    'WorkOrderNumber', 'Service_Order_Number__c', 'Service_Order_Type__c', 'Response_Time__c'    
]

export const IWorkOrderMapItem = [
    ...childToParentQueryFields('Asset', IEquipmentMapItem),    
    'Priority', 'Id', 'Status', 'Maintenance_Activity_Type__c', 'Service_Order_Type__c',
    'Entrapment__c', 'Injury__c', 'Hazard__c', 'Failure_Type_Code__c'
]

const IWorkOrderForListItemAsset = [
    'Id', 'Name', 'Customer_Asset_Name__c', 'Installation_Street__c', 'Installation_Zip_Postal_Code__c', 'Installation_City__c','Main_Work_Center__r.Name'
]

export const IWorkOrderForListItem = [
    //...childToParentQueryFields('Asset', [...childToParentQueryFields('Account', IApiNameAndId), 'Workcenter__c']),
    ...childToParentQueryFields('Asset', IWorkOrderForListItemAsset),
    ...childToParentQueryFields('Location', ILocation),    
    'Id', 'WorkOrderNumber', 'Service_Order_Number__c', 'OO_Asset_Site__c', 'Subject', 'Status', 'StartDate', 'CreatedDate', 
    'Assembly_SAP__c','Detailed_Reason_For_Rejection__c','Supervisor_Will_Manage_Reason__c',
    'Maintenance_Activity_Type__c', 'Service_Order_Type__c', 'Description__c', 'Priority',
    'Entrapment__c', 'Injury__c', 'Hazard__c', 'Failure_Type_Code__c',
    'New_Status_Date__c', 'Konect_Status__c', 'Earliest_Start_Date__c',
    '(SELECT Id, Title, Body, ParentId, OwnerId FROM Notes ORDER BY CreatedDate DESC)',
    'Work_Center__r.Name',
    //'(SELECT Subject__c, Description__c, Due_Date__c, Work_Order__c FROM SMT_Notes__r)'
]

const IWorkOrderForSearchItem = [
    ...childToParentQueryFields('Asset', IWorkOrderForListItemAsset),
    ...childToParentQueryFields('Location', ILocation),    
    'Id', 'WorkOrderNumber', 'Service_Order_Number__c', 'OO_Asset_Site__c', 'Subject', 'Status', 'StartDate', 'CreatedDate','Assembly_SAP__c', 'Maintenance_Activity_Type__c', 'Description__c', 'Priority',
    'Entrapment__c', 'Injury__c', 'Hazard__c', 'Failure_Type_Code__c', 'New_Status_Date__c', 'Konect_Status__c', 'Earliest_Start_Date__c','(SELECT Id, Title, Body, ParentId, OwnerId FROM Notes ORDER BY CreatedDate DESC)',
]

export const IWorkOrderForListItemSupervisorWillManage = [
    ...IWorkOrderForListItem,
    'Supervisor_Will_Manage__c', 'Case.FSM_Escalated_To__c'
]

export const IWorkOrderRejectedListItem = [
    'Id', 'WorkOrderNumber', 'Service_Order_Number__c', 'Priority', 'Maintenance_Activity_Type__c', 'Service_Order_Type__c',
    'Entrapment__c', 'Injury__c', 'Hazard__c', 'Failure_Type_Code__c',
    'Asset.Account.Id', 'Asset.Account.Name'
]

export const IWorkOrderRejectedListItemNonFSM = [
    ...IWorkOrderRejectedListItem,
    'Technician_Name__c', 'New_Status_Date__c',
    'Completed_By__r.Id', 'Completed_By__r.Name'
]

export const IServiceAppointmentRejectedListItem = [
    'Id', 'AppointmentNumber', 'Assigned_Service_Resource__c', 'ParentRecordId', 'New_Status_Date__c',
    ...childToParentQueryFields('Assigned_Service_Resource__r', IApiNameAndId)
]

export const IServiceAppointmentRejected = [ ...IServiceAppointmentRejectedListItem, 'Rejection_Reason__c' ];
export const IWorkOrderHistory = ['WorkOrderId','CreatedDate']

export const IMbmForListItem = [
    ...IWorkOrderForSearchItem,
    '(SELECT Operation_Text__c FROM WorkOrderLineItems)'
]

export const IWorkOrder = [
    ...childToParentQueryFields('Account', IApiNameAndId),
    ...childToParentQueryFields('Asset', [...IWorkOrderForListItemAsset, 'Building_Name__c', 'Geolocation__Latitude__s', 'Geolocation__Longitude__s', 'Manufacturer_Serial_Number__c', ...childToParentQueryFields('Account', IApiNameAndId)]),
    //...childToParentQueryFields('Asset', IAsset),
    ...childToParentQueryFields('Location', [...ILocation, 'Street__c', 'Zip_Postal_Code__c', 'City__c']),
    ...childToParentQueryFields('Case', ['FSM_Escalated_To__c', 'FSM_Next_Actions__c']),    
    ...IWorkOrderBase,
    //"(Select Id, OldValue, NewValue, CreatedDate From Histories Where Field = 'Status' ORDER BY CreatedDate DESC)",
    //"(Select Id, Owner.Name, Status, EarliestStartTime, DueDate, SchedStartTime, SchedEndTime From ServiceAppointments ORDER BY CreatedDate DESC)",
    'OO_Asset_Site__c', 'Assembly_SAP__c', 'Subject', 'System_Calculated_SLA__c',
    'Entrapment__c', 'Injury__c', 'Hazard__c', 'Priority', 'LastModifiedDate', 'IsClosed', 'WorkType.Name',
    'Latitude', 'Longitude', 'Due_Date__c', 'Earliest_Start_Date__c',
    'Address', 'Caller_Name__c', 'Konect_Caller_Name__c', 'Caller_Phone__c', 'Caller_Phone_Number__c', 'Maintenance_Activity_Type__c', 'Completed_Date__c', 'Type__c',
    'toLabel(Reason_Code__c)','Detailed_Reason_For_Rejection__c','Supervisor_Will_Manage_Reason__c',
    'Supervisor_Will_Manage__c', 'Failure_Type_Code__c',
    '(SELECT Operation_Text__c FROM WorkOrderLineItems)',
    '(SELECT Title, Body, ParentId, OwnerId FROM Notes ORDER BY CreatedDate DESC)',
    'Work_Center__r.Name'
    //'(SELECT Subject__c, Description__c, Due_Date__c, Work_Order__c FROM SMT_Notes__r)',
]

export const IServiceAppointmentForWorkOrder = [
    ...childToParentQueryFields('Work_Order__r', IWorkOrderForListItemSupervisorWillManage),
    'New_Status_Date__c'
]

export const IWorkOrderReport = [
    ...IWorkOrderBase,
    'AssetId', 'EndDate', 'Maintenance_Activity_Type__c','Completed_Date__c'
]

export const IWorkOrderForServiceOrdersReport = [
    ...childToParentQueryFields('Work_Center__r', IApiNameAndId),
    'Id', 'Status', 'StartDate', 'CreatedDate', 'Asset.Main_Work_Center__r.Name', 'WorkType.Name', 'Maintenance_Activity_Type__c', 'Service_Order_Type__c', 'Earliest_Start_Date__c','EndDate',
    'Detailed_Reason_For_Rejection__c','Supervisor_Will_Manage_Reason__c',
]

export const IServiceAppointment = [
    ...childToParentQueryFields('Owner', IApiNameAndId), 
    'Id', 'ActualStartTime', 'Status', 'StatusCategory', 'Assigned_Service_Resource__c', 'EarliestStartTime', 'DueDate', 'SchedStartTime', 'SchedEndTime', 'OwnerId', 'ParentRecordId'
]

const ServiceAppointment = ['Id', 'ParentRecordId', 'AppointmentNumber', 'toLabel(Status)'];

export const IServiceAppointmentVisitHistory = [
    ...childToParentQueryFields('Owner', IApiNameAndId),
    ...childToParentQueryFields('Service_Appointment__r', ServiceAppointment),
    'Id', 'Name', 'CreatedDate', '(SELECT Id, Title, Body FROM Notes)'
]

export const IInvoiceReport = [
    ...childToParentQueryFields('Contract__r', IApiNameAndId),    
    'Id', 'Name', 'Invoice_Date__c', 'Due_Date__c', 'Customer_PO__c', 'Invoice_Type__c', 'Document_Type__c', 'convertCurrency(Total_Amount__c)', 
    'CurrencyIsoCode'
]

export const INote = ['Title', 'Body', 'CreatedDate', 'ParentId']
export const IFlowSurvey = [
    'Id', 'LastModifiedDate', 'Name', 'NPI_Score__c',
    'Flow_Survey_Type__r.Name', 'Contact__r.Name'
]

export const NPX_Survey_Record = [
    'Id', 'Response_Received_Date__c', 'Name', 'Survey_Name__c', 'Contact__r.Name', 'NPI__c', 'NPI_Verbatim__c'
]

export const IContract = [
    ...childToParentQueryFields('Building_Manager_Contact__r', IApiNameAndId),    
    'Id', 'Contract_End_Date__c', 'Name', 'Contract_Type__c', 'Number_of_Equipments__c'
]

export const TimeSheetEntry = ['Service_Resource_Id__c', 'Status']

export function childToParentQueryFields(parent: string, fields: string[]) {
    return fields.map(f => {
        if(f.startsWith('toLabel(')) {
            const field = f.match(/\(([^)]+)\)/)[1];
            return 'toLabel(' + parent + '.' + field + ')';
        } else {
            return f.charAt(0) === '(' ? null :  parent + '.' + f
        }
    }).filter(f => f != null);
}