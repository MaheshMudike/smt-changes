import * as _ from 'lodash';


import { asyncActionNames, payloadAction } from './actionUtils';
import { asyncHttpActionGenericInitialData } from './http/httpActions';
import { EntityType } from 'src/constants/EntityType';
import { conditions } from './http/jsforceMappings';
import { ISearchMapResult } from '../models/search/ISearchResults';
import { ActionStatus } from './actions';
import { ThunkAction } from './thunks';

import { queryMapOpportunities, queryMapWorkOrders, queryMapServiceResources, queryMapEquipments } from './http/jsforce';
import { EquipmentMapItem, WorkOrderMapItem } from '../models/map/wrappers';
import { MapPosition } from '../models/map/LonLat';
import { Locatable } from '../models/map/Locatable';
import { mapHighlightPosition } from './mapActions';
import { fitterLocationEnabledType, activeInFSMFromState, serviceResourceEnabledFromState } from 'src/models/globalState';

export const TOGGLE_MAP = 'TOGGLE_MAP';
export const SHOW_OR_HIDE_MAP = 'SHOW_OR_HIDE_MAP';
export const SEARCH_MAP_SAVE_POSITION = 'SEARCH_MAP_SAVE_POSITION';
export const SEARCH_MAP_FILTER = 'SEARCH_MAP_FILTER';
export const SEARCH_MAP_FIT_MARKERS = 'SEARCH_MAP_FIT_MARKERS';
export const LOAD_SEARCH_MAP_PARTIAL = asyncActionNames('LOAD_SEARCH_MAP_PARTIAL');

/*
export const LOAD_SEARCH_MAP_OPPORTUNITIES = asyncActionNames('LOAD_SEARCH_MAP_OPPORTUNITIES');
export const LOAD_SEARCH_MAP_SERVICE_ORDERS = asyncActionNames('LOAD_SEARCH_MAP_SERVICE_ORDERS');
export const LOAD_SEARCH_MAP_EQUIPMENT = asyncActionNames('LOAD_SEARCH_MAP_EQUIPMENT');
export const LOAD_SEARCH_MAP_TECHNICIANS = asyncActionNames('LOAD_SEARCH_MAP_TECHNICIANS');
*/

//export const centerOnSearchMapAndShow = () => { }

export const centerOnSearchMapAndShow = (): ThunkAction<void> => (dispatch, getState) => {
    dispatch(payloadAction(SHOW_OR_HIDE_MAP)(true));
    dispatch(centerOnSearchMapSelectedItem());
}

export const showOrHideMap = (show: boolean): ThunkAction<void> => (dispatch, getState) => {
    dispatch(payloadAction(SHOW_OR_HIDE_MAP)(show));
}

function entityTypeMapFilters(entityType: EntityType) {
    switch(entityType) {
        case EntityType.Lead:
        case EntityType.Opportunity:
            return [EntityType.Opportunity, EntityType.Lead];
        default:
            return [entityType]
    }
}
export const centerOnSearchMapSelectedItem = (): ThunkAction<void> => (dispatch, getState) => {
    const locatable = getState().search.detailItem as any as Locatable;
    dispatch(searchMapSavePosition(mapHighlightPosition(getState().map.position, locatable.coordinates)));
    dispatch(filterSearchMap(entityTypeMapFilters(locatable.coordinates.type)));
    dispatch(payloadAction(SEARCH_MAP_FIT_MARKERS)(false));
}

export const filterSearchMap = (entityTypes: EntityType[]): ThunkAction<void> => (dispatch) => {
    dispatch(payloadAction(SEARCH_MAP_FILTER)(entityTypes));
    dispatch(payloadAction(SEARCH_MAP_FIT_MARKERS)(true));
}

export const searchMapSavePosition = (position: MapPosition): ThunkAction<void> => (dispatch) => {
    dispatch(payloadAction(SEARCH_MAP_SAVE_POSITION)(position));
}
/*
export const toggleSearchMap = (): ThunkAction<void> => (dispatch) => {
    dispatch(emptyAction(TOGGLE_MAP));
}
*/
function wrapSearchMapItemsResult(mapItems: any[], entityType: EntityType) {
    return { mapItems, entityType, mapItemsActionStatus: ActionStatus.SUCCESS }
}

