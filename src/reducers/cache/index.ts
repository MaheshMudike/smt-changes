import { combineReducers } from 'redux';

import { OFFLINE_SEARCH_ACCOUNTS } from '../../actions/cache/accountActions';
import { payloadValueReducerFactory } from '../factories/payloadValueReducerFactory';
import { eventsReducer } from './eventsReducer';
import { offlineAccountsReducer } from './offlineAccountsReducer';
import { IPayloadAction } from '../../actions/actionUtils';
import { ITimeSpan } from '../../models/events/calendarState';
import { CHANGE_EVENTS_CACHE_RANGE } from 'src/actions/integration/events/eventActions';
import { IEventsCacheRange } from 'src/models/globalState';

const initialRange: IEventsCacheRange = {
    range: null,
};

export default combineReducers({
    events: eventsReducer,
    eventsRange: (state = initialRange, action: IPayloadAction<ITimeSpan>) => {
        switch (action.type) {
            case CHANGE_EVENTS_CACHE_RANGE:
                return { range: action.payload };
            default:
                return state;
        }
    },
    offlineAccounts: offlineAccountsReducer,
    offlineAccountsSearchPhrase: payloadValueReducerFactory(OFFLINE_SEARCH_ACCOUNTS, ''),
});