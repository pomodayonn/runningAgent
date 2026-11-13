import Dexie,{type Table} from 'dexie';
import type {Session} from '../types/training';
class RunRebuildDB extends Dexie {sessions!:Table<Session,string>;constructor(){super('RunRebuild');this.version(1).stores({sessions:'id,date,week,status'});}}
export const db=new RunRebuildDB();
