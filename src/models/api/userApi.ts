import { IApiNameAndId, IServiceResourceMapItem, SObject } from './coreApi';

export type IApiUserBranch = IServiceTerritory;

export interface IServiceTerritoryMember extends IApiNameAndId {
    ServiceTerritory: IServiceTerritory;
    ServiceResource: IServiceResourceMapItem;
    ServiceResourceId: string;
}

export interface IServiceTerritory extends IApiNameAndId {
    Active_In_FSM__c: boolean;
    SAP_Code__c: string;
    Sales_Organization__c: string;
    OwnerId: string;
}

export interface User extends SObject {}

export interface IUserBase extends IApiNameAndId, User {
    Username: string;
    Email: string;
}

export interface IUser extends IUserBase {
    LocaleSidKey: string;
    LanguageLocaleKey: string;
    User_Country__c: string;
    CallCenterId: string;
    Sales_Organization__c: string;
    CompanyName: string;
    DefaultCurrencyIsoCode: string
}

export interface SMT_User_Info__c {
    Id?: string;
    //this field is a json string implementing ICompany[];
    Admin_Sales_Organizations__c: string;
    Admin_Type__c: string;
    Last_Activity__c: string;
    Last_Login__c: string;
    User__c: string;
    User_id__c: string;
}

export interface SMT_Configuration__mdt {
    Sales_Organizations_For_Admin_Assignment__c: string;    
    Map_Configuration__c: string;
}

export interface SMT_Sales_Organization_Configuration__c {
    Configuration_JSON__c: string; 
    Description__c: string;
    Sales_Organization__c : string;
}

export interface IUserExtended extends IUser {
    //adminInfo?: IApiUserInfo;
    userBranches: IApiUserBranch[];
    smtUserInfo: SMT_User_Info__c;
    gpsPermissionSet: boolean;
}
