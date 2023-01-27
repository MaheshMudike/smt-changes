import * as cx from 'classnames';
import * as React from 'react';

import { EntityType } from '../../constants/EntityType';
import { SvgIcon } from '../../constants/SvgIcon';
import { IFeedItem } from '../../models/feed/IFeedItem';
import Dragging from './Dragging';
import { IListItemBaseProps, ListItemBody } from './ListItem';

import { connect } from 'react-redux';
import { closeCallout } from '../../actions/integration/calloutActions';
import CheckButton from '../CheckButton';
import { SmallIcon } from '../layout/Icon';
import * as _ from 'lodash';

import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { CalloutTaskStatus } from '../../models/feed/CalloutTaskStatus';
import { TaskFeedItem } from 'src/models/feed/Task';
import { EntityFieldsData } from '../fields/EntityFieldsData';
import { SObject } from 'src/actions/http/jsforceMappings';
import { insert, del, insertMany } from 'src/actions/http/jsforceCore';
import { NotificationFeedItem } from 'src/models/feed/Notification';
import { userIdFromState, IGlobalState } from 'src/models/globalState';
import { ThunkAction } from 'src/actions/thunks';
import { reloadFeed } from 'src/actions/integration/feedActions';

class CompletionButtonBase extends React.Component<ICompletionButtonProps & ICompletionButtonDispatchProps, {}> {
    public render() {
        const isClosed = this.props.isClosed;
        return <CheckButton isChecked={isClosed} onClick={isClosed ? _.noop : this.handleClick} />;
    }

    private handleClick = (ev: React.MouseEvent<any>) => {
        ev.stopPropagation();
        this.props.closeAction(this.props.feedItem, this.props.userId);
    }
}

interface ICompletionButtonProps {
    feedItem: IFeedItem;
    isClosed: boolean;
    userId: string;
}

interface ICompletionButtonDispatchProps {
    closeAction: (ifi: IFeedItem, userId: string) => void;
}

const TaskCompletionButton = connect(
    (state: IGlobalState) => ({ userId: userIdFromState(state) }), 
    { closeAction: (task: IFeedItem) => showModal(ModalType.CreateEventQuestionModal, task) }
)(CompletionButtonBase);

const CalloutCompletionButton = connect(
    (state: IGlobalState) => ({ userId: userIdFromState(state) }),
    { closeAction: (ifi: IFeedItem) => closeCallout(ifi.id) }
)(CompletionButtonBase);

const NotificationCompletionButton = connect(
    (state: IGlobalState) => ({ userId: userIdFromState(state) }),
    {
        closeAction: markNotificationAsRead
    }
)(CompletionButtonBase);

function markNotificationAsRead(ifi: IFeedItem, userId: string): ThunkAction<void> {
    return markNotificationsAsRead([ifi.id], userId, !(ifi as  any as NotificationFeedItem<any>).read);
}

export function markNotificationsAsRead(notificationIds: string[], userId: string, read: boolean): ThunkAction<void> {
    return async (dispatch, getState) => {
        const res = await insertMany(SObject.SMT_Notification_Read__c, notificationIds.map(nid => ({ User__c: userId, SMT_Notification__c: nid })));
        dispatch(reloadFeed);
        //this code is for toggling read status, think we only gonna go from unread to read
        /*
        if(read) {
            await insertMany(SObject.SMT_Notification_Read__c, notificationIds.map(nid => ({ User__c: userId, SMT_Notification__c: nid })));
        } else {
            const reads = await querySMTNotificationReads([conditions.SMT_Notification_Read__c.notifications(notificationIds)]);
            await del(SObject.Note, reads.map(r => r.Id));
        }
        */
    }
}

function CompletionButton(props: { item: IFeedItem }) {
    const { item } = props;
    switch (item.entityType) {
        case EntityType.Task:
            const task = item as TaskFeedItem<any>;
            return <TaskCompletionButton feedItem={task} isClosed={task.isClosed} />;
        case EntityType.Callout:
            const status = item.calloutTaskStatus;
            if (status !== CalloutTaskStatus.NonClosable) {
                return <CalloutCompletionButton feedItem={item} isClosed={status === CalloutTaskStatus.Closed} />;
            }
            break;
        case EntityType.Notification:
            return <NotificationCompletionButton feedItem={item} isClosed={(item as NotificationFeedItem<any>).read} />;
        default:
    }
    return <span />;
}

export function RichListItem(props: IListItemBaseProps<IFeedItem> & { entityFieldsData: EntityFieldsData } & { style?: React.CSSProperties }) {
    const { item, entityFieldsData } = props;
    return (
        <Dragging draggedData={item} className='rich-list-item'>
            <div onClick={props.onClick}
                className={cx('container--horizontal', 'rich-list-item__content', {'list-item__content--high-priority': item.isHighPriority })}>
                <div className='rich-list-item__icons-panel flex-shrink--0'>
                    { item.entityType === EntityType.Callout ?
                    <div className='container--vertical container--centered'>
                        { item.svWillManage ? <SmallIcon svg={SvgIcon.FlagEmpty} /> : null }
                        { item.isRejected ? <SmallIcon svg={SvgIcon.RejectedSmall} /> : null }
                    </div>
                    :
                    <div />}
                </div>
                <ListItemBody title={item.title} body={item.body(entityFieldsData)} bodySecondLine={item.bodySecondLine} />
                <CompletionButton item={item} />
            </div>
        </Dragging>
    );
}
