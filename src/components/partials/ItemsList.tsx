import * as _ from 'lodash';
import * as React from 'react';
import { ListItem } from '../list/ListItem';
import { ListBody } from '../list/ListBody';
import { ComponentStatus, initialDataStatus, DataStatus } from 'src/models/IItemsState';
import { DataStatusContainer } from '../StatusContainer';
import { showModal } from 'src/actions/modalActions';
import { EntityFieldsData } from '../fields/EntityFieldsData';
import { EmptyView } from '../EmptyView';
import { ModalType } from 'src/constants/modalTypes';
import { IdentifiableTitleBodyHighPriority } from 'src/models/list/IListItem';
import ReactComponent from '../details/account/MyReactComponent';


type ItemsListDataStatusProps<T> = {
    topbar?: JSX.Element;
    renderItem: (item: T, style: React.CSSProperties) => JSX.Element,
    showBottomSpinner?: boolean,
    onScrollToBottom?: () => void;
    dataStatus: DataStatus<T[]>;
    versionMarker?: any;
}

export class ItemsListDataStatus<T> extends React.Component<ItemsListDataStatusProps<T>, object> {
    constructor(props: ItemsListDataStatusProps<T>) {
        super(props);
        this.state = { ...initialDataStatus() };
    }

    public render() {
        const { dataStatus, topbar, onScrollToBottom = () => {}, versionMarker, showBottomSpinner = false, renderItem } = this.props;
        const items = dataStatus.data;
        const isLoading = dataStatus.status === ComponentStatus.IN_PROGRESS;
        return <DataStatusContainer {...dataStatus}>
                <ListBody
                    topbar={topbar}
                    onScrollToBottom={onScrollToBottom} 
                    versionMarker={versionMarker}
                    emptyView={<EmptyView />}
                    isLoading={this.dataSize() == 0 && isLoading} 
                    listItems={items}
                    showBottomSpinner={showBottomSpinner } 
                    renderItem={renderItem}
                />
        </DataStatusContainer>
    }

    private dataSize = () => {
        const dataStatus = this.props.dataStatus;
        return dataStatus.data == null ? 0 : dataStatus.data.length;
    }

}

const minLimit = 15;
const LIMIT_STEP = 15;

type IItemsListAbstractProps<T> = {
    topbar?: JSX.Element;
    queryItems: (limit: number) => Promise<T[]>,
    renderItem: (item: T, style: React.CSSProperties) => JSX.Element
}

export class ItemsListClassAbstract<T> extends ReactComponent<IItemsListAbstractProps<T>, { limit: number } & DataStatus<T[]>> {

    constructor(props: IItemsListAbstractProps<T>) {
        super(props);
        this.state = { limit: minLimit, ...initialDataStatus() };
    }

    public render() {
        return <ItemsListDataStatus
            topbar={this.props.topbar}
            dataStatus={this.state}
            onScrollToBottom={this.loadNextPage}
            showBottomSpinner={ this.showBottomSpinner() } 
            renderItem={this.props.renderItem}
        />;
    }

    private dataSize = () => {
        return this.state.data == null ? 0 : this.state.data.length;
    }

    private showBottomSpinner = () => {
        const isLoading = this.state.status === ComponentStatus.IN_PROGRESS;
        return isLoading || this.state.limit <= this.dataSize();
    }

    private loadNextPage = () => {
        if(this.state.status !== ComponentStatus.IN_PROGRESS && this.state.limit <= this.state.data.length) {
            this.setState(
                { limit: this.state.limit + LIMIT_STEP }, 
                () => super.runPromise(() => this.props.queryItems(this.state.limit), (ds, prevState) => ({ ...prevState, ...ds }))
            );
        }
    }

    public componentDidMount() {
        super.runPromise(() => this.props.queryItems(this.state.limit), (ds, prevState) => ({ ...prevState, ...ds }) );
    }

}

type ItemsListClassProps<T> = {
    showModal: typeof showModal, 
    entityFieldsData: EntityFieldsData,
    queryItems: (limit: number) => Promise<T[]>,
}

export default class ItemsListClass<T extends IdentifiableTitleBodyHighPriority & { modalType: ModalType }> 
    extends ReactComponent<ItemsListClassProps<T>, object> {
    public render() {
        return <ItemsListClassAbstract {...this.props} 
            queryItems={this.props.queryItems}
            renderItem={(item: T, style) => 
                <ListItem item={item} onClick={() => this.props.showModal(item.modalType, item)} 
                    entityFieldsData={this.props.entityFieldsData}/>
            }
        />
    }

}