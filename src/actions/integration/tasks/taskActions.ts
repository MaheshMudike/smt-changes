import Task from '../../../models/feed/Task';
import { userId } from '../../../models/globalState';
import translate from '../../../utils/translate';
import { itemsStateAsyncActionNames } from '../../actionUtils';
import { asyncHttpActionGeneric } from '../../http/httpActions';
import { reloadFeed } from '../feedActions';
import { getJsforceCollectionAction, queryTaskContacts } from '../../http/jsforce';
import { conditions, SObject } from '../../http/jsforceMappings';
import { queryTaskBase } from '../../http/jsforceBase';
import { update, multiQuery1 } from '../../http/jsforceCore';
import { querySalesforceMetrics } from '../metricsActions';
import { metricConditionsTasks } from '../../http/jsforceMetrics';
import * as _ from 'lodash';
import { ThunkAction } from '../../thunks';
import { isAndroid, firebaseStartTrace } from 'src/utils/cordova-utils';

export const LOAD_TASKS = itemsStateAsyncActionNames('LOAD_TASKS');

export const downloadTasks = 
    () => getJsforceCollectionAction(
        state => 
            queryTaskBase(metricConditionsTasks.queryConditionsOpen(userId(state)))
            .then(tasks => { 
                if(isAndroid()){ firebaseStartTrace('Open Tasks trace') }
                return queryTaskContacts(tasks)
            }), 
        Task, LOAD_TASKS
    );

export const closeTask = (taskId: string): ThunkAction<void> =>
    (dispatch, getState) =>
        dispatch(asyncHttpActionGeneric(
            () => update(SObject.Task, { Id: taskId, Status: conditions.Task.completed }),
            null, 
            [
                dispatch => {
                    dispatch(reloadFeed);
                    dispatch(querySalesforceMetrics);
                }],
            {
                onFail: translate('toast.close-task.failure.message'),
                onSucceed: translate('toast.close-task.success.message'),
            }
        ))

