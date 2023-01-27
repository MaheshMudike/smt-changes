import { noop } from 'lodash';
import { Dispatch } from 'redux';

import { IApiEvent } from '../../../models/api/coreApi';
import { ITimeSpan } from '../../../models/events/calendarState';
import Event from '../../../models/events/Event';
import { GetGlobalState, userId } from '../../../models/globalState';
import { getMonthClosure, getWeekRange } from '../../../services/events/timeRanges';
import { IAsyncActionNames, payloadAction, asyncActionNames, itemsStateAsyncActionNames } from '../../actionUtils';
import { getJsforceCollectionAction, queryEventsRange, upsertEventFromWriteEventModal, insertEventRelations, queryEventRelations } from '../../http/jsforce';

import { toastMessages } from '../../../constants/toastMessages';
import { asyncHttpActionGeneric } from '../../http/httpActions';
import { IEventModification } from '../../../models/events/IEventModification';

import { conditions, SObject } from '../../http/jsforceMappings';
import { queryEventsBase } from '../../http/jsforceBase';
import { multiQueryUpdateQuery, describe, del } from '../../http/jsforceCore';
import { changeFormValue } from '../../planCustomerVisitActions';
import { querySalesforceMetrics } from '../metricsActions';
import { hideAllModals } from '../../modalActions';
import { closeTask } from '../tasks/taskActions';
import { metricConditionsCustomerVisits } from '../../http/jsforceMetrics';
import { reloadFeed } from '../../../actions/integration/feedActions';
import Contact from '../../../models/accounts/Contact';
import { CREATE_EVENT_OFFLINE } from '../../offlineChangesActions';
import { IEventFromEventCreationDialog } from '../../../components/modals/events/EventCreationDialog';
import { ThunkDispatch, ThunkAction } from '../../thunks';
import { queryDescribe } from '../metadataActions';

export const LOAD_EVENTS = itemsStateAsyncActionNames('LOAD_EVENTS');
export const LOAD_CACHED_EVENTS = itemsStateAsyncActionNames('LOAD_CACHED_EVENTS');
export const LOAD_CALENDAR_EVENTS = itemsStateAsyncActionNames('LOAD_CALENDAR_EVENTS');
export const MARK_EVENT_COMPLETED = asyncActionNames('MARK_EVENT_COMPLETED');
export const CHANGE_CALENDAR_RANGE = 'CHANGE_CALENDAR_RANGE';
export const CHANGE_EVENTS_CACHE_RANGE = 'CHANGE_EVENTS_CACHE_RANGE';
export const SET_CALENDAR_ADD_BUTTONS_EXPANDED = 'SET_CALENDAR_ADD_BUTTONS_EXPANDED';

export const downloadEvents = () => getJsforceCollectionAction(
    state => queryEventsBase(metricConditionsCustomerVisits.queryConditionsOpen(userId(state))).then(events => queryEventRelations(events)), Event, LOAD_EVENTS
);

export const refreshCalendarEvents: ThunkAction<void> = (dispatch, getState) => {
    const currentRange = getState().calendar.currentRange;
    if(currentRange != null) dispatch(loadCalendarEvents(currentRange))    
};

export const refreshCachedEvents: ThunkAction<void> = (dispatch, getState) => {
    const cacheRange = getWeekRange(4, 4);
    dispatch(payloadAction(CHANGE_EVENTS_CACHE_RANGE)(cacheRange));
    dispatch(loadEventsByTimeSpan(LOAD_CACHED_EVENTS, cacheRange));
    //TODO check if this makes sense
        //.then(events => dispatch(payloadAction(LOAD_CALENDAR_EVENTS.success)(events)));
};

const loadEventsByTimeSpan = (actionNames: IAsyncActionNames, timeSpan: ITimeSpan) => {
    return getJsforceCollectionAction(state => queryEventsRange(userId(state), timeSpan.start, timeSpan.end), Event, actionNames);
};

const loadCalendarEvents = (timeSpan: ITimeSpan) => loadEventsByTimeSpan(LOAD_CALENDAR_EVENTS, timeSpan);

function isSameTimeStamp(t1: ITimeSpan, t2: ITimeSpan) {
    if (t1 == null || t2 == null) {
        return false;
    }
    return t1.start.isSame(t2.start) && t1.end.isSame(t2.end);
}