export function emptyMapItemsSearch(entityType: EntityType) {
    return { mapItems: [] as any[], mapItemsActionStatus: null as any, entityType };
}

export const downloadSearchMapItems = (entityType: EntityType): ThunkAction<void> => (dispatch, getState) => {
    const state = getState();
    const fitterLocation = state.configuration.fitterLocation;
    const gpsPermissionSet = state.authentication.currentUser.gpsPermissionSet;
    const fitterLocationEnabled = fitterLocationEnabledType(fitterLocation, gpsPermissionSet);
    const activeInFSM = activeInFSMFromState(state);
    if(entityType === EntityType.Equipment) {
        dispatch(asyncHttpActionGenericInitialData(
            () => queryMapEquipments([conditions.SObject.ids(state.search.results.groups[EntityType.Equipment].items.map(item => item.id))])
            .then(assets => assets.map(a => {
                const alarm = conditions.Asset.stopped.isFullfilledBy(a);
                return new EquipmentMapItem(a, alarm);
            }))
            .then(mapItems => wrapSearchMapItemsResult(mapItems, EntityType.Equipment)),
            LOAD_SEARCH_MAP_PARTIAL, emptyMapItemsSearch(EntityType.Equipment) as ISearchMapResult<EquipmentMapItem>            
        ));
    } else if(entityType === EntityType.Callout) {
        dispatch(
            asyncHttpActionGenericInitialData(
                () => queryMapWorkOrders([conditions.SObject.ids(state.search.results.groups[EntityType.Callout].items.map(item => item.id))])
                .then(wos => wos.map(wo => new WorkOrderMapItem(wo, activeInFSM)))
                .then(wos => wrapSearchMapItemsResult(wos, EntityType.Callout)), 
                LOAD_SEARCH_MAP_PARTIAL, emptyMapItemsSearch(EntityType.Callout)
            )        
        );
    } else if(entityType === EntityType.Technician && fitterLocationEnabled) {
        dispatch(asyncHttpActionGenericInitialData(
            () => queryMapServiceResources([conditions.SObject.ids(
                state.search.results.groups[EntityType.Technician].items.map(item => item.id))], 
                state.configuration.technicianInactivityLimitInDays,
                serviceResourceEnabledFromState(state)
            ).then(srs => wrapSearchMapItemsResult(srs, EntityType.Technician)),
            LOAD_SEARCH_MAP_PARTIAL, emptyMapItemsSearch(EntityType.Technician)
        ));
    } else if(entityType === EntityType.Opportunity) {
        //return;
        dispatch(asyncHttpActionGenericInitialData(
            () => {
                const searchOpps = state.search.results.groups[EntityType.Opportunity].items;
                return queryMapOpportunities([conditions.Asset_Opportunity__c.opportunities(searchOpps.map(item => item.id))])
                    .then(opps => wrapSearchMapItemsResult(opps, EntityType.Opportunity))
            },
            LOAD_SEARCH_MAP_PARTIAL, emptyMapItemsSearch(EntityType.Opportunity)
        ));
    }


    /*
    switch (filterType) {
        case FilterType.Equipments:
            return dispatch(asyncHttpActionGeneric(
                () => queryMapEquipmentsForTerritory(territoryId).then(assets => assets.map(a => {
                    const alarm = conditions.Asset.stopped.isFullfilledBy(a);
                    return new EquipmentMapItem(a, alarm);
                })),
                LOAD_MAP_EQUIPMENTS
            ));
        case FilterType.Callouts:
            return dispatch(getJsforceCollectionAction(() => queryMapWorkOrdersForTerritory(territoryId), CalloutMapItem, LOAD_MAP_CALLOUTS));            
        case FilterType.Opportunities:
            return dispatch(asyncHttpActionGeneric(() => queryMapOpportunitiesForTerritory(territoryId), LOAD_MAP_OPPORTUNITIES));
        case FilterType.Technicians:
            return dispatch(getJsforceCollectionAction(() => queryMapServiceResourcesForServiceTerritory(territoryId), TechnicianMapItem, LOAD_MAP_TECHNICIANS));
        default:
            throw new Error('Unhandled filter type: ' + filterType);
    }
    */
};
