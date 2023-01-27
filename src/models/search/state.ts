import ISearchResults from './ISearchResults';
import { IListItem } from '../list/IListItem';
import { ActionStatus } from '../../actions/actions';
import { MapPosition } from '../map/LonLat';
import { EntityType } from '../../constants/EntityType';


/*
export interface ISearchMapState {
    equipment: ItemsStatusState<EquipmentMapItem>;
    opportunities: ItemsStatusState<OpportunityMapItem>;
    technicians: ItemsStatusState<TechnicianMapItem>;
    serviceOrders: ItemsStatusState<CalloutMapItem>;  
}
*/

export interface ISearchStateGeneric<T> {
    detailItem: T;
    detailStatus: ActionStatus;
    inputValue: string;
    results: ISearchResults;
//    mapResults: ISearchMapState;
    showMap: boolean;
    selectedResult: T;
    status: ActionStatus;

    position: MapPosition;
    mapFilters: EntityType[];
    fitMarkers: boolean;
    exactSearch: boolean;
}

export interface ISearchState extends ISearchStateGeneric<IListItem>{}