import { EntityType } from '../../constants/EntityType';
import { IAccountWithType } from '../plan/IPlanCustomerVisitState';
import { IdentifiableWithTitleEntity, Identifiable } from '../feed/ISObject';
import Contact from '../accounts/Contact';
import { EventObjective } from 'src/components/modals/events/EventCreationDialog';
import { EventType } from 'src/constants/EventType';
import { IEventContact } from './Event';

interface IEventSource extends Identifiable{
    accountsForEventCreation: Promise<IAccountWithType[]>;
    contactsForEventCreation: Promise<Contact[]>;
    participants?: IEventContact[];
    taskType?: string;
    readonly whatForEvent: IdentifiableWithTitleEntity;
    descriptionForEvent: string;
    entityType: EntityType;

    readonly eventType?: EventType;
    readonly eventObjective?: EventObjective;
}

export default IEventSource;