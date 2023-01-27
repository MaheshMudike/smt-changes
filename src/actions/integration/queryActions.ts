import Query from '../../models/feed/Query';
import { itemsStateAsyncActionNames } from '../actionUtils';
import { getJsforceCollectionAction, queryQueriesBase } from '../http/jsforce';
import { userId } from 'src/models/globalState';
import { metricConditionsQueries } from '../http/jsforceMetrics';

export const LOAD_QUERIES = itemsStateAsyncActionNames('LOAD_QUERIES');

export function downloadQueries() { 
    return getJsforceCollectionAction(state => queryQueriesBase(metricConditionsQueries.queryConditionsOpen(userId(state))), Query, LOAD_QUERIES); 
}