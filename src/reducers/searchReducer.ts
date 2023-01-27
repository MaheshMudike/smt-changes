import * as _ from 'lodash';

import { IPayloadAction } from '../actions/actionUtils';
import { CLEAR_SEARCH_RESULTS, LOAD_SEARCH_DETAIL, SEARCH_INPUT_CHANGE, SELECT_SEARCH_ITEM, LOAD_SEARCH_PARTIAL, LOAD_SEARCH_PARTIAL_RESET, searchGroupName, SET_EXACT_SEARCH } from '../actions/searchActions';
import { DESELECT_SEARCH_ITEM } from '../actions/searchActions';
import ISearchResults, { ISearchResultGroupStandard, ISearchResultGroup, ISearchResultsGroups } from '../models/search/ISearchResults';
import { ISearchState } from '../models/search/state';
import clone from '../utils/clone';
import { ActionStatus } from '../actions/actions';
import { EntityType } from '../constants/EntityType';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_POSITION } from '../models/map/state';
import { LOAD_SEARCH_MAP_PARTIAL, TOGGLE_MAP, SHOW_OR_HIDE_MAP, SEARCH_MAP_SAVE_POSITION, SEARCH_MAP_FILTER, SEARCH_MAP_FIT_MARKERS } from '../actions/searchMapActions';
import { IdentifiableTitleBodyHighPriority } from 'src/models/list/IListItem';
import { searchEntities } from 'src/actions/http/jsforceSearch';

export const initialSearchGroup = (entityType: EntityType, actionStatus: ActionStatus) => ({
    isExtraordinary: false,
    items: [],
    get title() { return searchGroupName(entityType) },
    entityType,
    actionStatus,
} as ISearchResultGroupStandard)


export const initialSearchGroupTitle = <T extends IdentifiableTitleBodyHighPriority>(title: string, items: T[]) => ({
    isExtraordinary: false,
    items,
    title,
    actionStatus: ActionStatus.SUCCESS,
    searchText: '',
    entityType: null
} as ISearchResultGroupStandard)

export const createInitialSearchResults = (keys: string[], actionStatus: ActionStatus = ActionStatus.SUCCESS) => (
    keys.reduce(
        (result, entityType) => { result[entityType] = initialSearchGroup(entityType as EntityType, actionStatus); return result; }, 
        {}
    )
);

export const initialSearchResults = () => {
    return { 
        groups: createInitialSearchResults(searchEntities),
        mapGroups: createInitialSearchResults(searchEntities)
    }
}

export const initialSearchState = () => ({
    detailItem: null,
    detailStatus: ActionStatus.SUCCESS,
    inputValue: '',
    results: initialSearchResults(),
    center: DEFAULT_MAP_CENTER,
    position: DEFAULT_MAP_POSITION,
    //mapResults: initialMapSearchState(),
    showMap: false,
    selectedResult: null,
    status: null,
    selectedObjects: { },
    mapFilters: [],
    fitMarkers: true,
    exactSearch: false
} as ISearchState);

/*
export function replaceSearchGrou2p(results: ISearchResults, result: ISearchResultGroupStandard, entityType: EntityType, actionStatus: ActionStatus) {
    return { ...results.groups, [entityType]: { ...result, actionStatus } };
}
*/

function replaceSearchGroup(state: ISearchState, result: ISearchResultGroupStandard, actionStatus: ActionStatus): ISearchState {
    return { 
        ...state, 
        results: { 
            ...state.results, 
            groups: { ...state.results.groups, [result.entityType]: { ...result, actionStatus } } 
        } as ISearchResults,
        status: (actionStatus == ActionStatus.FAILURE)?actionStatus:state.status 
    };
}

export function replaceSearchGroup2<T>(groups: ISearchResultsGroups<T>, entityType: EntityType, items: T[], actionStatus: ActionStatus): ISearchResultsGroups<T> {
    return { groups: { ...groups.groups, [entityType]: { ...groups.groups[entityType], items, actionStatus } } };
}

export function replaceSearchMapGroup(state: ISearchState, entityType: EntityType, mapItems: any[], mapItemsActionStatus: ActionStatus): ISearchState {
    const searchResults = state.results.mapGroups[entityType];
    return { 
        ...state, 
        results: { 
            ...state.results, 
            mapGroups: { ...state.results.mapGroups, [entityType]: { ...searchResults, mapItems, mapItemsActionStatus } } 
        } as ISearchResults 
    };
}


