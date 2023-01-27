import DiscussionListItem from '../../models/audits/Discussion';
import { itemsQueryStateAsyncActionNames } from '../actionUtils';
import { getJsforceCollectionAction, queryKffBase } from '../http/jsforce';
import { filterKffMonthlyDiscussionsOpen } from '../http/jsforceMetrics';

export const LOAD_DISCUSSIONS = itemsQueryStateAsyncActionNames('LOAD_DISCUSSIONS');

export function downloadDiscussions() {
    return getJsforceCollectionAction(() => queryKffBase().then(audits => filterKffMonthlyDiscussionsOpen(audits)), DiscussionListItem, LOAD_DISCUSSIONS);
}