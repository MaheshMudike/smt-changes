import { parseDate } from '../../../utils/parse';
import { IFlowSurvey as ISurveyApi } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Survey extends WrapperObject<ISurveyApi> {

    get id() {
        return this.value.Id;
    }

    get modificationDate() {
        return parseDate(this.value.LastModifiedDate);
    }

    get name() {
        return this.value.Name;
    }

    get type() {
        return this.value.Flow_Survey_Type__r && this.value.Flow_Survey_Type__r.Name;
    }

    get contact() {
        return this.value.Contact__r && this.value.Contact__r.Name;
    }

    get npiScore() {
        return this.value.NPI_Score__c;
    }
}
