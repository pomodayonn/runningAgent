export type Exercise = {id:string;name:string;area:string;reps:number;sets:number;restSeconds:number;description:string};
export const exercises:Exercise[]=[
{id:'wall-pushup',name:'壁腕立て伏せ',area:'上半身',reps:10,sets:1,restSeconds:45,description:'壁に手をつき、身体を一直線に保ってゆっくり曲げ伸ばし'},
{id:'dead-bug',name:'デッドバグ',area:'体幹',reps:12,sets:1,restSeconds:45,description:'左右各6回。腰を反らしすぎない'},
{id:'glute-bridge',name:'ヒップリフト',area:'お尻',reps:10,sets:1,restSeconds:45,description:'足裏を床につけ、腰を反らさずお尻を持ち上げる'},
{id:'bird-dog',name:'バードドッグ',area:'体幹',reps:12,sets:1,restSeconds:45,description:'左右各6回。四つ這いで対角の手足をゆっくり伸ばす'},
{id:'chair-squat',name:'椅子からの立ち座り',area:'脚',reps:8,sets:1,restSeconds:60,description:'安定した椅子を使い、痛みのない範囲で立ち座り'},
{id:'side-plank',name:'膝つきサイドプランク',area:'体幹',reps:20,sets:1,restSeconds:45,description:'左右各10秒。肩に痛みがある場合は行わない'},
];
export type Readiness={fatigue:number;soreness:number;pain:boolean};
export function strengthPlan(readiness:Readiness):{status:'rest'|'light'|'normal';items:Exercise[];reason:string}{
 if(readiness.pain)return {status:'rest',items:[],reason:'痛みがあるため筋トレは提案しません。痛みが続く場合は医療専門職に相談してください。'};
 if(readiness.fatigue>=4||readiness.soreness>=4)return {status:'rest',items:[],reason:'疲労や脚の張りが強いため、今日は休養を優先しましょう。'};
 if(readiness.fatigue===3||readiness.soreness===3)return {status:'light',items:exercises.slice(0,3),reason:'疲労を考慮し、上半身・体幹中心の短縮メニューです。'};
 return {status:'normal',items:exercises.slice(0,4),reason:'運動再開期向けの軽い全身メニューです。余裕を残して終了しましょう。'};
}
