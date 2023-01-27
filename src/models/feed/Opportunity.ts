import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import { formatLabelValue, joinOptionals } from '../../utils/formatUtils';
import { IOpportunity as IApiOpportunity, IAsset_Opportunity_Address__c } from '../api/coreApi';
import { conditions } from '../../actions/http/jsforceMappings';

import { assetOpportunityLocations, queryMapOpportunities, queryOpportunitiesById, queryAssetOpportunities } from '../../actions/http/jsforce';
import { ILatLng } from '../map/LonLat';
import { LocatableMapMarker } from '../map/Locatable';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { opportunityMarker, transparentMarker } from 'src/containers/pages/markers';
import { IdentifiableWithTitleEntity } from './ISObject';
import { SalesforceListItemDescription, SalesforceFeedItem, title } from './SalesForceListItem';
import { IdentifiableTitleBodyHighPriority } from '../list/IListItem';
import { equipmentAddress } from '../equipment/Equipment';
import { ITenderForOpportunity, queryTenderNumbersForOpportunityIds } from 'src/actions/integration/opportunitiesActions';
import { multiQuery2 } from 'src/actions/http/jsforceCore';
import * as _ from 'lodash';
import translate from 'src/utils/translate';

export async function queryOpportunitiesWithLocationById(ids: string[]) {
    const { queries: { result: [opps, tenders] } } = 
        await multiQuery2(queryOpportunitiesById(ids), queryTenderNumbersForOpportunityIds(ids));
    const assetOppsByOppId = await queryAssetOpportunities([conditions.Asset_Opportunity__c.opportunities(opps.map(opp => opp.Id))]);
    const tendersByOpportunity = _.groupBy(tenders, 'Opportunity__c');
    return opps.map(opp => new Opportunity(opp, assetOppsByOppId[opp.Id], tendersByOpportunity[opp.Id]));
};

export class OpportunityListItem extends SalesforceListItemDescription<IApiOpportunity> {

    constructor(opp: IApiOpportunity, protected assetOpps: IAsset_Opportunity_Address__c[]) {
        super(opp);
    }

    get id() {
        return this.value.Id;
    }

    get title() {
        return this.accountApiForTitle && this.accountApiForTitle.Name;
    }

    bodyText() {
        return this.value.Name;
    }

    get bodySecondLine() {
        //for some opportunities the name already contains the address if the opportunity is linked to an asset 
        // return formatLabelValue('generic.field.equipment-address', this.equipmentAddress);
        return this.equipmentAddress;
    }

    get equipment() {
        return this.assetOpps && this.assetOpps[0] && this.assetOpps[0].Asset__r;
    }

    get equipmentId() {
        return this.equipment && this.equipment.Id;
    }

    get equipmentName() {
        return this.equipment && this.equipment.Name;
    }

    get equipmentAddress() {
        return this.assetOpps && this.assetOpps[0] && this.assetOpps[0].Asset__r && equipmentAddress(this.assetOpps[0].Asset__r) || '';
    }

    get accountApiForTitle() {
        return this.value.Account;
    }

    get entityType() {
        return EntityType.Opportunity;
    }

    get isHighPriority() {
        return false;
    }
    
    get modalType() {
        return ModalType.OpportunityModal;
    }
    
    public queryDetails = () => {
        return queryOpportunitiesWithLocationById([this.id]).then(opps => opps[0]);
    }
    
}

export class OpportunityFeedItem extends SalesforceFeedItem<IApiOpportunity, OpportunityListItem> {
    constructor(opp: IApiOpportunity, assetOpps: IAsset_Opportunity_Address__c[]) {
        super(new OpportunityListItem(opp, assetOpps));
        this.sortDate = this.value.CreatedDate;
    }

}

export default class Opportunity extends OpportunityListItem//WrapperObject<IApiOpportunity> 
    implements LocatableMapMarker, IdentifiableWithTitleEntity, IdentifiableTitleBodyHighPriority {

    private coords: ILatLng[];

    constructor(opp: IApiOpportunity, assetOpps: IAsset_Opportunity_Address__c[], private tenders: ITenderForOpportunity[]) {
        super(opp, assetOpps);
        this.coords = assetOpportunityLocations(assetOpps);
    }

    get id() {
        return this.value.Id;
    }
    /*
    get title() {
        return title(this.entityType, this.value.Account && this.value.Account.Name);
    }
*/
    get isHighPriority() {
        return false;
    }

    get equipmentNumber() {
        return this.equipment && this.equipment.Name;
    }

    get tenderNames() {
        return this.tenders == null ? [] : this.tenders.map(t => t.FLTenderNumber__c);
    }

    get description() { 
        return this.value.Description; 
    }

    get probability() {
        return this.value.Probability
    }

    get createdDate(){
        return this.value.CreatedDate;
    }

    get coordinates() {
        const coords = this.coords[0];
        return { lat: coords && coords.lat, lng: coords && coords.lng, type: EntityType.Opportunity };
    }

    get leadSource() {
        return this.value.LeadSource;
    }

    get technicianName() {
        return this.value.Technician_Name__c;
    }

    get opportunityCategory() {
        return this.value.Opportunity_Category__c;
    }


    marker() {
        return queryMapOpportunities(
            [conditions.Asset_Opportunity__c.opportunities([this.id]), conditions.Asset_Opportunity__c.open]
        ).then(ms => ms.length > 0 ? transparentMarker(opportunityMarker(ms[0], this.id)[0]) : null)
    }

    get opportunityNumber() {
        return this.value.KONE_Opportunity_Number__c;
    }

    get amount() {
        return this.value.Amount;
    }

    get currencyIsoCode() {
        return this.value.CurrencyIsoCode;
    }

    get defaultcurrencyIsoCode() {
        return this.value && this.value.DefaultCurrencyIsoCode;
    }

    get businessType() {
        return this.value.Business_Type__c;
    }

    get name() {
        return this.value.Name;
    }

    get ownerId() {
        return this.value.OwnerId;
    }

    get ownerName() {
        return this.value.Owner.Name;
        //return this.value.OwnerName;
    }

    get stageName() {
        return this.value.StageName;
    }

    get closeDate() {
        return this.value.CloseDate;
    }

    get marketSegment() {
        return this.value.Industry_Segment__c;
        //return this.value.MarketSegment;
    }

    get whatForEvent() {
        return this;
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account);
    }

    body() {
        return this.value.Name;
    }

    public getListItemBody(): string {
        return this.value.Name;
    }

}
