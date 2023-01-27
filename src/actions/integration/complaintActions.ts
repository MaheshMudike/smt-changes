import { IComplaint } from '../../models/api/coreApi';
import Complaint from '../../models/feed/Complaint';
import { itemsStateAsyncActionNames } from '../actionUtils';
import { getJsforceCollectionAction, queryComplaintsBase } from '../http/jsforce';
import { IGlobalState, userId } from '../../models/globalState';
import { conditions } from '../http/jsforceMappings';
import { metricConditionsComplaint } from '../http/jsforceMetrics';

export const LOAD_COMPLAINTS = itemsStateAsyncActionNames('LOAD_COMPLAINTS');

export function downloadComplaints() { 
    return getJsforceCollectionAction(state => queryComplaintsBase(metricConditionsComplaint.queryConditionsOpen(userId(state))), Complaint, LOAD_COMPLAINTS); 
}

export function queryComplaintsForEquipment(equipmentId: string) {
    return queryComplaintsBase([conditions.Case.asset(equipmentId), conditions.Case.open]).then(cs => cs.map(c => new Complaint(c)))
}