import { payloadAction } from './actionUtils';

export const SET_OFFLINE_MODE = 'SET_OFFLINE_MODE';
export const SET_WEB_SOCKET_CONNECTION_STATUS = 'SET_WEB_SOCKET_CONNECTION_STATUS';

export const setOfflineMode = payloadAction<boolean>(SET_OFFLINE_MODE);
export const setWebSocketConnectionStatus = payloadAction<boolean>(SET_WEB_SOCKET_CONNECTION_STATUS);
