import * as _ from 'lodash';

import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { IApiEvent, IContactCore, IApiNameAndId } from '../../models/api/coreApi';
import { IEventContact } from '../../models/events/Event';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { joinOptionals } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { conditions, sobjectToEntityType } from 'src/actions/http/jsforceMappings';
import { SalesforceListItem } from '../feed/SalesForceListItem';
import { queryEventsBase } from '../../actions/http/jsforceBase';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import IEventSource from './IEventSource';
import { IListItem } from '../list/IListItem';
import INameAndId from '../INameAndId';
import Contact from '../accounts/Contact';

export interface IEventContact extends INameAndId {
    phone?: string;
}

export function eventContactFromApiContact(contact: IContactCore): IEventContact {
    return contact == null ? {
        id: null,
        name: null,
        phone: null,
    } : {
        id: contact.Id || null,
        name: contact.Name || null,
        phone: contact.Phone || null,
    };
}

export default class Event extends SalesforceListItem<IApiEvent> implements  IEventSource, IListItem {

    get id() {
        return this.value.Id;
    }

    get auditNumber() {
        return this.value.Audit_Number__c;
    }

    //this was used for the event creation, now the new event will be linked to the same object as the existing event
    /*
    get accountForEvent() {
        return {
            id: this.value.EquipmentAccountId,
            name: this.value.EquipmentAccountName,
            entityType: EntityType.Account
        } as INameAndIdAccount;
    }
    */

    get accountApiForTitle() {
        return null as IApiNameAndId;
    }

    get participants() {
        return this.contacts;
    }

    get contacts() {
        return this.value.contacts == null ? [] : this.value.contacts.map(eventContactFromApiContact);
    }

    get contactsForEventCreation() {
        return Promise.resolve(this.contacts.map(x => new Contact({ Name: x.name, Id: x.id })));
    }

    get primaryContact() {
        return this.value.Who == null ? null : _.find(this.contacts, c => c.id === this.value.Who.Id);
    }

    get invitees() {
        return this.value.invitees == null ? [] : this.value.invitees.map(eventContactFromApiContact);
    }

    get objectives() {
        return this.value.Objectives__c;
    }

    get location() {
        return this.value.Location;
    }

    get description() {
        return this.value.Description;
    }

    get descriptionForEvent() {
        return this.description;
    }

    set description(v: string) {
        this.value.Description = v;
    }

    get endDateTime() {
        return this.value.EndDateTime;
    }

    get whatForEvent() {
        return this.value.What == null ? null : { ...normalizeNameAndId(this.value.What), title: this.value.What.Name, entityType: sobjectToEntityType[this.value.What.Type] };
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.What);
    }

    get startDateTime() {
        return this.value.StartDateTime;
    }

    get visitType() {
        return this.value.Type;
    }

    get isHighPriority() {
        return false;
    }

    get isCompleted() {
        return conditions.Event.completed.isFullfilledBy(this.value);
    }

    public isOwnedBy(userId: string) {
        return this.value.OwnerId === userId;
    }

    get entityType() { return EntityType.Event; }
    
    bodyText() {
        return joinOptionals(this.contacts.map(t => t.name), ', ');
    }

    get title() {
        return this.value.Subject == null ? translate('generic.empty-subject') : this.value.Subject;
    }

    public getValue() {
        return this.value;
    }

    public completedEvent() {
        return new Event({ ...this.value, Event_Status__c: conditions.Event.completed.values[0] });
    }

    get modalType() {
        return ModalType.ReadEventModal;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Event(c));
        return queryEventsBase<IApiEvent>([conditions.SObject.id(this.id)]).then(evs => new Event(evs[0]));
    }
}
