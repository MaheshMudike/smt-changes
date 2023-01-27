import { initialState } from '../../reducers/factories/asyncActionReducerFactory';
import { ILabelValue } from '../ILabelValue';
import { taskPriority } from './taskPriority';
import { taskStatus } from './taskStatus';
import { Moment } from 'moment';
import { IdentifiableWithTitle } from '../feed/ISObject';

export const initialWriteTaskState = {
    form: {
        description: '',
        dueDate: null as Moment,
        isWaitingForResponse: false,
        priority: taskPriority.NORMAL,
        selectedUser: null as ILabelValue,
        status: taskStatus.OPEN,
        subject: '',
        what: null as IdentifiableWithTitle
    },
    searchUsers: {
        searchPhrase: '',
        users: initialState
    },
};

export type WriteTaskState = typeof initialWriteTaskState;
export type WriteTaskForm = typeof initialWriteTaskState.form;
export type SearchUsersState = typeof initialWriteTaskState.searchUsers;

export function isValidTaskForm(form: WriteTaskForm) {
    return form.selectedUser != null && Boolean(form.subject);
}
