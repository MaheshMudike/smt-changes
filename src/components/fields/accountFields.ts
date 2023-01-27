import { SvgIcon } from '../../constants/SvgIcon';
import Account from '../../models/accounts/Account';
import Contact from '../../models/accounts/Contact';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';

const fields = (account: Account, primaryContact: Contact): IFieldValue[] => {
    return [
        {
            icon: SvgIcon.Number,
            label: formatLabel('generic.field.account-number'),
            value: account.accountNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Location,
            label: formatLabel('generic.field.address'),
            value: joinOptionals([account.street, joinOptionals([account.postalCode, account.city ], ' ', true)], ', ', true),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.primary-contact'),
            value: !primaryContact ? null : joinOptionals([primaryContact.fullName, primaryContact.phone]),
            kind: FieldValueType.Plain,
        },
    ];
};

export default fields;
