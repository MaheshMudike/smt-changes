import translate from "../utils/translate";

export enum ContractLineStatus {
    Active = "Active",
    Expired = "Expired",
    Inactive  = "Inactive"
}

//different than ContractLineStatus, see Future value
export enum ContractLineStatusFilter {
    Active = "Active",
    Expired = "Expired",
    Future  = "Future"
}

export function contractStatusName(c: string): string {
    if(c == null) return null;
    return translate('contract-status.' + c.toLowerCase());
}