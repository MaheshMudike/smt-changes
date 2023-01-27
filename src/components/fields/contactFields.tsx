import { SvgIcon } from '../../constants/SvgIcon';
import Contact from '../../models/accounts/Contact';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatLabel } from '../../utils/formatUtils';

export default function contactFields(c: Contact): IFieldValue[] {
    return [
        {
            hrefPrefix: 'tel:',
            icon: SvgIcon.Phone,
            label: formatLabel('generic.field.phone'),
            value: c.phone,
            kind: FieldValueType.Anchored,
        },
        {
            hrefPrefix: 'tel:',
            icon: SvgIcon.Smartphone,
            label: formatLabel('generic.field.mobile-phone'),
            value: c.mobilePhone,
            kind: FieldValueType.Anchored,
        },
        {
            hrefPrefix: 'mailto:',
            icon: SvgIcon.Email,
            label: formatLabel('generic.field.email'),
            value: c.email,
            kind: FieldValueType.Anchored,
        },
        {
            icon: SvgIcon.Helmet,
            label: formatLabel('generic.field.title'),
            value: c.titleAddress,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.type'),
            value: c.position,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Primary,
            label: formatLabel('generic.field.primary-contact'),
            value: c.isPrimaryContact ? formatLabel('generic.answer.yes') : formatLabel('generic.answer.no'),
            kind: FieldValueType.Plain,
        },
    ];
}
