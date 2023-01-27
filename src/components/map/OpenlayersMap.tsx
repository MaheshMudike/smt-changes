import * as _ from 'lodash';
import * as ol from 'openlayers';
import * as React from 'react';

import { IGeoBounds } from '../../models/feed/state';
import { ILatLng, MapPosition } from '../../models/map/LonLat';
import { IMarker } from '../../models/markers/IMarker';
import { config } from '../../config/config';
import { getColor, ColorPalette, Brightness } from '../../constants/colors';
import { markerGroupToSingleMarker, groupColorPalette } from '../../services/map/joinSamePlaceMarkers';
import { LocatableIdentifiable } from '../../models/map/Locatable';
import { highlightWidth } from '../../services/map/markers/renderMarkers';

const mapRef = 'ol_map_ref';
const MARKER_KEY = 'marker';

const MINIMUM_DISTANCE_IN_PIXELS_BETWEEN_CLUSTERS = 100;

const normalCircleStroke = new ol.style.Stroke({ 
    color: '#fff' 
});

export interface IOpenLayersMapProps {
    highlightedEntity: LocatableIdentifiable;
    center: ILatLng;
    zoom: number;
    fitMarkers: boolean;
    markers: IMarker[];
    onBoundsChanged: (bounds: IGeoBounds) => void;
    onMarkerClicked: (marker: IMarker) => void;
    onRenderMarkersEnd: () => void;
    saveMapPosition: (position: MapPosition) => void;
}

export default class OpenlayersMap extends React.Component<IOpenLayersMapProps, {}> {
    public refs: {
        [key: string]: HTMLDivElement;
    };

    private olMap: ol.Map;
    private markerSource: ol.source.Vector;

    private isMaxZoom() {
        return this.olMap.getView().getZoom() == this.olMap.getView().getMaxZoom();
    }

    private markerFromFeature = (f: ol.Feature) => {
        return f.getProperties()[MARKER_KEY] as IMarker;
    }

    public componentDidMount() {
        this.markerSource = new ol.source.Vector({ features: [] });
        
        const clusterLayer = new ol.layer.Vector({
            source: new ol.source.Cluster({
                distance: MINIMUM_DISTANCE_IN_PIXELS_BETWEEN_CLUSTERS,
                source: this.markerSource,
            }),
            style: (feature: ol.Feature) => {
                const features = feature.get('features') as ol.Feature[];
                
                if (features.length === 1) {
                    return features[0].getStyle() as ol.style.Style;
                }
            
                const markers = features.map(this.markerFromFeature);
                const highlightedEntityId = this.props.highlightedEntity && this.props.highlightedEntity.id;
                if(this.isMaxZoom()) {
                    return this.buildMarker(markerGroupToSingleMarker(markers, highlightedEntityId)).getStyle() as ol.style.Style;
                } else {
                    const clusterSize = _.sumBy(markers, m => m.entityIds.length).toString(10);
                    const { colorPalette } = groupColorPalette(markers);
                    const color = getColor(colorPalette, Brightness.Basic);
                    const highlightColor = getColor(colorPalette, Brightness.Darker);
                    const highlightedCircleStroke = new ol.style.Stroke({
                        color: highlightColor,
                        width: highlightWidth
                    });
                    
                    const entityIds = _.flatMap(markers, m => m.entityIds);
                    const highlight = highlightedEntityId != null && entityIds.find(id => highlightedEntityId === id) != null;

                    return new ol.style.Style({
                        image: new ol.style.Circle({ 
                            fill: new ol.style.Fill({ color }),
                            radius: 22, 
                            stroke: highlight ? highlightedCircleStroke : normalCircleStroke
                        }),
                        text: new ol.style.Text({ 
                            fill: new ol.style.Fill({ color: '#fff' }), 
                            font: '16px "Open Sans"',
                            offsetY: 2,
                            text: clusterSize 
                        }),
                    });
                }
            },
            updateWhileAnimating: true,
            updateWhileInteracting: true,
        });

        const tilesLayer = new ol.layer.Tile({
            source: new ol.source.BingMaps({
                imagerySet: 'Road',
                key: config.mapKey,
                //culture: 'zh-CN'
            }),
        });

        const coords = this.props.center;
        const view = new ol.View({
            center: ol.proj.fromLonLat([coords.lng, coords.lat]),
            maxZoom: 18,
            minZoom: 3,
            zoom: this.props.zoom,
        });

        this.olMap = new ol.Map({
            controls: ol.control.defaults({ rotate: false }),
            interactions: ol.interaction.defaults({ altShiftDragRotate: false, pinchRotate: false }),
            layers: [tilesLayer, clusterLayer],
            target: this.refs[mapRef],
            view,
        });
        
        this.createGeolocation(view, this.olMap);

        const handler = _.debounce(this.handleBoundsChanged, 100);
        this.olMap.on('moveend', handler);
        this.olMap.on('zoomend', handler);

        var zoomslider = new ol.control.ZoomSlider();
        this.olMap.addControl(zoomslider);

        const selectionInteraction = new ol.interaction.Select({
            //condition: ol.events.condition.click,
            //fixes issue with autoclosing dialog in samsung tablet
            condition: ol.events.condition.singleClick,
            style: null,
        });
        selectionInteraction.on('select', this.handleSelect, this);        
        this.olMap.addInteraction(selectionInteraction);

        const features = this.props.markers.map(this.buildMarker, this);
        this.drawFeatures(features);

        if(this.props.fitMarkers) this.fitFeatures(features);
        this.centerMap(this.props.center, this.props.zoom);
    }
    
