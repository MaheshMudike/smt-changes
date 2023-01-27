import * as cx from 'classnames';
import * as React from 'react';

import { listItemsClasses } from '../constants/layout';
import { IListGroup } from '../models/list/aggregations';
import { ListBody } from './list/ListBody';
import { ListItem } from './list/ListItem';
import { IdentifiableTitleBodyHighPriority } from '../models/list/IListItem';
import { Group } from './list/Group';
import { flatten } from 'lodash';
import { ActionStatus } from '../actions/actions';
import { Spinner } from './Spinner';
import { searchGroupNumber } from '../actions/searchActions';
import { Identifiable } from '../models/feed/ISObject';
import * as _ from 'lodash';
import { EntityFieldsData } from './fields/EntityFieldsData';
import { OpportunityGroupingTitle } from './overview/OpportunityTopBar';
import translate from 'src/utils/translate';

export enum ListItemType {
    LIST_ITEM = 'LIST_ITEM',
    GROUP_TITLE = 'GROUP_TITLE'
}

export interface IGroup { title: string, isExtraordinary: boolean, listItemType: ListItemType, id: string }

export function flattenGroups<T>(listItems: IListGroup<T>[]) {
    return flatten((listItems || []).map(group => 
        group.title != null ? [{ title: group.title, isExtraordinary: group.isExtraordinary, listItemType: ListItemType.GROUP_TITLE, id: group.title }, ...group.items] : group.items
    ));
}

//T extends {} because of syntax ambiguities
const renderFlatList = <T extends any, U extends IListGroupCollapsible<T>>(props: ISplitPanelProps<T, U>) => (item: T, style: React.CSSProperties) => {
    return item.listItemType === ListItemType.GROUP_TITLE ? 
        (item.title == null ? null : 
            <Group title={item.title} isExtraordinary={item.isExtraordinary} style={style}/>) :
            <ListItem item={item as any} entityFieldsData={props.entityFieldsData} isSelected={props.selectedItem && props.selectedItem.id === item.id} 
                onClick={() => props.onItemClick(item)} key={`${ item.id }`} style={style}/>;
}

/*
const renderNestedList = (props: any) => <T extends IdentifiableTitleBodyHighPriority>(item: IListGroup<T>, style: React.CSSProperties) => {
    return <Group title={item.title} isExtraordinary={item.isExtraordinary} style={style}>
                {item.items.map(item => <ListItem item={item} isSelected={props.selectedItem && props.selectedItem.id === item.id} onClick={() => props.onItemClick(item)} key={`${ item.id }`} style={style}/>)}                
            </Group>
            
}
*/

export interface IListGroupCollapsible<T> extends IListGroup<T> {
    alwaysOpen?: boolean;
}

interface ISearchGroupResultProps<T> {
    group: IListGroupCollapsible<T>;
    selectedItem: Identifiable;
    onItemClick: (item: T) => void;
    groupButtons: (group: IListGroup<T>) => JSX.Element[];
    filter?: (item: T) => boolean;
    entityFieldsData: EntityFieldsData;
}

export class SearchGroupResultClass<T extends IdentifiableTitleBodyHighPriority, TMapItem> extends React.Component<ISearchGroupResultProps<T>, { open: boolean }> {

    constructor(props: ISearchGroupResultProps<T>) {
        super(props);
        this.state = { open: this.props.group.alwaysOpen };
    }

