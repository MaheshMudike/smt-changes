import { joinOptionals } from '../../utils/formatUtils';
import { IApiId } from '../api/coreApi';
import { EntityType, entityTypeToString } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { IListItemDetail } from '../list/IListItem';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { IFeedItem } from './IFeedItem';
import { IEventContact } from '../../models/events/Event';
//import { queryEntityByIdAndWrap } from '../../services/entities/getDetailByEntityType';
import { CalloutTaskStatus } from './CalloutTaskStatus';
import { IdentifiableWithTitleEntity } from './ISObject';
import IEventSource from '../events/IEventSource';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import Contact from '../accounts/Contact';

export function wrapIEventSource(accountApiForEvent: { Id: string, Name: string }) {
    return ({ ...normalizeNameAndId(accountApiForEvent), entityType: EntityType.Account });
}

export function title(entityType: EntityType, accountName: string) {
    return joinOptionals([entityTypeToString(entityType), accountName || null], ' - ', true);
}

abstract class SalesforceListItemDetail<T extends IApiId, TDetail> implements IListItemDetail<TDetail> {
    public value: T;

    constructor(entity: T) { this.value = entity; }
    
    get id() { return this.value && this.value.Id; }

    get isHighPriority(): boolean { return false; }

    get title() {
        return title(this.entityType, this.accountApiForTitle && this.accountApiForTitle.Name);
    }

    //get accountForEvent() { return this.accountApiForTitle ? wrapIEventSource(this.accountApiForTitle) : null; }
    abstract get accountApiForTitle(): { Id: string, Name: string }

    public getEntityName() { return entityTypeToString(this.entityType); }

    body(entityFieldsData: EntityFieldsData) {
        return this.bodyText(entityFieldsData);
    }

    get buttons() { return [] as React.ReactNode; }

    abstract bodyText(entityFieldsData: EntityFieldsData): string;
    public abstract entityType: EntityType;

    public abstract modalType: ModalType;

    abstract queryDetails: () => Promise<TDetail>;

    get descriptionForEvent() { return null as string; }
    get contactsForEventCreation() { return Promise.resolve([] as Contact[]); }
}

export abstract class SalesforceListItem<T extends IApiId> extends SalesforceListItemDetail<T, IdentifiableWithTitleEntity> {
}


export abstract class SalesforceListItemDescription<T extends IApiId & { Description: string }> extends SalesforceListItem<T> {    
    get description(): string { return this.value.Description; }
}

export abstract class SalesforceFeedItem<T extends IApiId, U extends IListItemDetail<IdentifiableWithTitleEntity & IEventSource> & { value: T }> implements IFeedItem {
    
    public value: T;

    constructor(public listItem: U) {
        this.value = listItem.value;

        this.calloutTaskStatus = CalloutTaskStatus.NonClosable;
        this.isRejected = false;
        this.svWillManage = false;
    }
    
    get modalType() { return ModalType.IncompleteEntityDialog; }

    get id() { return this.listItem.id; }
    get title() { return this.listItem.title; }
    get buttons() { return [] as React.ReactNode; }
    get entityType() { return this.listItem.entityType; }
    get isHighPriority() { return this.listItem.isHighPriority; }

    sortDate: string;

    //I think this is only for workorders, shows flag in the UI
    svWillManage: boolean;

    //this draws a small icon on the item
    isRejected: boolean;
    //used in RichListItem to show a close button for the callout
    calloutTaskStatus: CalloutTaskStatus;
    
    body(entityFieldsData: EntityFieldsData) {
        return this.listItem.body(entityFieldsData);
    }

    public queryDetails = this.listItem.queryDetails;
}
