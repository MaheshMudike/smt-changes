import { ServiceOrderGrouping } from '../models/overview/CalloutGrouping';
import { userFriendlyDate } from '../utils/formatUtils';
import { IOverviewListDataOptions } from './OverviewListDataSelector';
import Callout, { CalloutListItem } from 'src/models/feed/Callout';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

type Grouping = IOverviewListDataOptions<Callout>;

function toMs(d: string) {
    return d == null ? null : new Date(d).getTime()
}

// const getServiceOrderTime = (isUnplanned: boolean, activeInFSM: boolean, c: CalloutListItem<any>) => {
//     if(isUnplanned) {
//         return activeInFSM ? toMs(c.newStatusDateTime) || c.startDateMs : toMs(c.earliestStartDate);
//     } else {
//         return activeInFSM ? c.startDateMs : toMs(c.earliestStartDate);
//     }
// }


export const getServiceOrderTime = (isUnplanned: boolean, activeInFSM: boolean, c: { earliestStartDate: string }) => {
        return toMs(c.earliestStartDate);
}

export const getServiceOrderEndDate = (c: { endDate: string, createdDate: string }) => {   
    return c.endDate != null && c.endDate!= undefined ? toMs(c.endDate) : toMs(c.createdDate);
}

export function getWorkOrderGrouping(grouping: ServiceOrderGrouping, isUnplanned: boolean, entityFieldsData: EntityFieldsData): Grouping {
    const { locale, activeInFSM } = entityFieldsData;
    switch (grouping) {
        case ServiceOrderGrouping.ByDate:
            return {
                group: c => userFriendlyDate(getServiceOrderTime(isUnplanned, activeInFSM, c), locale),
                groupSort: g => -getServiceOrderTime(isUnplanned, activeInFSM, g.items[0]),
                sort: c => -getServiceOrderTime(isUnplanned, activeInFSM, c),
            };
        case ServiceOrderGrouping.ByWorkCenter:
            return {
                group: c => c.workCenter,
                groupSort: g => g.title,
                sort: c => -getServiceOrderTime(isUnplanned, activeInFSM, c),
            };
        case ServiceOrderGrouping.ByStatus:
            return {
                // group: c => (activeInFSM ? c.status : c.konectStatus) || '-',
                group: c => activeInFSM ? c.status : ( c.konectStatus == null ? c.status : ( c.status == 'Finished' || c.status == 'Completed') ? c.status : c.konectStatus),
                groupSort: g => g.title,
                sort: c => -getServiceOrderTime(isUnplanned, activeInFSM, c),
            };
        case ServiceOrderGrouping.ByAssemblyCode:
            return {
                group: c => c.assemblyCodeDescription || '-',
                groupSort: g => g.title,
                sort: c => -getServiceOrderTime(isUnplanned, activeInFSM, c),
            };
        default:
            throw new Error('Unhandled callout grouping type: ' + grouping);
    }
}