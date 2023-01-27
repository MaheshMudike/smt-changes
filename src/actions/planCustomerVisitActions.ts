import * as _ from 'lodash';
import { Dispatch } from 'redux';

import { EntityType } from '../constants/EntityType';
import { ModalType } from '../constants/modalTypes';
import { AccountType } from '../models/accounts/AccountType';
import { IPlanCustomerVisitForm, IAccountWithType } from '../models/plan/IPlanCustomerVisitState';
import { payloadAction } from './actionUtils';
import { goToPrevModal, showModal, hideModalType } from './modalActions';
import Contact from 'src/models/accounts/Contact';
import IEventSource from 'src/models/events/IEventSource';

import * as moment from 'moment';
import { ITimeSpan } from 'src/models/events/calendarState';
import INameAndId from 'src/models/INameAndId';
import { ThunkAction } from './thunks';
import { IApiNameAndId } from 'src/models/api/coreApi';
import { Identifiable, IdentifiableWithTitleEntity } from 'src/models/feed/ISObject';
import { AccountListItem } from 'src/models/accounts/Account';
import Event from 'src/models/events/Event';
import { multiQuery1Extract } from './http/jsforceCore';
import { queryWorkOrders, queryAssetsBase, queryAccountsBase, queryServiceContractBase } from './http/jsforceBase';
import { conditions } from './http/jsforceMappings';


export const PLAN_CUSTOMER_VISIT_CHANGE_VALUE = 'PLAN_CUSTOMER_VISIT_CHANGE_VALUE';
export const PLAN_CUSTOMER_VISIT_SET_RELATED_TO = 'PLAN_CUSTOMER_VISIT_SET_RELATED_TO';
export const PLAN_CUSTOMER_VISIT_INITIALIZE = 'PLAN_CUSTOMER_VISIT_INITIALIZE';
export const PLAN_CUSTOMER_VISIT_SET_SOURCE_ENTITY = 'PLAN_CUSTOMER_VISIT_SET_SOURCE_ENTITY';
export const PLAN_CUSTOMER_VISIT_SELECT_CONTACTS = 'PLAN_CUSTOMER_VISIT_SELECT_CONTACTS';
export const PLAN_CUSTOMER_VISIT_SET_EQ_ACCOUNTS = 'PLAN_CUSTOMER_VISIT_SET_EQ_ACCOUNTS';
//export const PLAN_CUSTOMER_VISIT_GET_CONTACTS = asyncActionNames('PLAN_CUSTOMER_VISIT_GET_CONTACTS');
//export const PLAN_CUSTOMER_VISIT_GET_ACCOUNTS = asyncActionNames('PLAN_CUSTOMER_VISIT_GET_ACCOUNTS');

export const changeFormValue = payloadAction<Partial<IPlanCustomerVisitForm>>(PLAN_CUSTOMER_VISIT_CHANGE_VALUE);
export const setRelatedToOnPlanCustomerVisit = payloadAction<IdentifiableWithTitleEntity>(PLAN_CUSTOMER_VISIT_SET_RELATED_TO);
export const setSourceEntityToOnPlanCustomerVisit = payloadAction<IdentifiableWithTitleEntity>(PLAN_CUSTOMER_VISIT_SET_SOURCE_ENTITY);
export const selectContactsOnPlanCustomerVisit = payloadAction<Contact[]>(PLAN_CUSTOMER_VISIT_SELECT_CONTACTS);

/*
export function getContactsForPlanCustomerVisit(accountIds: string[]) {
    return asyncHttpActionGeneric(
        () => queryContactsForAccountsByAccountContactRelationshipGrouped(accountIds).then(result => _.mapValues(result, r => r.map(c => new Contact(c)))), 
        PLAN_CUSTOMER_VISIT_GET_CONTACTS
    );
}

export function getContactsForPlanCustomerVisitOffline(accountIds: string[]) {
    
    return (dispatch: Dispatch<any>, getState: GetGlobalState) => {
        const accounts = accountIds.map(accountId => _.find(getState().cache.offlineAccounts.items, t => t.account.id === accountId)).filter(_.identity);
        const contactsByAccountId = _.mapValues(_.keyBy(accounts, a => a.account.id), v => v.contacts || []);
        dispatch(payloadAction(PLAN_CUSTOMER_VISIT_GET_CONTACTS.success)(contactsByAccountId));
    };
}
*/


export function accountIdAndTypeForNameAndId(nameAndId: INameAndId, type: AccountType): IAccountWithType {
    return nameAndId != null && nameAndId.id != null ?
        { account: { ...nameAndId, title: nameAndId.name, entityType: EntityType.Account }, accountType: [type] } : null;
}

export function accountWithTypeArray(nameAndId: IApiNameAndId, type: AccountType = AccountType.Unknown): Promise<IAccountWithType[]> {
    const sth = accountWithType(nameAndId, type);
    return Promise.resolve(sth == null ? [] : [sth]);
}

function accountWithType(nameAndId: IApiNameAndId, type: AccountType = AccountType.Unknown): IAccountWithType {
    return nameAndId != null && nameAndId.Id != null ?
        { account: new AccountListItem({ ...nameAndId, AccountNumber: null }), accountType: [type] } : null;
}

export function accountWithType2(nameAndId: IdentifiableWithTitleEntity, type: AccountType = AccountType.Unknown): IAccountWithType {
    return nameAndId != null && nameAndId.id != null ?
        { account: nameAndId, accountType: [type] } : null;
}

function valueIsValid(nameAndId: Identifiable) {
    return nameAndId != null && nameAndId.id != null;
}

