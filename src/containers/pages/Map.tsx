import * as React from 'react';
import OpenlayersMap, { IOpenLayersMapProps } from '../../components/map/OpenlayersMap';
import * as _ from 'lodash';
import Tabs from '../../components/tabs/Tabs';
import { Spinner } from '../../components/Spinner';
import { CoveringSpinner } from '../../components/CoveringSpinner';

interface MapProps {
    tabIndex: number,
    tabItems: JSX.Element[];
    tabChange: (n: number) => void;
    isProcessing: boolean;
    fitMarkers: boolean;
}

export class Map extends React.Component<MapProps & IOpenLayersMapProps, object> {

    public render() {
        return (
            <div className='full-height container--vertical'>
                {this.props.tabItems && this.props.tabItems.length > 0 &&
                <div className='map-filter separated--bottom-dark panel--gray'>
                    <Tabs
                        items={this.props.tabItems}
                        className='map-filter__tabs'
                        onChangeTab={this.props.tabChange}
                        selectedTab={this.props.tabIndex}
                    />
                </div>
                }
                <div className='flex-grow--1 relative'>
                    {this.props.isProcessing ? <CoveringSpinner /> : null}
                    {/*
                    <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <Spinner />
                    </div>
                    */}
                    <div className='cover-all'>
                        <OpenlayersMap
                            markers={this.props.markers}
                            onBoundsChanged={this.props.onBoundsChanged}
                            onMarkerClicked={this.props.onMarkerClicked}
                            onRenderMarkersEnd={this.props.onRenderMarkersEnd}
                            saveMapPosition={this.props.saveMapPosition}
                            highlightedEntity={this.props.highlightedEntity}
                            center={this.props.center} 
                            zoom={this.props.zoom}
                            fitMarkers={this.props.fitMarkers}
                        />
                    </div>
                </div>
                
                {this.props.children }
                   
            </div>
        );
    }
}