import { defaultFeedState, FeedState, MyTasksCounts, MyAuditsCounts, FeedFilters } from '../../models/feed/state';
import { composeReducers } from '../../utils/composeReducers';
import loadFeedReducer from './loadFeedReducer';
import { IPayloadAction } from 'src/actions/actionUtils';
import { RELOAD_TASK_FEED_COUNTERS, RELOAD_AUDIT_FEED_COUNTERS } from 'src/actions/integration/feedActions';
import { SELECT_FEED_MODE, SELECT_MY_TASKS_TYPE, SHOW_FEED_ITEMS_IN_AREA, SELECT_MY_AUDITS_TYPE } from '../../actions/integration/feedActions';
import { IListGroup } from '../../models/list/aggregations';
import { IFeedItem } from '../../models/feed/IFeedItem';

function updateFilters(state: FeedState, filters: FeedFilters) {
    return ({ ...state, filters, paging: { ...state.paging, currentNumberOfPages: 1 }, itemGroups: [] as IListGroup<IFeedItem>[]})
}

function filterFeedReducer(state: FeedState, action: IPayloadAction<any>) {
    switch (action.type) {
        case SELECT_MY_TASKS_TYPE:
            return updateFilters(state, { ...state.filters, selectedMyTasksTypes: action.payload });
        case SELECT_MY_AUDITS_TYPE:
            return updateFilters(state, { ...state.filters, selectedMyAuditsTypes: action.payload });
        case SELECT_FEED_MODE:
            return updateFilters(state, { ...state.filters, mode: action.payload });
        case SHOW_FEED_ITEMS_IN_AREA:
            return updateFilters(state, { ...state.filters, geoFilter: action.payload });
        default:
            return state;
    }
}

function myTasksCountersReducer(state: FeedState, action: IPayloadAction<MyTasksCounts>) {
    switch (action.type) {
        case RELOAD_TASK_FEED_COUNTERS.start:
            return { ...state, myTasksCounts: { closed: -1, open: -1 } }
        case RELOAD_TASK_FEED_COUNTERS.success:
            //return clone(state, s => s.myTasksCounts = action.payload);
            return { ...state, myTasksCounts: action.payload }
        case RELOAD_TASK_FEED_COUNTERS.failure:            
            return { ...state, myTasksCounts: { closed: -2, open: -2 } }
        default:
            return state;
    }
}

function myAuditsCountersReducer(state: FeedState, action: IPayloadAction<MyAuditsCounts>) {
    switch (action.type) {
        case RELOAD_AUDIT_FEED_COUNTERS.start:
            return { ...state, myAuditsCounts: { closed: -1, open: -1 } }
        case RELOAD_AUDIT_FEED_COUNTERS.success:
            //return clone(state, s => s.myTasksCounts = action.payload);
            return { ...state, myAuditsCounts: action.payload }
        case RELOAD_AUDIT_FEED_COUNTERS.failure:            
            return { ...state, myAuditsCounts: { closed: -2, open: -2 } }
        default:
            return state;
    }
}

const feedReducer = composeReducers(
    defaultFeedState,
    filterFeedReducer,
    loadFeedReducer,
    myTasksCountersReducer,
    myAuditsCountersReducer,
);

export default feedReducer;
