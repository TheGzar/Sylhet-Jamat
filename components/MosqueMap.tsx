'use client';
import {useSiteText} from './SiteText';
import {hasCoordinates} from '@/lib/directory';
import {useEffect,useRef,useState} from 'react';
import type {Map as LeafletMap,LayerGroup} from 'leaflet';
export type {DirectoryMosque as Mosque} from '@/lib/directory';
import type {DirectoryMosque as Mosque} from '@/lib/directory';
export default function MosqueMap({mosques,selected,onSelect,bn}:{mosques:Mosque[];selected:Mosque|null;onSelect:(m:Mosque)=>void;bn:boolean}){
 const t=useSiteText(bn);
 const root=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),layer=useRef<LayerGroup|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const cb=useRef(onSelect);cb.current=onSelect;
 useEffect(()=>{let gone=false;import('leaflet').then(L=>{if(gone||!root.current)return;const m=L.map(root.current,{scrollWheelZoom:false}).setView([24.8908096,91.8698364],14);map.current=m;L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).on('tileerror',()=>setFailed(true)).addTo(m);layer.current=L.layerGroup().addTo(m);setReady(true);}).catch(()=>setFailed(true));return()=>{gone=true;map.current?.remove();map.current=null;};},[]);
 useEffect(()=>{if(!ready||!layer.current)return;import('leaflet').then(L=>{const group=layer.current;if(!group)return;group.clearLayers();mosques.filter(hasCoordinates).forEach(m=>{const name=bn&&m.name_bn?m.name_bn:m.name;const el=document.createElement('span');el.textContent=name;L.marker([m.lat,m.lon],{title:name,alt:name,icon:L.divIcon({className:'mosque-marker'+(selected?.id===m.id?' selected':''),html:'<span></span>',iconSize:[28,28],iconAnchor:[14,14]})}).bindTooltip(el,{direction:'top'}).on('click',()=>cb.current(m)).addTo(group);});});},[mosques,ready,selected?.id,bn]);
 useEffect(()=>{if(!selected&&ready&&mosques.filter(hasCoordinates).length&&map.current){import('leaflet').then(L=>{map.current?.fitBounds(L.latLngBounds(mosques.filter(hasCoordinates).map(m=>[m.lat,m.lon] as [number,number])),{padding:[35,35],maxZoom:15,animate:false});});}},[mosques,ready,selected]);
 useEffect(()=>{if(selected&&hasCoordinates(selected)&&map.current)map.current.setView([selected.lat,selected.lon],15,{animate:false});},[selected,ready]);
 return <div className="map-wrap"><div ref={root} className="map" aria-label={t('সিলেটের মসজিদের মানচিত্র','Map of mosques in Sylhet')}/>{failed&&<div className="map-warning">{t('মানচিত্রের কিছু অংশ আসেনি। তালিকা থেকে মসজিদ বেছে নিন।','Some map tiles could not load. You can still use the mosque list.')}</div>}<div className="map-caption">{t('মসজিদ বেছে নিতে চিহ্নে চাপুন','Select a marker to view a mosque')}</div></div>;
}
