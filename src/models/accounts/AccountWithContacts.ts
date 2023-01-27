import Contact from './Contact';
import Account from './Account';
import { IDialogListItem } from '../list/IListItem';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

export class AccountWithContacts implements IDialogListItem {

    constructor(public account: Account, public contacts: Contact[]) {
    }

    get isHighPriority() {
        return this.account.isHighPriority;
    }

    get entityType() {
        return this.account.entityType;
    }

    get id() {
        return this.account.id;
    }

    body(entityFieldsData: EntityFieldsData) {
        return this.account.body(entityFieldsData);
    }

    get title() {
        return this.account.title;
    }
    
    get modalType() {
        return this.account.modalType;
    }

    public queryDetails() {
        return this.account.queryDetails();
    }

}