export const changeCalendarRange =
    (previousRange: ITimeSpan, visibleRange: ITimeSpan): ThunkAction<void> =>
        (dispatch, getState) => {

            dispatch(payloadAction(CHANGE_CALENDAR_RANGE)(visibleRange));
            const monthClosure = getMonthClosure(visibleRange);

            if (!isSameTimeStamp(monthClosure, previousRange)) {
                dispatch(loadCalendarEvents(monthClosure));
            }
        };

//this method, the reducer state and the action can be removed
export const toggleAddButtonsExpansion = (): ThunkAction<void> => (dispatch, getState) =>
    dispatch(payloadAction(SET_CALENDAR_ADD_BUTTONS_EXPANDED)(!getState().calendar.addButtonsExpanded));

export function markEventAsCompleted(mod: IEventModification) {
    return multiQueryUpdateQuery(SObject.Event, [{ Id: mod.event.id, Event_Status__c: conditions.Task.completed }], 
        [queryEventsBase([conditions.Event.ids([mod.event.id])])]
    ).then(resultWrapper => {            
        const [events] = resultWrapper.queries.result;
        return events[0];
    })    
}

export const markEventCompletedAndShowToast = (event: IEventModification): ThunkAction<void> =>
    (dispatch, getState) => {
        return dispatch(asyncHttpActionGeneric<IApiEvent>(() => markEventAsCompleted(event), MARK_EVENT_COMPLETED, 
            [
                dispatch => dispatch(querySalesforceMetrics)
            ],
            { onFail: toastMessages().MARK_EVENT_COMPLETED_FAILED },
        ));
}

export const SCHEDULE_OFFLINE_EVENT = 'SCHEDULE_OFFLINE_EVENT';
const CREATE_NEW_EVENT = asyncActionNames('CREATE_NEW_EVENT');

export function upsertEventWithToast(event: IEventFromEventCreationDialog, contacts: Contact[], idOfTaskToClose?: string) {
    return (dispatch: ThunkDispatch, getState: GetGlobalState) => {
        dispatch(changeFormValue({ isWaitingForResponse: true }));

        dispatch(asyncHttpActionGeneric(
            () => upsertEventFromWriteEventModal(event, contacts.map(c => c.id)), 
            CREATE_NEW_EVENT, [
                dispatch => {
                    dispatch(refreshCalendarEvents);
                    dispatch(querySalesforceMetrics);
                    dispatch(hideAllModals());
                    //dispatch(goToPrevModal());
                    if(idOfTaskToClose != null) dispatch(closeTask(idOfTaskToClose));
                    dispatch(changeFormValue({ isWaitingForResponse: false }))
                    dispatch(querySalesforceMetrics);
                    dispatch(reloadFeed);
                }
            ],
            { onFail: toastMessages().EVENT_SCHEDULE_SAVED_FAILED, onSucceed: toastMessages().EVENT_SCHEDULE_SAVED }
        ));
    };
}

export function deleteEventWithToast(id: string) {
    return (dispatch: ThunkDispatch, getState: GetGlobalState) => {
        dispatch(changeFormValue({ isWaitingForResponse: true }));

        dispatch(asyncHttpActionGeneric(
            () => del(SObject.Event, [id]), 
            CREATE_NEW_EVENT, [
                dispatch => {
                    dispatch(refreshCalendarEvents);
                    dispatch(querySalesforceMetrics);
                    dispatch(hideAllModals());
                    //dispatch(goToPrevModal());
                    dispatch(changeFormValue({ isWaitingForResponse: false }))
                    dispatch(querySalesforceMetrics);
                }
            ],
            //TODO change the messages
            { onFail: toastMessages().EVENT_SCHEDULE_SAVED_FAILED, onSucceed: toastMessages().EVENT_SCHEDULE_SAVED }
        ));
    };
}

export function scheduleCustomerMeetingOffline(event: IEventFromEventCreationDialog, contacts: Contact[]) {
    return (dispatch: Dispatch<any>) => {
        //const e = new Event(event);

        //this action is just to display the event in the offline calendar
        dispatch(payloadAction(SCHEDULE_OFFLINE_EVENT)(new Event({ ...event, 
            Id: null,
            CreatedDate: null,
            Event_Status__c: null,
            Location: null,
            OwnerId: null,
            Who: null,
            Audit_Number__c: null,
            Objectives__c: null,
            contacts: contacts.map(t => ({
                Id: t.id,
                Name: t.fullName,
                Phone: t.phone,
            })),
            invitees: []
        })));
        dispatch(payloadAction(CREATE_EVENT_OFFLINE)({ event, contacts }));
        dispatch(hideAllModals());
    };
}

export function queryEventDescribe(): ThunkAction<void> {
    return queryDescribe(SObject.Event);
}