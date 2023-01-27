import { parseDate } from '../../../utils/parse';
import WrapperObject from '../../WrapperObject';
import { IInvoiceReport } from 'src/models/api/coreApi';

export default class Invoice extends WrapperObject<IInvoiceReport> {
    get id(): string {
        return this.value.Id;
    }

    get contractNumber() {
        return this.value.Contract__r != null ? this.value.Contract__r.Name : null;
    }

    get number() {
        return this.value.Name;
    }

    get date() {
        return parseDate(this.value.Invoice_Date__c);
    }

    get dueDate() {
        return parseDate(this.value.Due_Date__c);
    }

    get customerPO() {
        return this.value.Customer_PO__c;
    }

    get invoiceType() {
        return this.value.Invoice_Type__c;
    }

    get documentType() {
        return this.value.Document_Type__c;
    }

    get amount() {
        return this.value.Total_Amount__c;
    }

    get currencyIsoCode() {
        return this.value.CurrencyIsoCode;
    }

    get defaultcurrencyIsoCode() {
        return this.value && this.value.DefaultCurrencyIsoCode;
    }

}
