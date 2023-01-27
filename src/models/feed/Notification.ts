import * as moment from 'moment';

import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { ITask as IApiTask, SMT_Notification__c } from '../api/coreApi';
import { SalesforceFeedItem, SalesforceListItem } from './SalesForceListItem';
import { conditions } from '../../actions/http/jsforceMappings'
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import translateNotificationMessage from 'src/config/translateNotificationMessage';

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

export class NotificationListItem<T extends SMT_Notification__c> extends SalesforceListItem<T> {

    bodyText() {
        return this.value.Description__c;
    }

    get accountApiForTitle() {
        return null as any;
    }

    get entityType(): EntityType {
        return EntityType.Notification;
    }

    get isHighPriority(): boolean {
        return false
    }

    get modalType() {
        return null as any;
    }

    get title() {
        return translateNotificationMessage(this.value);
    }

    public queryDetails = () => {
        return Promise.resolve(this) as any;
    }
}

export class NotificationFeedItem<T extends SMT_Notification__c> extends SalesforceFeedItem<T, NotificationListItem<T>> {

    constructor(notification: T, private entityFieldsData: EntityFieldsData, public read: boolean) {
        super(new NotificationListItem(notification));
        this.sortDate = this.value.CreatedDate;
    }

}



