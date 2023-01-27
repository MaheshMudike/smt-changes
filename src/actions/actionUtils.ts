import { Action } from 'redux';

export interface IPayloadAction<T> extends Action {
    payload?: T;
}

export interface IAsyncActionNames {
    failure: string;
    start: string;
    success: string;
}

export function asyncActionNames(name: string): IAsyncActionNames {
    return {
        failure: `${ name }_FAILURE`,
        start: name,
        success: `${ name }_SUCCESS`,
    };
}

export interface IItemsStateAsyncActionNames extends IAsyncActionNames {
    selectItem: string;
}
export function itemsStateAsyncActionNames(name: string): IItemsStateAsyncActionNames {
    return { ...asyncActionNames(name), selectItem: `${ name }_SELECT_ITEM` };
}

export interface IItemsQueryStateAsyncActionNames extends IItemsStateAsyncActionNames {
    queryItem: IAsyncActionNames;
}
export function itemsQueryStateAsyncActionNames(name: string): IItemsQueryStateAsyncActionNames {
    return { ...itemsStateAsyncActionNames(name), queryItem: asyncActionNames(name + "_QUERY_SELECTED_ITEM") };
}

export interface IChangeValueAction<T> extends Action {
    field: T;
    value: string;
}

export function emptyAction(type: string): Action {
    return {
        type,
    };
}

export const payloadAction = <T>(type: string) => (payload: T): IPayloadAction<T> => ({
    type,
    payload,
});
