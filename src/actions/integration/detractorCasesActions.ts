import { itemsStateAsyncActionNames } from '../actionUtils';
import { getJsforceCollectionAction, queryTransactionalSurveyBase } from '../http/jsforce';
import { userIdFromState } from '../../models/globalState';
import { metricConditionsDetractorCases } from '../http/jsforceMetrics';
import TransactionalSurveyCase from 'src/models/feed/TransactionalSurveyCase';

export const LOAD_DETRACTOR_CASES = itemsStateAsyncActionNames('LOAD_DETRACTOR_CASES');

export function queryDetractorCases() { 
    return getJsforceCollectionAction(
        state => queryTransactionalSurveyBase(metricConditionsDetractorCases.queryConditionsAll(userIdFromState(state))).sort('CreatedDate','DESC'), TransactionalSurveyCase, LOAD_DETRACTOR_CASES
    ); 
}