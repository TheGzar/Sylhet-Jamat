'use client';
import {useEffect,useRef,useState} from 'react';
import type {Map,Marker} from 'leaflet';
export default function PinEditor({lat,lon,onChange}:{lat:number;lon:number;onChange:(lat:number,lon:number)=>void}){
 const root=useRef<HTMLDivElement>(null),map=useRef<Map|null>(null),marker=useRef<Marker|null>(null),cb=useRef(onChange),[error,setError]=useState(false);cb.current=onChange;
 useEffect(()=>{let cancelled=false;import('leaflet').then(L=>{if(cancelled||!root.current)return;const m=L.map(root.current).setView([lat,lon],16);map.current=m;L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).on('tileerror',()=>setError(true)).addTo(m);const pin=L.marker([lat,lon],{draggable:true,icon:L.divIcon({className:'mosque-marker selected',html:'<span></span>',iconSize:[28,28]})}).addTo(m);marker.current=pin;pin.on('dragend',()=>{const p=pin.getLatLng();cb.current(+p.lat.toFixed(7),+p.lng.toFixed(7));});m.on('click',e=>{pin.setLatLng(e.latlng);cb.current(+e.latlng.lat.toFixed(7),+e.latlng.lng.toFixed(7));});}).catch(()=>setError(true));return()=>{cancelled=true;map.current?.remove();map.current=null}},[]);
 useEffect(()=>{if(Number.isFinite(lat)&&Number.isFinite(lon)){marker.current?.setLatLng([lat,lon]);map.current?.panTo([lat,lon],{animate:false});}},[lat,lon]);
 return <><div className="pin-editor" ref={root} aria-label="Edit mosque location"/>{error&&<p className="muted">মানচিত্র আসেনি। নিচে অক্ষাংশ ও দ্রাঘিমাংশ লিখতে পারেন। / Map unavailable. Use the coordinate fields below.</p>}</>;
}
