import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, ILinkedFieldValue, IFieldValue } from '../../models/fields';
import Technician from '../../models/technicians/Technician';
import { formatDateTime, joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';
import { DetailsModalButtonListItem } from '../forms/DetailsModalButton';
import { EntityFieldsData } from './EntityFieldsData';
import { WorkOrderForField } from 'src/models/api/coreApi';
import { WorkOrderField, coordinatesFromAsset } from 'src/models/feed/Callout';
import { parseDateToTimestamp } from 'src/utils/parse';
import { FitterLocation } from 'src/models/api/mapApi';
import { formatLonLat } from 'src/models/map/LonLat';
import { EntityType } from 'src/constants/EntityType';

export function technicianDetailsField(t: Technician, openAudits: number, openDiscussions: number, fitterLocation: FitterLocation, gpsPermissionSet: boolean, entityFieldsData: EntityFieldsData): IFieldValue[] {
    const { locale, serviceResourceEnabled, activeInFSM } = entityFieldsData;

    const currentServiceOrder = serviceResourceEnabled ? t.lastCompletedWorkOrder : t.serviceAppointmentWorkOrder;

    const fitterLocationType = gpsPermissionSet && fitterLocation || FitterLocation.OFF;

    return [
        {
            icon: SvgIcon.Helmet,
            label: formatLabel('technician.field.fitter-number'),
            value: t.fitterNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Phone,
            label: formatLabel('technician.field.phone'),
            value: t.telMobile,
            kind: FieldValueType.Plain,
        },
        {
            hrefPrefix: 'mailto:',
            icon: SvgIcon.Email,
            label: formatLabel('technician.field.email'),
            value: t.email,
            kind: FieldValueType.Anchored
        },
        activeInFSM ? {
            icon: SvgIcon.PlanCopy2,
            label: formatLabel('technician.field.next-planned-absence'),
            value: joinOptionals([formatDateTime(t.nextAbsenceStarts, locale), formatDateTime(t.absentUntil, locale)], ' - ', true),
            kind: FieldValueType.Plain,
        } : null,
        workorderFieldButton(currentServiceOrder, 'technician.field.last-service-order', entityFieldsData),
        activeInFSM ? {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status'),
            value: t.technicianStatus,
            kind: FieldValueType.Plain,
        } : null,
        activeInFSM ? {
            icon: SvgIcon.Number,
            label: formatLabel('technician.field.work-center-number'),
            value: t.roundNumber,
            kind: FieldValueType.Plain,
        } : null,
        fitterLocationType === FitterLocation.SO && (activeInFSM || serviceResourceEnabled) ? 
        {
            icon: SvgIcon.Location,
            label: formatLabel('technician.field.workorder-location'),
            value: currentServiceOrder == null ? '' : formatLonLat(coordinatesFromAsset(currentServiceOrder.Asset, EntityType.Technician)),
            kind: FieldValueType.Plain,
        } : null,
        fitterLocationType === FitterLocation.GPS ? 
        {
            icon: SvgIcon.Location,
            label: formatLabel('technician.field.last-known-location', 'technician.field.date'),
            value: joinOptionals([
                formatLonLat(t.coordinates), formatDateTime(parseDateToTimestamp(t.lastKnownLocationDate), locale)
            ]),
            kind: FieldValueType.Plain,
        } : null,
        {
            icon: SvgIcon.Audit,
            label: formatLabel('technician.field.open-audits'),
            value: openAudits == null ? null : openAudits+'',
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Chat,
            label: formatLabel('technician.field.open-discussions'),
            value: openDiscussions == null ? null : openDiscussions+'',
            kind: FieldValueType.Plain,
        },
    ];

}

export function workorderFieldButton(workOrderForField: WorkOrderForField, translationKey: string, entityFieldsData: EntityFieldsData): ILinkedFieldValue {
    const workOrder = workOrderForField == null ? null : new WorkOrderField(workOrderForField, entityFieldsData);
    return {
        icon: SvgIcon.PlanCopy2,
        label: formatLabel(translationKey),//'technician.field.last-service-order'),
        linkWrapper: (props: React.WithChildren) => 
            //TODO check this
            //currentServiceOrder == null ? props.children : 
            
            //<CalloutButton callout={currentServiceOrder}>{props.children}</CalloutButton>,

            //<CalloutDetailsButton id={workOrder.id}>{props.children}</CalloutDetailsButton>,
            //workOrder == null ? props.children : 
            workOrder == null ? <div>{props.children}</div> : 
                <DetailsModalButtonListItem item={workOrder}>{props.children}</DetailsModalButtonListItem>,
        value: joinOptionals([
            workOrder == null ? null : workOrder.number,
            workOrder == null ? null : entityFieldsData.activeInFSM ? workOrder.status : workOrder.konectStatus,
        ]),
        kind: FieldValueType.Linked,
    }
}