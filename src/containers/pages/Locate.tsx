import * as React from 'react';
import { connect } from 'react-redux';

import {EquipmentStatusFilter} from '../../constants/equipmentStatus';
import { OpportunityBusinessType } from '../../constants/opportunityBusinessType';
import { setGeoFilterBoundsDebounced } from '../../actions/integration/feedActions';
import { synchronizeMap } from '../../actions/integration/synchronization';
import { setMapMarkersRendering, updateObsoleteMapDataToastVisibility } from '../../actions/mapActions';
import { showModal } from '../../actions/modalActions';
import { showToast } from '../../actions/toasts/toastActions';
import { MaintenanceActivityTypeFilter, filterWithMaintenanceActivityTypeFilters } from '../../constants/ServiceOrderType';
import { toastMessages } from '../../constants/toastMessages';
import { ModalType } from '../../constants/modalTypes';
import { IMarker, MarkerType } from '../../models/markers/IMarker';
import { IGlobalState, fitterLocationEnabledType, activeInFSMFromState, serviceResourceEnabledFromState } from '../../models/globalState';
import { createSelector } from 'reselect';
import joinSamePlaceMarkers from '../../services/map/joinSamePlaceMarkers';
import * as _ from 'lodash';
import { WorkOrderMapItem, OpportunityMapItem, TechnicianMapItem, EquipmentMapItem } from '../../models/map/wrappers';
import translate from '../../utils/translate';
import { selectFilterType, centerOnMap, mapAutomaticallyCentered, saveMapPosition } from '../../actions/mapActions';
import { ContractLineStatusFilter } from '../../constants/ContractLineStatus';
import { SvgIcon } from '../../constants/SvgIcon';
import { Map } from  './Map';
import { opportunityMarkers, equipmentMarkers, technicianMarkers, serviceOrderMarkers, queryAndShowModal } from './markers';
import { FloatingActionButton } from '../../components/layout/FloatingActionButton';
import MapLegend from '../../components/map/MapLegend';
import { ComponentStatus } from 'src/models/IItemsState';
import { EntityType } from 'src/constants/EntityType';
import { FitterLocation } from 'src/models/api/mapApi';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

type FilterItem = [EntityType, string];

class LocateClass extends React.Component<ILocateProps, object> {
    private watchPositionId: number;

    public render() {

        const tabs = this.visibleTabs();

        //TODO use the filter types instead of indexes
        const selectedIndex = _.findIndex(tabs, item => item[0] === this.props.selectedFilterType);
        const indexInRange = _.inRange(selectedIndex, 0, tabs.length) ? selectedIndex : 0;
        const selectedFilterType = this.props.selectedFilterType;

        return <Map tabIndex={ indexInRange } tabItems={tabs.map(item => <span>{item[1] || EntityType[item[0]]}</span>)}
            center={this.props.position.coordinates}
            highlightedEntity={this.props.highlight}
            zoom={this.props.position.zoom}
            tabChange={tabIndex => this.props.selectFilterType(tabs[tabIndex][0])}
            isProcessing={this.props.isProcessing}
            markers={this.props.markers}
            onBoundsChanged={this.props.setGeoFilterBounds}
            onMarkerClicked={(marker: IMarker<any>) => {
                if(this.props.activeinFSM || this.props.serviceResourceEnabled || selectedFilterType != EntityType.Technician) {
                    this.props.queryAndShowModal(marker.query, item => dispatch => dispatch(showModal(marker.modalType, item)), [marker])
                }
            }}
            onRenderMarkersEnd={() => this.props.setMapMarkersRendering(false)}
            saveMapPosition={this.props.saveMapPosition}
            fitMarkers={this.props.fitMarkers}>
            
            <MapLegend filterTypes={ [selectedFilterType] }/>
            
            {/*
                <FloatingActionButtonContainer className='top-right margin--std' onClick={ this.centerOnLocation } >
                    <FontAwesomeIcon icon={faDotCircle} />
                </FloatingActionButtonContainer> 
            */}
            {this.props.selectedFilterType === EntityType.Callout &&
                <FloatingActionButton className='bottom-right margin--std' svg={SvgIcon.Layers}
                    onClick={() => this.props.showModal(ModalType.MapServiceOrderLayers, { selectedServiceOrderTypes: this.props.selectedServiceOrderTypes })} />
            }
            {this.props.selectedFilterType === EntityType.Equipment &&
                <FloatingActionButton className='bottom-right margin--std' svg={SvgIcon.Layers}
                    onClick={() => this.props.showModal(
                        ModalType.MapEquipmentFiltering, 
                        { 
                          equipment: this.props.map.equipments,
                          selectedWorkcenters: this.props.selectedWorkcenters,
                          selectedContractStatuses: this.props.selectedContractStatuses,
                          selectedEquipmentStatuses: this.props.selectedEquipmentStatuses  
                        }
                    )} />
            }
            {this.props.selectedFilterType === EntityType.Opportunity &&
                <FloatingActionButton className='bottom-right margin--std' svg={SvgIcon.Layers}
                    onClick={() => this.props.showModal(ModalType.MapOpportunityFiltering, { selectedOpportunityBusinessTypes: this.props.selectedOpportunityBusinessTypes })}
                 />
            }
        </Map>
    }

