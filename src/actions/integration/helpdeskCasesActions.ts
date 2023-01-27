import { itemsStateAsyncActionNames } from '../actionUtils';
import { getJsforceCollectionAction, queryHelpdeskCasesBase } from '../http/jsforce';
import { userId, plannerGroupIdFromState } from '../../models/globalState';
import { metricConditionsHelpdeskCases } from '../http/jsforceMetrics';
import HelpdeskCase from '../../models/feed/HelpdeskCase';

export const LOAD_HELPDESK_CASES = itemsStateAsyncActionNames('LOAD_HELPDESK_CASES');

export function queryHelpdeskCases() { 
    return getJsforceCollectionAction(state => 
        queryHelpdeskCasesBase(metricConditionsHelpdeskCases.queryConditionsAll(plannerGroupIdFromState(state))).sort('CreatedDate','DESC'), HelpdeskCase, LOAD_HELPDESK_CASES
    ); 
}