import * as React from 'react';
import { CoveringSpinner } from '../CoveringSpinner';
import { Spinner } from '../Spinner';
import { Identifiable } from '../../models/feed/ISObject';

type IListBodyComponentProps<T> = IListBodyProps<T> & IListBodyDispatchProps & {
    showBottomSpinner: boolean
};

export class ListBody<T> 
    extends React.Component<IListBodyComponentProps<T>, object> {

    public refs: {
        listBody: HTMLDivElement;
    };

    constructor(param: IListBodyComponentProps<T> & IListBodyDispatchProps) {
        super(param);
    }

    public render() {
        const { isLoading, emptyView, topbar, listItems, showBottomSpinner } = this.props;
        return (
            <div className='list-body flex-grow--1'>
                {isLoading ? <CoveringSpinner /> : null}
                {listItems == null && !isLoading && emptyView}
                {listItems != null &&
                    <div className='cover-all scrollable' onScroll={this.onScroll} ref='listBody'>
                        {topbar}
                        {listItems.map(item => this.props.renderItem(item, {}))}
                        {showBottomSpinner && 
                            <div className='block--smaller container--centered' style={{}}>
                                <Spinner isSmall />
                            </div>
                        }
                    </div>
                }
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: IListBodyProps<T>) {
        if (this.props.versionMarker !== nextProps.versionMarker && this.refs.listBody) {
            this.refs.listBody.scrollTop = 0;
        }
    }

    //TODO this should be fixed so it works also when there is no scrollbar present
    private onScroll = () => {
        if(!this.props.onScrollToBottom) return;
        const panel = this.refs.listBody;
        const scrollBottom = panel.scrollHeight - panel.offsetHeight - panel.scrollTop;
        const bottomThreshold = 100;
        if(scrollBottom < bottomThreshold) this.props.onScrollToBottom();
    }
    
}

export interface IListBodyProps<T> {
    topbar?: JSX.Element;
    emptyView?: JSX.Element;
    isLoading?: boolean;
    versionMarker: any;
    listItems: T[];
    selectedItem?: Identifiable;
    renderItem: (item: T, style: React.CSSProperties) => JSX.Element
}

export interface IListBodyDispatchProps {
    onScrollToBottom: () => void;
}
