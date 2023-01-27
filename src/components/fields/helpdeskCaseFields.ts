import HelpdeskCase from "../../models/feed/HelpdeskCase";
import { SvgIcon } from '../../constants/SvgIcon';
import { formatLabel, joinOptionals } from '../../utils/formatUtils';
import { FieldValueType, IFieldValue } from "../../models/fields";
import { formatDateTime } from '../../utils/formatUtils';
import { showAccountLinkWrapper } from "../forms/ShowAccountDetailsModalButton";
import { showEquipmentLinkWrapper } from "../forms/ShowEquipmentDetailsModalButton";
import { equipmentAddress } from "src/models/equipment/Equipment";
import { EntityFieldsData } from "./EntityFieldsData";

export default (helpdeskCase: HelpdeskCase, entityFieldsData: EntityFieldsData) => {
    const asset = helpdeskCase.value.Asset;
    const { locale } = entityFieldsData;
    return [
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Number,
            label: formatLabel('technical-helpdesk-case.number'),
            value: helpdeskCase.caseNumber,
        },
        ...(asset == null ? [] : [
        {
            kind: FieldValueType.Linked,
            icon: SvgIcon.Equipment,
            label: formatLabel('generic.field.equipment-number', 'generic.field.equipment-serial-number'),
            linkWrapper: showEquipmentLinkWrapper(asset.Id),
            value: joinOptionals([asset.Name, asset.Manufacturer_Serial_Number__c]),
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Location,
            label: formatLabel('equipment-details.field.site-address'),
            value: equipmentAddress(asset),
        },
        /*
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Number,
            label: formatLabel('equipment-details.field.manufacturer-serial-number'),
            value: asset.Manufacturer_Serial_Number__c,
        }
        */
        ]),
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Status,
            label: formatLabel('technical-helpdesk-case.sla-status'),
            value: helpdeskCase.slaStatus,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Person,
            label: formatLabel('generic.field.contact-name'),
            value: helpdeskCase.contact.name,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Person,
            label: formatLabel('technician-report.table.employeeNumber'),
            value: helpdeskCase.employee.name,
        },
        {
            kind: FieldValueType.Linked,
            icon: SvgIcon.Account,
            label: formatLabel('generic.field.account-name'),
            linkWrapper: showAccountLinkWrapper(helpdeskCase.account),
            value: helpdeskCase.account.name,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.subject'),
            value: helpdeskCase.subject,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status'),
            value: helpdeskCase.statusTranslated,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Priority,
            label: formatLabel('generic.field.priority'),
            value: helpdeskCase.priority,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.date-created'),
            value: formatDateTime(helpdeskCase.dateTimeCreated, locale),
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Person,
            label: formatLabel('generic.field.owner'),
            value: helpdeskCase.owner.Name,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: helpdeskCase.description,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.type'),
            value: helpdeskCase.type,
        }        
    ] as IFieldValue[];
};