import * as _ from 'lodash';
import { createSelector, ParametricSelector } from 'reselect';

import { IGlobalState } from '../models/globalState';
import { ISelectableItemsState, IConfigurableGroupingItemsQueriableState, IConfigurableGroupingFilterItemsQueriableState, ISelectedItemState } from '../models/IItemsState';
import { IListGroup } from '../models/list/aggregations';
import { Identifiable } from '../models/feed/ISObject';
import { ActionStatus } from '../actions/actions';
import { OverviewClassSelectorProps } from '../containers/pages/OverviewLists';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';

// This function is used to created a list that is not grouped but uses common format
export function noGrouping<T>(items: T[]) {
    return [{
        title: '', // Empty string = falsy value
        items,
    }];
}

export const createOverviewListDataSelector = <T extends Identifiable>(
    feedSubTree: (s: IGlobalState) => ISelectableItemsState<T>, 
    options: IOverviewListDataOptions<T> = {},
) =>
/*
    createOverviewListDataSelectorForGroups(feedSubTree,
        createSelector(
            (state: IGlobalState) => feedSubTree(state).items,
            state => feedSubTree(state).hasError,
            (items, hasError) => filterSortGroupItems(items, hasError, options),
        )
    )
    */
    
    createSelector(
        createSelector(
            (state: IGlobalState) => feedSubTree(state).items,
            state => feedSubTree(state).hasError,
            state => entityFieldsDataFromState(state),
            (items, hasError, entityFieldsData) => filterSortGroupItems(items, hasError, entityFieldsData, options),
        ),
        feedSubTree,
        state => entityFieldsDataFromState(state),
        (listItems, itemsState, entityFieldsData) => ({
            ...itemsState,
            listItems,
            itemToRender: itemsState.selectedItem,
            itemToRenderStatus: ActionStatus.SUCCESS,
            entityFieldsData
        }) as OverviewClassSelectorProps<T, T>
    );
    


export const createOverviewListDataSelectorForGroups = <T extends Identifiable>(
    feedSubTree: (s: IGlobalState) => { selectedItem: T, isProcessing: boolean },
    groupsSelector: (state: IGlobalState) => IListGroup<T>[] = () => []
) =>
    createSelector(
        feedSubTree,
        groupsSelector,
        state => entityFieldsDataFromState(state),
        (itemsState, listItems, entityFieldsData) => ({
            //...itemsState, 
            listItems,
            selectedItem: itemsState.selectedItem,
            itemToRender: itemsState.selectedItem,
            itemToRenderStatus: ActionStatus.SUCCESS,
            isProcessing: itemsState.isProcessing,
            entityFieldsData
        }) as OverviewClassSelectorProps<T, T>
    );

export function filterSortGroupItems<T extends Identifiable>(
    items: T[], hasError: boolean, entityFieldsData: EntityFieldsData,options: IOverviewListDataOptions<T>, filter?: (item: T) => boolean
) {    
    return filterSortGroupItems2(items, hasError, entityFieldsData, options.filter, options.group, 
        (items, key) => ({ items, title: key }), options.sort, options.groupSort);
}

export function filterSortGroupItems2<T extends Identifiable, TGroup = IListGroup<T>>(
    items: T[], 
    hasError: boolean,
    entityFieldsData: EntityFieldsData,
    filter?: (item: T) => boolean,
    group?: (item: T, entityFieldsData: EntityFieldsData) => string,
    createGroup?: (items: T[], key: string) => TGroup,    
    sort?: (item: T) => number | string | boolean,    
    groupSort?: (group: TGroup) => number | string | boolean
) {
    
    if(hasError) return null;

    const filteredItems = filter ? items.filter(filter) : items;    
    const sortedItems = sort ? _.sortBy<T>(filteredItems, sort) : filteredItems;
    if(group == null) return noGrouping(sortedItems);

    const groupedItems: TGroup[] = 
        _(sortedItems).groupBy(item => group(item, entityFieldsData))
        .map((value, key) => createGroup(value, key))
        .value().filter(g => g != null);
    const groupedSortedItems = groupSort ?  _.sortBy<TGroup>(groupedItems, groupSort) : groupedItems;    
    return groupedSortedItems;
}

