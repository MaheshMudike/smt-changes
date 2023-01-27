import { GetGlobalState, IGlobalState } from '../../models/globalState';
import { emptyAction, IAsyncActionNames, payloadAction, IItemsQueryStateAsyncActionNames } from '../actionUtils';
import { AllActionTypes, ActionStatus } from '../actions';
import { replace } from 'react-router-redux';
import { paths } from '../../config/paths';
import { hideAllModals } from '../modalActions';

import { Toast } from '../../models/toasts';
import { showToast } from '../toasts/toastActions';
import { enterOfflineMode } from '../offlineChangesActions';
import { ConnectionStatus, connectionStatus } from '../../config/cordovaConfig';
import { ThunkDispatch, ThunkAction } from '../thunks';
import { stopNotificationsAndStatisticsPeriodicUpdate } from '../authenticationActions';
import { ComponentStatus, DataStatus } from 'src/models/IItemsState';
import { IListGroupCollapsible } from 'src/components/ListSplitPanel';
import * as _ from 'lodash';
import { isBrowser } from 'src/utils/cordova-utils';

function showToastIfMessage(actionTitle: string, action: () => void, message: string, dispatch: ThunkDispatch) {
    let toast = { message } as Toast;
    if(action != null) toast = { ...toast, action: action, actionTitle };
    if (message) dispatch(showToast(toast));
}


export function asyncHttpActionGenericInitialData<TData>(
    httpActivity: (state: IGlobalState) => Promise<TData>, 
    names: IAsyncActionNames = null,
    initialData: TData = null
    ) {
    return asyncHttpActionGeneric<TData>(httpActivity, names, [], {}, initialData);
}


export const selectQueriableItemAction = <TListItem extends { queryDetails: () => Promise<TDetail> }, TDetail extends TListItem>(
    listItem: TListItem, action: IItemsQueryStateAsyncActionNames
): ThunkAction<void> => {
    return asyncHttpActionGenericInitialData(state => listItem.queryDetails(), action.queryItem, listItem)
}

export function asyncHttpActionGeneric<TData>(
    httpActivity: (state: IGlobalState) => Promise<TData>, 
    names: IAsyncActionNames = null,
    extraActions: ThunkAction<any>[] = [],
    messages: {
        onStart?: string;
        onSucceed?: string;
        onFail?: string;
        action?: () => void,
        actionTitle?: string
    } = {},
    initialData: TData = null, retries: number = 0
    )
    //TODO should return Promise<void>
    : ThunkAction<void> {

    return (dispatch, getState) => {
        
        showToastIfMessage(messages.actionTitle, messages.action, messages.onStart, dispatch);
        if(names != null) {
            dispatch(initialData == null ? emptyAction(names.start) : payloadAction(names.start)(initialData));
        }
        
        const state = getState();
        return httpActivity(state)
            .then(result => {
                showToastIfMessage(messages.actionTitle, messages.action, messages.onSucceed, dispatch);
                if(names != null) dispatch(payloadAction(names.success)(result));
                extraActions.forEach(action => dispatch(action));
                //return result;
            })
            .catch(error => {
                //this is not reliable for the browser version, type is always UNKNOWN even if offline
                const navigatorOffline = navigator.connection.type === Connection.NONE;

                const authenticationErrorOrNetworkError = isAuthenticationErrorOrNetworkError(error);
                if (!isBrowser() && navigatorOffline || connectionStatus === ConnectionStatus.Offline) {//isOfflineError) {
                    dispatch(enterOfflineMode);
                } else if (authenticationErrorOrNetworkError) {
                    if(retries > 0) return dispatch(asyncHttpActionGeneric(httpActivity, names, extraActions,messages, initialData, retries-1))
                    dispatch(hideAllModals());
                    //if(getState().routing.location.pathname !== paths.LOGIN) 
                    dispatch(replace(paths.LOGIN));
                    stopNotificationsAndStatisticsPeriodicUpdate();
                } else {
                    showToastIfMessage(messages.actionTitle, messages.action, messages.onFail, dispatch);
                    if(names.failure == "LOAD_SEARCH_PARTIAL_FAILURE") {
                        dispatch(payloadAction(names.failure)({ ...initialData, actionStatus:ActionStatus.FAILURE }));
                    } 
                    else if(names != null) dispatch(payloadAction(names.failure)(error));//asyncAction.fail(dispatch, error, getState);                    
                }
                //return Promise.reject<TData>(error);
            });
    };
}

function isAuthenticationErrorOrNetworkError(error: any) {
    //when unauthenticated the status code of the XMLHttpRequest is 0 and jsforce defaults the error to 400 and sets the error code 'ERROR_HTTP_400'
    //also happens with network changed error
    //(see /lib/http-api.js in jsforce library and /lib/browser/request.js)
    //{name: "invalid_grant", stack: (...), message: "expired access/refresh token"}
    return error.message === 'expired access/refresh token' || error.errorCode === 'ERROR_HTTP_400';
}

