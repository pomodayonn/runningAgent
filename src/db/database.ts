import Dexie,{type Table} from 'dexie';
import type {Session} from '../types/training';import type {Profile,StrengthSession} from '../types/strength';
import type {SavedStartPoint} from '../types/map';
import type {SavedRoute} from '../types/route';
class RunRebuildDB extends Dexie {
 sessions!:Table<Session,string>;profiles!:Table<Profile,string>;strengthSessions!:Table<StrengthSession,string>;startPoints!:Table<SavedStartPoint,string>;routes!:Table<SavedRoute,string>;
 constructor(){super('RunRebuild');this.version(1).stores({sessions:'id,date,week,status'});this.version(2).stores({sessions:'id,date,week,status',profiles:'id',strengthSessions:'id,date'});this.version(3).stores({sessions:'id,date,week,status',profiles:'id',strengthSessions:'id,date',startPoints:'id'});this.version(4).stores({sessions:'id,date,week,status',profiles:'id',strengthSessions:'id,date',startPoints:'id',routes:'id'});}
}
export const db=new RunRebuildDB();
