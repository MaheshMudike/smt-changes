import * as _ from 'lodash';
import { Dispatch } from 'redux';

import { GetGlobalState, IGlobalState, activeInFSMFromState } from '../models/globalState';

import { asyncActionNames, emptyAction, payloadAction } from './actionUtils';
import { asyncHttpActionGeneric, asyncHttpActionGenericInitialData } from './http/httpActions';
import { queryKffBase, filterAudits } from './http/jsforce';
import { EntityType } from 'src/constants/EntityType';
import { searchEntities, soslQueryGroup } from './http/jsforceSearch';
import { conditions } from './http/jsforceMappings';
import { IAuditApi, IApiId, MbmForListItem } from '../models/api/coreApi';
import translate from '../utils/translate';
import { ISearchResultGroupStandard,  ISearchResultGroup } from '../models/search/ISearchResults';
import { IListItem } from '../models/list/IListItem';
import { ActionStatus } from './actions';
import { ThunkDispatch, ThunkAction } from './thunks';
import { AccountListItem } from '../models/accounts/Account';
import { AuditListItem } from '../models/audits/Audit';
import Equipment from '../models/equipment/Equipment';
import Event from '../models/events/Event';
import { CalloutListItem, MbmListItem } from '../models/feed/Callout';
import { ComplaintListItem } from '../models/feed/Complaint';
import Lead from '../models/feed/Lead';
import { QueryListItem } from '../models/feed/Query';
import Task from '../models/feed/Task';
import { TechnicianListItem } from '../models/technicians/Technician';
import { TenderListItem } from '../models/tenders/Tender';
import { validCoordinates } from 'src/models/map/LonLat';
import { downloadSearchMapItems, emptyMapItemsSearch, centerOnSearchMapSelectedItem, showOrHideMap, LOAD_SEARCH_MAP_PARTIAL } from './searchMapActions';
import { LocatableIdentifiable } from '../models/map/Locatable';
import { EntityFieldsData, entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';


export const LOAD_SEARCH = asyncActionNames('LOAD_SEARCH');
export const LOAD_SEARCH_PARTIAL_RESET = 'LOAD_SEARCH_PARTIAL_RESET';
export const LOAD_SEARCH_PARTIAL = asyncActionNames('LOAD_SEARCH_PARTIAL');
export const LOAD_SEARCH_DETAIL = asyncActionNames('LOAD_SEARCH_DETAIL');
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
export const SEARCH_INPUT_CHANGE = 'SEARCH_INPUT_CHANGE';
export const SELECT_SEARCH_ITEM = 'SELECT_SEARCH_ITEM';
export const DESELECT_SEARCH_ITEM = 'DESELECT_SEARCH_ITEM';
export const SET_SELECTED_SEARCH_OBJECTS = 'CHOOSE_SELECTED_SEARCH_OBJECTS';
export const SET_EXACT_SEARCH = 'SET_EXACT_SEARCH';

const debouncedGetSearch = _.debounce(getSearchSOSLMulti, 500);
export const SOSL_LIMIT = 100;

export const setExactSearch = (exactSearch: boolean): ThunkAction<void> => (dispatch, getState) => {
    dispatch({ payload: exactSearch, type: SET_EXACT_SEARCH });
    dispatch(search());
};

export const searchInputChange = (text: string): ThunkAction<void> => (dispatch, getState) => {
    dispatch({
        payload: text,
        type: SEARCH_INPUT_CHANGE,
    });

    dispatch(search());
};

export const search = () => (dispatch: Dispatch<any>, getState: GetGlobalState) => {
    const state = getState();
    const text = state.search.inputValue;
    const exactSearch = state.search.exactSearch;
    if (text && text.length > 2) {
        debouncedGetSearch(text, exactSearch, dispatch, getState);
    } else {
        debouncedGetSearch.cancel();
        dispatch({ type: CLEAR_SEARCH_RESULTS });
    }
};

/*
export const toggleSearchObject = (object: string) => (dispatch: Dispatch<any>, getState: GetGlobalState) => {
    dispatch(payloadAction(TOGGLE_SEARCH_OBJECT)(object));
}

export const chooseSelectedSearchObjects = (objects: _.Dictionary<boolean>) => (dispatch: Dispatch<any>, getState: GetGlobalState) => {
    dispatch(payloadAction(SET_SELECTED_SEARCH_OBJECTS)(objects));
}
*/

/*
function getSearch(text: string, dispatch: Dispatch<any>, getState: GetGlobalState) {
    const searchQs = searchQueries.map(entityQuery => entityQuery[1](text));
    dispatch(asyncHttpActionGeneric(
        (state) => multiQuery(...searchQs).then(
            resultWrapper => {
                const searchResults = _.flatten(resultWrapper.queries.result.map((records, index) => records.map(r => {
                    const entityType = searchQueries[index][0];                
                    const res = wrapSearchResult(r, entityType as EntityType, searchConfiguration[entityType].descriptionField)
                    console.log(">>> getSearch", resultWrapper, entityType, res);
                    return res;
                }))) as ISearchResult[];
                return SearchResults.newSearchResults(getState().search.results, text, searchResults)
            }
        ), LOAD_SEARCH
    ));    
    dispatch(searchAudits(text));
}
*/


function searchAudits(state: IGlobalState, text: string) {
    return queryKffBase().then(kffData => {
        if(kffData == null) return [];

        const filteredAudits = filterAudits(kffData).filter(audit => { return audit.template_name.toLowerCase().indexOf(text) >= 0 || audit.technician_name.toLowerCase().indexOf(text) >= 0 });                
        return filteredAudits as IAuditApi[];
    })
}


const entityTypeTitles = (): [EntityType, string][] => ([
    [EntityType.User, translate('search-page.group-title.users')],
    [EntityType.Equipment, translate('search-page.group-title.equipments')],
    [EntityType.Callout, translate('search-page.group-title.callouts')],
    //queries and complaints are Cases
    [EntityType.Complaint, translate('search-page.group-title.complaints') + ' | ' + translate('search-page.group-title.queries')],
    //[EntityType.Query, translate('search-page.group-title.queries')],
    [EntityType.Task, translate('search-page.group-title.tasks')],
    [EntityType.Opportunity, translate('search-page.group-title.opportunities')],
    [EntityType.Event, translate('search-page.group-title.events')],
    [EntityType.Tender, translate('search-page.group-title.tenders')],
    [EntityType.Audit, translate('search-page.group-title.audits')],
    [EntityType.Timesheet, translate('search-page.group-title.timesheets')],
    [EntityType.Account, translate('search-page.group-title.accounts')],
    [EntityType.Lead, translate('search-page.group-title.leads')],
    [EntityType.Technician, translate('search-page.group-title.technicians')]
]);

const entityTypeTitlesMap = () => new Map(entityTypeTitles());

export function filterSelectedSearchOptions(options: _.Dictionary<boolean>) {
    return Object.keys(_.omitBy(options, (value, key) => value !== true))
}

function filterSalesforceObjects(objects: string[]) {
    return objects.filter(o => o != EntityType.Audit as any as string);
}
    
export function emptySearchGroup<T>(entityType: EntityType, searchText: string): ISearchResultGroup<T> {
    return { searchText, entityType, actionStatus: ActionStatus.START, items: [] as any[], title: searchGroupName(entityType) }
}

//one action for every search, fastest implementation
function getSearchSOSLMulti(text: string, exactSearch: boolean, dispatch: ThunkDispatch, getState: GetGlobalState) {
    //const selectedObjectsMap = getState().search.selectedObjects;
    let selectedObjects = [] as string[];//filterSelectedSearchOptions(selectedObjectsMap);
    const searchAll = true;//selectedObjects.length <= 0;
    const objectsToSearch = filterSalesforceObjects(searchAll ? searchEntities : selectedObjects);
    const entityFieldsData = entityFieldsDataFromState(getState());
    dispatch(emptyAction(LOAD_SEARCH_PARTIAL_RESET));

    //escape special SOSL characters
    const escapedSearchText = text.replace(/'|-|&|\||!|\(|\)|\{|\}|\[|\]|\^|"|~|\*|\?|\:|\\|\+|-/g, match => `\\${match}`)
    const searchText = exactSearch ? `"${ escapedSearchText }"` : `*${ escapedSearchText }*`;
    objectsToSearch.forEach(sobject => {
        const query = soslQueryGroup(searchText, SOSL_LIMIT, sobject, entityFieldsData);
        const entityType = sobject as EntityType;
        dispatch(payloadAction(LOAD_SEARCH_MAP_PARTIAL.success)(emptyMapItemsSearch(entityType)));
        dispatch(
            asyncHttpActionGeneric(
                state => query,
                LOAD_SEARCH_PARTIAL, [downloadSearchMapItems(entityType)], {},
                { ...emptySearchGroup(entityType, searchText) } as ISearchResultGroupStandard
            )
        )
    })

    if(searchAll || selectedObjects[EntityType.Audit]) {
        const entityType = EntityType.Audit;
        dispatch(payloadAction(LOAD_SEARCH_MAP_PARTIAL.success)(emptyMapItemsSearch(entityType)));
        dispatch(
            asyncHttpActionGenericInitialData(
                async state => {
                    const results = await searchAudits(state, text);
                    return createSearchResultGroup(text, entityType, results.map(audit => new AuditListItem(audit, entityFieldsData)))
                },
                LOAD_SEARCH_PARTIAL,
                { ...emptySearchGroup(entityType, text) } as ISearchResultGroupStandard
            )
        )
    }
}


const listItemComponentsByTypes: _.Dictionary<{ new (backendData: any, entityFieldsData: EntityFieldsData): IListItem; }> = {
    [EntityType.Account]: AccountListItem,
    [EntityType.Audit]: AuditListItem,
    [EntityType.Callout]: CalloutListItem,
    [EntityType.Complaint]: ComplaintListItem,
    [EntityType.Equipment]: Equipment,
    [EntityType.Event]: Event,
    [EntityType.Lead]: Lead,
    [EntityType.Query]: QueryListItem,
    [EntityType.Task]: Task,
    [EntityType.Tender]: TenderListItem,
    [EntityType.Technician]: TechnicianListItem,
};

export function createSearchResultGroupWithSobjects(searchText: string, entityType: EntityType, sobjects: IApiId[], entityFieldsData: EntityFieldsData) {

    const groupResults = sobjects.map(sobj => {
        
        var recordEntityType = entityType;
        if(entityType == EntityType.Complaint) {
            if(conditions.Case.complaint.isFullfilledBy(sobj)) recordEntityType = EntityType.Complaint;
            else if(conditions.Case.query.isFullfilledBy(sobj)) recordEntityType = EntityType.Query;
            else recordEntityType = null;
        } else if(entityType == EntityType.Callout && conditions.WorkOrder.mbm.isFullfilledBy(sobj as any)) {
            const res = sobj as MbmForListItem;
            return new MbmListItem(res, entityFieldsData, null, res.WorkOrderLineItems.records);
        }
        return new listItemComponentsByTypes[recordEntityType](sobj, entityFieldsData);
    });

    return createSearchResultGroup(searchText, entityType, groupResults);
}

export function createSearchResultGroup<T>(searchText: string, entityType: EntityType, items: T[]) {
    return {
        searchText,
        actionStatus: ActionStatus.SUCCESS,
        title: searchGroupName(entityType),
        items,
        ...emptyMapItemsSearch(entityType)
    } as ISearchResultGroup<T>;
}

export function searchGroupName(entityType: EntityType) {
    return entityTypeTitlesMap().get(entityType);
}

export function searchGroupNumber(length: number) {
    //return ' ('+ length + (length == SOSL_LIMIT ? '+' : '') + ')';
    return (length >= SOSL_LIMIT ? '+' : '') + length;
}

export const deSelectSearchItem = () => emptyAction(DESELECT_SEARCH_ITEM);

export const queryAndShowSearchDetail = (searchListItem: IListItem): ThunkAction<void> => (dispatch, getState) => {
    dispatch({ payload: searchListItem, type: SELECT_SEARCH_ITEM });
    dispatch(reloadSearchItem);
};

export const reloadSearchItem: ThunkAction<void> = (dispatch, getState) => {
    const searchListItem = getState().search.selectedResult;
    if(searchListItem == null) return;
    dispatch(asyncHttpActionGeneric(() => searchListItem.queryDetails(), LOAD_SEARCH_DETAIL, [
        (dispatch, getState) => {
            const detailItem = getState().search.detailItem;
            const item = detailItem as any as LocatableIdentifiable;
            if(validCoordinates(item.coordinates)) dispatch(centerOnSearchMapSelectedItem())
            else dispatch(showOrHideMap(false));
        }
    ]));
};