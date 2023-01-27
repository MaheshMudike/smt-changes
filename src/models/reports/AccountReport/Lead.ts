import { ILeadReport } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Lead extends WrapperObject<ILeadReport> {
    get leadOwner() {
        return this.value.Owner == null ? null : this.value.Owner.Name;
    }

    get businessType() {
        return this.value.Business_Type__c;
    }

    get stage() {
        return this.value.Business_Stage__c;
    }

    get status() {
        return this.value.Status;
    }

    get description() {
        return this.value.Description;
    }

    get source() {
        return this.value.LeadSource;
    }
}
