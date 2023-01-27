import * as _ from 'lodash';

import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { IdentifiableTitleBodyHighPriority, IDialogListItem } from '../list/IListItem';
import { SalesforceListItem, wrapIEventSource } from '../feed/SalesForceListItem';
import { joinOptionals } from '../../utils/formatUtils';
import { IDetailedContact, IContactListItem } from '../api/coreApi';
import { queryContactsBase } from '../../actions/http/jsforceBase';
import { conditions } from '../../actions/http/jsforceMappings';
import * as coreApi from '../../models/api/coreApi';
import IEventSource from '../events/IEventSource';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { IGlobalState } from '../globalState';

export class ContactListItem<T extends IContactListItem> extends SalesforceListItem<T> implements IdentifiableTitleBodyHighPriority {

    constructor(entity: T) { super(entity) }

    get id() {
        return this.value.Id;
    }
    
    get email() {
        return this.value.Email;
    }

    get phone() {
        return this.value.Phone;
    }

    bodyText() {
        return joinOptionals([this.email, this.phone]);
    }
    
    get fullName() {
        return joinOptionals([this.value.FirstName, this.value.LastName], ' ', true) || this.value.Name;
    }

    get title() {
        return this.fullName;
    }

    get isHighPriority(): boolean {
        return false;
    }

    get entityType() {
        return EntityType.Contact;
    }

    get modalType() {
        return ModalType.ShowContactModal;
    }

    get accountApiForTitle() {
        return this.value.Account;// as IApiNameAndId;
    }
    
    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Contact(c));
        return queryContactsBase<coreApi.IDetailedContact>([conditions.Contact.ids([this.id])]).then(ts => new Contact(ts[0]));
    }
    
}

export default class Contact extends ContactListItem<IDetailedContact> implements IDialogListItem, IEventSource {
    
    get mobilePhone() {
        return this.value.MobilePhone;
    }

    get fax() {
        return this.value.Fax;
    }

    get position() {
        return this.value.Function__c;
    }

    get titleAddress() {
        return this.value.Title;
    }

    get isPrimaryContact() {
        return this.value.Primary_Contact__c;
    }

    get firstName() {
        return this.value.FirstName;
    }

    get lastName() {
        return this.value.LastName;
    }

    get accountId() {
        return this.value.AccountId;
    }

    public setPhone(phone: string) {
        this.value.Phone = phone;
    }

    public setMobilePhone(phone: string) {
        this.value.MobilePhone = phone;
    }

    public setEmail(email: string) {
        this.value.Email = email;
    }

    public setFax(fax: string) {
        this.value.Fax = fax;
    }

    public setFirstName(name: string) {
        this.value.FirstName = name;
    }

    public setLastName(name: string) {
        this.value.LastName = name;
    }

    public getValue() {
        return this.value;
    }

    get name() {
        return this.fullName;
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account);
    }

    get whatForEvent() {
        //I think this makes more sense, linking the event to the contact
        return this;
    }
   
    public clone() {
        return new Contact(_.clone(this.getValue()));
    }
}

export class ContactWithRole extends Contact {
   
    constructor(c: IDetailedContact, public role: string) {
        super(c);
    }

}