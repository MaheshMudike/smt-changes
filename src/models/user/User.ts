import { IUserExtended, IUserBase, SMT_User_Info__c } from '../api/userApi';
import WrapperObject from '../WrapperObject';
import { IUserBranch } from './IUserBranch';
import UserBranch from './UserBranch';
import { AdminType } from './UserRole';
import ICompany from '../ICompany';
import * as _ from 'lodash';

export type IUserInfoAndCompany = [UserBase, ICompany];

export class UserBase<T extends IUserBase = any> extends WrapperObject<T> {

    public adminType: AdminType = AdminType.None
    public adminCompanies: ICompany[] = [];

    constructor(value: T, public smtUserInfo: SMT_User_Info__c) {
        super(value);

        if(smtUserInfo != null) {
            try {
                this.adminType = smtUserInfo.Admin_Type__c as AdminType;
                this.adminCompanies = JSON.parse(smtUserInfo.Admin_Sales_Organizations__c) as ICompany[];
                if(this.adminCompanies == null) this.adminCompanies = [];
                this.adminCompanies = this.adminCompanies.filter(c => c != null);
            } catch(error) {
                console.log("Error casting adminType or adminCompanies: ", error);
            }
        }
    }

    get id(): string {
        return this.value.Id;
    }

    get email() {
        return this.value.Email;
    }

    get userName() {
        return this.value.Username;
    }

    get fullName() {
        return this.value.Name;
    }
    
    public containsCompany(c: ICompany) {
        return !!_(this.adminCompanies).find(t => t.code === c.code);
    }    
}

export class User extends UserBase<IUserExtended> {

    constructor(entity: IUserExtended, smtUserInfo: SMT_User_Info__c) {
        super(entity, smtUserInfo);
    }

    get userValue() {
        return this.value;
    }

    get localeSidKey() {
        return this.value.LocaleSidKey;
    }

    get locale() {
        const [lang, country, currency] = this.localeSidKey.split('_');
        if(country == null) return lang;

        const locale = [lang, country].join('-');
        return locale;
    }

    get languageLocale() {
        return this.value.LanguageLocaleKey;
    }

    get userBranches(): IUserBranch[] {
        var branches = this.value.userBranches;
        if(branches == null) branches = [];
        return branches.map(branch => new UserBranch(branch, this.value.Id));
    }

    get gpsPermissionSet() {
        return this.value.gpsPermissionSet;
    }

    get defaultCurrencyIsoCode() {
        return this.value && this.value.DefaultCurrencyIsoCode
    }
}
