import * as _ from 'lodash';

import translate from '../../../utils/translate';
import INameAndId from '../../INameAndId';

const eventTypes = [
    {
        id: 'Customer Visit',
        get name() {
            return translate('event-type.customer-visit');
        },
    },
    {
        id: 'Phone Visit',
        get name() {
            return translate('event-type.phone-visit');
        },
    },
] as INameAndId[];

export default eventTypes;

export function eventTypeToString(id: string) {
    const event = _.find(eventTypes, t => t.id === id);
    return event == null ? null : event.name;    
}
