import * as moment from 'moment';

import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { ITask as IApiTask, ITaskExtended, ITaskListItem, IDetailedContact } from '../api/coreApi';
import { SalesforceListItemDescription, SalesforceFeedItem } from './SalesForceListItem';
import { conditions, sobjectToEntityType } from '../../actions/http/jsforceMappings';
import { queryTaskContacts } from '../../actions/http/jsforce';
import { queryTaskBase, queryContactsBase } from '../../actions/http/jsforceBase';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { formatDate } from 'src/utils/formatUtils';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import Contact from '../accounts/Contact';
import { EventType } from 'src/constants/EventType';
import { EventObjective } from 'src/components/modals/events/EventCreationDialog';

export function overdue(task: IApiTask) {
    return task.ActivityDate == null ? false : conditions.Task.open.isFullfilledBy(task) && dateInThePast(task.ActivityDate);
}

export function dateInThePast(date: string) {
    return date != null && moment(date).diff(moment()) < 0;
}
/*
export function dateInThePast(date: string) {
    return moment(date).isBefore(moment(), 'day');   
}
*/

export class TaskListItem<T extends ITaskListItem> extends SalesforceListItemDescription<T> {

    bodyText() {
        return this.value.Subject;
    }

    get accountApiForTitle() {
        return this.value.Account;
    }

    get entityType(): EntityType {
        return EntityType.Task;
    }

    get isHighPriority(): boolean {
        return conditions.Task.highPriority.isFullfilledBy(this.value);
    }

    get modalType() {
        return ModalType.TaskModal;
    }
    
    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Task(c));
        return queryTaskBase([conditions.SObject.id(this.id)]).then(tasks => queryTaskContacts(tasks)).then(cs => new Task(cs[0]))
    }
}

export class TaskFeedItem<T extends ITaskExtended> extends SalesforceFeedItem<T, TaskListItem<T>> {
    
    constructor(task: T, private entityFieldsData: EntityFieldsData) {
        super(new TaskListItem(task));
        //this.bodyDescription = this.value.Description;
        this.sortDate = this.value.ActivityDate;
        this.svWillManage = conditions.Task.owner(entityFieldsData.userId).isFullfilledBy(this.value);
    }

    get isClosed() {
        return conditions.Task.closed.isFullfilledBy(this.value);
    }

    body(entityFieldsData: EntityFieldsData) {
        return formatDate(this.value.ActivityDate, entityFieldsData.locale) + " " + this.value.Subject;
    }

}


export default class Task extends TaskListItem<ITaskExtended> {
    
    get whatForEvent() {
        return this.value.What && { ...normalizeNameAndId(this.value.What), title: this.value.What.Name, entityType: sobjectToEntityType[this.value.What.Type] };
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.What);
    }

    get contact() {
        //return this.value.Owner;
        return this.value.Who == null ? {
            id: null,
            name: null,
            phone: null,
        } : {
            id: this.value.Who.Id || null,
            name: this.value.Who.Name || null,
            phone: this.value.Who.Phone || null,
        };
    }

    get dueDate(): string {
        return this.value.ActivityDate;
    }

    get priority(): string {
        return this.value.Priority;
    }

    get status(): string {
        return this.value.Status;
    }

    get subject(): string {
        return this.value.Subject;
    }

    get isOverdue() {
        return overdue(this.value);
    }
    
    get descriptionForEvent() {
        return this.value.Description;
    }

    get contactsForEventCreation() {
        return queryContactsBase<IDetailedContact>([conditions.Contact.ids([this.contact.id])]).then(ts => ts.map(t => new Contact(t)));
    }

    get taskType() {
        return this.value && this.value.Type
    }

    get eventType() {
        return EventType.CustomerVisit;
    }

    get eventObjective() {
        return EventObjective.CXOnboardingVisit;
    }
}
