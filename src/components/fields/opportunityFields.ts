import { SvgIcon } from '../../constants/SvgIcon';
import Opportunity from '../../models/feed/Opportunity';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDate, formatLabel, formatDateTime, joinOptionals, formatCurrency } from '../../utils/formatUtils';
import { showEquipmentLinkWrapper } from '../forms/ShowEquipmentDetailsModalButton';
import { buttonLinkWrapper } from '../forms/SalesForceLink';
import { connection } from 'src/actions/http/jsforceCore';
import openLinkExternally from 'src/utils/openLinkExternally';
import { EntityFieldsData } from './EntityFieldsData';

const fields = (opportunity: Opportunity, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const locale = entityFieldsData.locale;
    return [
        {
            icon: SvgIcon.Number,
            label: formatLabel('generic.field.opportunity-number'),
            value: opportunity.opportunityNumber,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Equipment,
            label: formatLabel('generic.field.equipment-number', 'generic.field.equipment-address'),
            linkWrapper: showEquipmentLinkWrapper(opportunity.equipmentId),
            value: joinOptionals([opportunity.equipmentNumber, opportunity.equipmentAddress]),
            kind: FieldValueType.Linked,
        },
        {
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.tender-numbers'),
            linkWrapper: buttonLinkWrapper(() => openLinkExternally(`${ connection.instanceUrl }/lightning/r/${ opportunity.id }/related/Users__r/view`)),
            value: opportunity.tenderNames && joinOptionals(opportunity.tenderNames),
            kind: FieldValueType.Linked,
        },
        {
            icon: SvgIcon.Money,
            label: formatLabel('generic.field.amount'),
            value: formatCurrency(opportunity.amount, opportunity.defaultcurrencyIsoCode, locale),
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Business,
            label: formatLabel('generic.field.business-type'),
            value: opportunity.businessType,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.opportunity-name'),
            value: opportunity.name,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.SegmentShape,
            label: formatLabel('opportunity.field.market-segment'),
            value: opportunity.marketSegment,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Info,
            label: formatLabel('opportunity.field.stage-name'),
            value: opportunity.stageName,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.User,
            label: formatLabel('opportunity.field.owner'),
            value: opportunity.ownerName,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('opportunity.field.close-date'),
            value: formatDate(opportunity.closeDate, locale),
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: opportunity.description,
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Info,
            label: formatLabel('opportunity.field.probability'),
            value: opportunity.probability+' %',
            kind: FieldValueType.Plain
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.created-date'),
            value: formatDateTime(opportunity.createdDate, locale),
            kind: FieldValueType.Plain
        },
    ];
};

export default fields;
