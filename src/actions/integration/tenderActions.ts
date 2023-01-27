import { TenderListItem } from '../../models/tenders/Tender';
import { itemsStateAsyncActionNames } from '../actionUtils';
import { queryTendersOpenForEquipment } from '../http/jsforce';

export const LOAD_TENDERS = itemsStateAsyncActionNames('LOAD_TENDERS');

export function queryTendersForEquipment(assetId: string) {
    return queryTendersOpenForEquipment(assetId).then(ts => ts.map(t => new TenderListItem(t)));
}