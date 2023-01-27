import { combineReducers } from 'redux';

import { composeReducers } from '../utils/composeReducers';
import { initialState, selectableAsyncListReducerFactory } from './factories/asyncActionReducerFactory';
import { payloadValueReducerFactory } from './factories/payloadValueReducerFactory';
import { ISelectableItemsState } from '../models/IItemsState';
import { IPayloadAction } from '../actions/actionUtils';
import { IApiEvent } from '../models/api/coreApi';
import Event from '../models/events/Event';
import { ITimeSpan } from '../models/events/calendarState';
import { getMonthClosure } from '../services/events/timeRanges';
import { equalsById } from '../models/feed/ISObject';
import { CHANGE_CALENDAR_RANGE, MARK_EVENT_COMPLETED, LOAD_CALENDAR_EVENTS, SET_CALENDAR_ADD_BUTTONS_EXPANDED } from 'src/actions/integration/events/eventActions';

const loadEventReducer = selectableAsyncListReducerFactory<Event>(LOAD_CALENDAR_EVENTS);
const addButtonsReducer = payloadValueReducerFactory(SET_CALENDAR_ADD_BUTTONS_EXPANDED, false);

function currentRangeReducer(previousState: ITimeSpan = null, action: IPayloadAction<ITimeSpan>): ITimeSpan {
    switch (action.type) {
        case CHANGE_CALENDAR_RANGE:
            return getMonthClosure(action.payload);
        default:
            return previousState;
    }
}

export function markEventCompleted(previousState: ISelectableItemsState<Event>, action: IPayloadAction<IApiEvent>): ISelectableItemsState<Event> {
    switch (action.type) {
        case MARK_EVENT_COMPLETED.success:
            const newEvent = new Event(action.payload);
            const newItems = previousState.items.map(t => equalsById(t)(newEvent) ? newEvent : t);
            return { ...previousState, items: newItems };
        default:
            return previousState;
    }
}

export default combineReducers({
    addButtonsExpanded: addButtonsReducer,
    currentRange: currentRangeReducer,
    events: composeReducers(
        initialState as ISelectableItemsState<Event>,
        loadEventReducer,
        markEventCompleted,
    ),
});
