import WrapperObject from '../../WrapperObject';
import { IEventReport } from 'src/models/api/coreApi';
import normalizeNameAndId from '../../../services/SalesForce/normalizeNameAndId';

export default class CustomerVisit extends WrapperObject<IEventReport> {
    get id(): string {
        return this.value.Id;
    }

    get startDate() {
        return new Date(this.value.StartDateTime);
    }

    get owner() {
        return normalizeNameAndId(this.value.Owner);
    }

    get who() {
        return normalizeNameAndId(this.value.Who);
    }
    
    get subject() {
        return this.value.Subject;
    }
}
