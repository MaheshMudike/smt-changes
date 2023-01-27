import * as _ from 'lodash';
import { EquipmentMapItem, TechnicianMapItem, OpportunityMapItem } from '../../models/map/wrappers';

import { queryAndShowDetailsDialogGeneric, openListOfEntitiesOrOpenItem } from '../../actions/integration/detailsActions';
import { ModalType } from '../../constants/modalTypes';
import { IMarker } from '../../models/markers/IMarker';
import { IGlobalState, activeInFSMFromState } from '../../models/globalState';
import { MarkerType } from '../../models/markers/IMarker';
import { ColorPalette } from '../../constants/colors';
import { EntityType } from '../../constants/EntityType';
import { ILatLng, validCoordinates } from '../../models/map/LonLat';
import { renderTechnicianMarker, getSingleMarker } from '../../services/map/markers/renderMarkers';
import { Icon } from '../../models/map/mapModel';
import { queryEquipmentsByIds } from '../../actions/http/jsforce';
import { queryOpportunitiesWithLocationById } from '../../models/feed/Opportunity';
import Equipment from '../../models/equipment/Equipment';
import { queryWorkOrderDetails, coordinatesFromAsset } from '../../models/feed/Callout';
import { queryTechnicianDetails } from '../../models/technicians/Technician';
import { TechnicianStatus } from '../../constants/TechnicianStatus';
import { ThunkAction } from '../../actions/thunks';

import { FitterLocation } from 'src/models/api/mapApi';

import { ContractLineStatus, ContractLineStatusFilter } from 'src/constants/ContractLineStatus';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
interface IdentifiableWithCoordinates {
    id: string; 
    coordinates: ILatLng;//LonLat;

}

function markerWithPromiseStandardDialog<T>(
    c: IdentifiableWithCoordinates, entityType: EntityType, modalType: ModalType,
    query: (ids: string[]) => (state: IGlobalState) => Promise<T[]>,
    colorPalette: ColorPalette, type: MarkerType, highlight: boolean, icon?: Icon, 
    clickable: boolean = true, text: string = null): IMarker {
    return {
        colorPalette,
        icon: icon == null ? getSingleMarker(type, colorPalette, highlight) : icon,
        entityIds: [c.id],
        markerId: c.id,
        position: c.coordinates,
        type,
        query,
        entityType, 
        modalType,
        clickable,
        text
    };
}

//removed the entityType title during loading, doesn't make much sense as some of the titles change a lot after loading
export function queryAndShowModal<T>(
    query: (ids: string[]) => (state: IGlobalState) => Promise<T[]>, 
    openSingle: (t: T) => ThunkAction<void>, markers: IMarker<T>[]
): ThunkAction<void> {
    const entityIds = _.flatMap(markers, m => m.entityIds).filter(id => id != null && id != '');
    if(entityIds.length <= 0) return () => {};
    return queryAndShowDetailsDialogGeneric(
        '', 
        query(_.flatMap(markers, m => m.entityIds)), 
        items => openListOfEntitiesOrOpenItem(openSingle, items)
    )
}

export function transparentMarker(marker: IMarker) {
    return { ...marker, opacity: 0.5 }
}

//TODO unify these queries and list detail queries

export function opportunityMarkers(opportunities: OpportunityMapItem[], selectedId: string) {
    return _.flatMap(opportunities.filter(i => i.coordinates != null), 
        opp => opportunityMarker(opp, selectedId).filter(x => x != null)
    )
}

export function opportunityMarker(opp: OpportunityMapItem, selectedId: string) {
    return opp.coordinates.map(coordinates => 
            validCoordinates(coordinates) ?
                markerWithPromiseStandardDialog(
                    { id: opp.id, coordinates }, EntityType.Opportunity, ModalType.OpportunityModal,
                    ids => state => queryOpportunitiesWithLocationById(ids),
                    ColorPalette.Blue, MarkerType.Opportunity,
                    opp.id === selectedId, null
                )
            : null
        );
}

export function equipmentMarkers(equipments: EquipmentMapItem[], selectedId: string) {
    return equipments.map(e => equipmentMarker(e, selectedId));
}

