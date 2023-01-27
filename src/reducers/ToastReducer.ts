import { without } from 'lodash';

import { IPayloadAction } from '../actions/actionUtils';
import { HIDE_TOAST, SHOW_TOAST } from '../actions/toasts/toastActions';
import { Toast } from '../models/toasts';

const initialState: Toast[] = [];

export default function toastReducer(state = initialState, action: IPayloadAction<Toast>) {
    switch (action.type) {
        case SHOW_TOAST:
            return state.concat(action.payload);
        case HIDE_TOAST:
            return without(state, action.payload);
        default:
            return state;
    }
}
