import { EntityType } from '../../constants/EntityType';
import { joinOptionals } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { AuditListItemBase } from './Audit';
import { IAuditApi } from '../api/coreApi';

export default class DiscussionListItem extends AuditListItemBase {

    public getEntityType() {
        return EntityType.Discussion;
    }

    get title() {
        return joinOptionals([translate('generic.entity-name.audit-monthly'), this.technicianName], ' - ', true);
    }

    public queryDetails() {
        return Promise.resolve(new Discussion(this.value));
    }
}

export class Discussion extends DiscussionListItem {
    constructor(public value: IAuditApi) {
        super(value);
    }
}