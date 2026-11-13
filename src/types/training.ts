export type Phase = {kind:'warmup'|'jog'|'walk'|'cooldown';seconds:number;label:string};
export type Workout = {week:number;title:string;phases:Phase[]};
export type Session = {id:string;date:string;week:number;plannedSeconds:number;completedSeconds:number;status:'completed'|'stopped';effort:number;legSoreness:number;notes:string};