function searchReducer(state = initialSearchState(), action: IPayloadAction<any>): ISearchState {
    switch (action.type) {
        case CLEAR_SEARCH_RESULTS:
            return { ...clearSearchResults(state), status: ActionStatus.SUCCESS };
            /*
        case LOAD_SEARCH.start:
            return { ...state, status: ActionStatus.START };
        case LOAD_SEARCH.failure: // Make sure we don't show wrong data if the api call has failed
            return { ...clearSearchResults(state), status: ActionStatus.FAILURE };
        case LOAD_SEARCH.success:          
            const results = action.payload;
            if (results.searchText !== state.inputValue) {
                return state;
            }
            const newState = cleanDetailWhenIsNotInResults(state, results);
            return { ...newState, results, status: ActionStatus.SUCCESS }
            */

        case LOAD_SEARCH_PARTIAL_RESET:
            return { ...state, results: { ...state.results, groups: createInitialSearchResults(searchEntities) } as ISearchResults } as ISearchState;
        case LOAD_SEARCH_PARTIAL.start:
            return replaceSearchGroup(state, action.payload, ActionStatus.START);
            //return { ...state, results: { ...state.results, groups: { ...state.results.groups, [action.payload]: initialSearchState } }, status: ActionStatus.START };
        case LOAD_SEARCH_PARTIAL.failure: // Make sure we don't show wrong data if the api call has failed
            //return { ...clearSearchResults(state), status: ActionStatus.FAILURE };
            return replaceSearchGroup(state, action.payload, ActionStatus.FAILURE);
        case LOAD_SEARCH_PARTIAL.success:
            const results = action.payload;
            if (results.searchText !== state.results.groups[results.entityType].searchText) return state;
            //const newState2 = cleanDetailWhenIsNotInResults(state, results);
            return replaceSearchGroup(state, action.payload, ActionStatus.SUCCESS);//{ ...newState2, results, status: ActionStatus.SUCCESS }
        
        case SEARCH_INPUT_CHANGE:
            return { ...state, inputValue: action.payload }
        case SELECT_SEARCH_ITEM:
            return { ...state, selectedResult: action.payload, detailItem: null }
        case SET_EXACT_SEARCH:
            return { ...state, exactSearch: action.payload }
        case LOAD_SEARCH_DETAIL.start:
            return { ...state, detailStatus: ActionStatus.START, detailItem: null }
        case LOAD_SEARCH_DETAIL.failure:
            return { ...state, detailStatus: ActionStatus.FAILURE, selectedResult: null }
        case LOAD_SEARCH_DETAIL.success:
            return { ...state, detailStatus: ActionStatus.SUCCESS, detailItem: action.payload }

        case TOGGLE_MAP:
            return { ...state, showMap: !state.showMap }
        case SHOW_OR_HIDE_MAP:
            return { ...state, showMap: action.payload }
        case SEARCH_MAP_FILTER:
            return { ...state, mapFilters: action.payload };
        case SEARCH_MAP_FIT_MARKERS:
            return { ...state, fitMarkers: action.payload };
        case SEARCH_MAP_SAVE_POSITION:
            return { ...state, position: action.payload }
        
        case LOAD_SEARCH_MAP_PARTIAL.start:
            return replaceSearchMapGroup(state, action.payload.entityType, action.payload.mapItems, ActionStatus.START);
        case LOAD_SEARCH_MAP_PARTIAL.failure:
            return { ...clearSearchResults(state), status: ActionStatus.FAILURE };
        case LOAD_SEARCH_MAP_PARTIAL.success:
            //const results = action.payload;
            //if (results.searchText !== state.inputValue) return state;
            return replaceSearchMapGroup(state, action.payload.entityType, action.payload.mapItems, ActionStatus.SUCCESS);


        case DESELECT_SEARCH_ITEM:
            return clone(state, cleanDetail);
        default:
            return state;
    }
}

/*
const mapResultsReducer = combineReducers<ISearchMapState>({
    serviceOrders: asyncListReducerFactory(LOAD_SEARCH_MAP_SERVICE_ORDERS),
    equipment: asyncListReducerFactory(LOAD_SEARCH_MAP_EQUIPMENT),
    opportunities: asyncListReducerFactory(LOAD_SEARCH_MAP_OPPORTUNITIES),
    technicians: asyncListReducerFactory(LOAD_SEARCH_MAP_TECHNICIANS)
    //selectedFilterType: payloadValueReducerFactory(SELECT_FILTER_TYPE, initialMapState.selectedFilterType),
    //technicians: asyncListReducerFactory(LOAD_MAP_TECHNICIANS)
});
*/

/*
const mapResultsReducer = combineReducers<ISearchMapState>({
    serviceOrders: asyncListReducerFactory(LOAD_SEARCH_MAP_SERVICE_ORDERS),
    equipment: asyncListReducerFactory(LOAD_SEARCH_MAP_EQUIPMENT),
    opportunities: asyncListReducerFactory(LOAD_SEARCH_MAP_OPPORTUNITIES),
    technicians: asyncListReducerFactory(LOAD_SEARCH_MAP_TECHNICIANS)
    //selectedFilterType: payloadValueReducerFactory(SELECT_FILTER_TYPE, initialMapState.selectedFilterType),
    //technicians: asyncListReducerFactory(LOAD_MAP_TECHNICIANS)
});
*/


/*
function searchMapReducer(state: ISearchState, action: IPayloadAction<any>) {    
    switch(action.type) {
        
        default: return state
    }
}
*/

export default searchReducer;//composeReducers(initialSearchState(), searchReducer)

function clearSearchResults(state: ISearchState) {
    return clone(state, s => {
        s.results = initialSearchResults();
        cleanDetail(s);
    });
}

function cleanDetail(state: ISearchState) {
    state.selectedResult = null;
    state.detailItem = null;
    state.showMap = false;
    state.mapFilters = [];
    state.fitMarkers = true;
}

