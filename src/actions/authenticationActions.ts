import { replace } from 'react-router-redux';
import { Dispatch } from 'redux';

import { paths } from '../config/paths';
import { ModalType } from '../constants/modalTypes';
import { toastMessages } from '../constants/toastMessages';
import { ICredentials } from '../models/api/salesforce/ICredentials';
import { IUserBranch } from '../models/user/IUserBranch';
import { User } from '../models/user/User';
import credentialsValue from '../services/credentials';
import { asyncActionNames, emptyAction, IAsyncActionNames, payloadAction } from './actionUtils';
import { resetGlobalState } from './globalActions';
import { synchronize } from './integration/synchronization';
import { showModal } from './modalActions';
import { showToast } from './toasts/toastActions';
import { queryUserAndConfig } from '../actions/http/jsforce';
import { initConnection, multiQueryQueryInsert, connection, restGet, requestGet } from '../actions/http/jsforceCore';
import { GetGlobalState, userIdFromState } from '../models/globalState';
import { SMT_Notification__c } from '../models/api/coreApi';

import { handleNotification } from '../config/pushServiceHandler';
import { LOAD_MAP_CONFIG } from './mapActions';
import { IMapConfig } from '../models/api/mapApi';
import { querySMTSalesorgConfiguration, querySMTNotifications } from './http/jsforceBase';
import { SET_SALESORG_CONFIG, salesOrganizationConfigDefault } from '../reducers/configurationReducer';

import { initializeLanguageData, DEFAULT_LANGUAGE, setLanguageAndLocale } from '../utils/translate';
import { config as appConfig } from '../config/config';

import * as moment from 'moment';
import { LOAD_METRICS_RESET, queryKffMetrics } from './integration/metricsActions';
import { ThunkAction, ThunkDispatch } from './thunks';
import * as _ from 'lodash';
import rtlDetect from 'rtl-detect';
import { conditions, orCondition, andCondition } from './http/jsforceMappings';
import { Moment } from "moment";
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const LOGIN_REQUEST: IAsyncActionNames = asyncActionNames('LOGIN_REQUEST');
export const SET_PLANNER_GROUP = 'SET_PLANNER_GROUP';
export const LOCATION_CLEAR = "LOCATION_CLEAR";

export function initConnectionAndQueryUser(credentials: ICredentials): ThunkAction<Promise<User>> {
    return (dispatch, getState) => {
        dispatch(emptyAction(LOGIN_REQUEST.start));
        if(isAndroid()){ firebaseStartTrace('Login trace') }

        return credentialsValue.setValue(credentials)
            .then(() => {
                initConnection(credentials);
                return queryUserAndConfig(credentials.userId, __SMT_ENV__);
            })
            .then(userAndConfig => {
                const [user, config] = userAndConfig;
                const userInfo = new User(user, user.smtUserInfo);
                try {
                    const mapConfig = JSON.parse(config.Map_Configuration__c) as IMapConfig;
                    dispatch(payloadAction(LOAD_MAP_CONFIG.success)(mapConfig));
                } catch(error) {
                    console.log('Error casting mapConfig: ', config);
                } 
        
                //at this stage the language set is DEFAULT_LOCALE included in the code, now it tries to get the latest translations from the server                
                return Promise.all([
                    getLanguageFile(user.LanguageLocaleKey),
                    user.LanguageLocaleKey != DEFAULT_LANGUAGE ? getLanguageFile(DEFAULT_LANGUAGE) : Promise.resolve(undefined)
                ])
                .then(() => {
                    if(isAndroid()){ firebaseStopTrace('Login trace') }
                    setLanguageAndLocale(user.LanguageLocaleKey, user.LocaleSidKey);
                    dispatch(showAdminOrSupervisor(userInfo));
                    dispatch(payloadAction(LOGIN_REQUEST.success)(userInfo));
                    //downloadReport({ id: '0016E00000QlnvEQAR', name: 'Fluido' })(dispatch, getState);
                    //downloadReport({ id: '0016E00000Q3f3tQAB', name: 'ROBBA' })(dispatch, getState);
                    return userInfo;
                })
                .catch(err => {
                    if(isAndroid()){ firebaseStopTrace('Login trace') }
                    dispatch(showAdminOrSupervisor(userInfo));
                    dispatch(payloadAction(LOGIN_REQUEST.success)(userInfo));
                    return userInfo;
                });

            })
            .catch(reason => {
                dispatch(payloadAction(LOGIN_REQUEST.failure)(reason));
                if(isAndroid()){ firebaseStopTrace('Login trace') }
                if (reason.status === 403) {
                    dispatch(showModal(ModalType.PermissionDeniedModal));
                } else {
                    dispatch(logout());
                }
                throw new Error();
            });
    };
}

