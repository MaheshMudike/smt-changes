import * as _ from 'lodash';

import translate from '../utils/translate';

export enum EntityType {
    Account = 'Account',
    Audit = 'Audit',
    Discussion = 'Discussion',
    Callout = 'Callout',
    Complaint = 'Complaint',
    Contact = 'Contact',
    Equipment = 'Equipment',
    Event = 'Event',
    TechnicalHelpdeskCase = 'TechnicalHelpdeskCase',
    Query = 'Query',
    TransactionalSurveyCase = 'TransactionalSurveyCase',
    Task = 'Task',
    Tender = 'Tender',
    Technician = 'Technician',
    Timesheet = 'Timesheet',
    User = 'User',
    ServiceContract ='ServiceContract',

    //sales lead cannot be an entity type as it would be mapped to two sobjects
    //SalesLead = 'SalesLead'
    Lead = 'Lead',
    Opportunity = 'Opportunity',
    Notification = 'Notification'
}

export function entityTypeToString(entityType: EntityType) {
    switch(entityType) {
        case EntityType.Lead:
        case EntityType.Opportunity:
            return translate('generic.entity-name.sales-lead');
        default:
            return translate('generic.entity-name.' + _.kebabCase(entityType));
    }
    
}