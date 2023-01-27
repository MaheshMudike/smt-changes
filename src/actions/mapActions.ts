import * as _ from 'lodash';
import { Dispatch } from 'redux';
import { MaintenanceActivityTypeFilter } from '../constants/ServiceOrderType';
import { plannerGroupIdFromState, activeInFSMFromState, serviceResourceEnabledFromState } from '../models/globalState';
import { Toast } from '../models/toasts';
import { asyncActionNames, IPayloadAction, payloadAction } from './actionUtils';
import { obsoleteMapDataToast } from './toasts/obsoleteMapDataToast';
import { hideToast, showToast } from './toasts/toastActions';
import { queryMapOpportunitiesForTerritory, queryMapWorkOrdersForTerritory, 
    queryMapServiceResourcesForServiceTerritory, queryMapEquipments, technicianStatusFromWorkOrder } from './http/jsforce';
import { ILatLng, MapPosition } from '../models/map/LonLat';
import { conditions } from './http/jsforceMappings';
import { asyncHttpActionGeneric } from './http/httpActions';
import { ThunkAction } from './thunks';
import { ContractLineStatusFilter } from '../constants/ContractLineStatus';
import { EquipmentMapItem, WorkOrderMapItem, TechnicianMapItem } from '../models/map/wrappers';
import {EquipmentStatusFilter} from '../constants/equipmentStatus';
import {OpportunityBusinessType} from '../constants/opportunityBusinessType';
import { LocatableMapMarker } from '../models/map/Locatable';
import { paths } from '../config/paths';
import {  push } from 'react-router-redux';
import { EntityType } from '../constants/EntityType';
import { hideAllModals } from './modalActions';
import { queryWorkOrdersBase, queryWorkOrderHistory } from './http/jsforceBase';
import { IServiceResourceMapItem, AssetLocation, IWorkOrderEmergency } from 'src/models/api/coreApi';
import { joinQueries, multiQuery1 } from './http/jsforceCore';
import * as fields from './http/queryFields';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';
import { FitterLocation } from 'src/models/api/mapApi';

export const AUTOMATICALLY_CENTERED = 'AUTOMATICALLY_CENTERED';
export const SELECT_FILTER_TYPE = 'SELECT_FILTER_TYPE';
export const LOAD_MAP_CONFIG = asyncActionNames('LOAD_MAP_CONFIG');
export const LOAD_MAP_EQUIPMENTS = asyncActionNames('LOAD_MAP_EQUIPMENTS');
export const LOAD_MAP_CALLOUTS = asyncActionNames('LOAD_MAP_CALLOUTS');
export const LOAD_MAP_OPPORTUNITIES = asyncActionNames('LOAD_MAP_OPPORTUNITIES');
export const LOAD_MAP_TECHNICIANS = asyncActionNames('LOAD_MAP_TECHNICIANS');
export const MAP_HIGHLIGHT = 'MAP_HIGHLIGHT';
export const MAP_HIGHLIGHT_MARKER = asyncActionNames('MAP_HIGHLIGHT_MARKER');
export const SAVE_MAP_POSITION = 'SAVE_MAP_POSITION';
export const FIT_MARKERS = 'FIT_MARKERS';
export const SET_MAP_MARKERS_RENDERING = 'SET_MAP_MARKERS_RENDERING';
export const CHOOSE_SELECTED_SERVICE_ORDER_TYPES =  'CHOOSE_SELECTED_SERVICE_ORDER_TYPES';
export const CHOOSE_SELECTED_CONTRACT_STATUSES = 'CHOOSE_SELECTED_CONTRACT_STATUSES';
export const CHOOSE_SELECTED_WORKCENTERS = 'CHOOSE_SELECTED_WORKCENTERS';
export const CHOOSE_SELECTED_EQUIPMENT_STATUSES = 'CHOOSE_SELECTED_EQUIPMENT_STATUSES';
export const CHOOSE_SELECTED_OPPORTUNITY_STATUSES = 'CHOOSE_SELECTED_OPPORTUNITY_STATUSES';


export const mapAutomaticallyCentered = (centered: boolean): ThunkAction<void> => (dispatch) => {
    dispatch(payloadAction(AUTOMATICALLY_CENTERED)(centered));
}

export const showOnMap = (locatable: LocatableMapMarker): ThunkAction<void> => 
    (dispatch, getState) => {
        const state = getState();
        const coordinates = locatable.entityType == EntityType.Technician ? getState().configuration.fitterLocation == FitterLocation.SO ? locatable.assetCoordinates : locatable.coordinates : locatable.coordinates;
        dispatch(payloadAction(MAP_HIGHLIGHT)(locatable));
        dispatch(payloadAction(SELECT_FILTER_TYPE)(coordinates.type));
        
        dispatch(asyncHttpActionGeneric(() => locatable.marker(state), MAP_HIGHLIGHT_MARKER));
        dispatch(centerOnMap(coordinates));
        dispatch(hideAllModals());
    }


