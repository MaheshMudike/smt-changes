import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { ListBody } from '../list/ListBody';

import { ThunkDispatch, ThunkAction } from 'src/actions/thunks';
import { queryAndShowDetailsDialogFromListItem } from 'src/actions/integration/detailsActions';
import { SearchGroupResultClass, IListGroupCollapsible } from '../ListSplitPanel';
import { IListItem } from 'src/models/list/IListItem';
import { ActionStatus } from 'src/actions/actions';
import { asyncHttpActionGenericLocalStateGroups } from 'src/actions/http/httpActions';
import translate from 'src/utils/translate';
import { EntityFieldsData, entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { IGlobalState } from 'src/models/globalState';

const minLimit = 15;
const LIMIT_STEP = 15;

export enum ItemOpeningMode {
    Modal,
    Query
}

export type IDataStatusListItemGroups = IListGroupCollapsible<IListItem>[]

type IItemsListProps<T, TQueryParams> = {
    topbar?: JSX.Element;
    queryParams: TQueryParams,
    mode?: ItemOpeningMode, dispatch: ThunkDispatch, 
    groupProperties: { title: string, groupKey: string, action: (id: TQueryParams) => Promise<IListItem[]> }[],
    filter?: (t: T) => boolean,
    entityFieldsData: EntityFieldsData
    //action: (component: React.Component<any, { groups: _.Dictionary<IListGroupCollapsible<T>> }>, id: string, limit: number) => ThunkAction<void>,
}

function initialGroup<T>(title: string) {
    return {
        isExtraordinary: false,
        actionStatus: ActionStatus.SUCCESS,
        items: [] as T[],
        title
    }
}

export type DictionaryKey = string | number;

class ItemsListGroupsClass<T extends IListItem, TQueryParams> extends React.Component<IItemsListProps<T, TQueryParams>, 
    { limit: number, groups: _.Dictionary<IListGroupCollapsible<T>>, asyncActions: _.Dictionary<Promise<void>> }> {
   
    constructor(props: IItemsListProps<T, TQueryParams>) {
        super(props);
        const groups = _.mapValues(_.keyBy(this.props.groupProperties, 'groupKey'), g => initialGroup<T>(translate(g.title)));
        this.state = { limit: minLimit, groups, asyncActions: {} };
    }
//<ListItem item={item} onClick={() => dispatch(mode == ItemOpeningMode.Modal ? showModal(item.modalType, item)) } />
    public render() {
        const { dispatch, mode = ItemOpeningMode.Modal, filter, entityFieldsData } = this.props;
        const groups = this.state.groups;

        return <ListBody 
            topbar={this.props.topbar}
            onScrollToBottom={this.loadNextPage} versionMarker={null} 
            isLoading={false} listItems={_.values(groups)}
            showBottomSpinner={ this.showBottomSpinner() }
            renderItem={ (group) => 
                <SearchGroupResultClass filter={filter} groupButtons={() => []} selectedItem={null} group={group} 
                    onItemClick={item => dispatch(queryAndShowDetailsDialogFromListItem(item))} entityFieldsData={entityFieldsData}/>
            }
            /*
            renderItem={(item, style) => 
                <ListItem item={item} onClick={() => dispatch(queryAndShowDetailsDialogFromListItem(item)) } />
            }
            */
        />
        
    }

    private showBottomSpinner = () => {
        return false;
        /*
        const dataSize = this.state.data == null ? 0 : this.state.data.length;
        return isLoading || this.state.limit <= dataSize;
        */
    }

    private loadNextPage = () => {
        /*
        if(this.state.status !== ComponentStatus.IN_PROGRESS && this.state.limit <= this.state.data.length) {
            this.setState({ limit: this.state.limit + LIMIT_STEP });
            this.queryEvents();
        }
        */
    }

    componentWillUnmount() {
        for(let key in this.state.asyncActions) {
            //TODO check and install npm make cancellable
            //this.state.asyncActions[key].cancel();
        }
    }

    public componentDidMount() {
        this.queryGroups();
    }

    queryGroups = () => {
        const { queryParams, dispatch } = this.props;

        this.props.groupProperties.forEach(g => 
            dispatch(asyncHttpActionGenericLocalStateGroups(g.groupKey, this, () => g.action(queryParams)))
        )
    }

}

export default connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }), 
    (dispatch) => ({ dispatch })
)(ItemsListGroupsClass);
