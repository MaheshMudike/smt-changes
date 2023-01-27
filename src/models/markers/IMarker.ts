import { ColorPalette } from '../../constants/colors';
import { EntityType } from '../../constants/EntityType';
import { ILatLng } from '../map/LonLat';
import { Icon } from './../map/mapModel';
import { IGlobalState } from '../globalState';
import { ModalType } from '../../constants/modalTypes';


export enum MarkerType {
    Equipment = 'Equipment',
    Other = 'Other',
    Elevator = 'Elevator',
    Door = 'Door',
    Escalator = 'Escalator',
    WorkOrder = 'Workorder',
    RejectedWorkOrder = 'RejectedWorkorder',
    //QueryAndComplaint = 'QueryAndComplaint',
    Opportunity = 'Opportunity',
    //Task = 'Task',
    Technician = 'Technician',
}

export interface IMarker<T = any> {
    opacity?: number;
    colorPalette: ColorPalette;
    icon: Icon;
    markerId: string;
    text: string;
    //this is not needed anymore
    entityIds: string[];
    position: ILatLng;
    type: MarkerType;
    query: (ids: string[]) => (state: IGlobalState) => Promise<T[]>;
    entityType: EntityType;
    modalType: ModalType;
    clickable: boolean;
    //openItems: (markers: IMarker[]) => ThunkAction<void>;
}
