import * as _ from 'lodash';

import { IPayloadAction } from '../../actions/actionUtils';
import { CACHE_DELETE_ACCOUNT, CACHE_GET_ACCOUNTS, CACHE_UPDATE_ACCOUNT, CACHE_UPDATE_CONTACT, CACHE_UPDATE_ACCOUNT_WITH_CONTACTS } from '../../actions/cache/accountActions';
import Account from '../../models/accounts/Account';
import { ISelectableItemsState } from '../../models/IItemsState';
import { composeReducers } from '../../utils/composeReducers';
import { initialState, selectableAsyncListReducerFactory } from '../factories/asyncActionReducerFactory';
import { AccountWithContacts } from '../../models/accounts/AccountWithContacts';
import { equalsById } from '../../models/feed/ISObject';

const loadAccountsListReducer = selectableAsyncListReducerFactory<AccountWithContacts>(CACHE_GET_ACCOUNTS);

/*
function updateContactInAccounts(contact: IContact, accounts: IAccountWithContacts[]) {
    return accounts.map(account => {
        const contactExists = _.some(account.contacts, equalsById(contact));
        if (contactExists) {
            return new AccountWithContacts(account.account, account.contacts.map(c => (equalsById(contact)(c) ? contact : c)));
        } else {
            return account;
        }
    });
}
*/

function addOrUpdateAccount(a: Account, oa: AccountWithContacts[]) {
    const accountMatcher = equalsById(a);
    const accountExists = _.some(oa, accountMatcher);
    if (accountExists) {
        return oa.map(t => accountMatcher(t) ? new AccountWithContacts(a, t.contacts) : t);
    } else {
        return _.union(oa, [new AccountWithContacts(a, [])]);
    }
}

function addOrUpdateAccountWithContacts(a: AccountWithContacts, oa: AccountWithContacts[]) {
    const accountMatcher = equalsById(a);
    const accountExists = _.some(oa, accountMatcher);
    if (accountExists) {
        return oa.map(t => accountMatcher(t) ? a : t);
    } else {
        return _.union(oa, [a]);
    }
}

function additionalOfflineAccountsReducer(state: ISelectableItemsState<AccountWithContacts>, action: IPayloadAction<any>)
: ISelectableItemsState<AccountWithContacts> {
    const accountMatcher = equalsById(action.payload);

    switch (action.type) {
        case CACHE_DELETE_ACCOUNT:
            return { ...state, items: _.filter<AccountWithContacts>(state.items, _.negate(accountMatcher)) }
        case CACHE_UPDATE_ACCOUNT:
            return { ...state, items: addOrUpdateAccount(action.payload, state.items) };
        case CACHE_UPDATE_ACCOUNT_WITH_CONTACTS:
        return { ...state, items: addOrUpdateAccountWithContacts(action.payload, state.items) };
        case CACHE_UPDATE_CONTACT:
            const contact = action.payload;
            const accounts = state.items;
            const accountsUpdated = accounts.map(account => {
                const contactExists = _.some(account.contacts, equalsById(contact));
                return contactExists ? new AccountWithContacts(account.account, account.contacts.map(c => (equalsById(contact)(c) ? contact : c))) : account;                
            })
            return { ...state, items: accountsUpdated, 
                    selectedItem: state.selectedItem ? _.find(state.items, t => t.account.id === state.selectedItem.account.id) : null };
        default:
            return state;
    }
}

export const offlineAccountsReducer = composeReducers(
    initialState as ISelectableItemsState<AccountWithContacts>,
    loadAccountsListReducer,
    additionalOfflineAccountsReducer,
);