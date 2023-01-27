import { combineReducers } from 'redux';

import { SET_OFFLINE_MODE, SET_WEB_SOCKET_CONNECTION_STATUS } from '../actions/sharedStateActions';
import { payloadValueReducerFactory } from './factories/payloadValueReducerFactory';

export const sharedStateReducer = combineReducers({
    isOfflineMode: payloadValueReducerFactory(SET_OFFLINE_MODE, false),
    isWebSocketConnected: payloadValueReducerFactory(SET_WEB_SOCKET_CONNECTION_STATUS, false),
});
