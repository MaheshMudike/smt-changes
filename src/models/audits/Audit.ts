import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';

import { joinOptionals, formatDate } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { IAuditApi, IContactCore, IApiEvent } from '../api/coreApi';
import { IListItem } from '../list/IListItem';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import IEventSource from '../events/IEventSource';
import { EventType } from 'src/constants/EventType';
import Contact from '../accounts/Contact';
import { SalesforceFeedItem } from '../feed/SalesForceListItem';
import { IEventContact, eventContactFromApiContact } from '../events/Event';
import { queryEventsBase } from 'src/actions/http/jsforceBase';
import { conditions } from 'src/actions/http/jsforceMappings';
import * as fields from "../../actions/http/queryFields";
import { multiSOSL, retrieveSOSLResult } from 'src/actions/http/jsforceCore';


export class AuditListItemBase {
    constructor(public value: IAuditApi) {
    }

    get isHighPriority() {
        return false;
    }

    get status() {
        return this.value.status;
    }

    get plannedDate() {
        return this.value.date;
    }

    get employeeNumber() {
        return this.value.technician_id;
    }

    get technicianName() {
        return this.value.technician_name;
    }

    get templateName() {
        return this.value.template_name;
    }

    get id() {
        return this.value.audit_id+'';
    }

    get entityType() {
        return EntityType.Audit;
    }

    body(entityFieldsData: EntityFieldsData) {
        return joinOptionals([this.technicianName, formatDate(this.plannedDate, entityFieldsData.locale)]);
    }

    get title() { return ''; }
}

export class AuditListItem extends AuditListItemBase implements IListItem {
    constructor(public value: IAuditApi, private entityFieldsData: EntityFieldsData) {
        super(value);
    }

    get title() {
        return joinOptionals([translate('generic.entity-name.audit'), this.templateName], ' - ', true);
    }

    public async queryDetails() {
        //const contacts = await queryContactsBase<IContactCore>([conditions.Contact.names([this.value.technician_name])], fields.IContactCore);
        const soslQuery = "FIND {" + this.value.technician_name.replace(/ /g," AND ") + "} IN Name FIELDS RETURNING Contact("+ fields.IContactCore.join(",") +" WHERE RecordType.DeveloperName = 'Employee_Contact' ) ";
        const contactsSosl = await multiSOSL<IContactCore>(soslQuery).then(results => retrieveSOSLResult(results));

        const userId = this.entityFieldsData.userId;
        const events = await queryEventsBase([conditions.Event.createdBy(userId),conditions.Event.auditNumbers([this.value.audit_id.toString()])], fields.EventForAudit);

        return new Audit(this.value, contactsSosl.map(c => eventContactFromApiContact(c)), this.entityFieldsData, events);
    }

    get modalType() {
        return ModalType.AuditTaskModal as ModalType;
    }

}

export default class Audit extends AuditListItem implements IEventSource {
    constructor(public value: IAuditApi, public participants: IEventContact[], entityFieldsData: EntityFieldsData, private events: IApiEvent[]) {
        super(value, entityFieldsData);
    }

    get eventType() {
        return EventType.MeetingInternal;
    }

    get descriptionForEvent() {
        return this.value.template_name;
    }

    get whatForEvent() {
        //don't allow event creation if there is already an event
        return this.events.length > 0 ? undefined : null as any;
    }

    // not used in KFF audits yet
    accountsForEventCreation: null;

    get contactsForEventCreation() { return Promise.resolve([] as Contact[]); }
}

export class AuditFeedItem extends SalesforceFeedItem<IAuditApi, AuditListItem> {

    public technicianName: string;
    protected entityFieldsData: EntityFieldsData;

    constructor(audit: IAuditApi, entityFieldsData: EntityFieldsData) {
        super(new AuditListItem(audit, entityFieldsData));
        this.sortDate = this.value.date;
        this.technicianName = this.value.technician_name;
        this.entityFieldsData = entityFieldsData;
    }
}