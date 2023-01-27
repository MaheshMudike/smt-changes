import { joinOptionals } from "src/utils/formatUtils";
import translate from "src/utils/translate";
import { identity } from "lodash";

export enum AccountType {
    SoldTo,
    DecidedBy,
    BilledTo,
    Unknown,
}

export function formatAccountTypes(accountTypes: AccountType[]) {
    const types = accountTypes.map(formatAccountType).filter(identity);
    return joinOptionals(types, ' & ');
}

function formatAccountType(item: AccountType) {
    switch (item) {
        case AccountType.BilledTo:
            return `${ translate('modal.select-contacts.billed-to') }`;
        case AccountType.DecidedBy:
            return `${ translate('modal.select-contacts.decided-by') }`;
        case AccountType.SoldTo:
            return `${ translate('modal.select-contacts.sold-to') }`;
        default:
            return null;
    }
}
