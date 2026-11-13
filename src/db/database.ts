import Dexie,{type Table} from 'dexie';
import type {Session} from '../types/training';import type {Profile,StrengthSession} from '../types/strength';
class RunRebuildDB extends Dexie {
 sessions!:Table<Session,string>;profiles!:Table<Profile,string>;strengthSessions!:Table<StrengthSession,string>;
 constructor(){super('RunRebuild');this.version(1).stores({sessions:'id,date,week,status'});this.version(2).stores({sessions:'id,date,week,status',profiles:'id',strengthSessions:'id,date'});}
}
export const db=new RunRebuildDB();