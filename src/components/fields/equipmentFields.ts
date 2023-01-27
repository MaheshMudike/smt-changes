import { EquipmentStatusFilter} from '../../constants/equipmentStatus';
import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDateTime, formatLabel, joinOptionals, formatCurrency, formatNumber } from '../../utils/formatUtils';
import { workorderFieldButton } from './technicianDetailsField';
import Equipment, { UnitOfMeasure } from 'src/models/equipment/Equipment';
import { EntityFieldsData } from './EntityFieldsData';

const fields = (equipment: Equipment, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const { unitOfMeasure, locale, activeInFSM } = entityFieldsData;
    const uom = unitOfMeasure;
    return [
        {
            icon: SvgIcon.Equipment,
            //this says "Equipment description" in the traslation
            label: formatLabel('equipment-details.field.equipment-id'),
            value: equipment.customerAssetName,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Reason,
            label: formatLabel('equipment-details.field.equipment-type'),
            value: equipment.type,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Location,
            label: formatLabel('equipment-details.field.site-address'),
            value: equipment.siteAddress,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Account,
            label: formatLabel('generic.field.manufacturer', 'equipment-details.field.technical-platform'),
            value: joinOptionals([equipment.manufacturer, equipment.technicalPlatform]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Number,
            label: formatLabel('equipment-details.field.manufacturer-serial-number'),
            value: equipment.serialNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.WeightShape,
            label: 
                uom === UnitOfMeasure.Metric ? 
                    formatLabel('equipment-details.field.rated-speed', 'equipment-details.field.rated-load') :
                    formatLabel('equipment-details.field.rated-speed-imperial', 'equipment-details.field.rated-load-imperial'),
            value: joinOptionals(
                (uom === UnitOfMeasure.Metric ? 
                    [equipment.ratedSpeed, equipment.ratedLoad] : 
                    [equipment.ratedSpeedImperial, equipment.ratedLoadImperial]).map(n => formatNumber(n, locale))
            ),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Stairs,
            label: formatLabel('equipment-details.field.number-of-floors'),
            value: formatNumber(equipment.numberOfFloors, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.SegmentShape,
            label: formatLabel('equipment-details.field.market-segment'),
            value: equipment.marketSegment,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.PlanCopy2,
            label: formatLabel('generic.field.construction-year'),
            value: (equipment.year || '').toString(),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('equipment-details.field.status'),
            value: equipment.status,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Account,
            label: formatLabel('equipment-details.field.main-workcenter'),
            value: joinOptionals([equipment.mainWorkCenterName, equipment.mainWorkCenterDescription]),
            kind: FieldValueType.Plain,
        },
        workorderFieldButton(equipment.nextMbm, 'equipment.field.next-mbm', entityFieldsData),
        ...(equipment.statusApi === EquipmentStatusFilter.OUT_OF_ORDER ? outOfOrderFields(equipment, locale, entityFieldsData) : normalOperationFields(equipment, locale))
    ];
    
};

function normalOperationFields(equipment: Equipment, locale: string): IFieldValue[] {
    return [
        {
            icon: SvgIcon.StartDate,
            label: formatLabel('equipment-details.field.back-in-service'),
            value: formatDateTime(equipment.startDate, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Visittype,
            label: formatLabel('equipment-details.field.started-by'),
            value: equipment.lastEquipmentStartedOrder && equipment.lastEquipmentStartedOrder.completedByName,
            kind: FieldValueType.Plain,
        }
    ];
}

function outOfOrderFields(equipment: Equipment, locale: string, entityFieldsData: EntityFieldsData): IFieldValue[] {
    return [
        workorderFieldButton(equipment.lastServiceOrder, 'technician.field.last-service-order', entityFieldsData),
        {
            icon: SvgIcon.Description,
            label: formatLabel('equipment-details.field.stop-reason'),
            value: equipment.stopReason,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('equipment-details.field.stop-reason-description'),
            value: equipment.lastEquipmentStoppedOrder && equipment.lastEquipmentStoppedOrder.reasonCode,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.EndDate,
            label: formatLabel('equipment-details.field.stop-date'),
            value: formatDateTime(equipment.stopDate, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Visittype,
            label: formatLabel('equipment-details.field.stopped-by'),
            value: equipment.lastEquipmentStoppedOrder && equipment.lastEquipmentStoppedOrder.completedByName,
            kind: FieldValueType.Plain,
        },
        
    ];
}

export default fields;
