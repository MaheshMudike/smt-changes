import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { opportunityMarkers, equipmentMarkers, technicianMarkers, serviceOrderMarkers, queryAndShowModal } from './markers';
import { Map } from '../../containers/pages/Map';
import { IMarker } from '../../models/markers/IMarker';
import { ActionStatus } from '../../actions/actions';
import { IGlobalState } from '../../models/globalState';
import { downloadSearchMapItems, searchMapSavePosition, showOrHideMap } from '../../actions/searchMapActions';
import { EntityType } from '../../constants/EntityType';
import MapLegend from '../../components/map/MapLegend';
import { createSelector } from 'reselect';
import joinSamePlaceMarkers from '../../services/map/joinSamePlaceMarkers';
import { hideAllModals } from '../../actions/modalActions';
import ISearchResults from 'src/models/search/ISearchResults';
import { LocatableIdentifiable } from 'src/models/map/Locatable';
import { FitterLocation } from 'src/models/api/mapApi';

type SearchMapProps = ReturnType<typeof searchMapSelector> & typeof searchMapDispatchProps ;

class SearchMap extends React.Component<SearchMapProps & { selectItem: (id: string, entityType: EntityType) => void }, object> {
    public render() {
        const processing = 
            _.some(this.props.results.groups, g => g.actionStatus === ActionStatus.START) || 
            _.some(this.props.results.mapGroups, g => g.mapItemsActionStatus === ActionStatus.START);

        return <Map tabIndex={ 0 } tabItems={[]}
            center={this.props.position.coordinates}
            highlightedEntity={this.props.detailItem as any as LocatableIdentifiable}
            zoom={this.props.position.zoom}
            tabChange={tabIndex => {}}
            isProcessing={processing}
            markers={this.props.markers}
            onBoundsChanged={() => {}}
            onMarkerClicked={(marker: IMarker) => {
                if(marker.entityIds.length == 1) {
                    this.props.showOrHideMap(false);
                    this.props.selectItem(marker.entityIds[0], marker.entityType);
                    return;
                }

                this.props.queryAndShowModal(marker.query, item => dispatch => {
                    dispatch(showOrHideMap(false));
                    dispatch(hideAllModals());
                    this.props.selectItem(item.id, item.entityType);
                }, [marker])
                
            }}
            onRenderMarkersEnd={() => {}}
            saveMapPosition={this.props.searchMapSavePosition}
            fitMarkers={this.props.fitMarkers}
        >
            <MapLegend filterTypes={ this.props.mapFilters }/>
        </Map>
    }

}

function getMarkersForEntityType(results: ISearchResults, entityType: EntityType, selectedId: string, fitterLocation: FitterLocation) {

    switch(entityType) {
        case EntityType.Callout:
            return serviceOrderMarkers(results.mapGroups[EntityType.Callout].mapItems, selectedId);
        case EntityType.Equipment:
            return equipmentMarkers(results.mapGroups[EntityType.Equipment].mapItems, selectedId);
        case EntityType.Opportunity:
            return opportunityMarkers(results.mapGroups[EntityType.Opportunity].mapItems, selectedId);
        case EntityType.Technician:
            return technicianMarkers(results.mapGroups[EntityType.Technician].mapItems, selectedId, fitterLocation);
        default:
            return [];
    }
}
function getMarkers(results: ISearchResults, entityTypes: EntityType[], selectedId: string, fitterLocation: FitterLocation) {
    return _.flatMap(entityTypes, et => getMarkersForEntityType(results, et, selectedId, fitterLocation));
}

//this selector is needed because in the map there is reference comparison this.props.markers !== nextProps.markers
const mapMarkersReRenderingSelector = createSelector(
    (state: IGlobalState) => state.search.results,
    state => state.search.mapFilters,
    state => state.search.detailItem,
    state => state.configuration.fitterLocation,
    
    (results, selectedFilterTypes, detailItem, fitterLocation) => {
        const highlightId = detailItem && detailItem.id;
        
        return {
            markers: joinSamePlaceMarkers(
                getMarkers(results, selectedFilterTypes, highlightId, fitterLocation),
                highlightId
            )
        };
    },
);

const searchMapSelector = createSelector(
    mapMarkersReRenderingSelector,
    state => state.search,
    (markersAndFilters, search) => ({ ...markersAndFilters, ...search })
)

const searchMapDispatchProps = {
    downloadSearchMapItems, searchMapSavePosition, queryAndShowModal, showOrHideMap
}

export default connect(searchMapSelector, searchMapDispatchProps)(SearchMap);