function getAccountDetail(relatedTo: IdentifiableWithTitleEntity): Promise<IApiNameAndId> {
    const entityType = relatedTo && relatedTo.entityType;
    const id = relatedTo && relatedTo.id;
    //TODO: Needs to be implemented later - Under discussion
    switch (entityType) {
        // case EntityType.Callout:
        //     return multiQuery1Extract(queryWorkOrders([conditions.SObject.ids([id])]))
        //     .then(res => {
        //         console.log('res--->',res);
        //         return res[0].Account
        //     })
        // case EntityType.Equipment:
        //     return multiQuery1Extract(queryAssetsBase([conditions.SObject.ids([id])]))
        //     .then( res => {
        //         console.log('res--->',res);
        //         return res[0].Account
        //     })
        // case EntityType.Account:
        //     return multiQuery1Extract(queryAccountsBase([conditions.SObject.id(id)]))
        //     .then(res => {
        //         console.log('res--->',res);
        //         return res[0]
        //     })
        case EntityType.ServiceContract:
            return multiQuery1Extract(queryServiceContractBase([conditions.SObject.id(id)]))
            .then(res => {
                return multiQuery1Extract(queryAccountsBase([conditions.SObject.id(res[0].AccountId)])).then(
                    acc => {
                        return acc[0]   
                    })
            })
        default:
            return null
    }
}

async function eventFormForEventSource(entity: IEventSource, timeSpan: ITimeSpan): Promise<IPlanCustomerVisitForm> {
    const nextHour = moment().startOf('hour').add('hour', 1);
    const time = timeSpan || { end: nextHour.clone().add('hour', 1), start: nextHour };
    const entityIsAudit = entity != null && entity.entityType === EntityType.Audit;
    const auditNumber = entityIsAudit ? Number(entity.id) : null;
    const participants = entity != null && entity.participants != null ? entity.participants.map(x => new Contact({ Name: x.name, Id: x.id })) : [];

    // const relatedTo = entity && valueIsValid(entity.whatForEvent) ? getAccountDetail(entity.whatForEvent) : null;
    const relatedTo =  entity && valueIsValid(entity.whatForEvent) 
    ? 
        entity.whatForEvent.entityType == EntityType.ServiceContract ? {
            entityType: entity && entity.whatForEvent.entityType,
            id: (await getAccountDetail(entity.whatForEvent)).Id,
            title: (await getAccountDetail(entity.whatForEvent)).Name
        } : entity.whatForEvent
    : null

    const eventType = entity && entity.taskType == 'SMT On-boarding' ? entity.eventType : null

    return {
        description: entity && entity.descriptionForEvent,
        endDate: time.end,
        eventType,
        participants,
        relatedTo,
        startDate: time.start,
        auditNumber: auditNumber,
        objectives: entity && entity.eventObjective
    } as IPlanCustomerVisitForm;
}

export async function eventFormForEvent(event: Event) {
    // const relatedTo = event && valueIsValid(event.whatForEvent) ? event.whatForEvent : null;
    const relatedTo =  event && valueIsValid(event.whatForEvent) 
    ? 
    event.whatForEvent.entityType == EntityType.ServiceContract ? {
            entityType: event && event.whatForEvent.entityType,
            id: (await getAccountDetail(event.whatForEvent)).Id,
            title: (await getAccountDetail(event.whatForEvent)).Name
        } : event.whatForEvent
    : null
    const participants = event != null && event.participants != null ? event.participants.map(x => new Contact({ Name: x.name, Id: x.id })) : [];


    return {
        id: event.id,
        description: event.description,
        endDate: moment(event.endDateTime),
        participants,
        eventType: event.visitType,
        relatedTo,
        startDate: moment(event.startDateTime),
        //the objectives field is multi-select and can have potentially multiple values
        objectives: event.objectives == null ? null : event.objectives.split(";")[0],//.map(obj => ({ label: obj, value: obj })),
        location: event.location
    } as IPlanCustomerVisitForm;
}

export function eventCreationSetContactSelectionAccounts(accountIdsAndTypes: IAccountWithType[]): ThunkAction<void> {
    return (dispatch, getState) => {
        dispatch(payloadAction(PLAN_CUSTOMER_VISIT_SET_EQ_ACCOUNTS)(accountIdsAndTypes));
    }
}

export const showPlanCustomerVisitModal = (eventSource: IEventSource, time: ITimeSpan, replaceExistingModal?: boolean, closeTask?: boolean): ThunkAction<void> => {
    return async dispatch => {
        if (replaceExistingModal) dispatch(goToPrevModal());
        const title = eventSource && eventSource.entityType;
        dispatch(showModal(ModalType.IncompleteDialog, { title }));
        eventFormForEventSource(eventSource, time).then(
            res => {
                dispatch(initializePlanCustomerVisit(eventSource,res));
                dispatch(showModal(closeTask ? ModalType.WriteEventAndCloseTaskModal : ModalType.WriteEventModal));
                dispatch(hideModalType(ModalType.IncompleteDialog))
            }
        )
        // dispatch(initializePlanCustomerVisit(eventSource, await eventFormForEventSource(eventSource, time)));
        // dispatch(showModal(closeTask ? ModalType.WriteEventAndCloseTaskModal : ModalType.WriteEventModal));
    };
};

export const showPlanCustomerVisitOfflineModal = (eventSource: IEventSource, time: ITimeSpan): ThunkAction<void> => {
    return async dispatch => {
        dispatch(initializePlanCustomerVisit(eventSource, await eventFormForEventSource(eventSource, time)));
        dispatch(showModal(ModalType.WriteEventOfflineModal));
    };
};

export const initializePlanCustomerVisit = (eventSource: IEventSource, form: IPlanCustomerVisitForm) => {
    return payloadAction(PLAN_CUSTOMER_VISIT_INITIALIZE)([eventSource, form]);
}
