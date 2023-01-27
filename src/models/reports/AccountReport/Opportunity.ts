import { IOpportunity as IOpportunityApi } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Opportunity extends WrapperObject<IOpportunityApi> {
    get id(): string {
        return this.value.Id;
    }

    get number() {
        return this.value.KONE_Opportunity_Number__c;
    }

    get businessType() {
        return this.value.Business_Type__c;
    }

    get amount() {
        return this.value.Amount;
    }

    get currencyIsoCode() {
        return this.value.CurrencyIsoCode;
    }

    get defaultcurrencyIsoCode() {
        return this.value && this.value.DefaultCurrencyIsoCode;
    }

    get description() {
        return this.value.Description;
    }

    get name() {
        return this.value.Name;
    }

    get stageName() {
        return this.value.StageName;
    }
}