export function asyncHttpActionGenericLocalState3<TData>(
    httpActivity: (state: IGlobalState) => Promise<TData>,
    messages: {
        onStart?: string;
        onSucceed?: string;
        onFail?: (error: any) => string;
        action?: () => void,
        actionTitle?: string
    } = {},
    extraActions: ThunkAction<any>[] = [],
    retries: number = 0
): ThunkAction<Promise<TData>> {
    return (dispatch, getState) => {
        showToastIfMessage(messages.actionTitle, messages.action, messages.onStart, dispatch);
        return httpActivity(getState())
        .then(res => {
            showToastIfMessage(messages.actionTitle, messages.action, messages.onSucceed, dispatch);
            extraActions.forEach(action => dispatch(action));
            return res;
        })
        .catch(error => {
            //this is not reliable for the browser version, type is always UNKNOWN even if offline
            const navigatorOffline = navigator.connection.type === Connection.NONE;

            const authenticationErrorOrNetworkError = isAuthenticationErrorOrNetworkError(error);
            if (!isBrowser() && navigatorOffline || connectionStatus === ConnectionStatus.Offline) {//isOfflineError) {
                dispatch(enterOfflineMode);
            } else if (authenticationErrorOrNetworkError) {
                if(retries > 0) {
                    dispatch(asyncHttpActionGenericLocalState3(httpActivity, messages, extraActions, retries-1));
                    return;
                }
                dispatch(hideAllModals());
                //if(getState().routing.location.pathname !== paths.LOGIN) 
                dispatch(replace(paths.LOGIN));
                stopNotificationsAndStatisticsPeriodicUpdate();
            } else {
                showToastIfMessage(messages.actionTitle, messages.action, messages.onFail(error), dispatch);
                throw error;
                return null;
            }
        });
    };
}

function deleteKey<T>(dictionary: _.Dictionary<T>, key: string) {
    const res = { ...dictionary };
    delete res[key];
    return res;
}

export function asyncHttpActionGenericLocalStateGroups<TData>(
    groupKey: string,
    component: React.Component<any, { groups: _.Dictionary<IListGroupCollapsible<TData>>, asyncActions: _.Dictionary<Promise<any>> }>, 
    httpActivity: (state: IGlobalState) => Promise<TData[]>, 
    initialData: TData = null, retries: number = 0
): ThunkAction<void> {
    return (dispatch, getState) => {
        const actionId = _.uniqueId('action');
        const action = httpActivity(getState())
        .then(result => {
            component.setState(oldstate =>
                ({ ...oldstate, 
                    groups: { ...oldstate.groups, [groupKey]: { ...oldstate.groups[groupKey], items: result, actionStatus: ActionStatus.SUCCESS } },
                    asyncActions: deleteKey(oldstate.asyncActions, actionId)//{ ...oldstate.asyncActions, [actionId]: action }
                })
            );
        })
        .catch(error => {
            component.setState(oldstate =>
                ({ ...oldstate, 
                    groups: { ...oldstate.groups, [groupKey]: { ...oldstate.groups[groupKey], items: [], actionStatus: ActionStatus.FAILURE } },
                    asyncActions: deleteKey(oldstate.asyncActions, actionId)//{ ...oldstate.asyncActions, [actionId]: action }
                })
            );

            //this is not reliable for the browser version, type is always UNKNOWN even if offline
            const navigatorOffline = navigator.connection.type === Connection.NONE;

            const authenticationErrorOrNetworkError = isAuthenticationErrorOrNetworkError(error);
            if (!isBrowser() && navigatorOffline || connectionStatus === ConnectionStatus.Offline) {//isOfflineError) {
                dispatch(enterOfflineMode);
            } else if (authenticationErrorOrNetworkError) {
                if(retries > 0) {
                    dispatch(asyncHttpActionGenericLocalStateGroups(groupKey, component, httpActivity, initialData, retries-1));
                    return;
                }
                dispatch(hideAllModals());
                //if(getState().routing.location.pathname !== paths.LOGIN) 
                dispatch(replace(paths.LOGIN));
                stopNotificationsAndStatisticsPeriodicUpdate();
            }

        });

        component.setState(oldstate => (
            { 
                ...oldstate, 
                groups: { ...oldstate.groups, [groupKey]: { ...oldstate.groups[groupKey], items: [], actionStatus: ActionStatus.START } } ,
                asyncActions: { ...oldstate.asyncActions, [actionId]: action }
            }
        ));

    };
}

export function asyncHttpActionGenericLocalState2<TData>(
    setState: (dataStatus: DataStatus<TData>) => void, 
    httpActivity: (state: IGlobalState) => Promise<TData>, 
    initialData: TData = null, retries: number = 0
): ThunkAction<Promise<void>> {
    return (dispatch, getState) => {
        setState({ data: initialData, status: ComponentStatus.IN_PROGRESS, lastUpdated: new Date() });

        return httpActivity(getState())
        .then(result => {
            setState({ status: ComponentStatus.SUCCESS, data: result, lastUpdated: new Date() });
        })
        .catch(error => {
            setState({ status: ComponentStatus.FAILURE, data: null, lastUpdated: new Date() });

            //this is not reliable for the browser version, type is always UNKNOWN even if offline
            const navigatorOffline = navigator.connection.type === Connection.NONE;

            const authenticationErrorOrNetworkError = isAuthenticationErrorOrNetworkError(error);
            if (!isBrowser() && navigatorOffline || connectionStatus === ConnectionStatus.Offline) {//isOfflineError) {
                dispatch(enterOfflineMode);
            } else if (authenticationErrorOrNetworkError) {
                if(retries > 0) {
                    dispatch(asyncHttpActionGenericLocalState2(setState, httpActivity, initialData, retries-1));
                    return;
                }
                dispatch(hideAllModals());
                //if(getState().routing.location.pathname !== paths.LOGIN) 
                dispatch(replace(paths.LOGIN));
                stopNotificationsAndStatisticsPeriodicUpdate();
            }

        });
    };
}

export function toPlainObject(action: AllActionTypes) {
    return { ...action };
}