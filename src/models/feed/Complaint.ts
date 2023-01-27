import { EntityType } from '../../constants/EntityType';
import { ModalType } from '../../constants/modalTypes';
import normalizeNameAndId from '../../services/SalesForce/normalizeNameAndId';
import translate from '../../utils/translate';
import { IComplaint as IApiComplaint } from '../api/coreApi';
import { SalesforceListItem, SalesforceFeedItem } from './SalesForceListItem';
import { parseDateToTimestamp } from '../../utils/parse';
import { conditions } from '../../actions/http/jsforceMappings';
import { queryComplaintsBase } from '../../actions/http/jsforce';
import { accountWithTypeArray } from 'src/actions/planCustomerVisitActions';
import { ISalesForceEventSource } from './ISObject';
import { IWithLastModification } from './IWithLastModification';

export class ComplaintListItem<T extends IApiComplaint> extends SalesforceListItem<T> {

    get entityType(): EntityType {
        return EntityType.Complaint;
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
        return ModalType.ComplaintModal;
    }

    public queryDetails = () => {
        //return queryEntityByIdWrap(this, c => new Complaint(c));
        return queryComplaintsBase([conditions.SObject.id(this.id)]).then(ts => new Complaint(ts[0]))
    }
}

//https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/125988431/Display+Customer+feed
export class ComplaintFeedItem<T extends IApiComplaint> extends SalesforceFeedItem<T, ComplaintListItem<T>> {
    constructor(c: T, userId: string) {
        super(new ComplaintListItem(c));
        this.sortDate = this.value.CreatedDate;
        this.svWillManage = conditions.Case.escalatedTo(userId).isFullfilledBy(this.value);
    }

}


export default class Complaint extends ComplaintListItem<IApiComplaint> implements ISalesForceEventSource, IWithLastModification {
    
    get complaintNumber(): string {
        return this.value.CaseNumber;
    }

    get origin(): string {
        return this.value.Origin;
    }

    get reason(): string {
        return this.value.Reason;
    }

    get contact() {
        return normalizeNameAndId(this.value.Contact);
    }

    get contactPhone(): string {
        return this.value.Contact == null ? null : this.value.Contact.Phone;
    }

    get status(): string {
        return this.value.Status;
    }

    get subject(): string {
        return this.value.Subject;
    }

    get whatForEvent() {
        return this;
        //complaint number was used in the title before, the title is just displayed in the event dialog
        /*
        return {
            id: this.value.Id,
            name: `${ translate('generic.entity-name.complaint') } - ${ this.complaintNumber }`,
            entityType: EntityType.Complaint
        };
        */
    }

    get accountsForEventCreation() {
        return accountWithTypeArray(this.value.Account);
    }

    get lastModifiedDate() {
        return parseDateToTimestamp(this.value.LastModifiedDate);
    }
}
