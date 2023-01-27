import { SvgIcon } from '../../constants/SvgIcon';
import Complaint from '../../models/feed/Complaint';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';

const fields = (complaint: Complaint): IFieldValue[] => {
    return [
        {
            icon: SvgIcon.Number,
            label: formatLabel('generic.field.complaint-number'),
            value: complaint.complaintNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Reason,
            label: formatLabel('generic.field.complaint-origin', 'generic.field.complaint-reason'),
            value: joinOptionals([complaint.origin, complaint.reason]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.contact-name'),
            value: joinOptionals([complaint.contact.name, complaint.contactPhone]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status'),
            value: complaint.status,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.subject'),
            value: complaint.subject,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: complaint.description,
            kind: FieldValueType.Plain,
        },
    ];
};

export default fields;
