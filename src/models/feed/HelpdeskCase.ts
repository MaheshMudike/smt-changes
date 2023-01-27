import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import translate from '../../utils/translate';
import { IHelpdeskCase, IApiNameAndId } from '../api/coreApi';
import { SalesforceListItem } from './SalesForceListItem';
import { parseDateToTimestamp } from '../../utils/parse';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryHelpdeskCasesBase } from '../../actions/http/jsforce';
import IEventSource from '../events/IEventSource';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';

export class HelpdeskCaseListItem<T extends IHelpdeskCase> extends SalesforceListItem<T> {

    get entityType(): EntityType {
        return EntityType.TechnicalHelpdeskCase;
    }

    bodyText() {
        return this.value.Subject;
    }
    
    get accountApiForTitle() {
        // return this.value.Account;
        const siteName:IApiNameAndId = { Id:'', Name:this.value.Asset.Building_Name__c };
        return siteName    /* returning building name as title name for the Technical HelpDesk Cases Tile in Customers Overview */
    }


    get employee(){
        return normalizeNameAndId(this.value.Employee__r);
    }
    
    get isHighPriority() {
        return conditions.Case.highPriority.isFullfilledBy(this.value);
    }
    
    get description(): string {
        return this.value.Description;
    }
    
    get modalType() {
        return ModalType.HelpdeskModal;
    }

    public queryDetails = () => {
        return queryHelpdeskCasesBase([conditions.SObject.id(this.id)]).then(ts => new HelpdeskCase(ts[0]));
    }
}

export default class HelpdeskCase extends HelpdeskCaseListItem<IHelpdeskCase> implements IEventSource {
    
    get caseNumber(): string {
        return this.value.CaseNumber;
    }

    get slaStatus() {
        return this.value.thd_SLA_Status__c;
    }

    get account() {
        return normalizeNameAndId(this.value.Account);
    }

    get contact() {
        return normalizeNameAndId(this.value.Contact);
    }

    get status(): string {
        return this.value.Status;
    }

    get statusTranslated(): string {
        return this.value.Status_Translated;
    }

    get isClosed() {
        return conditions.Case.closed.isFullfilledByValue(this.value.Status);
    }

    get priority() {
        return this.value.Priority;
    }

    get dateTimeCreated() {
        //maybe Complaint_date__c
        return this.value.CreatedDate;
    }

    get owner() {
        return this.value.Owner;
    }

    get type() {
        return this.value.thd_Case_Type__c;
    }

    get subject(): string {
        return this.value.Subject;
    }

    get whatForEvent() {
        return this;
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account); 
    }

    get lastModifiedDate() {
        return parseDateToTimestamp(this.value.LastModifiedDate);
    }
}