    private createGeolocation(view: ol.View, map: ol.Map) {
        const geolocation = new ol.Geolocation({
            projection: view.getProjection()
        });
        geolocation.setTracking(true);

        var accuracyFeature = new ol.Feature();
        geolocation.on('change:accuracyGeometry', function() {
            accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });
  
        var positionFeature = new ol.Feature();
        positionFeature.setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: '#3399CC'
            }),
            stroke: new ol.style.Stroke({
              color: '#fff',
              width: 2
            })
          })
        }));

        geolocation.on('change:position', function() {
            var coordinates = geolocation.getPosition();
            positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        });

        new ol.layer.Vector({
            map: map,
            source: new ol.source.Vector({
                features: [accuracyFeature, positionFeature]
            })
        });
    }

    public componentWillReceiveProps(nextProps: IOpenLayersMapProps) {
        if (!this.olMap) return;

        //get center and zoom before fitFeatures changes it
        const center = this.getMapCenter();
        const zoom = this.olMap.getView().getZoom();

        if (this.props.markers !== nextProps.markers) {
            const features = nextProps.markers.map(this.buildMarker, this);
            this.drawFeatures(features);
            if(nextProps.fitMarkers) this.fitFeatures(features);
        }
/*
        if (center.lat !== nextProps.center.lat || center.lng !== nextProps.center.lng || zoom !== nextProps.zoom) {
            this.centerMap(nextProps.center, nextProps.zoom);
        }
        */
        //if(!nextProps.fitMarkers) this.centerMap(nextProps.center, nextProps.zoom);
        this.centerMap(nextProps.center, nextProps.zoom);
    }

    private centerMap(center: ILatLng, zoom: number) {
        if(center == null) return;
        //this.centerMapWithAnimation(center);
        this.mapView.setCenter(ol.proj.fromLonLat([center.lng, center.lat]));
        this.mapView.setZoom(zoom);
    }

    private centerMapWithAnimation(center: ILatLng) {
        
        this.mapView.cancelAnimations();
        /*
        this.mapView.animate({ 
            center: ol.proj.fromLonLat([nextProps.center.lng, nextProps.center.lat]), 
            duration: 2000,
            zoom: 10 
        });
        */
       const coords = this.props.center;
        this.mapView.animate({ 
            center: ol.proj.fromLonLat([(center.lng + coords.lng) / 2.0, (center.lat + coords.lat) / 2.0]), 
            duration: 2000,
            zoom: 5
        }, { 
            center: ol.proj.fromLonLat([center.lng, center.lat]), 
            duration: 2000,
            zoom: 15
        });
                    
        //this.mapView.setCenter(ol.proj.fromLonLat([nextProps.center.lng, nextProps.center.lat]));
    }

    public render() {
        return <div id="openlayers-map" className='cover-all' ref={mapRef}></div>;
    }

    private handleBoundsChanged = () => {
        if (!this.olMap) {
            return;
        }
        const extent = this.mapView.calculateExtent(this.olMap.getSize());
        const extentTransformed = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');

        const bounds = {
            northEast: {
                latitude: extentTransformed[3],
                longitude: extentTransformed[2],
            },
            southWest: {
                latitude: extentTransformed[1],
                longitude: extentTransformed[0],
            },
        };

        this.props.onBoundsChanged(bounds);
        this.saveMapPositionIfDifferent();
        //this.mapView.setCenter(ol.proj.fromLonLat([center.lng, center.lat]));

    }

    private getMapCenter = () => {
        const center = ol.proj.transform(this.mapView.getCenter(), 'EPSG:3857', 'EPSG:4326');
        return { lng: center[0], lat: center[1] };
    }

    public componentWillUnmount() {
        this.saveMapPositionIfDifferent();
    }

    private saveMapPositionIfDifferent = () => {
        this.props.saveMapPosition({
            coordinates:  this.getMapCenter(), 
            zoom: this.olMap.getView().getZoom()
        });
    }

    private drawMarkers(markers: IMarker[]) {
        const features = markers.map(this.buildMarker, this);
        this.drawFeatures(features);
    }

    private drawFeatures(features: ol.Feature[]) {
        this.markerSource.clear();
        try {
            this.markerSource.addFeatures(features);
        } catch(err) {
            console.log(err);
        }
        this.props.onRenderMarkersEnd();
    }

    private buildMarker(marker: IMarker) {
        const point = new ol.geom.Point(ol.proj.transform([marker.position.lng, marker.position.lat], 'EPSG:4326', 'EPSG:3857'));
        const feature = new ol.Feature(point);
        feature.setStyle([
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [marker.icon.anchor.x, marker.icon.anchor.y],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: marker.opacity || 1,
                    scale: (marker.icon.scaledSize.height / marker.icon.size.height),
                    size: [marker.icon.size.width, marker.icon.size.height],
                    src: marker.icon.url,
                }),
            }),
        ]);
        feature.setId(marker.markerId);
        feature.setProperties({ [MARKER_KEY]: marker }, true);
        return feature;
    }

    private handleSelect(event: ol.events.Event) {
        const item = (event.target as any).getFeatures().item(0);
        const features: ol.Feature[] = item.getProperties().features;
        if (features.length === 1) {
            item.setStyle(features[0].getStyle());
            this.props.onMarkerClicked(features[0].getProperties()[MARKER_KEY]);
        } else if(this.isMaxZoom()) {
            const markers = features.map(this.markerFromFeature);
            //the highlightedEntityId here doesn't matter, this is just to wrap the markers to call the onMarkerClicked
            const highlightedEntityId = this.props.highlightedEntity && this.props.highlightedEntity.id;
            this.props.onMarkerClicked(markerGroupToSingleMarker(markers, highlightedEntityId));
        } else if (features.length > 1) {
            this.fitFeatures(features);
        }

        // select layer adds extra select marker on top of other markers on the select event
        // this select marker does not have events connected to it (cannot be clicked)
        // this line removes this unnecessary extra marker
        this.olMap.getInteractions().forEach(interaction => {
            if (interaction instanceof ol.interaction.Select) {
                interaction.getFeatures().clear();
            }
        });
    }

    private fitFeatures = (features: ol.Feature[]) => {
        if(features.length <= 0) return;
        const extentFromFeatures = ol.extent.boundingExtent(
            features.map(f => (f.getGeometry() as ol.geom.Point).getCoordinates()),
        );
        this.zoomToExtent(extentFromFeatures);
    }

    private zoomToExtent(extent: ol.Extent) {
        this.mapView.fit(extent, {
            constrainResolution: false,
            padding: [45, 20, 0, 20],
        });
        if (this.mapView.getResolution() < this.mapView.getMinResolution()) {
            this.mapView.setResolution(this.mapView.getMinResolution());
        }
    }

    private get mapView() {
        return this.olMap.getView();
    }
}

/*
export function formatDistance(length: number) {
    if (length >= 1000) {
        return (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        return  Math.round(length) + ' ' + 'm';
    }    
}
*/

export function round2Decimals(km: number) {
    return Math.round(km * 100) / 100;
}

export function distanceBetweenPointsKM(latlng1: [number, number], latlng2: [number, number]) {
    return round2Decimals(distanceBetweenPoints(latlng1, latlng2) / 1000);
}

export function kmToMiles(km: number) {
    return km / 1.609344;
}

export function distanceBetweenPoints(latlng1: [number, number], latlng2: [number, number]){
    var line = new ol.geom.LineString([latlng1, latlng2]);
    return Math.round(line.getLength() * 100) / 100;
};