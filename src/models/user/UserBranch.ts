import { IApiUserBranch } from '../api/userApi';
import { IUserBranch } from './IUserBranch';

export default class UserBranch implements IUserBranch {
    constructor(private value: IApiUserBranch, private userId: string) {}

    public get id() { return this.value.Id; }

    public get activeInFSM() {
        return this.value.Active_In_FSM__c;
    }

    public get branchCode() {
        return this.value.SAP_Code__c;
    }

    public get branchLabel() {
        return this.value.Name;
    }

    public get branchToString() {
        return this.value.Name;
        //return [this.shortBranchCode, this.branchLabel].filter(_.identity).join(' - ');
    }

    public get shortBranchCode() {
        return this.branchCode;
    }

    public get salesOrganization() {
        return this.value.Sales_Organization__c;
    }

    public get owned() {
        return this.userId && this.value.OwnerId && this.userId.substring(0,15) == this.value.OwnerId.substring(0,15);
    }
}
