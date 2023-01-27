import { parseDate } from '../../../utils/parse';
import { IQuery as IQueryApi } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Query extends WrapperObject<IQueryApi> {
    get id(): string {
        return this.value.Id;
    }

    get queryDate(): Date {
        return this.parseQueryDate(this.value.LastModifiedDate);
    }

    get number() {
        return this.value.CaseNumber;
    }

    get subject() {
        return this.value.Subject;
    }

    get category() {
        return this.value.Query_category__c;
    }
    
    get reason() {
        return this.value.Query_Classification__c;
    }

    private parseQueryDate(input: string): Date {
        return parseDate(input);
    }
}
