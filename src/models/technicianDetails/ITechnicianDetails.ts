import Callout from '../feed/Callout';

export interface ITechnicianDetails {
    detailsSet: IDetailsSet[];
}

export interface IDetailsSet {
    items: Callout[];
    isDownloaded: boolean;
    isDownloading: boolean;
    detailsSetType: TechnicianDetailsSetType;
}

export enum TechnicianDetailsSetType {
    CompletedToday = 'CompletedToday',
    Mbm = 'Mbm',
    OtherCallouts = 'OtherCallouts',
    OpenCallouts = 'OpenCallouts',
}

