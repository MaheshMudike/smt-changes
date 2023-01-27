import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { IQuery as IApiQuery } from '../api/coreApi';
import { SalesforceFeedItem, SalesforceListItem } from './SalesForceListItem';
import { parseDateToTimestamp } from '../../utils/parse';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryCasesBase } from '../../actions/http/jsforceBase';
import * as fields from "../../actions/http/queryFields";
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';

export class QueryListItem<T extends IApiQuery> extends SalesforceListItem<T> {

    get entityType(): EntityType {
        return EntityType.Query;
    }

    bodyText() {
        return this.value.Subject;
    }
    
    get accountApiForTitle() {
        return this.value.Account;
    }

    get isHighPriority() {
        return conditions.Case.highPriority.isFullfilledBy(this.value);;
    }
    
    get description(): string {
        return this.value.Description;
    }
    
    get modalType() {
        return ModalType.QueryModal;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Query(c));
        return queryCasesBase<IApiQuery>([conditions.SObject.id(this.id)], fields.IQuery).then(ts => new Query(ts[0]))
    }
}

export class QueryFeedItem<T extends IApiQuery> extends SalesforceFeedItem<T, QueryListItem<T>> {
    constructor(c: T, userId: string) {
        super(new QueryListItem(c));
        //this.entityType = conditions.Case.query.isFullfilledBy(this.value) ? EntityType.Query : EntityType.Complaint
        this.sortDate = this.value.CreatedDate;
        this.svWillManage = conditions.Case.escalatedTo(userId).isFullfilledBy(this.value);
    }

}

export default class Query extends QueryListItem<IApiQuery> {

    get queryNumber(): string {
        return this.value.CaseNumber;
    }

    get category(): string {
        return this.value.Query_category__c;
    }

    get reason(): string {
        return this.value.Query_Classification__c;
    }

    get contact() {
        return normalizeNameAndId(this.value.Contact);
    }

    get contactPhone(): string {
        return (this.value.Contact || { Phone: null }).Phone;
    }

    get parentNumber(): string {
        return (this.value.Parent || { CaseNumber: null }).CaseNumber;
    }

    get parentSubject(): string {
        return (this.value.Parent || { Subject: null }).Subject;
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

    get isEntrapment(): boolean {
        return this.value.Entrapment__c;
    }

    get lastModifiedDate() {
        return parseDateToTimestamp(this.value.LastModifiedDate);
    }
}
