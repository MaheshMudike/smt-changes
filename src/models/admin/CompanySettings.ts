import * as moment from 'moment';

import WrapperObject from '../WrapperObject';
import { SMT_Sales_Organization_Configuration__c } from '../api/coreApi';

export class CompanySettings extends WrapperObject<SMT_Sales_Organization_Configuration__c> {

    get id() {
        return this.value.Id;
    }

    get code() {
        return this.value.Sales_Organization__c;
    }

    get label() {
        return this.value.Description__c;
    }

    get modifiedBy() {
        return this.value.LastModifiedBy.Name;
    }

    get lastModification() {
        return moment(this.value.LastModifiedDate);
    }
}
