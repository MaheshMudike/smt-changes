import * as _ from 'lodash';
import * as React from 'react';

import { EmptyView } from '../../components/EmptyView';
import { ModalType } from '../../constants/modalTypes';
import { IAggregatedList, IListGroup } from '../../models/list/aggregations';
import { CoveringSpinner } from '../CoveringSpinner';
import { ErrorView } from '../EmptyView';
import ListSplitPanel from '../ListSplitPanel';

import { IdentifiableWithTitle } from '../../models/feed/ISObject';
import { IdentifiableTitleBodyHighPriority } from '../../models/list/IListItem';
import { ActionStatus } from '../../actions/actions';
import { connect } from 'react-redux';
import { synchronizeCurrentPage } from '../../actions/integration/synchronization';
import { showModal } from '../../actions/modalActions';
import { EntityFieldsData, entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { IGlobalState } from 'src/models/globalState';

interface IOverviewListDispatchFromProps<T> {
    synchronizeCurrentPage: () => void;
    showModal: (mt: ModalType, a: any) => void;
    selectAction: (t: T) => void;
}

interface IAggregatedListWithItemToRender<T,U> extends IAggregatedList<T> {
    itemToRender: U,
    itemToRenderStatus: ActionStatus,
}

export interface IOverviewListOptions2<T, TDetail> extends IAggregatedListWithItemToRender<T, TDetail>{
    detail: (t: TDetail) => JSX.Element | JSX.Element[];
    selectAction: (t: T) => void;
    listTopPart?: JSX.Element;
    autoSelectItem?: boolean;
    renderCollapsibleGroups?: boolean;
    entityFieldsData: EntityFieldsData;
}

class OverviewList<T extends IdentifiableTitleBodyHighPriority, U extends IdentifiableWithTitle> 
extends React.Component<IOverviewListOptions2<T, U> & IOverviewListDispatchFromProps<T>, object> {

    public render() {
        const { isProcessing, listItems, selectedItem, renderCollapsibleGroups, listTopPart, selectAction, entityFieldsData } = this.props;
        return (
            <div className='full-height'>
                {isProcessing ? <CoveringSpinner className='above-split-panel' /> : null}
                <ListSplitPanel
                    listItems={listItems}
                    onItemClick={selectAction}
                    selectedItem={selectedItem}
                    listTopPart={listTopPart}
                    renderCollapsibleGroups={renderCollapsibleGroups}
                    entityFieldsData={entityFieldsData}
                >
                    {this.renderRightPanel()}
                </ListSplitPanel>
            </div>
        );
    }

    public componentDidMount() {
        this.props.synchronizeCurrentPage();
    }

    public componentWillReceiveProps(next: IAggregatedListWithItemToRender<T,U>) {
        if(this.props.autoSelectItem === false) return;

        const currentSelectedItem = next.selectedItem;
        const items = next.listItems;
        if (!currentSelectedItem || !this.isSelectedItemInGroup(currentSelectedItem, items)) {
            const firstItem = (items && items.length > 0 && items[0].items && items[0].items.length > 0) ? items[0].items[0] : null;
            if (firstItem) this.props.selectAction(firstItem);
        }               
    }

    protected renderRightPanel() {
        const isEmpty = this.isEmpty;
        const actionStatus = this.props.itemToRenderStatus;

        if (isEmpty) return <EmptyView isGrey />;
        if(actionStatus === ActionStatus.START) return <CoveringSpinner />;
        else if(actionStatus === ActionStatus.FAILURE) return <ErrorView isGrey />;

        const itemToRender = this.props.itemToRender;
        return itemToRender == null ? null : this.props.detail(itemToRender);
    }

    private get isEmpty() {
        return !_.find(this.props.listItems, group => group.items.length > 0)
            && !this.props.isProcessing;
    }

    private isSelectedItemInGroup = (currentSelectedItem: T, items: IListGroup<T>[]) => {        
        return _.some(_.flatMap(items, (t: IListGroup<T>) => t.items), x => x.id === currentSelectedItem.id);
    };

}

export default connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    {
        synchronizeCurrentPage,
        showModal
    },
)(OverviewList);