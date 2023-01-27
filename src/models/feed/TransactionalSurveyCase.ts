import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { IQuery as IApiQuery, ITransactionalSurveyCase, IApiNameAndId } from '../api/coreApi';
import { SalesforceFeedItem, SalesforceListItem } from './SalesForceListItem';

import { conditions } from '../../actions/http/jsforceMappings';
import { queryCasesBase } from '../../actions/http/jsforceBase';
import * as fields from "../../actions/http/queryFields";
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';

export class TransactionalSurveyCaseListItem<T extends ITransactionalSurveyCase> extends SalesforceListItem<T> {

    get entityType(): EntityType {
        return EntityType.TransactionalSurveyCase;
    }

    bodyText() {
        return this.value.Subject;
    }

    get accountApiForTitle() {
        return null as IApiNameAndId;
        //return this.value.Account;
    }

    get isHighPriority() {
        return conditions.Case.highPriority.isFullfilledBy(this.value);
    }
    
    get modalType() {
        return ModalType.TransactionalSurveyCase;
    }

    public queryDetails = () => {
        return queryCasesBase<ITransactionalSurveyCase>([conditions.SObject.id(this.id)], fields.ITransactionalSurveyCase).then(ts => new TransactionalSurveyCase(ts[0]))
    }
}

export class TransactionalSurveyCaseFeedItem<T extends ITransactionalSurveyCase> extends SalesforceFeedItem<T, TransactionalSurveyCaseListItem<T>> {
    constructor(c: T, userId: string) {
        super(new TransactionalSurveyCaseListItem(c));
        this.sortDate = this.value.CreatedDate;
        this.svWillManage = conditions.Case.escalatedTo(userId).isFullfilledBy(this.value);
    }

}

export default class TransactionalSurveyCase extends TransactionalSurveyCaseListItem<ITransactionalSurveyCase> {

    get npiScore(): string {
        return this.value.NPX_NPI__c;
    }

    get surveyName() {
        return this.value.NPX_Response_Survey_Name__c;
    }
    
    get subject() {
        return this.value.Subject;
    }

    get description(): string {
        return this.value.Description;
    }

    get contactName() {
        return this.value.Contact == null ? null : this.value.Contact.Name;
    }

    get contactPhone() {
        return this.value.Contact == null ? null : this.value.Contact.Phone;
    }

    get dueDate() {
        return this.value.NPX_Response_Due_Date__c;
    }
    
    get comment() {
        return this.value.Additional_Comment__c;
    }

    
    get whatForEvent() {
        return this;
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account);
    }

    get isClosed() {
        return conditions.Case.closed.isFullfilledByValue(this.value.Status);
    }
}
