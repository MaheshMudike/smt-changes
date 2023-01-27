import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { selectFeedMode, selectMyTasksType, selectMyAuditsType, loadFeedPage } from '../../actions/integration/feedActions';
import { showModal } from '../../actions/modalActions';
import { ListBody } from '../../components/list/ListBody';
import { RichListItem, markNotificationsAsRead } from '../../components/list/RichListItem';
import { FeedMode } from '../../models/feed/FeedMode';
import { IFeedItem } from '../../models/feed/IFeedItem';
import { MyTasksType } from '../../models/feed/state';
import translate from '../../utils/translate';
import { IGlobalState, userIdFromState } from '../../models/globalState';
import { createSelector } from 'reselect';
import { SmallIcon } from '../../components/layout/Icon';
import { SvgIcon } from '../../constants/SvgIcon';
import { Group } from '../../components/list/Group';
import { flattenGroups, ListItemType, IGroup } from '../../components/ListSplitPanel';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import CheckButton from 'src/components/CheckButton';
import { ThunkAction } from 'src/actions/thunks';
import { NotificationFeedItem } from 'src/models/feed/Notification';
import { EntityType } from 'src/constants/EntityType';

const titles: () => _.Dictionary<string> = () => ({
    [FeedMode.MyTasks]: translate('feed.title-my-tasks'),
    [FeedMode.Konect]: translate('feed.title-konect'),
    [FeedMode.Notifications]: translate('feed.title-notifications'),
    [FeedMode.Audits]: translate('feed.title-audits'),
});


export function FilterBar(props: IFilterBarProps) {
    return (
        <div className={cx('container--horizontal', { 'filter-bar--bottom': props.isBottom })}>
            {props.items.map((item, index) => {
                const isSelected = props.selectedIndex === index;
                return (
                <div className={cx('filter-bar__button', 'container--centered', 
                            {clickable: !isSelected, 'filter-bar__button--active': isSelected})}
                    style={{ flexBasis: `${ 100 / props.items.length }%` }}
                    onClick={() => props.onSelectIndex(index)} key={index}>
                    {item}
                </div>)
            })}
        </div>
    );
}

interface IFilterBarProps {
    isBottom?: boolean; 
    items: JSX.Element[];
    selectedIndex: number;
    onSelectIndex: (n: number) => void;
}


/*
const FeedScroller = connect<IListBodyProps, IListBodyDispatchProps, {}>(
    (state: IGlobalState) => ({
        showBottomSpinner: state.feed.paging.hasMorePages && state.feed.items.length > 0,
        versionMarker: state.feed.filters,
        isLoading: state.feed.paging.isReloading,
        listItems: state.feed.items
    }),
    {
        onScrollToBottom: loadFeedPage,
    },
)(ListBody);
*/

class FeedClass extends React.Component<ReturnType<typeof FeedStateProps> & IFeedProps, object> {

    private hasMorePages= () => {
        return this.props.paging.hasMorePages && this.props.listItems.length > 0;
    }

