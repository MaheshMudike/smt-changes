import { parseDate } from '../../../utils/parse';
import { NPX_Survey_Record_Report } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class TransactionalSurvey extends WrapperObject<NPX_Survey_Record_Report> {

    get id() {
        return this.value.Id;
    }

    get responseReceivedDate() {
        return parseDate(this.value.Response_Received_Date__c);
    }

    get name() {
        return this.value.Name;
    }

    get surveyName() {
        return this.value.Survey_Name__c;
    }

    get contact() {
        return this.value.Contact__r && this.value.Contact__r.Name;
    }

    get npi() {
        return this.value.NPI__c;
    }

    get npiVerbatim() {
        return this.value.NPI_Verbatim__c;
    }

}