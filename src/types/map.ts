export type Coordinates={latitude:number;longitude:number};
export type SavedStartPoint=Coordinates&{id:'default';updatedAt:string};
export function isValidCoordinates(point:Coordinates){return Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&Math.abs(point.latitude)<=90&&Math.abs(point.longitude)<=180;}
