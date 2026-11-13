import {useCallback,useEffect,useRef,useState} from 'react';
import maplibregl,{type Map as MapLibreMap,type Marker,type StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair,MapPin,Save,Trash2,Route,Satellite,Map as MapIcon} from 'lucide-react';
import {db} from '../db/database';
import {isValidCoordinates,type Coordinates} from '../types/map';
import type {SavedRoute} from '../types/route';
import {candidateWaypoints,formatDistance,estimateMinutes} from '../features/route/geometry';

type Layer='street'|'satellite';
// Development-only public tile services. Check usage rights and choose a contracted provider before production.
function styleFor(layer:Layer):StyleSpecification{
 const satellite=layer==='satellite';
 return {version:8,sources:{basemap:{type:'raster',tiles:satellite?
 ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']:
 ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:satellite?'Tiles © Esri and its imagery providers':'© OpenStreetMap contributors'}},layers:[{id:'basemap',type:'raster',source:'basemap'}]};
}
const INITIAL:Coordinates={latitude:35.6812,longitude:139.7671};
const ROUTE_SOURCE='runrebuild-route';
function paintRoute(instance:MapLibreMap,geometry:[number,number][]|null){
 if(!instance.isStyleLoaded())return;
 if(instance.getLayer('runrebuild-route-line'))instance.removeLayer('runrebuild-route-line');
 if(instance.getSource(ROUTE_SOURCE))instance.removeSource(ROUTE_SOURCE);
 if(!geometry||geometry.length<2)return;
 instance.addSource(ROUTE_SOURCE,{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:geometry}}});
 instance.addLayer({id:'runrebuild-route-line',type:'line',source:ROUTE_SOURCE,paint:{'line-color':'#12e9bb','line-width':5,'line-opacity':0.95},layout:{'line-cap':'round','line-join':'round'}});
}
function routeUrl(points:Coordinates[]){return `https://router.project-osrm.org/route/v1/foot/${points.map(p=>`${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';')}?overview=full&geometries=geojson&steps=false`}
export default function MapPage(){
 const container=useRef<HTMLDivElement|null>(null),map=useRef<MapLibreMap|null>(null),marker=useRef<Marker|null>(null);
 const geometryRef=useRef<[number,number][]|null>(null),requestRef=useRef<AbortController|null>(null),requestId=useRef(0);
 const [layer,setLayer]=useState<Layer>('street'),[point,setPoint]=useState<Coordinates|null>(null),[saved,setSaved]=useState(false);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[routing,setRouting]=useState(false);
 const [targetKm,setTargetKm]=useState(3),[pace,setPace]=useState(7),[route,setRoute]=useState<SavedRoute|null>(null),[routeSaved,setRouteSaved]=useState(false);
 const [message,setMessage]=useState('地図をクリックして出発地点を指定できます。');
 const cancelRoute=useCallback(()=>{requestId.current++;requestRef.current?.abort();requestRef.current=null;setRouting(false)},[]);
 const update=useCallback((p:Coordinates,move=true)=>{
  if(!isValidCoordinates(p))return;
  cancelRoute();setRoute(null);setRouteSaved(false);geometryRef.current=null;
  if(map.current)paintRoute(map.current,null);
  setPoint(p);setSaved(false);
  if(!map.current)return;
  marker.current?.remove();marker.current=new maplibregl.Marker({color:'#31d0b1'}).setLngLat([p.longitude,p.latitude]).addTo(map.current);
  if(move)map.current.flyTo({center:[p.longitude,p.latitude],zoom:Math.max(map.current.getZoom(),14)});
 },[cancelRoute]);
 useEffect(()=>{
  if(!container.current)return;
  const instance=new maplibregl.Map({container:container.current,style:styleFor('street'),center:[INITIAL.longitude,INITIAL.latitude],zoom:12});
  map.current=instance;instance.addControl(new maplibregl.NavigationControl(),'top-right');
  instance.on('click',e=>{update({latitude:e.lngLat.lat,longitude:e.lngLat.lng},false);setMessage('出発地点を選択しました。')});
  instance.on('load',()=>setReady(true));
  instance.on('style.load',()=>paintRoute(instance,geometryRef.current));
  instance.on('error',()=>setMessage('地図の読み込みで問題が発生しました。接続やタイル配信元を確認してください。'));
  let active=true;
  void Promise.all([db.startPoints.get('default'),db.routes.get('latest')]).then(([p,r])=>{
   if(!active)return;
   if(p){update(p);setSaved(true)}
   if(r&&(!p||(Math.abs(p.latitude-r.start.latitude)<1e-6&&Math.abs(p.longitude-r.start.longitude)<1e-6))){
    geometryRef.current=r.geometry;setRoute(r);setRouteSaved(true);setTargetKm(r.targetKm);paintRoute(instance,r.geometry);
   }
  }).catch(()=>{if(active)setMessage('保存データの読み込みに失敗しました。')});
  return()=>{active=false;cancelRoute();marker.current?.remove();marker.current=null;instance.remove();map.current=null};
 },[update,cancelRoute]);
 function switchLayer(next:Layer){setLayer(next);map.current?.setStyle(styleFor(next));}
 function locate(){
  if(!navigator.geolocation){setMessage('このブラウザは位置情報に対応していません。');return}
  if(!window.isSecureContext){setMessage('位置情報にはHTTPSまたはlocalhostが必要です。');return}
  setBusy(true);setMessage('現在地を取得しています…');
  navigator.geolocation.getCurrentPosition(position=>{setBusy(false);update({latitude:position.coords.latitude,longitude:position.coords.longitude});setMessage('現在地を出発地点に設定しました。')},err=>{setBusy(false);setMessage(err.code===1?'位置情報の許可がありません。':'現在地を取得できませんでした。')},{enableHighAccuracy:false,timeout:12000,maximumAge:60000});
 }
 async function save(){if(!point)return;try{await db.startPoints.put({id:'default',...point,updatedAt:new Date().toISOString()});setSaved(true);setMessage('出発地点を保存しました。')}catch{setMessage('保存に失敗しました。')}}
 async function clear(){cancelRoute();try{await db.startPoints.delete('default');await db.routes.delete('latest');marker.current?.remove();marker.current=null;setPoint(null);setSaved(false);setRoute(null);setRouteSaved(false);geometryRef.current=null;if(map.current)paintRoute(map.current,null);setMessage('地点と保存済みルートを削除しました。')}catch{setMessage('削除に失敗しました。')}}
 async function propose(){
  if(!point||routing)return;
  cancelRoute();const id=requestId.current;const controller=new AbortController();requestRef.current=controller;
  setRouting(true);setMessage('道路に沿ったルート候補を計算しています…');
  try{
   // Three directions. The OSRM demo server is used for prototyping only.
   const results=await Promise.allSettled([0,120,240].map(async rotation=>{
    const via=candidateWaypoints(point,targetKm*1000,rotation);
    const response=await fetch(routeUrl([point,...via,point]),{signal:controller.signal});
    if(!response.ok)throw new Error('routing service unavailable');
    const data:unknown=await response.json();
    if(!data||typeof data!=='object'||!('routes' in data))throw new Error('invalid response');
    const routes=(data as {routes?:unknown}).routes;
    if(!Array.isArray(routes)||!routes.length)throw new Error('no route');
    const best=routes[0] as {distance?:number;duration?:number;geometry?:{coordinates?:[number,number][]}};
    if(!Number.isFinite(best.distance)||!Array.isArray(best.geometry?.coordinates)||best.geometry.coordinates.length<2)throw new Error('invalid geometry');
    return {distance:best.distance as number,duration:best.duration??0,geometry:best.geometry.coordinates};
   }));
   if(requestId.current!==id)return;
   const candidates=results.filter((r):r is PromiseFulfilledResult<{distance:number;duration:number;geometry:[number,number][]}>=>r.status==='fulfilled').map(r=>r.value);
   if(!candidates.length)throw new Error('候補が見つかりませんでした。出発地点や距離を変えて再試行してください。');
   candidates.sort((a,b)=>Math.abs(a.distance-targetKm*1000)-Math.abs(b.distance-targetKm*1000));
   const best=candidates[0];const next:SavedRoute={id:'latest',updatedAt:new Date().toISOString(),start:point,geometry:best.geometry,distanceMeters:best.distance,durationSeconds:best.duration,targetKm};
   geometryRef.current=best.geometry;setRoute(next);setRouteSaved(false);if(map.current){paintRoute(map.current,best.geometry);const bounds=new maplibregl.LngLatBounds();best.geometry.forEach(([lon,lat])=>bounds.extend([lon,lat]));map.current.fitBounds(bounds,{padding:45,maxZoom:16});}
   setMessage(`候補${candidates.length}件から、希望距離に最も近いルートを表示しました。`);
  }catch(e){if(requestId.current===id)setMessage(e instanceof Error?e.message:'ルートを生成できませんでした。')}finally{if(requestId.current===id){setRouting(false);requestRef.current=null}}
 }
 async function saveRoute(){if(!route)return;try{await db.routes.put(route);setRouteSaved(true);setMessage('ルートをこのブラウザに保存しました。')}catch{setMessage('ルートの保存に失敗しました。')}}
 return <><div className="eyebrow">RUNNING ROUTE PLANNER</div><h1>走る道を見つけよう。</h1><p className="muted">通常地図・航空衛星画像を切り替え、出発地点から周回ルートを提案します。</p>
  <div className="map-layer-switch"><button className={layer==='street'?'selected':''} onClick={()=>switchLayer('street')}><MapIcon size={16}/>通常地図</button><button className={layer==='satellite'?'selected':''} onClick={()=>switchLayer('satellite')}><Satellite size={16}/>航空・衛星画像</button></div>
  <div className="map-frame"><div ref={container} className="map-canvas" aria-label="出発地点とランニングルートの地図"/>{!ready&&<div className="map-loading">地図を読み込み中…</div>}</div>
  <section className="panel map-panel"><div className="map-actions"><button className="secondary" disabled={busy} onClick={locate}><Crosshair size={17}/>{busy?'取得中…':'現在地を取得'}</button><button className="primary" disabled={!point} onClick={()=>void save()}><Save size={17}/>地点を保存</button></div>
   {point&&<div className="map-coordinates"><MapPin size={17}/><span>緯度 {point.latitude.toFixed(6)}<br/>経度 {point.longitude.toFixed(6)}</span>{saved&&<span className="map-saved">保存済み</span>}</div>}
   <h2 className="route-heading">周回ルート提案</h2><div className="route-options"><label>希望距離<select value={targetKm} onChange={e=>setTargetKm(Number(e.target.value))}>{[2,3,5,8,10].map(n=><option key={n} value={n}>{n} km</option>)}</select></label><label>想定ペース<select value={pace} onChange={e=>setPace(Number(e.target.value))}>{[5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} 分/km</option>)}</select></label></div>
   <button className="primary" disabled={!point||routing} onClick={()=>void propose()}><Route size={18}/>{routing?'候補を計算中…':'周回ルートを提案'}</button>
   {route&&<div className="route-result"><strong>道路に沿った推定距離：{formatDistance(route.distanceMeters)}</strong><span>想定所要時間：約{estimateMinutes(route.distanceMeters,pace)}分（設定ペースで計算）</span><span>希望距離：{route.targetKm} km　{routeSaved?'保存済み':'未保存'}</span><button className="secondary" disabled={routeSaved} onClick={()=>void saveRoute()}><Save size={16}/>ルートを保存</button></div>}
   <p className="map-message" role="status">{message}</p>
   {point&&<button className="linkbtn" onClick={()=>void clear()}><Trash2 size={15}/> 地点とルートをクリア</button>}
  </section><p className="muted small">※ ルートはOSRM公開デモサービスの道路データを利用した試作です。歩道・横断可能箇所・私有地・交通規制・坂道の安全性は保証しません。OSRMの所要時間は表示せず、指定ペースから概算します。航空衛星画像はEsri配信で、撮影時点は場所により異なります。いずれも本番利用前に提供元の利用条件と配信契約を確認してください。</p></>;
}
