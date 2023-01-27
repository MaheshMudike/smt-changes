import { EntityType, entityTypeToString } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { ITender, IApiNameAndId, IVersionForTender } from '../../models/api/coreApi';
import { joinOptionals } from '../../utils/formatUtils';
import {  SalesforceFeedItem, SalesforceListItem, title } from '../feed/SalesForceListItem';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryTendersBase, queryVersionBase } from '../../actions/http/jsforceBase';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { AccountListItem } from '../accounts/Account';
import { ISalesForceEventSource } from '../feed/ISObject';
import * as fields from "../../actions/http/queryFields";

export class TenderListItem<T extends ITender> extends SalesforceListItem<T> {

    get description() {
        return this.value.Description__c;
    }

    bodyText() { return this.description; }
    
    get accountApiForTitle() {
        return null as IApiNameAndId;
    }

    get title() {
        return joinOptionals([entityTypeToString(this.entityType), this.number], ' - ', true);
        //return title(this.entityType, this.accountApiForTitle && this.accountApiForTitle.Name);
    }

    get number() {
        return this.value.FLTenderNumber__c;
    }

    get entityType() {
        return EntityType.Tender;
    }

    get modalType(): ModalType {
        return ModalType.TenderDialog;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Tender(c));
        return queryTendersBase([conditions.SObject.id(this.id)])
            .then(ts => 
                queryVersionBase<IVersionForTender>([conditions.Version__c.tender(ts[0].Id), conditions.Version__c.active], fields.IVersionForTender)
                .then(versions => new Tender(ts[0], versions[0]))
            )
    }
}

export class TenderFeedItem<T extends ITender> extends SalesforceFeedItem<T, TenderListItem<T>> {
    
    constructor(version: T) {
        super(new TenderListItem(version));
        this.sortDate = this.value.CreatedDate;
    }

}

export default class Tender extends TenderListItem<ITender> implements ISalesForceEventSource {

    constructor(value: ITender, private version: IVersionForTender) {
        super(value);
    }


    get account() {
        return normalizeNameAndId(this.value.Opportunity__r.Account);
    }

    get createDate() {
        return this.value.CreatedDate;
    }

    get opportunityName() {
        return this.value.Opportunity__r.Name;
    }

    get opportunityId() {
        return this.value.Opportunity__r.Id;
    }

    get opportunityAccountName() {
        return this.value.Opportunity__r.Account.Name;
    }

    get owner() {
        return this.version && this.version.Owner.Name;
    }

    get stage() {
        return this.version && this.version.Stage__c;
    }

    get totalSalesPrice() {
        return this.version && this.version.Total_Sales_Price__c;
    }

    get currencyIsoCode() {
        return this.version && this.version.CurrencyIsoCode;
    }

    get whatForEvent() {
        return new AccountListItem(this.value.Opportunity__r.Account);
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Opportunity__r.Account);
    }

}
