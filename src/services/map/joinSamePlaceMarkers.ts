import * as _ from 'lodash';

import { ILatLng } from '../../models/map/LonLat';
import { IMarker, MarkerType } from '../../models/markers/IMarker';
import { getClusterMarker, renderTechnicianMarker } from './markers/renderMarkers';
import { ColorPalettePriority, ColorPalette } from 'src/constants/colors';
import { EntityType } from 'src/constants/EntityType';
import { technicianMarker } from 'src/containers/pages/markers';

function averagePosition(markers: IMarker[]) {
    const averageBy = (f: (c: ILatLng) => number) => _.sumBy(markers, m => f(m.position)) / markers.length;
    return { lng: averageBy(c => c.lng), lat: averageBy(c => c.lat) };
}

export function distance(p1: ILatLng, p2: ILatLng) {
    const radlat1 = Math.PI * p1.lat / 180;
    const radlat2 = Math.PI * p2.lat / 180;
    const theta = p1.lng - p2.lng;
    const radtheta = Math.PI * theta / 180;
    const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    return Math.acos(dist) * 180 * 60 * 1.853159616 / Math.PI;
}

function compareMarkerByCoords(threshold: number) { 
    return (m1: IMarker, m2: IMarker) => {
        if (m1 == null && m2 == null) {
            return 0;
        } else if (m1 == null) {
            return -1;
        } else if (m2 == null) {
            return 1;
        } else if (distance(m1.position, m2.position) < threshold) {
            return 0;
        } else {
            return m1.position.lat * m1.position.lng - m2.position.lat * m2.position.lng;
        }
    }
}


function groupBy<T>(array: T[], comparison: (t1: T, t2: T) => number): T[][] {
    const result: T[][] = [];

    _(array)
        .clone()
        .sort(comparison)
        .forEach((item, index, sortedArray) => {
            const comp = comparison(item, sortedArray[index - 1]);
            if (comp === 0) {
                result[result.length - 1].push(item);
            } else {
                result.push([item]);
            }
        });

    return result;
}


export function groupColorPalette(markers: IMarker[]) {
    return _(markers).sortBy(m => ColorPalettePriority[m.colorPalette]).last();
    /*
    return findColor(ColorPalette.Red, markers) || findColor(ColorPalette.Blue, markers) || findColor(ColorPalette.Orange, markers) 
        || findColor(ColorPalette.Gray, markers) || ColorPalette.Black;
    */
}

export function markerGroupToSingleMarker(duplicatedMarkers: IMarker[], highlightedEntityId: string): IMarker {
    if (duplicatedMarkers.length === 0) {
        return null;
    }
    const markers = _.uniqBy(duplicatedMarkers, m => m.markerId);
    if (markers.length === 1) {
        return markers[0];
    }

    const { type, colorPalette, entityType } = groupColorPalette(markers);
    const types = _.uniq(markers.map(m => m.type));
    const entityIds = _.flatMap(markers, m => m.entityIds);
    const shadow = highlightedEntityId != null && entityIds.find(id => highlightedEntityId === id) != null;
    const texts = markers.filter(m => m.text != null).map(m => m.text);
    const text = texts.length == 0 ? null : texts.join(' | ')//reduce((accum, m) => accum + ", " + m.text, '');
    const clickable = markers[0].clickable;
    return {
        colorPalette,
        entityIds,
        icon: clickable ? 
            getClusterMarker(markers.reduce((accum, i) => i.entityIds.length + accum, 0), type, colorPalette, shadow) :
            renderTechnicianMarker(text, colorPalette, shadow),
        markerId: markers.map(m => m.markerId).join('_'),
        position: averagePosition(markers),
        type: types.length > 1 && entityType == EntityType.Equipment ? MarkerType.Other : type,
        query: markers[0].query,
        entityType: markers[0].entityType,
        modalType: markers[0].modalType,
        clickable,
        text
        //openItems: markers[0].openItems
    };
}

export default function joinSamePlaceMarkers(markers: IMarker[], highlightedEntityId: string, threshold = 0.03): IMarker[] {
    const groupedMarkers = groupBy(markers, compareMarkerByCoords(threshold));
    return groupedMarkers.map(ms => markerGroupToSingleMarker(ms, highlightedEntityId));
}
