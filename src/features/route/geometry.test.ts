import {describe,it,expect} from 'vitest';
import {offsetPoint,candidateWaypoints,formatDistance,estimateMinutes} from './geometry';
const tokyo={latitude:35.68,longitude:139.76};
describe('route geometry helpers',()=>{
 it('offset north increases latitude',()=>expect(offsetPoint(tokyo,0,1000).latitude).toBeGreaterThan(tokyo.latitude));
 it('offset east increases longitude',()=>expect(offsetPoint(tokyo,90,1000).longitude).toBeGreaterThan(tokyo.longitude));
 it('creates two distinct via points',()=>{const p=candidateWaypoints(tokyo,3000,45);expect(p).toHaveLength(2);expect(p[0]).not.toEqual(p[1]);});
 it('formats distance',()=>expect(formatDistance(2540)).toBe('2.54 km'));
 it('estimates running time',()=>expect(estimateMinutes(3000,7)).toBe(21));
});
