import * as _ from 'lodash';

import { AccountWithContacts } from '../../models/accounts/AccountWithContacts';
import INameAndId from 'src/models/INameAndId';
import Account from 'src/models/accounts/Account';

export const enum AccountSearchRank {
    NoMatch = -1,
    Name = 0,
    Address = 1,
    Contact = 2,
}

function isInName(token: string, item: INameAndId) {
    return item.name != null && item.name.toLowerCase().indexOf(token) >= 0;
}

function isInAddress(token: string, account: Account) {
    return account.address != null && account.address.toLowerCase().indexOf(token) >= 0;
}

function isInContacts(token: string, item: AccountWithContacts) {
    return _.some(item.contacts, c => c.fullName.toLowerCase().indexOf(token) >= 0);
}

export const accountSearchRank = (phrase: string) => {
    const tokens = phrase
        .toLowerCase()
        .split(/\s+/)
        .filter(s => s.length >= 3);
    if (tokens.length === 0) {
        return () => AccountSearchRank.NoMatch;
    }
    return (item: AccountWithContacts) =>
        _.min(
            tokens.map(t =>
                isInName(t, item.account)
                    ? AccountSearchRank.Name
                    : isInAddress(t, item.account)
                        ? AccountSearchRank.Address
                        : isInContacts(t, item)
                            ? AccountSearchRank.Contact
                            : AccountSearchRank.NoMatch,
            ),
        );
};
