import { replace } from 'react-router-redux';
import { Dispatch, Store } from 'redux';

import { initConnectionAndQueryUser, resetNotificationTimestamp } from '../actions/authenticationActions';
import { resetGeoFilterIfNeeded } from '../actions/integration/feedActions';
import { GetGlobalState } from '../models/globalState';
import credentials from '../services/credentials';
import { initializeLanguageData, setLanguageAndLocale, DEFAULT_LANGUAGE, DEFAULT_LOCALE } from '../utils/translate';
import { paths } from './paths';
import * as history from 'history';
import { initSecureStorageMethod } from '../services/storage/secureStorage';
import * as _ from 'lodash';
import { showModal } from '../actions/modalActions';
import en from '../translations/en';
import { ModalType } from 'src/constants/modalTypes';
import { User } from '../models/user/User';
import { enterOfflineMode, tryLeavingOfflineMode } from '../actions/offlineChangesActions';
import { loadAllIconsPromise } from '../services/map/markers/mapIcons';
import { ThunkDispatch, ThunkAction } from '../actions/thunks';
import { modalClosingStrategy, getClosingFunctionByStrategy } from '../components/modals/GlobalModal';
import { isBrowser } from 'src/utils/cordova-utils';


export enum AppStatus {
    Background = "Background",
    Foreground = "Foreground"
}

export enum ConnectionStatus {
    Online = "Online",
    Offline = "Offline"
}

export var appStatus: AppStatus = AppStatus.Background;
export var connectionStatus: ConnectionStatus = ConnectionStatus.Online;

function deviceReady() {
    return new Promise(resolve => document.addEventListener('deviceready', resolve));
}

function getPreferredLanguage() {
    return new Promise<string>((resolve, reject) =>
        navigator.globalization.getPreferredLanguage(
            (lang: { value: string; }) => resolve(lang.value),
            () => reject(`Failed to load user's preferred language.`),
        ),
    );
}

function setupBackButton(dispatch: Dispatch<any>, getState: GetGlobalState) {
    document.addEventListener('backbutton', (ev: Event) => {
        ev.preventDefault();
        const lastModal = _.last(getState().modal);
        if(lastModal != null) dispatch(getClosingFunctionByStrategy(modalClosingStrategy(lastModal.modalType))())
    });
}

export function setupCordovaAndRun(store: Store<any>, history: history.History,
    initApp: {
        normal: () => void,
        error: (stack: string) => void,
        failedTranslations: (error:string) => void
    },
) {
    var dispatch = store.dispatch as ThunkDispatch;
    var getState = store.getState;
    deviceReady()
    .then(() =>{
        appStatus = AppStatus.Foreground;
        document.addEventListener('pause', () => {
            appStatus = AppStatus.Background;
        });
        document.addEventListener('resume', () => {
            appStatus = AppStatus.Foreground;
            if(!isBrowser()) resetNotificationTimestamp();
        });

        document.addEventListener("online", () => {
            connectionStatus = ConnectionStatus.Online;
            setTimeout(() => dispatch(tryLeavingOfflineMode()), 300);
        }, false);

        document.addEventListener("offline", () => {
            connectionStatus = ConnectionStatus.Offline;
            dispatch(enterOfflineMode);
        }, false);

        //TODO check if this works
        setupBackButton(dispatch, getState);
        history.listen(resetGeoFilterIfNeeded(dispatch, getState));
    })
    .then(getPreferredLanguage)
    .then(() => loadAllIconsPromise)
    .then(lang => {
        initializeLanguageData(DEFAULT_LANGUAGE, en);
        setLanguageAndLocale(DEFAULT_LANGUAGE, DEFAULT_LOCALE);
        initSecureStorageMethod(__SMT_ENV__)
        .then(storage => {
            if (location.hash.indexOf(paths.OAUTH_CALLBACK) >= 0) {
                initApp.normal();
            } else {
                credentials.getValue()
                .then(credentials => dispatch(initConnectionAndQueryUser(credentials)))
                .then(userInfo => {
                    initApp.normal();
                    //dispatch(showAdminOrSupervisor(userInfo));
                })
                .catch(error => {
                    dispatch(replace(paths.LOGIN));
                    initApp.normal();
                });
            }
        })
        .catch(err=> {
            initApp.failedTranslations(err.message)
        })
    })
    .catch(err => initApp.error(err.stack));
}

function showAdminOrSupervisor(userInfo: User): ThunkAction<void> {
    return (dispatch, getState) => {

        dispatch(showModal(ModalType.SelectPlannerGroupDialog, {
            currentPlannerGroup: null,
            currentUser: userInfo,
        }));


        /*
        if(userInfo.userBranches.length == 1) {//1) {
            setPlannerGroup(userInfo.userBranches[0])(dispatch, getState);
            navigateToDefaultPageIfNeeded()(dispatch);
        } else {
            dispatch(showModal(ModalType.SelectPlannerGroupDialog, {
                currentPlannerGroup: null,
                currentUser: userInfo,
            }));
        }
        */
    }
}
