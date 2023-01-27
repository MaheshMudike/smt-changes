import * as _ from 'lodash';

import { IPayloadAction } from '../../actions/actionUtils';
import Event from '../../models/events/Event';
import { ISelectableItemsState } from '../../models/IItemsState';
import clone from '../../utils/clone';
import { composeReducers } from '../../utils/composeReducers';
import { initialState, selectableAsyncListReducerFactory } from '../factories/asyncActionReducerFactory';
import { MARK_EVENT_COMPLETED_OFFLINE } from '../../actions/offlineChangesActions';
import { IEventModification } from '../../models/events/IEventModification';
import { markEventCompleted } from '../calendarReducer';
import { equalsById } from '../../models/feed/ISObject';
import { SCHEDULE_OFFLINE_EVENT, LOAD_CACHED_EVENTS } from '../../actions/integration/events/eventActions';

const loadEventReducer = selectableAsyncListReducerFactory<Event>(LOAD_CACHED_EVENTS);

function markEventAsCompletedOfflineReducer(state: ISelectableItemsState<Event>, action: IPayloadAction<IEventModification>): ISelectableItemsState<Event> {
    switch (action.type) {
        case MARK_EVENT_COMPLETED_OFFLINE:
            return clone(state, s => s.items = s.items.map(e => equalsById(action.payload.event)(e) ? e.completedEvent() : e));
        default:
            return state;
    }
}

export const eventsReducer = composeReducers(
    initialState as ISelectableItemsState<Event>,
    loadEventReducer,
    markEventAsCompletedOfflineReducer,
    additionalOfflineEventsReducer,
    markEventCompleted,
);

function additionalOfflineEventsReducer(state: ISelectableItemsState<Event>, action: IPayloadAction<any>,): ISelectableItemsState<Event> {
    switch (action.type) {
        case SCHEDULE_OFFLINE_EVENT:
            return clone(state, s => s.items = _.concat(s.items, action.payload));
        default:
            return state;
    }
}
