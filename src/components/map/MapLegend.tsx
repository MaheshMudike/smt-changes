import * as React from 'react';
import * as _ from 'lodash';
import { MarkerType } from '../../models/markers/IMarker';
import { ColorPalette } from '../../constants/colors';
import translate from '../../utils/translate';
import { getSingleMarker } from '../../services/map/markers/renderMarkers';
import { EntityType } from '../../constants/EntityType';

const equipmentMarkerType = 
    () => [
        { color: ColorPalette.Blue, label: translate('equipment-status.normal') },
        { color: ColorPalette.Red, label: translate('equipment-status.out-of-order') },
        { color: ColorPalette.Gray, label: translate('equipment-status.non-contracted') },
    ]; // e.nonContracted ? ColorPalette.Gray : (e.alarm ? ColorPalette.Red : ColorPalette.Blue)

const markerTypes = {
    [MarkerType.Equipment]: equipmentMarkerType,
    [MarkerType.Other]: equipmentMarkerType,
    [MarkerType.Elevator]: equipmentMarkerType,
    [MarkerType.Escalator]: equipmentMarkerType,
    [MarkerType.Door]: equipmentMarkerType,
    [MarkerType.Opportunity]: () => [
        { color: ColorPalette.Blue, label: translate('generic.entity-name.opportunity') },
    ],
    [MarkerType.Technician]: () => [
        { color: ColorPalette.Blue, label: translate('technician-activity-status.callout') },
        { color: ColorPalette.Red, label: translate('technician-activity-status.emergency-callout') },
        { color: ColorPalette.Gray, label: translate('technician-activity-status.working') },
        { color: ColorPalette.LightGray, label: translate('technician-activity-status.absent') },
        { color: ColorPalette.Black, label: translate('technician-activity-status.inactive') },
    ], //t.fitterLocation === 'GPS' ? ColorPalette.Blue : ColorPalette.Gray;
    [MarkerType.WorkOrder]: () => [
        { color: ColorPalette.Blue, label: translate('serviceorder-type.unplanned') },
        { color: ColorPalette.Red, label: translate('serviceorder-type.high-priority') },
        { color: ColorPalette.Gray, label: translate('serviceorder-type.other') },
    ],
    [MarkerType.RejectedWorkOrder]: () => [
        { color: ColorPalette.Blue, label: translate('serviceorder-type.unplanned') },
        { color: ColorPalette.Red, label: translate('serviceorder-type.high-priority') },
        { color: ColorPalette.Gray, label: translate('serviceorder-type.other') },
    ],/*     c.highPriority ? ColorPalette.Red
        : c.unplanned
            ? ColorPalette.Blue
          : ColorPalette.Gray;   
  */
    //[MarkerType.Task]: [{ color: ColorPalette.Blue, label: translate('map-legend.tasks') }]

}

const markerTypesByFilter = {
    [EntityType.Callout]: [{ mt: MarkerType.WorkOrder }, { mt: MarkerType.RejectedWorkOrder }],
    [EntityType.Equipment]: [
        { mt: MarkerType.Elevator, translationKey: 'equipment-type.004' }, 
        { mt: MarkerType.Escalator, translationKey: 'equipment-type.005' }, 
        { mt: MarkerType.Door, translationKey: 'equipment-type.002' }, 
        { mt: MarkerType.Other, translationKey: 'equipment-type.999' }
    ],
    [EntityType.Opportunity]: [{ mt: MarkerType.Opportunity }],
    [EntityType.Technician]: [{ mt: MarkerType.Technician }],
} as _.Dictionary<{ mt: MarkerType, translationKey?: string}[]>

export default class MapLegend extends React.Component<{ filterTypes: EntityType[] }, object>{

    render() {
        const mts = _.flatMap(this.props.filterTypes, ft => markerTypesByFilter[ft]).filter(mt => mt != null);
        return (
            <div id="map-legend" className="ol-control">
                {mts.map(mt => (
                    <div key={mt.translationKey}>
                        <div>
                            { translate(mt.translationKey || 'generic.entity-name.' + mt.mt.toLowerCase()) }
                        </div>
                        {/*
                        <div>
                            { mt === MarkerType.Technician && translate('map-legend.technician-position-gps') }
                        </div>
                        */}
                        { markerTypes[mt.mt]().map(legendItem => (
                            <div key={legendItem.label} className="container--horizontal">
                                <img src={getSingleMarker(mt.mt, legendItem.color, false).url} alt="" />
                                {legendItem.label}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        )
    }
}