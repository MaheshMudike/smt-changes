import * as _ from 'lodash';

import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { joinOptionals } from '../../utils/formatUtils';
import { IApiAccount, IApiAccountListItem } from '../api/coreApi';
import { SalesforceListItem, wrapIEventSource } from '../feed/SalesForceListItem';
import { queryAccountsBase } from '../../actions/http/jsforceBase';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryContactsForAccountsByAccountContactRelationship } from '../../actions/http/jsforce';
import Contact from './Contact';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import IEventSource from '../events/IEventSource';
import { IDialogListItem } from '../list/IListItem';

export const queryAccountDetail = (id: string) => 
    queryAccountsBase([conditions.SObject.id(id)])
    .then(accounts => 
        queryContactsForAccountsByAccountContactRelationship([accounts[0].Id])
        .then(cs => {
            const contacts = cs.map(c => new Contact(c));
            //.then(c => new Account(c[0]))
            return new Account(accounts[0], contacts);
        })
    )
    
export class AccountListItem<T extends IApiAccountListItem> extends SalesforceListItem<T> {

    get entityType() {
        return EntityType.Account;
    }

    get id() {
        return this.value.Id;
    }
    
    get accountNumber(): string {
        return this.value.AccountNumber;
    }

    bodyText() {
        return this.accountNumber;
    }
    
    get name(): string {
        return this.value.Name;
    }

    get title() {
        return this.name;
    }

    get isHighPriority(): boolean {
        return false;
    }

    get accountApiForTitle() {
        return this.value;//null as { Id: string; Name: string };
    }

    get modalType(): ModalType {
        return ModalType.AccountModal;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Account(c));
        return queryAccountDetail(this.id);
    }
}

class Account extends AccountListItem<IApiAccount> implements IDialogListItem, IEventSource {

    constructor(account: IApiAccount, public contacts: Contact[]) {
        super(account);
    }

    get primaryContact(): Contact {
        const apiContact = _.find(this.value.contacts, c => c.Primary_Contact__c);
        return apiContact ? new Contact(apiContact) : null;
    }

    get address() {
        return joinOptionals([this.street, this.postalCode, this.city], ' ', true);
    }

    get street(): string {
        return this.value.Street_1__c;
    }

    get city(): string {
        return this.value.KONE_City__c;
    }

    get postalCode(): string {
        return this.value.KONE_Zip_Postal_Code__c;
    }

    get phone() {
        return this.value.Phone;
    }

    get whatForEvent() {
        return this;
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value);
    }
}

export default Account;
