import type {Coordinates} from '../../types/map';
export type RouteCandidate={geometry:[number,number][];distanceMeters:number;durationSeconds:number;name:string};
export function offsetPoint(origin:Coordinates,bearingDegrees:number,distanceMeters:number):Coordinates{
 const angle=bearingDegrees*Math.PI/180;
 const lat=origin.latitude+(distanceMeters*Math.cos(angle))/111320;
 const scale=Math.max(0.1,Math.cos(origin.latitude*Math.PI/180));
 const lon=origin.longitude+(distanceMeters*Math.sin(angle))/(111320*scale);
 return {latitude:Math.max(-85,Math.min(85,lat)),longitude:((lon+540)%360)-180};
}
export function candidateWaypoints(origin:Coordinates,targetMeters:number,rotationDegrees:number):Coordinates[]{
 // Three corners: OSRM will snap these points to routable streets.
 const radius=targetMeters/3.7;
 return [offsetPoint(origin,rotationDegrees,radius),offsetPoint(origin,rotationDegrees+115,radius)];
}
export function formatDistance(meters:number){return `${(meters/1000).toFixed(2)} km`}
export function estimateMinutes(meters:number,paceMinutesPerKm:number){return Math.max(1,Math.round(meters/1000*paceMinutesPerKm))}
