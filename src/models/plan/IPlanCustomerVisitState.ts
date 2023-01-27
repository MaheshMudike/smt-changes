import * as moment from 'moment';
import * as _ from 'lodash';
import { EventType } from '../../constants/EventType';
import Contact from '../accounts/Contact';
import IEventSource from '../events/IEventSource';
import { AccountType } from '../accounts/AccountType';
import { IdentifiableWithTitleEntity } from '../feed/ISObject';
import { ILabelValue } from '../ILabelValue';
import { EventObjective } from 'src/components/modals/events/EventCreationDialog';

export interface IPlanCustomerVisitState {
    //accountOptions: IPlanCustomerAccountOptions;
    relatedAccounts: IAccountWithType[];//INameAndId[];
    form: IPlanCustomerVisitForm;
    sourceEntity?: IEventSource;
    //relatedContactsByAccountId: _.Dictionary<IContact[]>
}

export interface IAccountWithType {
    accountType: AccountType[];
    account: IdentifiableWithTitleEntity;
}

export interface IPlanCustomerVisitForm {
    id?: string;
    description?: string;
    startDate?: moment.Moment;
    endDate?: moment.Moment;
    participants?: Contact[];
    eventType?: EventType;
    objectives?: EventObjective;
    relatedTo?: IdentifiableWithTitleEntity;
    auditNumber?: number;
    isWaitingForResponse?: boolean;
    location?: string;
}