export function isRtlLanguage(locale: string) {
    //iw is an old code for hebrew
    return rtlDetect.isRtlLang(locale == 'iw' ? 'he' : locale);
}

function getLanguageFile2(localeKey: string): Promise<void> {
    const url = appConfig.translationsUrl(localeKey);
    return requestGet(url).then((langData: _.Dictionary<string>) => {
        if(langData != null && typeof langData === 'object') {
            const langDataParsed = langData;//JSON.parse(langData);
            initializeLanguageData(localeKey, langDataParsed);
        }
    })
}

function getLanguageFile(localeKey: string): Promise<void> {
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {

            // Only run if the request is complete
            if (request.readyState !== 4) return;

            if (request.status >= 200 && request.status < 300) {
                var langData = null;
                try {
                    langData = JSON.parse(request.response);
                } catch(error) {}
                if(langData != null && typeof langData === 'object') {
                    initializeLanguageData(localeKey, langData);
                }
                resolve();
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        };

        request.open('GET', appConfig.translationsUrl(localeKey));
        request.send();
    });
}

export function showAdminOrSupervisor(userInfo: User): ThunkAction<void> {
    return (dispatch, getState) => {
        const ownedGroups = userInfo.userBranches.filter((el) => el.owned);
        if(userInfo.userBranches.length == 1) {
            dispatch(setPlannerGroup(userInfo.userBranches[0]));
            dispatch(navigateToDefaultPageIfNeeded());
        } else if(ownedGroups.length == 1) {
            dispatch(setPlannerGroup(ownedGroups[0]));
            dispatch(navigateToDefaultPageIfNeeded());
        } else {
            dispatch(showModal(ModalType.SelectPlannerGroupDialog, {
                currentPlannerGroup: null,
                currentUser: userInfo,
            }));
        }
    }
}

const NOTIFICATIONS_TIMEOUT_MS = 60 * 1000;

export function setPlannerGroup(plannerGroup: IUserBranch): ThunkAction<void> {
    return (dispatch, getState) => querySMTSalesorgConfiguration(plannerGroup.salesOrganization).then(
        salesorgConfigs => {
            dispatch({ payload: plannerGroup, type: SET_PLANNER_GROUP });
            let config = salesOrganizationConfigDefault;
            if(salesorgConfigs.length > 0) {
                try {
                    config = JSON.parse(salesorgConfigs[0].Configuration_JSON__c);
                } catch(error) {
                    console.log('Error casting the salesorg configuration: ', error, salesorgConfigs);
                }
            }
            dispatch(payloadAction(SET_SALESORG_CONFIG)(config));
            dispatch(synchronize());

            stopNotificationsAndStatisticsPeriodicUpdate();
            const state = getState();
            getNotificationsAndUpdateStatisticsPeriodically(dispatch, getState, plannerGroup.id, userIdFromState(state),
                state.authentication.currentUser.smtUserInfo.Id, NOTIFICATIONS_TIMEOUT_MS);

            //dispatch(registerDevice());

        }
    );
}

var timestamp: moment.Moment = null;
var getNotificationsAndUpdateStatisticsPeriodicallyHandle = null as number;

export function resetNotificationTimestamp() {
    timestamp = moment();
}