const BING_MAPS = 'https://www.bing.com/maps';

export function bingRoute(destiny: ILatLng) {
    return `${BING_MAPS}?rtp=~pos.${destiny.lat}_${destiny.lng}&mode=D`;
}

//https://www.google.com/maps/search/?api=1&query=47.5951518,-122.3316393
//https://www.google.com/maps/dir/?api=1&origin=47.5951518,-122.3316393&destination=57.5951518,-122.3316393&travelmode=driving

export function googleMapsRoute(destiny: ILatLng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destiny.lat}%2C${destiny.lng}&travelmode=driving`;    
}

const MIN_HIGHLIGHT_ZOOM = 17;

export function mapHighlightPosition(mapPosition: MapPosition, coordinates: ILatLng) {
    return { ...mapPosition, coordinates, zoom: Math.max(mapPosition.zoom, MIN_HIGHLIGHT_ZOOM) };
}

export const centerOnMap = (coordinates: ILatLng): ThunkAction<void> => (dispatch, getState) => {    
    dispatch(saveMapPosition(mapHighlightPosition(getState().map.position, coordinates)));
    dispatch(payloadAction(FIT_MARKERS)(false));
    dispatch(push(paths.LOCATE));
}

export const saveMapPosition = (position: MapPosition): ThunkAction<void> => (dispatch) => {
    dispatch(payloadAction(SAVE_MAP_POSITION)(position));
}

export const downloadMapItems = (): ThunkAction<void> => (dispatch, getState) => {
    const state = getState();
    const filterType = state.map.selectedFilterType;
    const territoryId = plannerGroupIdFromState(state);
    const activeInFSM = activeInFSMFromState(state);
    const serviceResourceEnabled = serviceResourceEnabledFromState(state);

    switch (filterType) {
        case EntityType.Equipment:
            if(isAndroid()){ firebaseStartTrace('Map Equipment trace') }
            return dispatch(asyncHttpActionGeneric(
                () => queryMapEquipments([conditions.Asset.serviceTerritory(territoryId), conditions.Asset.active])
                .then(assets => assets.map(a => {
                    const alarm = conditions.Asset.stopped.isFullfilledBy(a);
                    if(isAndroid()){ firebaseStopTrace('Map Equipment trace') }
                    return new EquipmentMapItem(a, alarm);
                })),
                LOAD_MAP_EQUIPMENTS
            ));
        case EntityType.Callout:
            if(isAndroid()){ firebaseStartTrace('Map Callout trace') }
            return dispatch(
                asyncHttpActionGeneric(
                    () => queryMapWorkOrdersForTerritory(territoryId, activeInFSM).then(
                        wos => {
                            if(isAndroid()){ firebaseStopTrace('Map Callout trace') }
                            return wos.map(w => new WorkOrderMapItem(w, activeInFSM))
                        }
                        ),
                    LOAD_MAP_CALLOUTS
                )
            );
        case EntityType.Opportunity:
            return dispatch(asyncHttpActionGeneric(() => queryMapOpportunitiesForTerritory(territoryId), LOAD_MAP_OPPORTUNITIES));
        case EntityType.Technician:
            if(isAndroid()){ firebaseStartTrace('Map Technician trace') }
            const woConditions = conditions.WorkOrder;
            const woHistoryConditions = conditions.WorkOrderHistory;
            //return dispatch(getJsforceCollectionAction(() => queryMapServiceResourcesForServiceTerritory(territoryId), TechnicianMapItem, LOAD_MAP_TECHNICIANS));
            return dispatch(asyncHttpActionGeneric(
                activeInFSM || serviceResourceEnabled ?
                () => queryMapServiceResourcesForServiceTerritory(territoryId, state.configuration.technicianInactivityLimitInDays, serviceResourceEnabled)
                :
                async () => {
                    const historyWos = await queryWorkOrderHistory([woHistoryConditions.isNotDeleted,woHistoryConditions.Created30DaysAgo(),woHistoryConditions.ModifiedStatus,
                        woHistoryConditions.serviceTerritory(territoryId)]).sort('CreatedDate','DESC');
                    const filteredHistoryWos = _.uniqBy(historyWos,'WorkOrderId');
                    // const Ids = filteredHistoryWos.map(w => w.WorkOrderId);
                    const IdsChunk = _.chunk( filteredHistoryWos.map(w=>w.WorkOrderId),500 );
                    const wos = await joinQueries(
                        ...IdsChunk.map( ids => 
                            multiQuery1(
                                queryWorkOrdersBase<IWorkOrderEmergency & { Technician_Name__c: string; Asset: AssetLocation }>(
                                    [woConditions.ids(ids), woConditions.serviceTerritory(territoryId), woConditions.technicianNameNotNull],
                                    [...fields.IWorkOrderEmergency, 'Technician_Name__c', 'Asset.Geolocation__Longitude__s', 'Asset.Geolocation__Latitude__s']
                                )
                            )
                        )
                    ).then(wrapper => wrapper.queries.result[0])
                    const ordersByTechnician = _.groupBy(wos, wo => wo.Technician_Name__c.toUpperCase());
                    const lastModifiedOrders = _.values(ordersByTechnician).map(v => {
                    const filteredWos = filteredHistoryWos.filter(w => v.some(t => t.Id == w.WorkOrderId))
                    const latestWOId = filteredWos[0].WorkOrderId;
                    const latestWO = v.filter(w => w.Id == latestWOId);
                    return latestWO[0];
                    })
                    return lastModifiedOrders
                        .filter(wo => wo.Technician_Name__c != null && wo.Asset.Geolocation__Latitude__s != null && wo.Asset.Geolocation__Longitude__s != null)
                        .map(wo => {
                            if(isAndroid()){ firebaseStopTrace('Map Technician trace') }
                            return new TechnicianMapItem(
                                {
                                    Id: wo.Technician_Name__c,
                                    Name: wo.Technician_Name__c,
                                    //this is used when location is set to GPS, doesn't make sense in this case as the location is coming from the wo
                                    //LastKnownLongitude: wo.Asset.Geolocation__Longitude__s,
                                    //LastKnownLatitude: wo.Asset.Geolocation__Latitude__s,
                                } as IServiceResourceMapItem, 
                                technicianStatusFromWorkOrder(wo),
                                wo.Asset,
                                false
                            )
                        }
                        );
                }, 
                LOAD_MAP_TECHNICIANS)
            );
        default:
            throw new Error('Unhandled filter type: ' + filterType);
    }
};

export const updateObsoleteMapDataToastVisibility = (shouldBeShown: boolean): ThunkAction<void> =>
    (dispatch, getState) => {
        const isToastShown = _.includes<Toast>(getState().toasts, obsoleteMapDataToast);
        if (shouldBeShown && !isToastShown) {
            obsoleteMapDataToast.initialize(dispatch);
            dispatch(showToast(obsoleteMapDataToast));
        } else if (!shouldBeShown && isToastShown) {
            dispatch(hideToast(obsoleteMapDataToast));
        }
};

function dispatchMapRenderingAction(dispatch: Dispatch<IPayloadAction<any>>, actionName: string, payload: any) {
    dispatch(setMapMarkersRendering(true));
    dispatch(payloadAction(actionName)(payload));
    //dont understand the use of setTimeout here
    /*
    return new Promise((resolve) => {
        dispatch(setMapMarkersRendering(true));
        setTimeout(
            () => {
                dispatch(payloadAction(actionName)(payload));
                resolve(null);
            },
            50,
        );
    });
    */
}

export function selectFilterType(filterType: EntityType): ThunkAction<void> {
    return (dispatch) => {
        dispatchMapRenderingAction(dispatch, SELECT_FILTER_TYPE, filterType);
        dispatch(payloadAction(FIT_MARKERS)(true));
        dispatch(downloadMapItems());
            //.then(() => { dispatch(downloadMapItems()) });
    };
}

export function chooseSelectedServiceOrderTypes(types: MaintenanceActivityTypeFilter[]) {
    return (dispatch: Dispatch<IPayloadAction<MaintenanceActivityTypeFilter[]>>) => {
        dispatchMapRenderingAction(dispatch, CHOOSE_SELECTED_SERVICE_ORDER_TYPES, types);
    };
}


export function chooseSelectedContractStatusesAndWorkcenters(contractStatuses: ContractLineStatusFilter[], workcenters: string[]): ThunkAction<void> {
    return (dispatch) => {
        dispatchMapRenderingAction(dispatch, CHOOSE_SELECTED_CONTRACT_STATUSES, contractStatuses);
        dispatchMapRenderingAction(dispatch, CHOOSE_SELECTED_WORKCENTERS, workcenters);
    };
}

export function chooseSelectedEquipmentStatuses(equipmentStatuses: EquipmentStatusFilter[]): ThunkAction<void> {
    return (dispatch) => {
        dispatchMapRenderingAction(dispatch, CHOOSE_SELECTED_EQUIPMENT_STATUSES, equipmentStatuses);
    };
}

export function chooseSelectedOpportunityBusinessTypes(opportunityStatuses: OpportunityBusinessType[]): ThunkAction<void> {
    return (dispatch) => {
        dispatchMapRenderingAction(dispatch, CHOOSE_SELECTED_OPPORTUNITY_STATUSES, opportunityStatuses);
    };
}

export const setMapMarkersRendering = payloadAction<boolean>(SET_MAP_MARKERS_RENDERING);