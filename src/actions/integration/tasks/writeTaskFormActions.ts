import { debounce } from 'lodash';
import { Dispatch } from 'redux';

import { IApiNameAndId } from '../../../models/api/coreApi';
import { GetGlobalState } from '../../../models/globalState';
import { ILabelValue } from '../../../models/ILabelValue';
import { WriteTaskForm } from '../../../models/tasks/writeTaskState';
import translate from '../../../utils/translate';
import { asyncActionNames, payloadAction } from '../../actionUtils';
import { asyncHttpActionGeneric } from '../../http/httpActions';
import { goToPrevModal, showModal } from '../../modalActions';
import { showToast } from '../../toasts/toastActions';
import { reloadFeed } from '../feedActions';
import { insertTask, getJsforceCollectionActionMapping, queryUsersByNameSearch } from 'src/actions/http/jsforce';
import { IUserExtended } from 'src/models/api/userApi';
import { querySalesforceMetrics } from '../metricsActions';
import { ModalType } from '../../../constants/modalTypes';
import { ThunkDispatch, ThunkAction } from '../../thunks';
import { SalesforceId } from 'jsforce';
import { IdentifiableWithTitle } from 'src/models/feed/ISObject';

export const LOAD_USERS_FOR_TASK = asyncActionNames('LOAD_USERS_FOR_TASK');
export const SET_WRITE_TASK_FORM_FIELD = 'SET_WRITE_TASK_FORM_FIELD';
export const INIT_WRITE_TASK_FORM = 'INIT_WRITE_TASK_FORM';
export const SET_SEARCH_USERS_PHRASE = 'SET_SEARCH_USERS_PHRASE';

interface IWriteTaskFormChange<K extends keyof WriteTaskForm> {
    key: K;
    value: WriteTaskForm[K];
}

export type WriteTaskFormChange = IWriteTaskFormChange<keyof WriteTaskForm>;

export function setWriteTaskFormField<K extends keyof WriteTaskForm>(key: K, value: WriteTaskForm[K]) {
    return payloadAction(SET_WRITE_TASK_FORM_FIELD)({
        key,
        value,
    });
}

export const showTaskCreationDialog = (what?: IdentifiableWithTitle): ThunkAction<void> => 
    (dispatch, getState) => {
        dispatch(showModal(ModalType.WriteTaskModal));
        const { currentUser } = getState().authentication;
        dispatch(payloadAction(INIT_WRITE_TASK_FORM)({
            label: currentUser.fullName,
            value: currentUser.id,
        }));
        dispatch(setWriteTaskFormField('what', what));
    }

export const initWriteTaskForm = (): ThunkAction<void> =>
    (dispatch, getState) => {
        const { currentUser } = getState().authentication;
        const params: ILabelValue = {
            label: currentUser.fullName,
            value: currentUser.id,
        };
        dispatch(payloadAction(INIT_WRITE_TASK_FORM)(params));
    };

export const saveTaskFromForm = (): ThunkAction<void> =>
    (dispatch, getState) => {
        dispatch(setWriteTaskFormField('isWaitingForResponse', true));

        const form = getState().writeTask.form;
        const task = {
            Description: form.description,
            Priority: form.priority,
            ActivityDate: form.dueDate,
            Status: form.status,
            Subject: form.subject,
            OwnerId: form.selectedUser.value
        } as any;
        if(form.what != null) task.WhatId = form.what.id;

        insertTask(task)
        .then(() => {
            dispatch(goToPrevModal());
            dispatch(showToast({ message: translate('toast.create-task.success.message') }));
            dispatch(reloadFeed);
            dispatch(querySalesforceMetrics);
        })
        .catch(() => dispatch(showToast({ message: translate('toast.create-task.failure.message') })))
        .then(() => dispatch(setWriteTaskFormField('isWaitingForResponse', false)));
    };

const loadUsers = debounce((phrase: string, dispatch: ThunkDispatch, getState: GetGlobalState) => {    
    return dispatch(
        getJsforceCollectionActionMapping(() => queryUsersByNameSearch(phrase), 
            (user: IUserExtended) => ({ label: user.Name, value: user.Id }), LOAD_USERS_FOR_TASK
        )
    )
}, 500);

export const setSearchUsersPhrase = (phrase: string) =>
    (dispatch: Dispatch<any>, getState: GetGlobalState) => {
        dispatch(payloadAction(SET_SEARCH_USERS_PHRASE)(phrase));        
        if (phrase && phrase.trim().length > 0) {
            loadUsers(phrase, dispatch, getState);
        } else {
            loadUsers.cancel();
            dispatch(payloadAction(LOAD_USERS_FOR_TASK.success)([]));
        }
    };

export const setSelectedUser = (user: ILabelValue) => setWriteTaskFormField('selectedUser', user);