    public componentWillUpdate(nextProps: ILocateProps) {
        this.checkTabs();
    }

    private visibleTabs() {
        const { mapConfig, config, gpsPermissionSet } = this.props;
        const tabs: FilterItem[] = [[EntityType.Equipment, translate('locate-page.tab.equipment')]] ;
        const fitterLocationEnabled = fitterLocationEnabledType(config.fitterLocation, gpsPermissionSet);
        if(mapConfig.callouts.visible) 
            tabs.push([EntityType.Callout, translate('locate-page.tab.open-so')]);
        if(mapConfig.opportunities.visible) 
            tabs.push([EntityType.Opportunity, translate('locate-page.tab.opportunities')]);
        if(mapConfig.technicians.visible && fitterLocationEnabled) 
            tabs.push([EntityType.Technician, translate('locate-page.tab.technicians')]);
            return tabs;
    }

    //in Samsung tablet if GPS only location is set it only works with enableHighAccuracy:true
    private locationOptions = {enableHighAccuracy:true, maximumAge:Infinity, timeout:60000};

    private checkTabs() {
        const tabs = this.visibleTabs();
        const selectedIndex = _.findIndex(tabs, item => item[0] === this.props.selectedFilterType);
        const isIndexInRange = _.inRange(selectedIndex, 0, tabs.length);
        if(!isIndexInRange) {
            this.props.selectFilterType(EntityType.Equipment);
            return;
        }
    }

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Locate Screen');
        this.props.synchronizeMap();
        this.props.closeMenu();

        if(!this.props.automaticallyCentered && this.props.map.position == null) {
            //TODO add this to the initialization
            this.watchPositionId = navigator.geolocation.watchPosition(
                this.positionReceived,
                () => this.props.showToast({ message: toastMessages().GEOLOCATION_FAILED }),
                this.locationOptions
            );
        }
        
    }

    public componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchPositionId);
        this.props.updateObsoleteMapDataToastVisibility(false);
    }

    private positionReceived = (position: Position) => {
        navigator.geolocation.clearWatch(this.watchPositionId);
        this.centerOnPosition(position);
        this.props.mapAutomaticallyCentered(true);
    };

    private centerOnLocation = () => {
        //this.watchPositionId = navigator.geolocation.watchPosition(
        navigator.geolocation.getCurrentPosition(
            this.centerOnPosition,
            (error: PositionError) => {
                this.props.showToast({ message: toastMessages().GEOLOCATION_FAILED })
            },
            this.locationOptions
        );
    }

    private centerOnPosition = (position: Position) => {
        this.props.centerOnMap({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        });
    }
    
}

function filteryByValueInArray<T>(objs: T[], array: string[], field: (t: T) => string) {
    return array.length == 0 ? objs : objs.filter(so =>
        array.indexOf(field(so)) > -1,
    );
}

function filteryByValuesInArrays<T>(objs: T[], array: string[], field: (t: T) => string[]) {
    return array.length == 0 ? objs : objs.filter(so => 
        _.intersection(field(so), array).length > 0
    );
}

function getMarkers(equipments: EquipmentMapItem[], opportunities: OpportunityMapItem[], workorders: WorkOrderMapItem[], technicians: TechnicianMapItem[],
    selectedFilterType: EntityType, selectedServiceOrderTypes: MaintenanceActivityTypeFilter[], 
    contractStatuses: ContractLineStatusFilter[], workcenters: string[], equipmentStatuses: EquipmentStatusFilter[], opportunityBusinessTypes: OpportunityBusinessType[],
    highlightedId: string, fitterLocation: FitterLocation): IMarker[] {

    switch (selectedFilterType) {
        //showEquipmentDetails
        case EntityType.Equipment:
            const filteredEquipments = filteryByValueInArray(equipments, workcenters, e => e.mainWorkCenter.Id);
            const filteredEquipments2 = filteryByValuesInArrays(filteredEquipments, contractStatuses, e => e.contractStatusFilter);
            const filteredEquipments3 = filteryByValueInArray(filteredEquipments2, equipmentStatuses, e => e.equipmentStatusApi);
            return equipmentMarkers(filteredEquipments3, highlightedId);
        case EntityType.Callout:
            const filteredServiceOrders = workorders.filter(wo => filterWithMaintenanceActivityTypeFilters(wo, selectedServiceOrderTypes));
            return serviceOrderMarkers(filteredServiceOrders, highlightedId);
        case EntityType.Opportunity:
            const filteredOpportunity = filteryByValueInArray(opportunities, opportunityBusinessTypes, e => e.businessType);
            return opportunityMarkers(filteredOpportunity, highlightedId);
        case EntityType.Technician: 
            return technicianMarkers(technicians, highlightedId, fitterLocation);
        default:
            return [];
    }
}

