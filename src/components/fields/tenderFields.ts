import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, IFieldValue } from '../../models/fields';
import Tender from '../../models/tenders/Tender';
import { formatDateTime, formatCurrency } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';
import { showActionLinkWrapper } from '../forms/ShowAccountDetailsModalButton';

export default function tenderFields(t: Tender, downloadAndShowOpportunity: (id: string, title: string) => void, locale: string): IFieldValue[] {
    return [
        
        {
            icon: SvgIcon.Related,
            label: formatLabel('generic.field.opportunity-name'),
            value: t.opportunityName,
            kind: FieldValueType.Linked,
            linkWrapper: showActionLinkWrapper(() => downloadAndShowOpportunity(t.opportunityId, t.opportunityAccountName)),
        },
        
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: t.description,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.stage'),
            value: t.stage,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Account,
            label: formatLabel('generic.field.customer-account'),
            value: t.account.name,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.date-created'),
            value: formatDateTime(t.createDate, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Money,
            label: formatLabel('generic.field.total-sales-price'),
            value: formatCurrency(t.totalSalesPrice, t.currencyIsoCode, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Business,
            label: formatLabel('generic.field.owner'),
            value: t.owner,
            kind: FieldValueType.Plain,
        },
    ];
}
