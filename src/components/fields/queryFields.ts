import { SvgIcon } from '../../constants/SvgIcon';
import Query from '../../models/feed/Query';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';

const fields = (query: Query): IFieldValue[] => {
    return [
        {
            icon: SvgIcon.Number,
            label: formatLabel('generic.field.query-number'),
            value: query.queryNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Reason,
            label: formatLabel('generic.field.query-category', 'generic.field.query-reason'),
            value: joinOptionals([query.category, query.reason]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.contact-name'),
            value: joinOptionals([query.contact.name, query.contactPhone]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Parent,
            label: formatLabel('generic.field.query-parent'),
            value: joinOptionals([query.parentNumber, query.parentSubject], ' - ', true),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.subject'),
            value: query.subject,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: query.description,
            kind: FieldValueType.Plain,
        },
    ];
};

export default fields;
