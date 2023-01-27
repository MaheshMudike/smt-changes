import { Identifiable } from './feed/ISObject';
import { ActionStatus } from '../actions/actions';

//new interface to replace the interfaces from below
export enum ComponentStatus {
    INITIAL = "INITIAL",
    IN_PROGRESS = "IN_PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}

export interface DataStatus<T> {
    status: ComponentStatus;
    data: T;
    lastUpdated: Date;
}

export type ItemsStatus<T> = DataStatus<T[]>;

export function initialDataStatus<T>() {
    return { status: ComponentStatus.INITIAL, data: null } as DataStatus<T>;
}


export function initialItemsStatus<T>() {
    return { status: ComponentStatus.INITIAL, data: null } as ItemsStatus<T>;
}

export function getEmptyItemsState<T>() {
    return {
        hasError: false,
        isProcessing: false,
        items: [] as T[],
    };
}

export interface IItemsState<T> {
    hasError: boolean;
    isProcessing: boolean;
    items: T[];
}

export interface ISelectedItemState<T> {
    selectedItem: T;
    hasError: boolean;
    isProcessing: boolean;
}

export interface ISelectedFilterGroupingItemState<T, TGrouping, TFilter> {
    selectedItem: T;
    filter: TFilter;
    grouping: TGrouping;
}

export interface ISelectableItemsState<T extends Identifiable> extends IItemsState<T> {
    selectedItem: T;
}

export interface IQueriableItemsState<TListItem extends Identifiable, TDetail extends Identifiable> extends ISelectableItemsState<TListItem> {    
    selectedItemStatus: ActionStatus;
    selectedItemQueried: TDetail;    
}

export interface IConfigurableGroupingItemsState<T extends Identifiable, TGrouping> {
    list: ISelectableItemsState<T>;
    grouping: TGrouping;
}

export interface IConfigurableGroupingItemsQueriableState<TListItem extends Identifiable, TDetail extends Identifiable, TGrouping> {
    list: IQueriableItemsState<TListItem, TDetail>;
    grouping: TGrouping;
}

export interface IConfigurableGroupingFilterItemsQueriableState<TListItem extends Identifiable, TDetail extends Identifiable, TGrouping, TFilter> 
extends IConfigurableGroupingItemsQueriableState<TListItem, TDetail, TGrouping>{
    filter: TFilter;
}

export interface IFullyConfigurableItemsState<TItem extends Identifiable, TGrouping, TFilter> extends IConfigurableGroupingItemsState<TItem, TGrouping> {
    filter: TFilter;
}
