import { debounce } from 'lodash';
import { Dispatch } from 'redux';

import { paths } from '../../config/paths';
import { ModalType } from '../../constants/modalTypes';
import { FeedMode } from '../../models/feed/FeedMode';
import { IFeedItem } from '../../models/feed/IFeedItem';
import { IGeoBounds, MyTasksType, FeedFilters } from '../../models/feed/state';
import { GetGlobalState, userId, plannerGroupId, userIdFromState, activeInFSMFromState } from '../../models/globalState';
import { ITitle } from '../../models/list/IListItem';
import { isIncompleteModalShown } from '../../services/modals/isModalTypeShown';
import { asyncActionNames, payloadAction } from '../actionUtils';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { showModal } from '../modalActions';
import { showPlanCustomerVisitModal } from '../planCustomerVisitActions';
import { hideModalAndShowDetailsFailedToast } from './detailsActions';
import { Moment } from 'moment';
import { Location } from 'history';
import { queryFeedPageMytasks, queryFeedCustomerPage, queryFeedOperationalPage, feedPageMyTasksQueries, queryFeedNotificationsPage, queryFeedAuditsPage, queryFeedAuditsCounters } from '../../actions/http/jsforceFeed';
import { writeEventModalTitle } from '../../components/modals/events/EventCreationDialog';
import translate from '../../utils/translate';
import { multiQuery3, multiQueryCore, QueryType, StatusWrapper } from '../http/jsforceCore';
import { ThunkDispatch, ThunkAction } from '../thunks';
import { IListGroup } from 'src/models/list/aggregations';
import { EntityFieldsData, entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';

export const LOAD_FEED_PAGE = asyncActionNames('LOAD_FEED_PAGE');
export const RELOAD_FEED = asyncActionNames('RELOAD_FEED');
export const RELOAD_TASK_FEED_COUNTERS = asyncActionNames('RELOAD_TASK_FEED_COUNTERS');
export const RELOAD_AUDIT_FEED_COUNTERS = asyncActionNames('RELOAD_AUDIT_FEED_COUNTERS');
export const SELECT_MY_TASKS_TYPE = 'SELECT_MY_TASKS_TYPE';
export const SELECT_MY_AUDITS_TYPE = 'SELECT_MY_AUDITS_TYPE';
export const SELECT_FEED_MODE = 'SELECT_FEED_MODE';
export const SHOW_FEED_ITEMS_IN_AREA = 'SHOW_FEED_ITEMS_IN_AREA';

/*
export function getFeedCountersOLD(plannerGroupId: string, userId: string, box: IGeoBounds) {
    const queries = feedPageQueries(plannerGroupId, userId, box, null, ['Status']);
    return multiQuery3(
        queries[0], queries[1], queries[2]
    ).then(res => {
        const [tasks, workOrders, cases] = res.queries.result;        
        return ({
            open: tasks.filter(conditions.Task.open.isFullfilledBy).length
                + workOrders.filter(conditions.WorkOrder.open.isFullfilledBy).length
                + cases.filter(conditions.Case.open.isFullfilledBy).length,
            closed: tasks.filter(conditions.Task.closed.isFullfilledBy).length
                + workOrders.filter(conditions.WorkOrder.closed.isFullfilledBy).length
                + cases.filter(conditions.Case.closed.isFullfilledBy).length
        })
    });
}
*/

export function queryTaskFeedCounters(plannerGroupId: string, activeInFSM: boolean, userId: string, box: IGeoBounds) {
    const count = ['Count()'];
    const openQueries = feedPageMyTasksQueries(plannerGroupId, activeInFSM, userId, box, true, null, count, false);
    const closedQueries = feedPageMyTasksQueries(plannerGroupId, activeInFSM, userId, box, false, null, count, false);
    return multiQueryCore<{ countQueries: StatusWrapper<[number,number,number,number]> }>([...openQueries, ...closedQueries], QueryType.COUNT)
    .then(res => {
        const [openTasks, closedTasks] = res.countQueries.result;
        return ({
            open: openTasks,
            closed: closedTasks
        })
    });
}

export function queryAuditFeedCounters(plannerGroupId: string, activeInFSM: boolean, userId: string) {
    return queryFeedAuditsCounters(plannerGroupId, activeInFSM, userId);
}

const PAGE_SIZE = 100;

function queryFeedPage(plannerGroupId: string, entityFieldsData: EntityFieldsData,
    filter: FeedFilters, includePreviousPages: boolean, pageNumber: number): Promise<{ itemGroups: IListGroup<IFeedItem>[]; last: boolean; }> {

    const queryPreviousPages = true; //includePreviousPages
    const { userId, locale } = entityFieldsData;
    const geoFilter = filter.geoFilter;
    switch (filter.mode) {
        case FeedMode.MyTasks:
            const openTasks = filter.selectedMyTasksTypes === MyTasksType.Open;
            return queryFeedPageMytasks(plannerGroupId, entityFieldsData, openTasks, geoFilter, queryPreviousPages, pageNumber, PAGE_SIZE)
                .then(items => ({ ...items, filter }));
        case FeedMode.SalesForce:
            return queryFeedCustomerPage(plannerGroupId, entityFieldsData, geoFilter, queryPreviousPages, pageNumber, PAGE_SIZE)
                .then(items => ({ ...items, filter }));
        case FeedMode.Konect:
            return queryFeedOperationalPage(plannerGroupId, entityFieldsData, geoFilter, queryPreviousPages, pageNumber, PAGE_SIZE)
                .then(items => ({ ...items, filter }));
        case FeedMode.Notifications: 
            return queryFeedNotificationsPage(plannerGroupId, entityFieldsData, geoFilter, queryPreviousPages, pageNumber, PAGE_SIZE)
                .then(items => ({ ...items, filter }));
        case FeedMode.Audits:    
            const openAudits = filter.selectedMyAuditsTypes === MyTasksType.Open;        
            return queryFeedAuditsPage(entityFieldsData, openAudits, queryPreviousPages, pageNumber, PAGE_SIZE).then(items => 
                ({ ...items, filter })
            );
        default:
            throw new Error('Unhandled feed mode: ' + filter.mode);
    }    
}

export function reloadFeed(dispatch: ThunkDispatch, getState: GetGlobalState) {
    const state = getState();
    const { filters, paging } = state.feed;
    const activeInFSM = activeInFSMFromState(state);
    const pgId = plannerGroupId(state);
    dispatch(asyncHttpActionGeneric(() => queryFeedPage(pgId, entityFieldsDataFromState(state), filters, true, paging.currentNumberOfPages), RELOAD_FEED));
    dispatch(asyncHttpActionGeneric(() => queryTaskFeedCounters(pgId, activeInFSM, userId(state), filters.geoFilter), RELOAD_TASK_FEED_COUNTERS));
    dispatch(asyncHttpActionGeneric(() => queryAuditFeedCounters(pgId, activeInFSM, userId(state)), RELOAD_AUDIT_FEED_COUNTERS));
}

export const loadFeedPage = () => (dispatch:ThunkDispatch, getState: GetGlobalState) => {
    const state = getState();
    const { filters, paging } = state.feed;
    if (paging.isLoadingNextPage || !paging.hasMorePages) return;
    dispatch(asyncHttpActionGeneric(
        () => queryFeedPage(plannerGroupId(state), entityFieldsDataFromState(state), filters, false, paging.currentNumberOfPages + 1), 
        LOAD_FEED_PAGE
    ));
};


const changeFilter = <T>(actionName: string) => (payload: T) => (dispatch: Dispatch<any>, getState: GetGlobalState) => {    
    changeFilterDirect(actionName, payload, dispatch, getState);
    /*
    dispatch(payloadAction(actionName)(payload));
    dispatch(reloadFeed);
    */
};

const changeFilterDebounced = <T>(actionName: string) => (payload: T) => (dispatch: Dispatch<any>, getState: GetGlobalState) => {    
    changeFilterDirectDebounced(actionName, payload, dispatch, getState);
};

const changeFilterDirect = <T>(actionName: string, payload: T, dispatch: ThunkDispatch, getState: GetGlobalState) => {
    dispatch(payloadAction(actionName)(payload));
    dispatch(reloadFeed);
};

const changeFilterDirectDebounced = debounce(changeFilterDirect, 1000);

export const selectMyTasksType = changeFilter<MyTasksType>(SELECT_MY_TASKS_TYPE);
export const selectMyAuditsType = changeFilter<MyTasksType>(SELECT_MY_AUDITS_TYPE);
export const selectFeedMode = changeFilter<FeedMode>(SELECT_FEED_MODE);
export const setGeoFilterBounds = changeFilter<IGeoBounds>(SHOW_FEED_ITEMS_IN_AREA);
export const setGeoFilterBoundsDebounced = changeFilterDebounced<IGeoBounds>(SHOW_FEED_ITEMS_IN_AREA);

export const resetGeoFilterIfNeeded = (dispatch: Dispatch<any>, getState: GetGlobalState) => (location: Location) => {    
    const feed = getState().feed;
    const hasGeoFilter = feed != null && feed.filters.geoFilter != null;
    if (hasGeoFilter && location.pathname !== paths.LOCATE) {
        setGeoFilterBounds(null)(dispatch, getState);
    }
};

const getDetailsAndShowIncompleteEventModal = (feedItem: IFeedItem, start: Moment, closeTask?: boolean): ThunkAction<void> =>
    (dispatch, getState) => {
        dispatch(showModal(ModalType.IncompleteDialog, { title: translate(writeEventModalTitle) } as ITitle));
        feedItem.queryDetails().then(data => {
            if (isIncompleteModalShown(getState)) {
                const time = start != null ? { start, end: start.clone().add(1, 'hours') } : null;
                dispatch(showPlanCustomerVisitModal(data, time, true, closeTask));
            }
        })
        .catch(hideModalAndShowDetailsFailedToast(() => isIncompleteModalShown(getState), dispatch));
    };

export function addEventFromDropedItem(start: Moment, droppedItem: IFeedItem) {
    return getDetailsAndShowIncompleteEventModal(droppedItem, start);
}

export function showWriteEventAndCloseTaskModal(feedItem: IFeedItem) {
    return getDetailsAndShowIncompleteEventModal(feedItem, null, true);
}
