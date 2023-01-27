import { FeedMode } from './FeedMode';
import { IFeedItem } from './IFeedItem';
import { IListGroup } from '../list/aggregations';

export enum MyTasksType {
    Open,
    Done,
}

interface IGeoPoint {
    latitude: number;
    longitude: number;
}

export interface IGeoBounds {
    northEast: IGeoPoint;
    southWest: IGeoPoint;
}

export const defaultFeedState = {
    filters: {
        geoFilter: null as IGeoBounds,
        mode: FeedMode.MyTasks,
        selectedMyTasksTypes: MyTasksType.Open,
        selectedMyAuditsTypes: MyTasksType.Open,
    },
    //items: [] as IFeedItem[],
    itemGroups: [] as IListGroup<IFeedItem>[],
    myTasksCounts: {
        closed: null as number,
        open: null as number,
    },
    myAuditsCounts: {
        closed: null as number,
        open: null as number,
    },
    paging: {
        currentNumberOfPages: 1,
        hasMorePages: true,
        isLoadingNextPage: false,
        isReloading: false,
    },
};

export type FeedState = typeof defaultFeedState;
export type FeedFilters = typeof defaultFeedState.filters;
export type FeedPaging = typeof defaultFeedState.paging;
export type MyTasksCounts = typeof defaultFeedState.myTasksCounts;
export type MyAuditsCounts = typeof defaultFeedState.myAuditsCounts;
