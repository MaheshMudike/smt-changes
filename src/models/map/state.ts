import { MaintenanceActivityTypeFilter } from '../../constants/ServiceOrderType';
import { IMapConfig } from '../api/mapApi';
import { WorkOrderMapItem, EquipmentMapItem, OpportunityMapItem, TechnicianMapItem } from '../map/wrappers';
import { getEmptyItemsState, initialDataStatus } from '../IItemsState';
import { ContractLineStatusFilter } from '../../constants/ContractLineStatus';
import { EquipmentStatusFilter } from '../../constants/equipmentStatus';
import { OpportunityBusinessType } from '../../constants/opportunityBusinessType';
import { LocatableIdentifiable, LocatableMapMarker } from './Locatable';
import { IMarker } from '../markers/IMarker';
import { EntityType } from 'src/constants/EntityType';

const initialMapConfig: IMapConfig = {
    callouts: {
        filters: [],
        visible: true,
    },
    //isInitial: true,
    opportunities: {
        //filters: [],
        visible: false,
    },
    technicians: {
        //filters: [],
        visible: false,
    },
};

const koneEspooLocation = { lat: 60.172072, lng: 24.828557 };
const helsinkiLocation = { lng: 24.828557, lat: 60.172072 };
const berlin = { lat: 52.52, lng: 13.4050 };

export const DEFAULT_MAP_POSITION = { coordinates: berlin, zoom: 4 };
export const DEFAULT_MAP_CENTER = { id: null, coordinates: berlin } as LocatableIdentifiable;

export const initialMapState = {
    callouts: getEmptyItemsState<WorkOrderMapItem>(),
    config: initialMapConfig,
    automaticallyCentered: false,
    //TODO this can be removed I think
    highlight: null as LocatableMapMarker,
    highlightMarker: initialDataStatus<IMarker>(),
    position: DEFAULT_MAP_POSITION,
    fitMarkers: true,
    equipments: getEmptyItemsState<EquipmentMapItem>(),
    isRenderingMarkers: false,
    opportunities: getEmptyItemsState<OpportunityMapItem>(),
    selectedFilterType: EntityType.Equipment,
    selectedServiceOrderTypes: [] as MaintenanceActivityTypeFilter[],
    selectedContractStatuses: [ContractLineStatusFilter.Active] as ContractLineStatusFilter[],
    selectedEquipmentStatuses: [EquipmentStatusFilter.BACK_IN_ORDER, EquipmentStatusFilter.OUT_OF_ORDER, EquipmentStatusFilter.NORMAL_OPERATION] as EquipmentStatusFilter[],
    selectedOpportunityBusinessTypes: [] as OpportunityBusinessType[],
    /*
    [OpportunityBusinessType.Doors, OpportunityBusinessType.EBULI, OpportunityBusinessType.Maintenance_SEB, OpportunityBusinessType.Modernization_FRB, 
        OpportunityBusinessType.Modernization_NEB, OpportunityBusinessType.New_Equipment_NEB, OpportunityBusinessType.Spares, OpportunityBusinessType.VA_Repairs] as OpportunityBusinessType[],
    */
    selectedWorkcenters: [] as string[],
    technicians: getEmptyItemsState<TechnicianMapItem>(),
};

export type IMapState = typeof initialMapState;
