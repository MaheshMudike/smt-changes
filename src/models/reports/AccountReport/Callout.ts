import WrapperObject from '../../WrapperObject';
import { IWorkOrderReport } from 'src/models/api/coreApi';

export default class Callout extends WrapperObject<IWorkOrderReport> {

    get orderNumber(): string {
        return this.value.WorkOrderNumber;
    }

    //TODO: this is different in the feed model, check with KONE
    get visitType(): string {
        return this.value.Service_Order_Type__c;
    }

    get description(): string {
        return this.value.Description;
    }

    get jobDescription(): string {
        return this.value.Job_Description__c;
    }

    get startDate(): string {
        return this.value.StartDate;
    }

    get closeDate(): string {
        return this.value.EndDate;
    }
}
