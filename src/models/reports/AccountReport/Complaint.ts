import { parseDate } from '../../../utils/parse';
import { IComplaint as IComplaintApi } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Complaint extends WrapperObject<IComplaintApi> {
    get id(): string {
        return this.value.Id;
    }

    get complaintDate(): Date {
        return parseDate(this.value.LastModifiedDate);
    }

    get number() {
        return this.value.CaseNumber;
    }

    get subject() {
        return this.value.Subject;
    }

    get reason() {
        return this.value.Reason;
    }
    
    get type() {
        return this.value.Type;
    }
}
