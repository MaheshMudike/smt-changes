import { combineReducers } from 'redux';

import { CHOOSE_SELECTED_SERVICE_ORDER_TYPES, LOAD_MAP_CALLOUTS, LOAD_MAP_EQUIPMENTS, LOAD_MAP_OPPORTUNITIES, 
    LOAD_MAP_TECHNICIANS, SELECT_FILTER_TYPE, SET_MAP_MARKERS_RENDERING, CHOOSE_SELECTED_WORKCENTERS, CHOOSE_SELECTED_CONTRACT_STATUSES, 
    CHOOSE_SELECTED_EQUIPMENT_STATUSES, CHOOSE_SELECTED_OPPORTUNITY_STATUSES, MAP_HIGHLIGHT, AUTOMATICALLY_CENTERED, SAVE_MAP_POSITION, FIT_MARKERS, MAP_HIGHLIGHT_MARKER } from '../actions/mapActions';
import { LOAD_MAP_CONFIG } from '../actions/mapActions';
import { IMapState, initialMapState } from '../models/map/state';
import { asyncListReducerFactory, asyncDataStatusReducerFactory } from './factories/asyncActionReducerFactory';
import { payloadValueReducerFactory } from './factories/payloadValueReducerFactory';

export const mapReducer = combineReducers<IMapState>({
    automaticallyCentered: payloadValueReducerFactory(AUTOMATICALLY_CENTERED, initialMapState.automaticallyCentered),
    callouts: asyncListReducerFactory(LOAD_MAP_CALLOUTS),
    highlight: payloadValueReducerFactory(MAP_HIGHLIGHT, initialMapState.highlight),
    highlightMarker: asyncDataStatusReducerFactory(MAP_HIGHLIGHT_MARKER),
    fitMarkers: payloadValueReducerFactory(FIT_MARKERS, initialMapState.fitMarkers),
    position: payloadValueReducerFactory(SAVE_MAP_POSITION, initialMapState.position),
    config: payloadValueReducerFactory(LOAD_MAP_CONFIG.success, initialMapState.config),
    equipments: asyncListReducerFactory(LOAD_MAP_EQUIPMENTS),
    isRenderingMarkers: payloadValueReducerFactory(SET_MAP_MARKERS_RENDERING, initialMapState.isRenderingMarkers),
    opportunities: asyncListReducerFactory(LOAD_MAP_OPPORTUNITIES),
    selectedFilterType: payloadValueReducerFactory(SELECT_FILTER_TYPE, initialMapState.selectedFilterType),
    selectedServiceOrderTypes: payloadValueReducerFactory(CHOOSE_SELECTED_SERVICE_ORDER_TYPES, initialMapState.selectedServiceOrderTypes),
    selectedContractStatuses: payloadValueReducerFactory(CHOOSE_SELECTED_CONTRACT_STATUSES, initialMapState.selectedContractStatuses),
    selectedWorkcenters: payloadValueReducerFactory(CHOOSE_SELECTED_WORKCENTERS, initialMapState.selectedWorkcenters),
    technicians: asyncListReducerFactory(LOAD_MAP_TECHNICIANS),
    selectedEquipmentStatuses: payloadValueReducerFactory(CHOOSE_SELECTED_EQUIPMENT_STATUSES, initialMapState.selectedEquipmentStatuses),
    selectedOpportunityBusinessTypes: payloadValueReducerFactory(CHOOSE_SELECTED_OPPORTUNITY_STATUSES, initialMapState.selectedOpportunityBusinessTypes),
});