export function equipmentMarker(e: IdentifiableWithCoordinates & { nonContracted: boolean, alarm: boolean, equipmentType: string }, selectedId: string) {
    return markerWithPromiseStandardDialog(
        e, EntityType.Equipment, ModalType.EquipmentDetails,
        (ids: string[]) => state => 
            queryEquipmentsByIds(ids)
            .then(eqs => eqs.map(e => {
                const contractStatuses = state.map.selectedContractStatuses;
                const active = e.contractLines.filter(cl => cl.Status == ContractLineStatus.Active);
                const expired = e.contractLines.filter(cl => cl.Status == ContractLineStatus.Expired);
                const future = e.contractLines.filter(cl => cl.Status == ContractLineStatus.Inactive);
                if(contractStatuses.length == 1){
                    if(contractStatuses[0] == ContractLineStatusFilter.Active)
                        e.activeContractLines = active;
                    else if(contractStatuses[0] == ContractLineStatusFilter.Expired)
                        e.activeContractLines = expired;
                    else
                        e.activeContractLines = future;
                }
                else if (contractStatuses.length == 2){
                    if(contractStatuses[0] == ContractLineStatusFilter.Active||contractStatuses[1] == ContractLineStatusFilter.Active)
                        e.activeContractLines = active;
                    else if(future.length > 0)
                        e.activeContractLines = future;
                    else
                        e.activeContractLines = expired;
                }
                return new Equipment(e, entityFieldsDataFromState(state))
            })),
        e.nonContracted ? ColorPalette.Gray : (e.alarm ? ColorPalette.Red : ColorPalette.Blue), 
        MarkerType[e.equipmentType] || MarkerType.Other,
        selectedId === e.id, null
    );
}

export function technicianMarkers(technicians: TechnicianMapItem[], selectedId: string, fitterLocation: FitterLocation) {
    return technicians.map(t => technicianMarker(t, selectedId, fitterLocation)).filter(t => t != null)
}

const technicianColors = {
    [TechnicianStatus.Working]: ColorPalette.Gray,
    [TechnicianStatus.Callout]: ColorPalette.Blue,
    [TechnicianStatus.EmergencyCallout]: ColorPalette.Red,
    [TechnicianStatus.Absent]: ColorPalette.LightGray,
    [TechnicianStatus.Inactive]: ColorPalette.Black,
}

export function technicianMarker(t: TechnicianMapItem, selectedId: string, fitterLocation: FitterLocation) {
    //const colorPalette = t.fitterLocation === 'GPS' ? ColorPalette.Blue : ColorPalette.Gray;        
    //TODO combine color palettes, maybe we can use an icon for technicians that are gps based or some other indication, it actually is a country wide property so we probably dont even need it
    
    /*
    const colorPalette = 
        t.status === TechnicianStatus.Working ? ColorPalette.Blue : 
            t.status === TechnicianStatus.Callout ? ColorPalette.Red : 
                t.status === TechnicianStatus.Inactive ? ColorPalette.Black : ColorPalette.Gray;
    */
    const colorPalette = technicianColors[t.status];

    const assetCoordinates = t.assetLocation && coordinatesFromAsset(t.assetLocation, EntityType.Technician);
    const coordinates = fitterLocation == FitterLocation.GPS ? t.coordinates : assetCoordinates
    if(coordinates == null) return null;

    return markerWithPromiseStandardDialog(
        { id: t.id, coordinates },
        EntityType.Technician, ModalType.TechnicianDialog, 
        ids => state => queryTechnicianDetails(ids, entityFieldsDataFromState(state)),
        colorPalette, MarkerType.Technician, t.id === selectedId, 
        renderTechnicianMarker(t.fullName, colorPalette, t.id === selectedId),
        t.clickable, t.fullName
    );
}

type IWorkorderMarker = IdentifiableWithCoordinates & { highPriority: boolean, unplanned: boolean, rejected: boolean }

export function serviceOrderMarkers(filteredServiceOrders: IWorkorderMarker[], selectedId: string) {
    return filteredServiceOrders.map(c => serviceOrderMarker(c, selectedId));
}

export function serviceOrderMarker(c: IWorkorderMarker, selectedId: string) {
    const colorPalette = 
        c.highPriority && c.unplanned ? ColorPalette.Red 
            : c.unplanned ? ColorPalette.Blue
                : ColorPalette.Gray;
    return markerWithPromiseStandardDialog(
        c, EntityType.Callout, ModalType.CalloutDetailsModal, 
        ids => state => queryWorkOrderDetails(ids, entityFieldsDataFromState(state)),
        colorPalette, c.rejected ? MarkerType.RejectedWorkOrder : MarkerType.WorkOrder,
        c.id === selectedId, null
    );    
}