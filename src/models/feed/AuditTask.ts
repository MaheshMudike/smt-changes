import { EntityType, entityTypeToString } from '../../constants/EntityType';
import { EventType } from '../../constants/EventType';
import { ModalType } from '../../constants/modalTypes';
import { joinOptionals } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { IAuditApi } from '../api/coreApi';
import { IListItem } from '../list/IListItem';
import { SalesforceFeedItem, SalesforceListItem } from './SalesForceListItem';
import IEventSource from '../events/IEventSource';
import { IEventContact } from '../../models/events/Event';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

class AuditListItem <T extends IAuditApi> extends SalesforceListItem<T> implements IListItem, IEventSource {
    constructor(t: T) {
        super(t);
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

    get entityType(): EntityType {
        return EntityType.Audit;
    }

    get sortDate() {
        return this.value.date;
    }

    get eventType() {
        return EventType.MeetingInternal;
    }

    // prepopulates Event description
    get descriptionForEvent() {
        return this.value.template_name;
    }

    // not used in KFF audits yet
    get whatForEvent() {
        return this;
    }

    // not used in KFF audits yet
    accountsForEventCreation: null;

    contacts: IEventContact[];

    body(entityFieldsData: EntityFieldsData) {
        return this.value.template_name;
    }

    get title() {
        return joinOptionals([translate('generic.entity-name.audit'), this.templateName], ' - ', true);
    }

    get modalType() {
        return ModalType.AuditTaskModal as ModalType;
    }

    get openItem() {
        return () => () => {};
    }

    bodyText() {
        return this.value.template_name;
    }

    public queryDetails = () => {
        return Promise.resolve(this);
    }

    get accountApiForTitle() {
        return { Id: '1234', Name: '12345' };
    }

    public getEntityName() { return entityTypeToString(this.entityType); }
}

class AuditFeedItem extends SalesforceFeedItem<IAuditApi, AuditListItem<IAuditApi>> {

    public technicianName: string;

    constructor(audit: IAuditApi) {
        super(new AuditListItem(audit));
        //this.isClosed = conditions.Opportunity.closed.isFullfilledBy(this.value);
        this.sortDate = this.value.date;
        this.technicianName = this.value.technician_name;
    }    
}