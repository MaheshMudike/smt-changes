import { asyncActionNames, IAsyncActionNames, emptyAction } from '../actionUtils';
import * as jsforce from '../http/jsforceMetrics';
import * as _ from 'lodash';

import { GetGlobalState, plannerGroupId, activeInFSMFromState } from '../../models/globalState';

import { userId } from '../../models/globalState';
import { defaultMetricsState } from 'src/reducers/MetricsReducer';
import { asyncHttpActionGeneric, asyncHttpActionGenericInitialData } from '../http/httpActions';
import { ThunkDispatch, ThunkAction } from '../thunks';

export const LOAD_METRICS_RESET = 'LOAD_METRICS_RESET';
//export const LOAD_METRICS = asyncActionNames('LOAD_METRICS');

export const LOAD_METRICS_KFF = asyncActionNames('LOAD_METRICS_KFF');
export const LOAD_METRICS_WORKORDERS = asyncActionNames('LOAD_METRICS_WORKORDERS');
export const LOAD_METRICS_OTHER = asyncActionNames('LOAD_METRICS_OTHER');

export const LOAD_METRICS_OPPORTUNITIES = asyncActionNames('LOAD_METRICS_OPPORTUNITIES');
export const LOAD_METRICS_OPPORTUNITIES_WITH_TENDERS = asyncActionNames('LOAD_METRICS_OPPORTUNITIES_WITH_TENDERS');
export const LOAD_METRICS_CALLOUTS = asyncActionNames('LOAD_METRICS_CALLOUTS');
export const LOAD_METRICS_EVENTS = asyncActionNames('LOAD_METRICS_EVENTS');
export const LOAD_METRICS_TASKS = asyncActionNames('LOAD_METRICS_TASKS');
export const LOAD_METRICS_COMPLAINTS = asyncActionNames('LOAD_METRICS_COMPLAINTS');
export const LOAD_METRICS_HELP_DESK_CASES = asyncActionNames('LOAD_METRICS_HELP_DESK_CASES');
export const LOAD_METRICS_QUERIES = asyncActionNames('LOAD_METRICS_QUERIES');
export const LOAD_METRICS_EQUIPMENT = asyncActionNames('LOAD_METRICS_EQUIPMENT');
export const LOAD_METRICS_MBM = asyncActionNames('LOAD_METRICS_MBM');
export const LOAD_METRICS_WORKORDER = asyncActionNames('LOAD_METRICS_WORKORDER');
export const LOAD_METRICS_TIMESHEETS = asyncActionNames('LOAD_METRICS_TIMESHEETS');
export const LOAD_METRICS_REJECTED_SERVICE_APPOINTMENTS = asyncActionNames('LOAD_METRICS_REJECTED_SERVICE_APPOINTMENTS');

export function downloadMetrics(dispatch: ThunkDispatch, getState: GetGlobalState) {
    dispatch(emptyAction(LOAD_METRICS_RESET));   
    dispatch(querySalesforceMetrics);
    dispatch(queryKffMetrics);
}

export function queryKffMetrics(dispatch: ThunkDispatch, getState: GetGlobalState) {
    dispatch(asyncHttpActionGeneric(() => jsforce.queryMetricsFromKff(dispatch, getState()), LOAD_METRICS_KFF));
}

export const querySalesforceMetrics: ThunkAction<void> = (dispatch, getState) => {
    const state = getState();
    dispatch(asyncHttpActionGenericInitialData(() => jsforce.queryOtherMetrics(userId(state), plannerGroupId(state), activeInFSMFromState(state)), LOAD_METRICS_OTHER, defaultMetricsState.data));
    dispatch(asyncHttpActionGeneric(() => jsforce.queryWorkorderMetrics(userId(state), plannerGroupId(state), activeInFSMFromState(state)), LOAD_METRICS_WORKORDERS));

    /*
    dispatch(
        asyncHttpActionGeneric(() =>
            Promise.all([jsforce.queryOtherMetrics(userId(state), plannerGroupId(state)), jsforce.queryWorkorderMetrics(userId(state), plannerGroupId(state))])
            .then(([otherMetrics, workorderMetrics]) => ({ ...otherMetrics, ...workorderMetrics}))
        , LOAD_METRICS)
    );
    */
}

/*
export function querySalesforceMetrics2(clearMetrics?: boolean) {
    return (dispatch: Dispatch<any>, getState: GetGlobalState) => {
        const state = getState();        
        dispatch(asyncHttpActionGeneric(() => jsforce.queryMetrics(userId(state), plannerGroupId(state)), LOAD_METRICS, [], {}, (sth: any) => sth, defaultMetricsState.data));
    }
}
*/