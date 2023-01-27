import { parseDate } from '../../../utils/parse';
import { IVersionReport } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Tender extends WrapperObject<IVersionReport> {
    get createdDate(): Date {
        return this.value.Tender__r == null ? null : parseDate(this.value.Tender__r.CreatedDate);
    }

    get number() {
        return this.value.Tender__r.FLTenderNumber__c;
    }

    get versionNumber() {
        return this.value.Version_Number__c;
    }

    get stage() {
        return this.value.Stage__c;
    }

    get totalSalesPrice() {
        return this.value.Total_Sales_Price__c;
    }

    get currencyIsoCode() {
        return this.value.CurrencyIsoCode;
    }

    get defaultcurrencyIsoCode() {
        return this.value && this.value.DefaultCurrencyIsoCode;
    }

    get owner() {
        return this.value.Owner == null ? null : this.value.Owner.Name;
    }

    get description() {
        return this.value.Tender__r == null ? null : this.value.Tender__r.Description__c;
    }

}
