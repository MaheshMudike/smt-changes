import * as _ from 'lodash';

import translate from '../utils/translate';

export enum ServiceOrderType {
    YSM1 = 'YSM1',
    YSM2 = 'YSM2',
    YSM3 = 'YSM3',
    YSM4 = 'YSM4',
    YSM6 = 'YSM6',
}

enum MaintenanceActivityType {
    Y01 = "Y01",
    Y02 = "Y02",
    Y03 = "Y03",
    Y04 = "Y04",
    Y05 = "Y05",
    Y06 = "Y06",
    Y07 = "Y07",
    Y08 = "Y08",
    Y09 = "Y09",
    Y16 = "Y16",
    Z03 = "Z03",
    Z04 = "Z04",
    Z06 = "Z06",
    Z07 = "Z07",
}

export default MaintenanceActivityType;

export enum MaintenanceActivityTypeFilter {
    Y01 = "Y01",
    Y02 = "Y02",
    Y03 = "Y03",
    Y04_YSM1_YSM2 = "Y04_YSM1_YSM2",
    Y04_YSM3_YSM4 = "Y04_YSM3_YSM4",
    Y04_YSM6 = "Y04_YSM6",
    Y05 = "Y05",
    Y06 = "Y06",
    Y07 = "Y07",
    Y08 = "Y08",
    Y09 = "Y09",
    Y16 = "Y16",
    //Y99 = "Y99",
    Z01 = "Z01",
    Z02 = "Z02",
    Z03 = "Z03",
    Z04 = "Z04",
    Z06 = "Z06",
    Z07 = "Z07",
}

export const maintenanceActivityTypeDictionary: _.Dictionary<MaintenanceActivityType> = MaintenanceActivityType as any;

export function maintenanceActivityTypeDescription(c: string): string {
    if(c == null) return null;
    return translate('service-order-type.' + c.toLowerCase());
}

export function maintenanceActivityTypeFilterDescription(maintenanceActivityType: string, serviceOrderType: string): string {
    return maintenanceActivityTypeFilterLabel(maintenanceActivityTypeFilter(maintenanceActivityType, serviceOrderType));
}

export function maintenanceActivityTypeFilterLabel(v: MaintenanceActivityTypeFilter): string {
    switch(v) {
        case MaintenanceActivityTypeFilter.Y04_YSM1_YSM2:
        case MaintenanceActivityTypeFilter.Y04_YSM3_YSM4:
        case MaintenanceActivityTypeFilter.Y04_YSM6:
            return `${ MaintenanceActivityType.Y04 } - ${ maintenanceActivityTypeDescription(MaintenanceActivityTypeFilter[v]) }`;
        default:
            return `${ MaintenanceActivityTypeFilter[v] } - ${ maintenanceActivityTypeDescription(MaintenanceActivityTypeFilter[v]) }`;
    }
}

export function filterWithMaintenanceActivityTypeFilters(wo: { maintenanceActivityType: string, serviceOrderType: string }, filters: MaintenanceActivityTypeFilter[]): boolean {
    return filters == null || filters.length <= 0 || filters.some(sot => filterWithMaintenanceActivityTypeFilter(wo, sot));
}

export function filterWithMaintenanceActivityTypeFilter(wo: { maintenanceActivityType: string, serviceOrderType: string }, filter: MaintenanceActivityTypeFilter) {
    if(filter == null) return true;
    switch (filter) {
        case MaintenanceActivityTypeFilter.Y04_YSM1_YSM2:
            return wo.maintenanceActivityType === MaintenanceActivityType.Y04 && (wo.serviceOrderType === ServiceOrderType.YSM1 || wo.serviceOrderType === ServiceOrderType.YSM2);
        case MaintenanceActivityTypeFilter.Y04_YSM3_YSM4:
            return wo.maintenanceActivityType === MaintenanceActivityType.Y04 && (wo.serviceOrderType === ServiceOrderType.YSM3 || wo.serviceOrderType === ServiceOrderType.YSM4);
        case MaintenanceActivityTypeFilter.Y04_YSM6:
            return wo.maintenanceActivityType === MaintenanceActivityType.Y04 && (wo.serviceOrderType === ServiceOrderType.YSM6);
        default:
            return wo.maintenanceActivityType === filter;
    }
}

function maintenanceActivityTypeFilter(maintenanceActivityType: string, serviceOrderType: string): MaintenanceActivityTypeFilter {
    if(maintenanceActivityType === MaintenanceActivityType.Y04) {
        if(serviceOrderType === ServiceOrderType.YSM1 || serviceOrderType === ServiceOrderType.YSM2) return MaintenanceActivityTypeFilter.Y04_YSM1_YSM2;
        if(serviceOrderType === ServiceOrderType.YSM3 || serviceOrderType === ServiceOrderType.YSM4) return MaintenanceActivityTypeFilter.Y04_YSM3_YSM4;
        if(serviceOrderType === ServiceOrderType.YSM6) return MaintenanceActivityTypeFilter.Y04_YSM6;
    }
    return MaintenanceActivityTypeFilter[maintenanceActivityType];
}