import { Dispatch } from 'redux';

import { ModalType } from '../constants/modalTypes';
import Contact from '../models/accounts/Contact';
import { ISelectContactsDialogState } from '../models/plan/ISelectContactsDialogState';
import { payloadAction } from './actionUtils';
import { showModal } from './modalActions';

export const SELECT_CONTACTS_INITIALIZE = 'SELECT_CONTACTS_INITIALIZE';
export const SELECT_CONTACTS_SET_CONTACT = 'SELECT_CONTACTS_SET_CONTACT';

export const initializeSelectContactsDialogAction = payloadAction<ISelectContactsDialogState>(SELECT_CONTACTS_INITIALIZE);
export const setContactOnSelectContactsDialog = payloadAction<Contact[]>(SELECT_CONTACTS_SET_CONTACT);

export function showSelectContactsDialog(state: ISelectContactsDialogState) {
    return (dispatch: Dispatch<any>) => {
        dispatch(initializeSelectContactsDialogAction(state));
        dispatch(showModal(ModalType.SelectContactsDialog));
    };
}
