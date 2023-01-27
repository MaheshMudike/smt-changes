import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { IVersion } from '../../models/api/coreApi';
import {  SalesforceFeedItem, SalesforceListItem } from '../feed/SalesForceListItem';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryVersionBase } from '../../actions/http/jsforceBase';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { AccountListItem } from '../accounts/Account';
import { ISalesForceEventSource } from '../feed/ISObject';

class VersionListItem<T extends IVersion> extends SalesforceListItem<T> {

    get description() {
        return this.value.Tender__r && this.value.Tender__r.Description__c;
    }

    bodyText() { return this.description; }
    
    get accountApiForTitle() {
        return this.value.Account__r;
    }

    get entityType() {
        return EntityType.Tender;
    }

    get modalType(): ModalType {
        return ModalType.TenderDialog;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Tender(c));
        return queryVersionBase([conditions.SObject.id(this.id)]).then(ts => new Version(ts[0]))
    }
}

class Version extends VersionListItem<IVersion> implements ISalesForceEventSource {

    get account() {
        return normalizeNameAndId(this.value.Account__r);
    }

    get createDate() {
        return this.value.Tender__r && this.value.Tender__r.CreatedDate;
    }

    get opportunityName() {
        return this.value.Opportunity_Name__c;
    }

    get owner() {
        return this.value.Owner.Name;
    }

    get stage() {
        return this.value.Stage__c;
    }

    get totalSalesPrice() {
        return this.value.Tender__r && this.value.Total_Sales_Price__c;
            //formatCurrency(this.value.Total_Sales_Price__c, this.value.Tender__r.CurrencyIsoCode);
    }

    get whatForEvent() {
        return new AccountListItem(this.value.Account__r);
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account__r);
    }

}