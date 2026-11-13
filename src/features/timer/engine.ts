import type {Phase} from '../../types/training';
export type Snapshot={elapsed:number;total:number;phaseIndex:number;phaseRemaining:number;finished:boolean};
export function snapshot(phases:Phase[],elapsedSeconds:number):Snapshot{
 const total=phases.reduce((a,b)=>a+b.seconds,0);
 const elapsed=Math.max(0,Math.min(total,Math.floor(elapsedSeconds)));
 let cursor=0;
 for(let i=0;i<phases.length;i++){
  const end=cursor+phases[i].seconds;
  if(elapsed<end)return {elapsed,total,phaseIndex:i,phaseRemaining:end-elapsed,finished:false};
  cursor=end;
 }
 return {elapsed,total,phaseIndex:Math.max(0,phases.length-1),phaseRemaining:0,finished:true};
}
export const clock=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
