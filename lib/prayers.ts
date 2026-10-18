export const prayers = ['fajr','dhuhr','asr','maghrib','isha','jummah'] as const;
export type Prayer = typeof prayers[number];
export type Times = Partial<Record<Prayer,string[]>>;
export type Report = {id:string;mosqueId:string;times:Times;observed:string;validUntil:string;created:string;source:string;note:string;status:string;photo:boolean;authorName?:string;proofNote?:string;mine?:boolean; confirmations?:Record<string,number>;confirmed?:string[];flags?:number};
export function dhakaDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function dateValid(v:unknown):v is string {return typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v}
export function days(a:string,b:string){return Math.floor((Date.parse(a)-Date.parse(b))/86400000)}
export function validateReport(v:any, today=dhakaDate()){
 if(!v || typeof v!=='object') throw Error('Invalid report.');
 if(!dateValid(v.observed)||v.observed>today||days(today,v.observed)>31)throw Error('Choose a date you checked within the last 31 days.');
 if(!dateValid(v.validUntil)||v.validUntil<v.observed||days(v.validUntil,v.observed)>31)throw Error('The end date must be within 31 days of the checked date.');
 if(!['noticeboard','attended','committee'].includes(v.source))throw Error('Choose how you checked the time.');
 const times:Times={};let count=0;
 for(const p of prayers){const a=v.times?.[p];if(a?.length){if(!Array.isArray(a)||a.length>(p==='jummah'?3:1)||a.some((t:unknown)=>typeof t!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))throw Error('Use valid 24-hour times.'); times[p]=Array.from(new Set(a as string[])).sort();count+=a.length;}}
 if(!count)throw Error('Add at least one jamaat time.');
 if(typeof v.note!=='string'||v.note.length>400)throw Error('Keep the note within 400 characters.');
 return {times,observed:v.observed,validUntil:v.validUntil,source:v.source,note:v.note.trim()};
}
export function currentReport(reports:Report[],mosqueId:string,p:Prayer,today=dhakaDate()){
 const available=reports.filter(r=>r.mosqueId===mosqueId&&r.status==='approved'&&r.times[p]?.length&&r.observed<=today).sort((a,b)=>b.observed.localeCompare(a.observed)||b.created.localeCompare(a.created));
 const r=available[0];if(!r)return {report:null,state:'missing',conflict:false};
 const conflict=available.some(x=>x.observed===r.observed&&JSON.stringify(x.times[p])!==JSON.stringify(r.times[p]));
 return {report:r,state:conflict?'conflict':r.flags?'flagged':r.validUntil<today?'expired':days(today,r.observed)>(['fajr','maghrib'].includes(p)?3:7)?'old':'recent',conflict};
}
export function canConfirm(r:Report,p:Prayer,userIsAuthor:boolean,now=new Date(),at?:string){
 const today=dhakaDate(now);const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 return !userIsAuthor&&r.status==='approved'&&r.observed<=today&&r.validUntil>=today&&!!r.times[p]?.some(t=>t<=time&&(!at||t===at))&&(p!=='jummah'||new Date(today+'T12:00:00Z').getUTCDay()===5);
}
export function distanceKm(a:number,b:number,c:number,d:number){const rad=Math.PI/180;const x=Math.sin((c-a)*rad/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export function cleanJpeg(bytes:Uint8Array){
 if(bytes[0]!==255||bytes[1]!==216)throw Error('Use a JPG timetable photo.');
 if(bytes.length<20||bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)throw Error('The photo is incomplete.');
 const pieces:Uint8Array[]=[bytes.slice(0,2)];let i=2,frame=false,scan=false;
 while(i<bytes.length){if(bytes[i]!==255)throw Error('The photo is not a valid JPG.');const marker=bytes[i+1];if(marker===0xda){scan=true;pieces.push(bytes.slice(i));i=bytes.length;break;}if(marker===0xd9){pieces.push(bytes.slice(i,i+2));break;}const len=(bytes[i+2]<<8)+bytes[i+3];if(len<2||i+2+len>bytes.length)throw Error('The photo is incomplete.');if([0xc0,0xc1,0xc2].includes(marker)){const height=(bytes[i+5]<<8)+bytes[i+6],width=(bytes[i+7]<<8)+bytes[i+8];if(!height||!width||height>4096||width>4096)throw Error('Photo dimensions are too large.');frame=true;}if(!(marker>=0xe1&&marker<=0xef)&&marker!==0xfe)pieces.push(bytes.slice(i,i+len+2));i+=len+2;}
 if(!frame||!scan)throw Error('The photo is not a valid JPG.');const out=new Uint8Array(pieces.reduce((n,p)=>n+p.length,0));let pos=0;for(const p of pieces){out.set(p,pos);pos+=p.length;}return out;
}
