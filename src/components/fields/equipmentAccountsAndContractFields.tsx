import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDate, formatLabel } from '../../utils/formatUtils';
import { showAccountLinkWrapper } from '../forms/ShowAccountDetailsModalButton';
import { salesForceLinkWrapper } from '../forms/SalesForceLink';
import Equipment from 'src/models/equipment/Equipment';

export default function fields(e: Equipment, locale: string): IFieldValue[] {
    const contract = e.contract;
    return [
        {
            icon: SvgIcon.Account,
            label: formatLabel('equipment-details.field.sold-to-account'),
            linkWrapper: showAccountLinkWrapper(e.soldToAccount),
            value: e.soldToAccount.name,
            kind: FieldValueType.Linked,
        }, {
            icon: SvgIcon.Account,
            label: formatLabel('equipment-details.field.decided-by-account'),
            linkWrapper: showAccountLinkWrapper(e.decidedByAccount),
            value: e.decidedByAccount.name,
            kind: FieldValueType.Linked,
        }, {
            icon: SvgIcon.Account,
            label: formatLabel('equipment-details.field.billed-to-account'),
            linkWrapper: showAccountLinkWrapper(e.billedToAccount),
            value: e.billedToAccount.name,
            kind: FieldValueType.Linked,
        }, 
        // {
        //     icon: SvgIcon.Contract,
        //     label: formatLabel('equipment-details.field.service-contract-characteristics'),
        //     linkWrapper: salesForceLinkWrapper(contract.fsmServiceContractCharacteristic),
        //     value: contract.fsmServiceContractCharacteristic.name,
        //     kind: FieldValueType.Linked,
        // },
         {
            icon: SvgIcon.Number,
            label: formatLabel('contract.field.number'),
            value: contract.number,
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.Contract,
            label: formatLabel('contract.field.type'),
            value: contract.contractType,
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.Date,
            label: formatLabel('contract.field.service-time'),
            value: contract.serviceHours,
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.StartDate,
            label: formatLabel('contract.field.start-date'),
            value: formatDate(contract.startDate, locale),
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.EndDate,
            label: formatLabel('contract.field.end-date'),
            value: formatDate(contract.endDate, locale),
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.Date,
            label: formatLabel('contract.field.response-time'),
            value: contract.responseTime,
            kind: FieldValueType.Plain,
        }, {
            icon: SvgIcon.Date,
            label: formatLabel('contract.field.response-time-out-of-hours'),
            value: contract.responseTimeOutOfHours,
            kind: FieldValueType.Plain,
        },
    ];
};
