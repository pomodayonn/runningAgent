import {describe,it,expect} from 'vitest';
import {snapshot,clock} from './engine';
import {getWorkout,totalSeconds} from '../training/plan';
describe('training plan',()=>{
 it('week 1 has 30 minutes',()=>expect(totalSeconds(getWorkout(1))).toBe(1800));
 it('all weeks have positive durations',()=>{for(let w=1;w<=8;w++)expect(getWorkout(w).phases.every(p=>p.seconds>0)).toBe(true)});
 it('invalid week fails',()=>expect(()=>getWorkout(9)).toThrow());
});
describe('timer',()=>{
 const phases=getWorkout(1).phases;
 it('starts with warmup',()=>expect(snapshot(phases,0).phaseRemaining).toBe(300));
 it('transitions at 5 minutes',()=>expect(snapshot(phases,300).phaseIndex).toBe(1));
 it('clamps completion',()=>expect(snapshot(phases,99999).finished).toBe(true));
 it('formats time',()=>expect(clock(125)).toBe('02:05'));
});
