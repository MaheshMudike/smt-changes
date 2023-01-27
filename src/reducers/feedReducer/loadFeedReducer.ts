import { IPayloadAction } from '../../actions/actionUtils';
import { LOAD_FEED_PAGE, RELOAD_FEED } from '../../actions/integration/feedActions';
//import { FeedListItem } from '../../models/feed/FeedListItem';
import { IFeedItem } from '../../models/feed/IFeedItem';
import { FeedPaging, FeedState, FeedFilters } from '../../models/feed/state';
import { IListGroup } from '../../models/list/aggregations';

/*
function setPagingReloading(state: FeedState, isReloading: boolean) {
    return { ...state, paging: { ...state.paging, isReloading } };
}
*/

function setPagingNextPageLoading(state: FeedState, isLoadingNextPage: boolean) {
    return { ...state, paging: { ...state.paging, isLoadingNextPage } };
}

function sameFilters(state: FeedState, filter: FeedFilters) {
    return filter.mode === state.filters.mode && (filter.geoFilter == null || 
        filter.geoFilter.northEast == state.filters.geoFilter.northEast && filter.geoFilter.southWest == state.filters.geoFilter.southWest);
}

export interface IFeedResponse {
    //content: IFeedItem[];
    itemGroups: IListGroup<IFeedItem>[];
    last: boolean;
    filter: FeedFilters;
    //totalElements: number;
}

export default function loadFeedReducer(state: FeedState, action: IPayloadAction<IFeedResponse>) {
    switch (action.type) {
        case RELOAD_FEED.start:
            return { ...state, items: [] as IFeedItem[], paging: { ...state.paging, isReloading: true } };
        case RELOAD_FEED.success:
            return  sameFilters(state, action.payload.filter) ? 
                { ...state, itemGroups: action.payload.itemGroups,
                    paging: { ...state.paging, isReloading: false, hasMorePages: !action.payload.last } } 
                : state;
        case RELOAD_FEED.failure:
            return { ...state, paging: { ...state.paging, isReloading: false } }//setPagingReloading(state, false);
        case LOAD_FEED_PAGE.start:
            return setPagingNextPageLoading(state, true);
        case LOAD_FEED_PAGE.success:
            return sameFilters(state, action.payload.filter) ? { 
                ...state, itemGroups: action.payload.itemGroups,                
                paging: { ...state.paging, isLoadingNextPage: false, currentNumberOfPages: state.paging.currentNumberOfPages + 1, hasMorePages: !action.payload.last }
            } : state;
        case LOAD_FEED_PAGE.failure:            
            return setPagingNextPageLoading(state, false);
        default:
            return state;
    }
}
