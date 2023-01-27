import * as React from 'react';
import { CoveringSpinner } from '../CoveringSpinner';
import { Identifiable } from '../../models/feed/ISObject';

type IListBodyContainerProps = {
    isLoading?: boolean;
    selectedItem?: Identifiable;
    onScroll?: () => void;
};

export class ListBodyContainer extends React.Component<IListBodyContainerProps, object> {

    public render() {
        return (
            <div className="full-height container--vertical list-container">
                <div className='list-body flex-grow--1'>
                    {this.props.isLoading ? <CoveringSpinner /> : null}
                    <div className='cover-all scrollable' onScroll={this.props.onScroll} ref='listBody'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

}