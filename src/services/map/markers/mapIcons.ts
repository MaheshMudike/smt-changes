import { MarkerType } from "../../../models/markers/IMarker";

import { images } from "../../../components/layout/Icon";

//const fileNamePostfix = devicePixelRatio < 2 ? '' : `@${ devicePixelRatio }x`;
const fileNamePostfix = devicePixelRatio < 1.5 ? '' : `@${ Math.min(3, Math.round(devicePixelRatio)) }x`;

export enum IconType {
    SVG = 'SVG',
    PNG = 'PNG'
}

const allIcons: { [index: string]: { img: HTMLImageElement, iconType: IconType } } = {
    [MarkerType.Equipment]: createIconImage('equipment'),
    [MarkerType.Other]: createIconImage('other'),
    [MarkerType.Elevator]: createIconImage('equipment'),
    [MarkerType.Door]: createIconImage('door'),
    [MarkerType.Escalator]: createIconImage('escalator'),
    [MarkerType.WorkOrder]: createIconImage('konect'),
    [MarkerType.RejectedWorkOrder]: createIconImage('rejected'),
    //[MarkerType.QueryAndComplaint]: createIconImage('salesforce'),
    [MarkerType.Opportunity]: createIconImage('salesforce'),
    //[MarkerType.Task]: createIconImage('task'),
    [MarkerType.Technician]: createIconImage('helmet'),
};

function createIconImage(iconType: string) {
    const imageNamePng = `icon-${ iconType }-medium${ fileNamePostfix }.png`;
    const imageNameSvg = `icon-${ iconType }-white.svg`;
    const url = images[imageNameSvg] || images[imageNamePng];
    const img = new Image();
    img.src = url;
    return { img, iconType: images[imageNameSvg] ? IconType.SVG : IconType.PNG };
}

function buildImagePromise(markerType: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const { img } = allIcons[markerType];
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

export const loadAllIconsPromise = Promise.all(Object.keys(allIcons).map(buildImagePromise));

export function getIcon(markerType: MarkerType) {
    return allIcons[markerType];
}