    public render() {
        const { listItems, filters, myTasksCounts, myAuditsCounts, entityFieldsData } = this.props;
        const filterDefsTasks: [string, number, MyTasksType][] = [
            [translate('feed.tab.open'), myTasksCounts.open, MyTasksType.Open],
            [translate('feed.tab.completed'), myTasksCounts.closed, MyTasksType.Done],
        ];
        const taskTypes = filterDefsTasks.map(d => d[2]);

        const filterDefsAudits: [string, number, MyTasksType][] = [
            [translate('feed.tab.audits-without-event'), myAuditsCounts.open, MyTasksType.Open],
            [translate('feed.tab.audits-with-event'), myAuditsCounts.closed, MyTasksType.Done],
        ];
        const auditTypes = filterDefsTasks.map(d => d[2]);

        // const modes = [FeedMode.MyTasks, FeedMode.SalesForce, FeedMode.Konect, FeedMode.Audits, FeedMode.Notifications];
        // const modes = [FeedMode.MyTasks, FeedMode.SalesForce, FeedMode.Konect, FeedMode.Notifications];
        const modes = [FeedMode.MyTasks, FeedMode.Konect, FeedMode.Audits, FeedMode.Notifications];

        const items = flattenGroups(listItems);
        //className="feed-header__checkbox" 
        return (
            <div className="full-height container--vertical feed">
                <div className={cx('feed-header', {'feed-header--separated': filters.mode !== FeedMode.MyTasks })}>
                    <h3 className='feed-header__title container--horizontal'>
                        {titles()[filters.mode]}
                        {
                            filters.mode == FeedMode.Notifications && 
                            <CheckButton className="feed-header__checkbox" isChecked={false} onClick={() => this.props.markAllNotificationsAsRead()} />
                        }
                    </h3>
                </div>

                {this.props.filters.mode === FeedMode.MyTasks ?   
                    <FilterBar
                        items={filterDefsTasks.map(([caption, count], index) => 
                            <div key={index} className='my-tasks-filter full-width padding-vertical--decreased'>
                                <span className='badge my-tasks-filter__badge'>{ count == -2 ? '?' : count == -1 ? '-' : count }</span>
                                <span className='my-tasks-filter__caption'>{caption}</span>
                            </div>
                        )}
                        onSelectIndex={i => this.props.selectMyTasksType(taskTypes[i])}
                        selectedIndex={taskTypes.indexOf(this.props.filters.selectedMyTasksTypes)}
                    />
                    : null
                }
                {this.props.filters.mode === FeedMode.Audits ?   
                    <FilterBar
                        items={filterDefsAudits.map(([caption, count], index) => 
                            <div key={index} className='my-tasks-filter full-width padding-vertical--decreased'>
                                <span className='badge my-tasks-filter__badge'>{ count == -2 ? '?' : count == -1 ? '-' : count }</span>
                                <span className='my-tasks-filter__caption'>{caption}</span>
                            </div>
                        )}
                        onSelectIndex={i => this.props.selectMyAuditsType(auditTypes[i])}
                        selectedIndex={auditTypes.indexOf(this.props.filters.selectedMyAuditsTypes)}
                    />
                    : null
                }
                <ListBody onScrollToBottom={this.props.loadFeedPage} versionMarker={this.props.filters} isLoading={this.props.paging.isReloading} 
                    listItems={items} showBottomSpinner={this.hasMorePages()}
                    renderItem={(item, style) => {
                    switch((item as any).listItemType) {
                        case ListItemType.GROUP_TITLE:
                            const group = item as IGroup;
                            return group.title == null ? null : <Group key={group.title} title={group.title} isExtraordinary={group.isExtraordinary} style={style}/>;
                        default:
                            const feedItem = item as IFeedItem;
                            return <RichListItem item={feedItem} key={item.id} style={style} entityFieldsData={entityFieldsData}
                                onClick={() => { if(feedItem.modalType != null) this.props.showModal(feedItem.modalType, item); }}
                            />;
                    }
                }}>
                </ListBody>
                <FilterBar isBottom items={[
                    <div>
                        <SmallIcon svg={SvgIcon.Task} />
                        { this.props.myTasksCounts.open > 0 ? <span className='badge my-tasks-badge'>{this.props.myTasksCounts.open}</span> : null }
                    </div>,
                    <SmallIcon svg={SvgIcon.Konect} />,
                    <div>
                        <SmallIcon svg={SvgIcon.Audit} />
                        { this.props.myAuditsCounts.open > 0 ? <span className='badge my-tasks-badge'>{this.props.myAuditsCounts.open}</span> : null }
                    </div>,
                    <FontAwesomeIcon style={{ color: '#969899' }} className='hello' icon={faBell} />
                ]} onSelectIndex={i => this.props.selectFeedMode(modes[i])} selectedIndex={modes.indexOf(filters.mode)} />
            </div>
        );
    }
}

type IFeedProps = {
    showModal: typeof showModal;
    selectMyTasksType: typeof selectMyTasksType;
    selectMyAuditsType: typeof selectMyAuditsType;
    selectFeedMode: typeof selectFeedMode;
    loadFeedPage: typeof loadFeedPage;
    markAllNotificationsAsRead: typeof markAllNotificationsAsRead;
};

const FeedStateProps = createSelector(
    (state: IGlobalState) => state.feed,
    state => entityFieldsDataFromState(state),
    (feed, entityFieldsData) => {
        const { filters, paging, myTasksCounts, myAuditsCounts, itemGroups } = feed;
        return {
            listItems: itemGroups,//groupItems(items, filters),
            filters,
            myTasksCounts,
            myAuditsCounts,
            paging,
            selectedItem: null,
            entityFieldsData
        };
    }
)

function markAllNotificationsAsRead(): ThunkAction<void> {
    return (dispatch, getState) => {
        const state = getState();
        const feed = state.feed;
        if(feed.filters.mode == FeedMode.Notifications) {
            const items = flattenGroups(feed.itemGroups);
            const unreadNotifications = items.filter(item => {
                const notif = item as NotificationFeedItem<any>;
                return notif.entityType === EntityType.Notification && !(item as NotificationFeedItem<any>).read;
            });
            dispatch(markNotificationsAsRead(unreadNotifications.map(item => item.id), userIdFromState(state), true));
        }
    }
}

export const Feed = connect(
    FeedStateProps,
    {
        showModal,
        selectFeedMode,
        selectMyTasksType,
        selectMyAuditsType,
        loadFeedPage,
        markAllNotificationsAsRead
    },
)(FeedClass) as React.ComponentClass<{}>;