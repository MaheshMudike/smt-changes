import { config } from '../config/config';
import { connection } from '../actions/http/jsforceCore';

/*
export const SALESFORCE_1 = {
    buildEditSobjectUrl: (objectId: string) => `salesforce1://sObject/${ objectId }/edit`,
    buildViewSobjectUrl: (objectId: string) => `salesforce1://sObject/${ objectId }/view`,
    package: 'com.salesforce.chatter',
};
*/

export const SALESFORCE_WEB = {
    createContactUrl: (accountId: string) => `${ connection.instanceUrl }/003/e${ accountId == null ? '' : '?accid=' + accountId }`,
    buildEditSobjectUrl: (objectId: string) => `${ connection.instanceUrl }/${ objectId }/e`,
    buildViewSobjectUrl: (objectId: string) => `${ connection.instanceUrl }/${ objectId }`,
    //frontDoorUrl: () => `${ connection.instanceUrl }secur/frontdoor.jsp`,
};

export const KFF_WEB = {
    buildAuditUrl: (objectId: string) => `${ config.kffUrl }/#!/app/audits/${ objectId }/overview`,
};

export const TRACE_DB_WEB = {
    buildTraceDbUrl: (objectId: string) => `${ config.traceUrl }/equipment/${ objectId }`,
};

export const KOL_WEB = `${ config.kolUrl }`;