    public render() {
        const { group, selectedItem, filter = () => true } = this.props;
        const title = OpportunityGroupingTitle[group.title] != undefined ? translate(OpportunityGroupingTitle[group.title]) : group.title
        const filteredItems = group.items.filter(filter);
        return <div key={title}>
                <div className={cx('collapsible-group-header', {'is-open': this.state.open})}>
                <div className={cx('list-item subheader relative container--horizontal', { 'subheader--alert': group.isExtraordinary })} >
                    <div className='container--horizontal flex-grow--1'
                        onClick={() => { if(this.isCollapsible && !group.alwaysOpen) this.setState({ open: !this.state.open })} } >
                        <div className='flex-grow--1'>
                            <div className="Select-arrow" style={ {visibility: group.alwaysOpen ? 'hidden' : 'visible'} }/>
                            {title}
                        </div>
                        {(group.actionStatus == ActionStatus.FAILURE) ?
                        <span>{"Error"}</span> : <span>{searchGroupNumber(filteredItems.length)}</span>
                        }
                    </div>
                    {group.actionStatus == ActionStatus.START &&
                        <div className={cx('cover-all overlay container--centered')}><Spinner isSmall={true}/></div>
                    }
                    <div className="container--horizontal">
                        { this.props.groupButtons && this.props.groupButtons(group) }
                    </div>
                </div>
                </div>
                {
                    this.state.open && 
                    <div>
                    {
                        filteredItems.map(
                            item => <ListItem item={item} isSelected={selectedItem && selectedItem.id === item.id} onClick={() => this.props.onItemClick(item)} 
                                key={`${ item.id }`} entityFieldsData={this.props.entityFieldsData}/>
                        )
                    }
                    </div>
                }

        </div>;
    }

    private isCollapsible = () => {
        return this.props.group.items.length > 0 && !this.props.group.alwaysOpen;
    }

    public componentWillReceiveProps(props: ISearchGroupResultProps<T>) {
        //if(!this.props.group.alwaysOpen && (!this.isCollapsible || this.props.group != props.group)) this.setState({ open: false });
        if(!this.props.group.alwaysOpen && !this.isCollapsible) this.setState({ open: false });
    }
}

//const SearchGroupResult = connect(null, { chooseSelectedSearchObjects })(SearchGroupResultClass);

export function ListContainer( props: { list: React.ReactNode, detail: React.ReactNode, listItemsClasses?: string }) {
    return (
        <div className='full-height'>
            <div className={cx('split-panel--side-above', 'no-padding', props.listItemsClasses || listItemsClasses)}>
                { props.list }
            </div>
            { props.detail }
        </div>
    );
}


interface ISplitPanelProps<T, U extends IListGroupCollapsible<T>> extends React.WithChildren {
    listItems: U[];
    listTopPart?: JSX.Element;
    listItemsClasses?: string;
    selectedItem: Identifiable;
    renderCollapsibleGroups?: boolean;
    onItemClick?: (t: T) => void;
    groupButtons?: (group: U) => JSX.Element[];
    entityFieldsData: EntityFieldsData
}

export default function ListSplitPanel<T extends IdentifiableTitleBodyHighPriority, U extends IListGroupCollapsible<T>>(props: ISplitPanelProps<T, U>) {
    const onlyOneEmptyGroup = props.listItems != null && props.listItems.length == 1 && (props.listItems[0].title == null || props.listItems[0].title == '');
    return (
        <ListContainer listItemsClasses={props.listItemsClasses} 
            list={
                <div className="full-height container--vertical list-container">
                    {props.listTopPart}
                    {
                        props.renderCollapsibleGroups && !onlyOneEmptyGroup ? 
                        <ListBody selectedItem={props.selectedItem} listItems={props.listItems} 
                            onScrollToBottom={null} versionMarker={null} showBottomSpinner={false} 
                            renderItem={ group => 
                                <SearchGroupResultClass groupButtons={props.groupButtons} selectedItem={props.selectedItem} group={group} 
                                    onItemClick={props.onItemClick} entityFieldsData={props.entityFieldsData}/>
                            }/>
                        :
                        <ListBody selectedItem={props.selectedItem} listItems={flattenGroups(props.listItems)} onScrollToBottom={null} versionMarker={null} 
                            showBottomSpinner={false} renderItem={ renderFlatList(props) }/>
                    }
                    
                </div>
            } 
            detail={ props.children } 
        />
    );
}