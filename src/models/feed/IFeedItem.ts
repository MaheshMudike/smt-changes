import { IDialogListItem } from '../list/IListItem';
import { EntityType } from '../../constants/EntityType';
import { CalloutTaskStatus } from './CalloutTaskStatus';
import IEventSource from '../events/IEventSource';
import { IdentifiableWithTitleEntity } from './ISObject';

export interface IFeedItem extends IDialogListItem {
    entityType: EntityType;

    //isClosed: boolean;
    sortDate: string;
    isRejected: boolean;
    svWillManage: boolean;
    calloutTaskStatus: CalloutTaskStatus;

    //IEventSource is needed in the drag & drop
    queryDetails: () => Promise<IdentifiableWithTitleEntity & IEventSource>
}