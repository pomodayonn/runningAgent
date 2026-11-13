import type {Phase,Workout} from '../../types/training';
const p=(kind:Phase['kind'],seconds:number,label:string):Phase=>({kind,seconds,label});
const alternating=(jog:number,walk:number,repeats:number):Phase[]=>Array.from({length:repeats},()=>[p('jog',jog*60,'ジョギング'),p('walk',walk*60,'ウォーキング')]).flat();
export function getWorkout(week:number):Workout{
 const middle:Phase[]=week===1?alternating(2,2,5):week===2?alternating(3,2,5):week===3?alternating(5,2,4):week===4?alternating(8,2,3):week===5?[p('jog',900,'ジョギング'),p('walk',180,'ウォーキング'),p('jog',600,'ジョギング')]:[p('jog',({6:20,7:25,8:30} as Record<number,number>)[week]*60,'ジョギング')];
 if(!Number.isInteger(week)||week<1||week>8)throw new Error('Invalid week');
 return {week,title:`Week ${week}`,phases:[p('warmup',300,'ウォームアップ'),...middle,p('cooldown',300,'クールダウン')]};
}
export const totalSeconds=(w:Workout)=>w.phases.reduce((sum,phase)=>sum+phase.seconds,0);
