'use client';
import {useEffect,useRef,useState} from 'react';
import type {Map,Marker} from 'leaflet';
export default function PinEditor({lat,lon,onChange}:{lat:number|null;lon:number|null;onChange:(lat:number,lon:number)=>void}){
 const root=useRef<HTMLDivElement>(null),map=useRef<Map|null>(null),marker=useRef<Marker|null>(null),cb=useRef(onChange),[error,setError]=useState(false);cb.current=onChange;
 useEffect(()=>{let cancelled=false;import('leaflet').then(L=>{if(cancelled||!root.current)return;const m=L.map(root.current).setView([lat??24.8908,lon??91.8698],16);map.current=m;L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).on('tileerror',()=>setError(true)).addTo(m);m.on('click',e=>cb.current(+e.latlng.lat.toFixed(7),+e.latlng.lng.toFixed(7)));setReady(true);}).catch(()=>setError(true));return()=>{cancelled=true;map.current?.remove();map.current=null;marker.current=null}},[]);
 const [ready,setReady]=useState(false);
 useEffect(()=>{let cancelled=false;if(!ready||!map.current)return;if(lat===null||lon===null){marker.current?.remove();marker.current=null;return}import('leaflet').then(L=>{if(cancelled||!map.current)return;if(marker.current)marker.current.setLatLng([lat,lon]);else{const pin=L.marker([lat,lon],{draggable:true,icon:L.divIcon({className:'mosque-marker selected',html:'<span></span>',iconSize:[28,28]})}).addTo(map.current);marker.current=pin;pin.on('dragend',()=>{const p=pin.getLatLng();cb.current(+p.lat.toFixed(7),+p.lng.toFixed(7))})}map.current.panTo([lat,lon],{animate:false})});return()=>{cancelled=true}},[lat,lon,ready]);
 return <><div className="pin-editor" ref={root} aria-label="Edit mosque location"/>{error&&<p className="muted">মানচিত্র আসেনি। নিচে অক্ষাংশ ও দ্রাঘিমাংশ লিখতে পারেন। / Map unavailable. Use the coordinate fields below.</p>}</>;
}
