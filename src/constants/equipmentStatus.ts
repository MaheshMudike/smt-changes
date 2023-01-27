import translate from '../utils/translate';

export enum EquipmentStatusFilter {
    //this value doesn't exist in Salesforce, '', null and undefined means normal operation
    NORMAL_OPERATION = "Normal-Operation",
    OUT_OF_ORDER = "Out-Of-Order",
    BACK_IN_ORDER = "Back-In-Order"
}

//this is to map emtpy string, null and undefined to EquipmentStatusFilter
export const fsmEquipmentConditionToStatusMapping = {
    'Back-In-Order': EquipmentStatusFilter.BACK_IN_ORDER,
    '': EquipmentStatusFilter.NORMAL_OPERATION,
    null: EquipmentStatusFilter.NORMAL_OPERATION,
    //for some reason the SOSL search returns undefined when FSM_Equipment_Condition__c is empty
    undefined: EquipmentStatusFilter.NORMAL_OPERATION,
    'Out-Of-Order': EquipmentStatusFilter.OUT_OF_ORDER,
}

export const equipmentStatusTranslationsKeys: { [index: string]: string } = {
    [EquipmentStatusFilter.NORMAL_OPERATION]: 'generic.entity.equipment.normal-operations',
    [EquipmentStatusFilter.OUT_OF_ORDER]: 'generic.entity.equipment.out-of-order',
    [EquipmentStatusFilter.BACK_IN_ORDER]: 'generic.entity.equipment.back-in-order',
};

export function equipmentStatusName(c: string): string {
    if(c == null) return null;
    return translate('equipment-status.' + c.toLowerCase());
}