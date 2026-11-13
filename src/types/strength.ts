export type Profile={id:'local';sexForTraining:'female'|'male'|'unspecified';goal:'endurance'|'body_composition'|'strength'|'health';experience:'beginner'|'returning'|'active';equipment:'none'|'home'|'gym'};
export type StrengthSession={id:string;date:string;exerciseIds:string[];completedSets:Record<string,number>;fatigue:number;soreness:number;notes:string};
export const defaultProfile:Profile={id:'local',sexForTraining:'female',goal:'endurance',experience:'returning',equipment:'none'};
