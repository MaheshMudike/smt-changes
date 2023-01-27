import { IListGroup } from '../list/aggregations';
import { IdentifiableTitleBodyHighPriority } from '../list/IListItem';
import { EntityType } from '../../constants/EntityType';
import { ActionStatus } from '../../actions/actions';


export interface ISearchMapResult<T> {
    mapItems: T[],
    mapItemsActionStatus: ActionStatus,
    entityType: EntityType;
}

export interface ISearchResultGroup<T> extends IListGroup<T> {
    entityType: EntityType;
    actionStatus: ActionStatus;
    searchText: string;
    alwaysOpen?: boolean;
}

export type ISearchResultGroupStandard = ISearchResultGroup<IdentifiableTitleBodyHighPriority> //& ISearchMapResult<any>

export interface ISearchResultsGroups<T> {
    groups: _.Dictionary<ISearchResultGroup<T>>;
}

interface ISearchResults {
    groups: _.Dictionary<ISearchResultGroupStandard>;
    mapGroups: _.Dictionary<ISearchMapResult<any>>;
}

export default ISearchResults;