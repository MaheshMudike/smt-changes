export interface ILatLng {
    lat: number;
    lng: number;
}

export interface MapPosition {
    coordinates: ILatLng, zoom: number
}

export function formatLonLat(lonlat: ILatLng) {
    return lonlat == null ? null : convertDMS(lonlat.lat, lonlat.lng);
}

/**
 * Convert longitude/latitude decimal degrees to degrees and minutes
 * DDD to DMS, no seconds
 * @param lat, latitude degrees decimal
 * @param lng, longitude degrees decimal
 */
function toDegreesMinutesAndSeconds(coordinate: number) {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = (minutesNotTruncated - minutes) * 60;

    return degrees + "°" + minutes + "'" + seconds.toFixed(2)+"\"";
}

function sign(x: any) {
    return ((x > 0) as any - (x < 0 as any) as any) || +x;
}

function convertDMS(lat: number, lng: number) {
    //return lat + ' ' + lng;
    
    var latitude = toDegreesMinutesAndSeconds(lat);
    
    var latitudeCardinal = sign(lat) >= 0 ? "N" : "S";

    var longitude = toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = sign(lng) >= 0 ? "E" : "W";

    return latitude + latitudeCardinal + "\n" + longitude + " " + longitudeCardinal;
    
}

export function validCoordinates(coordinates: ILatLng) {
    return coordinates != null && coordinates.lat != null && coordinates.lng != null;
}
