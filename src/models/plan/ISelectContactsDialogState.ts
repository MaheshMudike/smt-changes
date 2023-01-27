import Contact from '../accounts/Contact';

export interface ISelectContactsDialogState {
    confirmSelection: (ics: Contact[]) => void;
    contacts: Contact[];
}