//this selector is needed because in the map there is reference comparison this.props.markers !== nextProps.markers
const mapMarkersReRenderingSelector = createSelector(
    (state: IGlobalState) => state.map.equipments.items,
    state => state.map.opportunities.items,
    state => state.map.callouts.items,
    state => state.map.technicians.items,    
    createSelector(
        (state: IGlobalState) => state.map.selectedFilterType,
        state => state.map.selectedServiceOrderTypes,
        state => state.map.selectedContractStatuses,
        state => state.map.selectedWorkcenters,
        state => state.map.selectedEquipmentStatuses,
        state => state.map.selectedOpportunityBusinessTypes,
        (selectedFilterType, selectedServiceOrderTypes, selectedContractStatuses, selectedWorkcenters, selectedEquipmentStatuses, selectedOpportunityBusinessTypes) => 
            ({selectedFilterType, selectedServiceOrderTypes, selectedContractStatuses, selectedWorkcenters, selectedEquipmentStatuses, selectedOpportunityBusinessTypes})
    ),
    
    state => state.map.highlight,
    state => state.map.highlightMarker,
    state => state.configuration.fitterLocation,
    
    (equipments, opportunities, callouts, technicians, selections, highlight, highlightMarker, fitterLocation) => {
        const { 
            selectedFilterType, selectedServiceOrderTypes,
            selectedContractStatuses, selectedWorkcenters, 
            selectedEquipmentStatuses, selectedOpportunityBusinessTypes 
        } = selections;
        const highlightId = highlight && highlight.id;
        const markers = getMarkers(equipments, opportunities, callouts, technicians, selectedFilterType, selectedServiceOrderTypes
            , selectedContractStatuses, selectedWorkcenters, selectedEquipmentStatuses, selectedOpportunityBusinessTypes, highlightId, fitterLocation);
        if(highlightMarker.data != null && highlightMarker.status === ComponentStatus.SUCCESS 
            && !markers.find(m => m.markerId === highlightId) && selectedFilterType == highlightMarker.data.entityType) {
            markers.push(highlightMarker.data);
        }
        return {
            markers: joinSamePlaceMarkers(markers, highlightId),
            selectedServiceOrderTypes,
            selectedContractStatuses,
            selectedWorkcenters,
            selectedFilterType,
            selectedEquipmentStatuses,
            selectedOpportunityBusinessTypes,
            highlight
        };
    },
);

/*
const mapMarkersReRenderingSelector = createSelector(
    (state: IGlobalState) => state.map,
    map => {
        const equipments = map.equipments.items;
        const opportunities = map.opportunities.items;
        const callouts = map.callouts.items;
        const technicians = map.technicians.items;
        const selectedFilterType = map.selectedFilterType;
        const selectedServiceOrderTypes = map.selectedServiceOrderTypes;
        const selectedContractStatuses = map.selectedContractStatuses;
        const selectedWorkcenters = map.selectedWorkcenters;
        const selectedEquipmentStatuses = map.selectedEquipmentStatuses;
        const selectedOpportunityStatuses = map.selectedOpportunityStatuses;
        const highlight = map.highlight;
            return {
            markers: joinSamePlaceMarkers(
                getMarkers(equipments, opportunities, callouts, technicians, selectedFilterType, selectedServiceOrderTypes
                , selectedContractStatuses, selectedWorkcenters, selectedEquipmentStatuses, selectedOpportunityStatuses, highlight.id),
                highlight.id
            ),
            selectedServiceOrderTypes,
            selectedContractStatuses,
            selectedWorkcenters,
            selectedFilterType,
            selectedEquipmentStatuses,
            selectedOpportunityStatuses,
            highlight
        };
    },
);
*/

const mapMarkersNonRenderingSelector = createSelector(
    (state: IGlobalState) => state.map,
    state => state.map.config,
    state => state.configuration,
    state => state.authentication.currentUser.gpsPermissionSet,
    state => activeInFSMFromState(state),
    state => serviceResourceEnabledFromState(state),
    (map, mapConfig, config, gpsPermissionSet, activeinFSM, serviceResourceEnabled) => ({
        map,
        isProcessing: map.isRenderingMarkers || map.equipments.isProcessing || map.callouts.isProcessing || map.opportunities.isProcessing || map.technicians.isProcessing ||
            map.highlightMarker.status === ComponentStatus.IN_PROGRESS,
        mapConfig,
        config,
        gpsPermissionSet,
        automaticallyCentered: map.automaticallyCentered,
        position: map.position,
        fitMarkers: map.fitMarkers,
        activeinFSM,
        serviceResourceEnabled
    }),
);

const mapMarkersSelector = createSelector(
    mapMarkersReRenderingSelector,
    mapMarkersNonRenderingSelector,
    (markersAndFilters, isProcessing) => ({ ...markersAndFilters, ...isProcessing })
)

const dispatchProps = {
    setGeoFilterBounds: setGeoFilterBoundsDebounced,
    setMapMarkersRendering,
    showModal,
    showToast,
    synchronizeMap,
    updateObsoleteMapDataToastVisibility,
    selectFilterType,
    closeMenu,
    queryAndShowModal,
    centerOnMap,
    mapAutomaticallyCentered,
    saveMapPosition
};

type ILocateProps = ReturnType<typeof mapMarkersSelector> & typeof dispatchProps;

export default connect(mapMarkersSelector, dispatchProps)(LocateClass);
