import translate from "src/utils/translate";
import { kebabCase } from "lodash";

export enum EventType {
    CustomerVisit = 'Customer Visit',
    CustomerEvent = 'Customer Event',
    ProspectingVisit = 'Prospecting Visit (Cold Call)',
    PhoneVisit = 'Phone Visit',
    MeetingInternal = 'Meeting (Internal)',
}

export function translateEventType(eventType: EventType) {
    return translate(`event-type.${ kebabCase(eventType) }`);
}