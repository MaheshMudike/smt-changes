import { replace } from 'react-router-redux';
import { Dispatch } from 'redux';

import { paths } from '../config/paths';
import { ModalType } from '../constants/modalTypes';
import { IEventModification } from '../models/events/IEventModification';
import { IFileAttachment } from '../models/events/IFileAttachment';
import { INote } from '../models/events/INote';
import { userIdFromState } from '../models/globalState';
import { IOfflineChangeJob } from '../models/offlineChanges/IOfflineChanges';
import translate from '../utils/translate';
import { asyncActionNames, emptyAction, payloadAction } from './actionUtils';
import { asyncHttpActionGeneric } from './http/httpActions';
import { hideAllModals, showModal, hideModalType } from './modalActions';
import { showToast } from './toasts/toastActions';
import { queryUser } from './http/jsforce';
import INameAndId from '../models/INameAndId';
import { ThunkDispatch, ThunkAction } from './thunks';
import { connectionStatus, ConnectionStatus } from 'src/config/cordovaConfig';

export const CREATE_OFFLINE_SF_NOTE = 'CREATE_OFFLINE_SF_NOTE';
export const CREATE_OFFLINE_SF_ATTACHMENT = 'CREATE_OFFLINE_SF_ATTACHMENT';
export const MARK_EVENT_COMPLETED_OFFLINE = 'MARK_EVENT_COMPLETED_OFFLINE';
export const EDIT_OFFLINE_CONTACT = 'EDIT_OFFLINE_CONTACT';
export const CREATE_EVENT_OFFLINE = 'CREATE_EVENT_OFFLINE';

const SYNC_ALL_OFFLINE_CHANGES = asyncActionNames('SYNC_ALL_OFFLINE_CHANGES');
export const SYNC_SINGLE_OFFLINE_CHANGE = asyncActionNames('SYNC_SINGLE_OFFLINE_CHANGE');
export const CLEAR_SYNC_JOBS = 'CLEAR_SYNC_JOBS';

export const enterOfflineMode: ThunkAction<void> = (dispatch, getState) => {
    if (!getState().sharedState.isOfflineMode) dispatch(showModal(ModalType.EnterOfflineModeDialog));
}

export const createOfflineSfNote = payloadAction<INote>(CREATE_OFFLINE_SF_NOTE);

//export const createOfflineSfAttachment = payloadAction<IFileAttachment>(CREATE_OFFLINE_SF_ATTACHMENT);

export function createOfflineSfAttachment(contact: INameAndId, fileName: string, base64Content: string): ThunkAction<void> {
    return (dispatch, getState) => {
        dispatch(payloadAction(CREATE_OFFLINE_SF_ATTACHMENT)({ contact, fileName, base64Content } as IFileAttachment));        
    };
}

export const markEventCompletedOffline = payloadAction<IEventModification>(MARK_EVENT_COMPLETED_OFFLINE);

const jobToPromise = (dispatch: Dispatch<any>) => (job: IOfflineChangeJob) =>
    job.sync()
        .then(result => {
            dispatch(payloadAction(SYNC_SINGLE_OFFLINE_CHANGE.success)(job.id));
            return result;
        })
        .catch(() => {
            dispatch(payloadAction(SYNC_SINGLE_OFFLINE_CHANGE.failure)(job.id));
            return null;
        });

export function syncOfflineChanges(): ThunkAction<void> {    
    return (dispatch, getState) => {
        const jobs = getState().offlineChanges.jobs.map(jobToPromise(dispatch));
        dispatch(asyncHttpActionGeneric(() => Promise.all(jobs), SYNC_ALL_OFFLINE_CHANGES));
    };
}

function leaveOffline(dispatch: ThunkDispatch) {
    dispatch(replace(paths.OVERVIEW));
}

// export function tryLeavingOfflineMode(): ThunkAction<void> {
//     return (dispatch, getState) => {        
//         //http.get(APP_INFO_URL)
//         queryUser(userIdFromState(getState()))
//         .then(() => {
//             if (getState().offlineChanges.jobs.length === 0) {
//                 const path = getState().routing.location.pathname;
//                 if(path === paths.OFFLINE_ACCOUNTS || path === paths.PLAN_OFFLINE) dispatch(replace(paths.OVERVIEW));
//                 dispatch(hideModalType(ModalType.EnterOfflineModeDialog));
//             } else {
//                 dispatch(showModal(ModalType.LeaveOfflineModeModal));
//             }
//         })
//         .catch(() => dispatch(showToast({ message: translate('synchronisation.connot-go-online-toast') })));
//     };
// }

export function tryLeavingOfflineMode(): ThunkAction<void> {
    return (dispatch, getState) => {        
        if(connectionStatus == ConnectionStatus.Offline){
            dispatch(showToast({message: translate('synchronisation.connot-go-online-toast')}))
        } else {
            userIdFromState(getState()) ? queryUser(userIdFromState(getState()))
            .then(()=>{
                if (getState().offlineChanges.jobs.length === 0) {
                    const path = getState().routing.location.pathname;
                    if(path === paths.OFFLINE_ACCOUNTS || path === paths.PLAN_OFFLINE) dispatch(replace(paths.OVERVIEW));
                    dispatch(hideModalType(ModalType.EnterOfflineModeDialog));
                    } else {
                    dispatch(showModal(ModalType.LeaveOfflineModeModal));
                }
            })
            .catch(() => dispatch(showToast({ message: translate('synchronisation.connot-go-online-toast') }))) :
            dispatch(hideAllModals());
            // dispatch(showToast({message: translate('synchronisation.back-to-online-toast.caption')}))
        }
    }
}

export function finishSynchronisation() {
    return (dispatch: ThunkDispatch) => {
        dispatch(leaveOffline);
        dispatch(hideAllModals());
        dispatch(emptyAction(CLEAR_SYNC_JOBS));
    };
}
