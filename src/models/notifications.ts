import { ISyncable, IApiAccount } from './api/coreApi';

export enum NotificationType {
    Account = 'Account',
    Event = 'Event',
    TechnicianAlarm = 'TechnicianAlarm',
    SickLiftAlert = 'SickLiftAlert',
    Callout = 'Callout',
    Equipment = 'Equipment',
    SalesForceNotification = 'SalesForceNotification',
    DataChange = 'DataChange'
}

export interface IAccountNotification {
    type: NotificationType.Account;
    data: IApiAccount & ISyncable;
}

export interface IEventNotification {
    type: NotificationType.Event;
}

export interface ITechnicianAlarmNotification {
    type: NotificationType.TechnicianAlarm;
    description: string;
}

export interface ISickLiftAlertNotification {
    type: NotificationType.SickLiftAlert;
    description: string;
}

export interface ICalloutNotification {
    type: NotificationType.Callout;
    description: string;
}

export interface IEquipmentNotification {
    type: NotificationType.Equipment;
    description: string;
}

export interface ISalesForceNotification {
    type: NotificationType.SalesForceNotification;
    description: string;
}

export interface IDataChangeNotification {
    type: NotificationType.DataChange;
}

export type WebSocketNotification =
    | IAccountNotification
    | IEventNotification
    //| IReportNotification
    | ITechnicianAlarmNotification
    | ISickLiftAlertNotification
    | ICalloutNotification
    | IEquipmentNotification
    | ISalesForceNotification
    | IDataChangeNotification
    ;