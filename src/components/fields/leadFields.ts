import { SvgIcon } from '../../constants/SvgIcon';
import Lead from '../../models/feed/Lead';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDateTime, formatLabel, joinOptionals } from '../../utils/formatUtils';
import { EntityFieldsData } from './EntityFieldsData';

const fields = (lead: Lead, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    return [
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.customer-name', 'generic.field.company', 'generic.field.phone'),
            value: joinOptionals([lead.name, lead.company, lead.phone]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            multiLine: true,
            value: lead.description,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status'),
            value: lead.status,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Business,
            label: formatLabel('generic.field.business-type'),
            value: lead.businessType,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.lead-product-service-interest'),
            multiLine: true,
            value: lead.productServiceInterests,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Reason,
            label: formatLabel('generic.field.lead-source'),
            value: lead.leadSource,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.lead-created-by-and-date'),
            value: joinOptionals([lead.createdBy, formatDateTime(lead.createdDate, entityFieldsData.locale)]),
            kind: FieldValueType.Plain,
        },
    ];
};

export default fields;
