import { AccountWithContacts } from '../../models/accounts/AccountWithContacts';
import { itemsStateAsyncActionNames, payloadAction } from '../actionUtils';
import { asyncHttpActionGeneric } from '../http/httpActions';
import Contact from '../../models/accounts/Contact';
import { EDIT_OFFLINE_CONTACT } from '../offlineChangesActions';
import { plannerGroupIdFromState, IGlobalState } from '../../models/globalState';
import { queryContactsForAccountsByAccountContactRelationshipGrouped, queryAccountIdsForTerritory } from '../http/jsforce';
import { queryAccountsBase } from '../http/jsforceBase';
import { conditions } from '../http/jsforceMappings';
import { multiQuery1, multiQuery2 } from '../http/jsforceCore';
import Account from '../../models/accounts/Account';
import { ThunkAction, ThunkDispatch } from '../thunks';
import { Moment } from '../../../node_modules/moment';
import * as _ from 'lodash';
import { IApiAccount } from '../../models/api/coreApi';

export const CACHE_GET_ACCOUNTS = itemsStateAsyncActionNames('CACHE_GET_ACCOUNTS');
export const CACHE_UPDATE_ACCOUNT = 'CACHE_UPDATE_ACCOUNT';
export const CACHE_UPDATE_ACCOUNT_WITH_CONTACTS = 'CACHE_UPDATE_ACCOUNT_WITH_CONTACTS';
export const CACHE_DELETE_ACCOUNT = 'CACHE_DELETE_ACCOUNT';
export const CACHE_UPDATE_CONTACT = 'CACHE_UPDATE_CONTACT';
export const OFFLINE_SEARCH_ACCOUNTS = 'OFFLINE_SEARCH_ACCOUNTS';

export function getOfflineAccounts() {
    return asyncHttpActionGeneric(
        state => queryAccountIdsForTerritory(plannerGroupIdFromState(state)).then(accountIds => queryAccounts(accountIds))        
        , CACHE_GET_ACCOUNTS
    );
}

export function refreshOfflineAccount(id: string) {    
    return asyncHttpActionGeneric(state => 
        queryAccounts([id])
        .then(newAccounts => 
            state.cache.offlineAccounts.items.map(oldAccount => {
                return oldAccount.id === id ? _.find(newAccounts, a => a.account.id == id) : oldAccount;                
            }).filter(a => a != null)
        )
        , CACHE_GET_ACCOUNTS
    );
}

function queryAccounts(accountIds: string[]) {
    return multiQuery1(queryAccountsBase([conditions.Account.ids(accountIds)]))
        .then(result => queryContactsForAccounts(result.queries.result[0]))
}

export function synchOfflineAccounts(state: IGlobalState, dispatch: ThunkDispatch, moment: Moment) {
    queryAccountIdsForTerritory(plannerGroupIdFromState(state)).then(accountIds => {
        if(accountIds.length > 0) {
            multiQuery2(
                queryAccountsBase([conditions.Account.ids(accountIds), conditions.Account.modifiedAfter(moment)]),
                queryAccountsBase([conditions.Account.ids(accountIds), conditions.Account.modifiedAfter(moment), conditions.Account.isDeleted])
            ).then(result => queryContactsForAccounts(result.queries.result[0]).then(
                accountsWithContacts => {
                    accountsWithContacts.forEach(account => dispatch(payloadAction(CACHE_UPDATE_ACCOUNT_WITH_CONTACTS)(account)));
                    result.queries.result[1].forEach(deletedAccount => 
                        //TODO empty contacts here
                        dispatch(payloadAction(CACHE_DELETE_ACCOUNT)(new Account(deletedAccount, [])))
                    )
                }
            ))
        }
    });
}

function queryContactsForAccounts(accounts: IApiAccount[]) {
    return queryContactsForAccountsByAccountContactRelationshipGrouped(accounts.map(a => a.Id))
        .then(groupedContacts => {
            return accounts.map(a => {
                const accountContacts = (groupedContacts[a.Id] || []).map(c => new Contact(c));
                return new AccountWithContacts(new Account(a, accountContacts), accountContacts);
            })
        })
}

/*
export const updateCachedAccount = payloadAction<IAccount>(CACHE_UPDATE_ACCOUNT);

export const deleteCachedAccount = payloadAction<IAccount>(CACHE_DELETE_ACCOUNT);
*/

export function updateOfflineContact(contact: Contact, onSuccess = (error: any) => {}): ThunkAction<void> {
    return (dispatch, getState) => {
        dispatch(payloadAction(CACHE_UPDATE_CONTACT)(contact));
        dispatch(payloadAction(EDIT_OFFLINE_CONTACT)(contact));
        setTimeout(onSuccess);
    };
}

export const searchAccountsOffline = payloadAction<string>(OFFLINE_SEARCH_ACCOUNTS);