export function getNotificationsAndUpdateStatisticsPeriodically(dispatch: ThunkDispatch, getState: GetGlobalState,
    territoryId: string, userId: string, userInfoId: string, timeoutMs: number) {
    var oldtimestamp = timestamp;

    resetNotificationTimestamp()
    if(oldtimestamp != null) {
        /*
        const entries = locations.map(location => ({
            Type__c: 'Path', SMT_User_Info__c: userInfoId, Value__c: location.location, Timestamp__c: momentToSfDateString(location.timestamp),
            attributes: { type: "SMT_Usage_Statistics_Entry__c" }
        }));
        */
        const state = getState();
        const locationsNum = state.locations.length;
        const entries = state.locations.map(location => ({
            Type__c: 'Path', SMT_User_Info__c: userInfoId, Value__c: location.location, Timestamp__c: location.timestamp, Platform__c: cordova.platformId.toLowerCase(),
            attributes: { type: "SMT_Usage_Statistics_Entry__c" }
        }));
        
        multiQueryQueryInsert([querySMTNotificationsForServiceTerritory(territoryId, userId, oldtimestamp)], entries).then(
            resultWrapper => {
                const notifs = resultWrapper.queries.result[0] as SMT_Notification__c[];
                const filteredDuplicatesNotifs = _.uniqBy(notifs, elem =>
                    [elem.Record_Id__c, elem.Translation_Key__c, elem.Data__c, elem.Service_Territory__c, elem.User__c].join('_')
                );
                filteredDuplicatesNotifs.forEach(notif => dispatch(handleNotification(notif)));

                dispatch(payloadAction(LOCATION_CLEAR)(locationsNum));
                //locations = locations.slice(entries.length);
            }
        )

        //synchOfflineAccounts(state, dispatch, timestamp);

        //poll kff data to synchronize as no notifications are generated from kff changes
        const path = getState().routing.location.pathname;
        //queryKffMetrics already synchs the listviews
        //if(path == paths.AUDIT || path == paths.MONTHLY_DISCUSSIONS) dispatch(synchronizeCurrentPage(true));
        dispatch(queryKffMetrics);
    }
    getNotificationsAndUpdateStatisticsPeriodicallyHandle = window.setTimeout(() => getNotificationsAndUpdateStatisticsPeriodically(dispatch, getState, territoryId, userId, userInfoId, timeoutMs), timeoutMs)
}

function querySMTNotificationsForServiceTerritory(serviceTerritoryId: string, userId: string, lastQuery: Moment) {
    const smtNotifConds = conditions.SMT_Notification__c;
    return querySMTNotifications([
        smtNotifConds.createdDateAfter(lastQuery),
        orCondition(
            andCondition(smtNotifConds.serviceTerritory(serviceTerritoryId), smtNotifConds.userId(null)),
            smtNotifConds.userId(userId),
            andCondition(
                smtNotifConds.serviceTerritory(null), smtNotifConds.userId(null)
            )
        )
    ]);
}

export function stopNotificationsAndStatisticsPeriodicUpdate() {
    window.clearTimeout(getNotificationsAndUpdateStatisticsPeriodicallyHandle);
}


export function logout() {
    return (dispatch: Dispatch<any>) => {
        connection.logoutByOAuth2(error => { if(error != null) console.log("Logout error: ",error)});
        dispatch(resetGlobalState);
        credentialsValue.remove().then(() => dispatch(replace(paths.LOGIN)));
        stopNotificationsAndStatisticsPeriodicUpdate();
    };
}

export function authenticateFailed(errorMessage: any): ThunkAction<void> {
    return dispatch => {
        dispatch(logout());
        dispatch(showToast({
            message: errorMessage || toastMessages().AUTHENTICATION_FAILED,
        }));
    };
}

export function navigateToDefaultPageIfNeeded() {
    return (dispatch: Dispatch<any>) => {
        if (location.hash.indexOf(paths.LOGIN) > -1 || location.hash.indexOf(paths.OAUTH_CALLBACK) > -1) {
            dispatch(replace(paths.OVERVIEW));
        }
    };
}