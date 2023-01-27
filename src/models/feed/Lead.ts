import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { joinOptionals } from '../../utils/formatUtils';
import { IApiLead } from '../api/coreApi';
import { SalesforceFeedItem, SalesforceListItemDescription } from './SalesForceListItem';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryLeadsBase } from '../../actions/http/jsforceBase';
import IEventSource from '../events/IEventSource';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { equipmentAddress } from '../equipment/Equipment';
import translate from 'src/utils/translate';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

export function formatProductServiceInterest(param: string) {
    return param == null ? null : param.replace(/;/g, ', ');    
}

class LeadListItem<T extends IApiLead> extends SalesforceListItemDescription<T> {

    constructor(entity: T, private entityFieldsData: EntityFieldsData) {
        super(entity);
    }

    bodyText() {
        return this.value.Name;
    }

    get activeInFSM() {
        return this.entityFieldsData.activeInFSM;
    }

    get equipmentName() {
        return this.asset && this.asset.Name;
    }

    get accountApiForTitle() {
        return this.asset &&  this.asset.Account;
    }

    get asset() {
        return this.activeInFSM ? this.value.FSM_Asset__r : this.nonFSMAsset;
    }

    get nonFSMAsset() {
        return this.value.Asset_Leads__r && this.value.Asset_Leads__r.records.length > 0 ? this.value.Asset_Leads__r.records[0] : null;
    }

    get entityType() {
        return EntityType.Lead;
    }

    get isHighPriority(): boolean {
        return false;
    }

    get modalType() {
        return ModalType.LeadModal;
    }

    get technicianName() {
        return this.value.Technician_Name__c;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Lead(c));
        return queryLeadsBase([conditions.Lead.ids([this.id])]).then(ls => new Lead(ls[0], this.entityFieldsData))
    }
}

export class LeadFeedItem extends SalesforceFeedItem<IApiLead, LeadListItem<IApiLead>> {
    
    constructor(lead: IApiLead, entityFieldsData: EntityFieldsData) {
        super(new LeadListItem(lead, entityFieldsData));
        this.sortDate = this.value.CreatedDate;
    }

}

export default class Lead extends LeadListItem<IApiLead> implements IEventSource {

    get company() {
        return this.value.Company;
    }

    get name() {
        return this.value.Name;
    }

    get status() {
        return this.value && this.value.Status;
    }

    get leadSource() {
        return this.value.LeadSource;
    }

    get urgency() {
        return this.value.Urgency__c;
    }

    get productServiceInterests() {
        return formatProductServiceInterest(this.value.Product_Service_Interest__c);
    }

    get businessType() {
        return this.value && this.value.Business_Type__c;
    }

    get changedDate() {
        return this.value.LastModifiedDate;
    }

    get createdDate() {
        return this.value.CreatedDate;
    }

    get createdBy() {
        return this.value.CreatedBy.Name;
    }

    get phone() {
        return this.value.Phone;
    }

    get title() {
        return this.company;
    }

    get whatForEvent() {
        return this;
    }
    
    get accountsForEventCreation() {
        return accountWithTypeArray(this.accountApiForTitle);
    }

    get ownerId() {
        return this.value.OwnerId;
    }

    //opportunity filter implementation
    get amount() {
        return null as number;
    }

    get stageName() {
        return this.status;//null as string;
    }

    get marketSegment() {
        //TODO maybe we can use one of these fields
        //return this.value.Industry_Segment__c;
        return this.value.Customer_Type__c;
        //return null as string;
    }

    get closeDate() {
        return null as string;
    }

    get equipmentAddress() {
        return this.asset && equipmentAddress(this.asset);
    }
}
