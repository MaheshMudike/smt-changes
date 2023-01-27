import { IPayloadAction } from '../actions/actionUtils';
import { SELECT_CONTACTS_INITIALIZE, SELECT_CONTACTS_SET_CONTACT } from '../actions/selectContactsDialogActions';
import { ISelectContactsDialogState } from '../models/plan/ISelectContactsDialogState';
import * as _ from 'lodash';

const initialSelectContactsDialogState: ISelectContactsDialogState = {
    confirmSelection: _.noop,
    contacts: [],
};

export function selectContactsDialogReducer(state: ISelectContactsDialogState = initialSelectContactsDialogState, action: IPayloadAction<any>) {
    switch (action.type) {
        case SELECT_CONTACTS_INITIALIZE:
            return action.payload;
        case SELECT_CONTACTS_SET_CONTACT:
            return { ...state, contacts: action.payload };
        default:
            return state;
    }
}
