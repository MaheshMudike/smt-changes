import { ILatLng } from "./LonLat";
import { EntityType } from "../../constants/EntityType";
import { Identifiable } from "../feed/ISObject";
import { IMarker } from "../markers/IMarker";
import { IGlobalState } from "../globalState";

export interface Locatable {
    coordinates: ILatLng & { type: EntityType };
}

export interface LocatableIdentifiable extends Locatable, Identifiable {}

export interface LocatableMapMarker extends LocatableIdentifiable {
    entityType: EntityType;
    marker: (state: IGlobalState) => Promise<IMarker>;
    assetCoordinates?: ILatLng & { type: EntityType };
}

/*
export interface Coordinates {
    latitude: number;
    longitude: number;
}
*/
/*
export class Coordinates {
    constructor(public latitude: number,public longitude: number) {}
}
*/