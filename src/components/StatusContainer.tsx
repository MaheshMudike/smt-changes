import * as React from 'react';

import { CoveringSpinner } from './CoveringSpinner';
import { EmptyView } from './EmptyView';
import { IItemsState, ItemsStatus, ComponentStatus } from '../models/IItemsState';
import { Identifiable } from '../models/feed/ISObject';
import { Spinner } from './Spinner';


export class ComponentStatusContainer extends React.Component<{ status: ComponentStatus }> {
    public render() {
        const { status } = this.props;
        return (
            <React.Fragment>
                { 
                    status == null || status == ComponentStatus.IN_PROGRESS ?
                    <div className={'cover-all overlay container--centered'}>
                        <Spinner />
                    </div> : null
                }
                { this.props.children }
            </React.Fragment>
        );

    }
}


export class DataStatusContainer<T> extends React.Component<ItemsStatus<T>> {
    public render() {
        const { status, data } = this.props;
        const items = data;
        if (items != null && items.length === 0 && status !== ComponentStatus.IN_PROGRESS) return <EmptyView />;

        return (
            <React.Fragment>
                { 
                    status == null || status == ComponentStatus.IN_PROGRESS ?
                    <div className={'cover-all overlay container--centered'}>
                        <Spinner />
                    </div> : null
                }
                { this.props.children }
            </React.Fragment>
        );

    }
}


export default class StatusContainer<T extends Identifiable> extends React.Component<IItemsState<T>> {
    public render() {
        if (this.props.isProcessing) return <CoveringSpinner />;
        
        const items = this.props.items;
        if (items.length === 0) return <EmptyView />;
        
        return this.props.children;
    }
}


export class StatusContainerItems<T> extends React.Component<{ isProcessing: boolean, items: T[] }> {
    public render() {
        if (this.props.isProcessing) return <CoveringSpinner />;
        
        const items = this.props.items;
        if (items.length === 0) return <EmptyView />;
        
        return this.props.children;
    }
}

export class StatusContainerCore<T> extends React.Component<{ isProcessing: boolean, isEmpty: boolean }> {
    public render() {
        if (this.props.isProcessing) return <CoveringSpinner />;
        
        if (this.props.isEmpty) return <EmptyView />;
        
        return this.props.children;
    }
}