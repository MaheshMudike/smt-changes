/*
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { ListItem } from '../list/ListItem';
import { ListBody } from '../list/ListBody';
import { ItemsStatus, ComponentStatus, initialDataStatus } from 'src/models/IItemsState';
import { EmptyView } from '../EmptyView';
import Event from 'src/models/events/Event';
import { downloadEvents } from 'src/actions/integration/accountActions';
import { ThunkDispatch } from 'src/actions/thunks';
import { DataStatusContainer } from '../StatusContainer';
import { showModal } from 'src/actions/modalActions';
import ItemsList from './ItemsList';

const minLimit = 15;
const LIMIT_STEP = 15;

type IEventListyProps =  { id: string } & { dispatch: ThunkDispatch }

//account ST TRUIDENSE WOONCENTRALE BVBA has long list
class EventListClass extends React.Component<IEventListyProps, { limit: number } & ItemsStatus<Event>> {
   
    constructor(props: IEventListyProps) {
        super(props);
        this.state = { limit: minLimit, ...initialDataStatus() };
    }

    public render() {
        const events = this.state.data;
        const dispatch = this.props.dispatch;
        const isLoading = this.state.status === ComponentStatus.IN_PROGRESS;
        return <DataStatusContainer {...this.state}>
                <ListBody onScrollToBottom={this.loadNextPage} versionMarker={this.props.id} 
                    isLoading={isLoading} listItems={events}
                    showBottomSpinner={ this.showBottomSpinner() } 
                    renderItem={(item, style) => 
                        <ListItem item={item} onClick={() => dispatch(showModal(item.modalType, item))} />
                    }
                />
        </DataStatusContainer>
    }

    private showBottomSpinner = () => {
        const isLoading = this.state.status === ComponentStatus.IN_PROGRESS;
        const dataSize = this.state.data == null ? 0 : this.state.data.length;
        return isLoading || this.state.limit <= dataSize;
    }

    private loadNextPage = () => {
        if(this.state.status !== ComponentStatus.IN_PROGRESS && this.state.limit <= this.state.data.length) {
            this.setState({ limit: this.state.limit + LIMIT_STEP });
            this.queryEvents();
        }
    }

    public componentWillReceiveProps(nextProps: IEventListyProps) {
        if (this.props.id !== nextProps.id) {
            this.setState({ limit: minLimit });
            this.queryEvents();
        }
    }

    public componentDidMount() {
        this.queryEvents();
    }

    private queryEvents() {
        this.props.dispatch(downloadEvents(this, this.props.id, this.state.limit));
    }

}

export const EventList = connect(null, (dispatch) => ({ dispatch }))(EventListClass);
*/
