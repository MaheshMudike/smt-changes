import { ThunkAction } from '../thunks';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { describe } from '../http/jsforceCore';
import { SObject } from '../http/jsforceMappings';
import { asyncActionNames } from '../actionUtils';
import { DescribeSObjectResult } from 'jsforce';

export const LOAD_DESCRIBE = asyncActionNames('LOAD_DESCRIBE');

export interface DescribeResult {
    describe?: DescribeSObjectResult,
    sobject: SObject
}

export function queryDescribe(sobject: SObject): ThunkAction<void> {
    return asyncHttpActionGeneric(
        () => describe(sobject).then(describe => ({ sobject, describe })),
        LOAD_DESCRIBE, [], {}, { sobject }
    );
}