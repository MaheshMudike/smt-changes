import { AuditListItem } from '../../models/audits/Audit';
import { itemsQueryStateAsyncActionNames } from '../actionUtils';
import { queryKffBase } from '../http/jsforce';
import { filterKffFieldAuditsOpen } from '../http/jsforceMetrics';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';

export const LOAD_AUDITS = itemsQueryStateAsyncActionNames('LOAD_AUDITS');

export function downloadAudits() {
    return asyncHttpActionGeneric(
        state => queryKffBase().then(audits => filterKffFieldAuditsOpen(audits)).then(audits => {
            const entityFieldsData = entityFieldsDataFromState(state);
            return audits.map(a => new AuditListItem(a, entityFieldsData))
        }),
        LOAD_AUDITS
    );
}