function filterSortGroupItemsPerf<T extends Identifiable>(items: T[], filter?: (t: T) => boolean, sort?: (item: T) => any, 
    group?: (item: T) => any, groupSort?: (group: IListGroup<T>) => any) {
   
   const groups = {} as _.Dictionary<T[]>;
   for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if(filter && !filter(item)) continue;       
        const groupKey = group ? group(item) : '';
        var itemGroup = groups[groupKey];
        if(itemGroup == null) {
            itemGroup = [];
            groups[groupKey] = itemGroup;
        }
        const insertionIndex = sort ? _.sortedIndexBy(itemGroup, item, sort) : 0;
        itemGroup.splice(insertionIndex, 0, item);
   }
   
   const groupsList: IListGroup<T>[] = _(groups).map((value, key) => ({ items: value, title: key })).value();
   return groupSort ?  _.sortBy<IListGroup<T>>(groupsList, groupSort) : groupsList;    
}


export interface IOverviewListDataOptions<T, TGrouping = string> {    
    filter?: (item: T) => boolean;
    group?: (item: T, entityFieldsData: EntityFieldsData) => TGrouping;
    sort?: (item: T) => number | string | boolean;
    groupSort?: (group: IListGroup<T>) => number | string | boolean;
}


export const createOverviewListQueriableSelector =
    <TListItem extends Identifiable, TDetail extends Identifiable, TGrouping>(
        subStateGetter: (s: IGlobalState) => IConfigurableGroupingItemsQueriableState<TListItem, TDetail, TGrouping>, 
        opts: (grouping: TGrouping, entityFieldsData: EntityFieldsData) => IOverviewListDataOptions<TListItem>
    ) =>
        createSelector(
            (state: IGlobalState) => subStateGetter(state).list,
            state => subStateGetter(state).grouping,
            state => entityFieldsDataFromState(state),
            (list, grouping, entityFieldsData) => {
                return {
                    ...list,
                    listItems: filterSortGroupItems(list.items, list.hasError, entityFieldsData, opts(grouping, entityFieldsData)),
                    itemToRender: list.selectedItemQueried, 
                    itemToRenderStatus: list.selectedItemStatus,
                    entityFieldsDataFromState
                }
            },
        )
        

export const createOverviewListQueriableFilterSelector =
    <TListItem extends Identifiable, TDetail extends Identifiable, TGrouping, TFilter>(
        configurableGroupingItemsQueriableStateGetter: (s: IGlobalState) => IConfigurableGroupingFilterItemsQueriableState<TListItem, TDetail, TGrouping, TFilter>, 
        opts: (grouping: TGrouping, filter: TFilter, entityFieldsData: EntityFieldsData) => IOverviewListDataOptions<TListItem> = () => ({})
    ) =>
    createSelector(
        
        createSelector(
            (state: IGlobalState) => configurableGroupingItemsQueriableStateGetter(state).list.items,
            state => configurableGroupingItemsQueriableStateGetter(state).list.hasError,
            state => configurableGroupingItemsQueriableStateGetter(state).grouping,
            state => configurableGroupingItemsQueriableStateGetter(state).filter,
            state => entityFieldsDataFromState(state),
            (items, hasError, grouping, filter, entityFieldsData) => filterSortGroupItems(items, hasError, entityFieldsData, opts(grouping, filter, entityFieldsData)),
        ),

        createSelector(
            configurableGroupingItemsQueriableStateGetter,
            configurableGroupingItemsQueriableState => {
                const itemsState = configurableGroupingItemsQueriableState.list;                
                return ({ ...itemsState, itemToRender: itemsState.selectedItemQueried, itemToRenderStatus: itemsState.selectedItemStatus }) //as IAggregatedListWithItemToRender<T, U>
            }
        ),
        state => entityFieldsDataFromState(state),
        (listItems, sth, entityFieldsData) => ({ listItems, ...sth, entityFieldsData })
    );