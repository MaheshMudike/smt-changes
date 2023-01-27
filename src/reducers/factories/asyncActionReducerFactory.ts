import { IAsyncActionNames, IItemsStateAsyncActionNames, IPayloadAction, IItemsQueryStateAsyncActionNames } from '../../actions/actionUtils';
import { ISelectableItemsState, IQueriableItemsState, DataStatus, initialDataStatus, ComponentStatus, ISelectedItemState } from '../../models/IItemsState';
import { Identifiable } from '../../models/feed/ISObject';
import { ActionStatus } from '../../actions/actions';

//new reducer to use with DataStatus
export function asyncDataStatusReducerFactory<T>(actionName: IAsyncActionNames, clearOnStart = true) {
    return (state = initialDataStatus<T>(), action: IPayloadAction<T>): DataStatus<T> => {
        switch (action.type) {
            case actionName.start:
                const res = { ...state, status: ComponentStatus.IN_PROGRESS, lastUpdated: new Date() }
                return clearOnStart ? ({ ...res, data: null }) : res;
            case actionName.success:
                return { ...state, status: ComponentStatus.SUCCESS, data: action.payload, lastUpdated: new Date() };
            case actionName.failure:
                return { ...state, status: ComponentStatus.FAILURE, lastUpdated: new Date() };
            default:
                return state;
        }
    };
}


export function initialSelectableItemsState<T>() {
    return {
        hasError: false,
        isProcessing: false,
        items: [] as T[],
        selectedItem: null as T,
    };
}

export function initialItemsState<T>() {
    return {
        hasError: false,
        isProcessing: false,
        items: [] as T[]
    };
}

export const initialState: ISelectableItemsState<any> = {
    hasError: false,
    isProcessing: false,
    items: [] as any[],
    selectedItem: null as any,
};

export function asyncListReducerFactory<T extends Identifiable>(actionName: IAsyncActionNames, clearOnStart = false) {
    return (state = initialState as ISelectableItemsState<T>, action: IPayloadAction<T[]>): ISelectableItemsState<T> => {
        switch (action.type) {
            case actionName.start:
                const res = { ...state, isProcessing: true, hasError: false }
                return clearOnStart ? ({ ...res, items: [], selectedItem: null }) : res;
            case actionName.success:
                return { ...state, isProcessing: false, items: action.payload } as ISelectableItemsState<T>;
            case actionName.failure:
                return { ...state, isProcessing: false, hasError: true };
            default:
                return state;
        }
    };
}

export function selectableAsyncListReducerFactory<T extends Identifiable>(actionName: IItemsStateAsyncActionNames, clearOnStart = false) {
    return (state = initialState as ISelectableItemsState<T>, action: IPayloadAction<any>): ISelectableItemsState<T> => {
        switch (action.type) {
            case actionName.selectItem:
                return { ...state, selectedItem: action.payload } as ISelectableItemsState<T>;
            default:
                return asyncListReducerFactory<T>(actionName, clearOnStart)(state, action);
        }
    };
}

export function selectableItemReducerFactory<T extends Identifiable>(actionName: string) {
    return (state = { selectedItem: null, hasError: false, isProcessing: false } as ISelectedItemState<T>, action: IPayloadAction<any>): ISelectedItemState<T> => {
        switch (action.type) {
            case actionName:
                return { ...state, selectedItem: action.payload } as ISelectedItemState<T>;
            default:
                return state;
        }
    };
}


const initialState2: IQueriableItemsState<any, any> = {
    ...initialState,
    selectedItemQueried: null as any,
    selectedItemStatus: ActionStatus.START
};

export function queriableAsyncListReducerFactory<T extends Identifiable, U extends Identifiable>(actionName: IItemsQueryStateAsyncActionNames, clearOnStart = false) {
    return (state = initialState2 as IQueriableItemsState<T, U>, action: IPayloadAction<any>): IQueriableItemsState<T, U> => {
        switch (action.type) {
            case actionName.queryItem.start:
                return { ...state, selectedItem: action.payload,
                        selectedItemStatus: ActionStatus.START };
            case actionName.queryItem.success:
                return { ...state, selectedItemQueried: action.payload, selectedItemStatus: ActionStatus.SUCCESS };
            case actionName.queryItem.failure:
                return { ...state, selectedItemStatus: ActionStatus.FAILURE };
            default:
                return { ...selectableAsyncListReducerFactory<T>(actionName, clearOnStart)(state, action),
                    selectedItemStatus: state.selectedItemStatus, selectedItemQueried: state.selectedItemQueried
                };
        }
    };
}
