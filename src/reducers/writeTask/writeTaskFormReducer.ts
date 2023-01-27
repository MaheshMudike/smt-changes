import { IPayloadAction } from '../../actions/actionUtils';
import { INIT_WRITE_TASK_FORM, SET_WRITE_TASK_FORM_FIELD, WriteTaskFormChange } from '../../actions/integration/tasks/writeTaskFormActions';
import { initialWriteTaskState, WriteTaskForm } from '../../models/tasks/writeTaskState';

export function writeTaskFormReducer(state = initialWriteTaskState.form, action: IPayloadAction<any>) {
    switch (action.type) {
        case SET_WRITE_TASK_FORM_FIELD:
            const change: WriteTaskFormChange = action.payload;
            return { ...state, [change.key]: change.value };
        case INIT_WRITE_TASK_FORM:
            return { ...initialWriteTaskState.form, selectedUser: action.payload }                
        default:
            return state;
    }
}
