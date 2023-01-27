import * as moment from 'moment';

import { SvgIcon } from '../../constants/SvgIcon';
import { IEventContact } from '../../models/events/Event';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatLabel, formatRichDateTime, formatSameDayTimeRange, joinOptionals } from '../../utils/formatUtils';
import whatField from './relatedToField';
import * as _ from 'lodash';
import Event from 'src/models/events/Event';
import { EntityFieldsData } from './EntityFieldsData';
import { faBullseye, faMapMarkerAlt, faUsers } from '@fortawesome/free-solid-svg-icons';

export function formatContactNames(contacts: IEventContact[]) {
    return joinOptionals((contacts || []).map(t => t.name).filter(_.identity), ', ');
}

export function formatContactNamesAndPhones(contacts: IEventContact[]) {
    return joinOptionals((contacts || []).map(t => t.name ? joinOptionals([t.name, t.phone]) : null).filter(_.identity), ', ');
}

const fields = (event: Event, entityFieldsData: EntityFieldsData): IFieldValue[] => [
    whatField(event.whatForEvent),
    {
        icon: SvgIcon.Contacts,
        label: formatLabel('generic.field.contact-name'),
        value: formatContactNamesAndPhones(event.contacts),
        kind: FieldValueType.Plain,
    },
    {
        //icon: SvgIcon.Adduser,
        faIcon: faUsers,
        label: formatLabel('generic.field.invitees'),
        value: formatContactNames(event.invitees),
        kind: FieldValueType.Plain,
    },
    {
        //icon: SvgIcon.Info,
        faIcon: faBullseye,
        label: formatLabel('generic.field.objectives'),
        value: event.objectives,
        kind: FieldValueType.Plain,
    },
    {
        //icon: SvgIcon.Location,
        faIcon: faMapMarkerAlt,
        label: formatLabel('generic.field.location'),
        value: event.location,
        kind: FieldValueType.Plain,
    },
    ...dateFields(event, entityFieldsData.locale),
    {
        icon: SvgIcon.Description,
        label: formatLabel('generic.field.description'),
        multiLine: true,
        value: event.description,
        kind: FieldValueType.Plain,
    }
];


function dateFields(event: Event, locale: string): IFieldValue[] {
    const isSameDay = moment(event.startDateTime).isSame(event.endDateTime, 'day');
    if (isSameDay) {
        return [{
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.date'),
            value: formatSameDayTimeRange(event.startDateTime, event.endDateTime, locale),
            kind: FieldValueType.Plain,
        }];
    } else {
        return [
            {
                icon: SvgIcon.StartDate,
                label: formatLabel('generic.field.start-time'),
                value: formatRichDateTime(event.startDateTime, locale),
                kind: FieldValueType.Plain,
            },
            {
                icon: SvgIcon.EndDate,
                label: formatLabel('generic.field.end-time'),
                value: formatRichDateTime(event.endDateTime, locale),
                kind: FieldValueType.Plain,
            },
        ];
    }
}
        

export default fields;
