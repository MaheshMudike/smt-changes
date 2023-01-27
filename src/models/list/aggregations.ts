import { ActionStatus } from '../../actions/actions';

export interface IAggregatedList<T> {
    listItems: IListGroup<T>[];
    selectedItem: T;
    isProcessing?: boolean;
}

export interface IAggregatedListQueriable<T, U> extends IAggregatedList<T> {
    selectedItemQueried: U;
    selectedItemStatus: ActionStatus;
}

export interface IListGroup<T> {
    isExtraordinary?: boolean;
    actionStatus?: ActionStatus;
    items: T[];
    title: string;
}
