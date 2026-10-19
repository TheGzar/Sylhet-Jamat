import {identity,authRoute} from '@/lib/auth';
import {env} from 'cloudflare:workers';
import seed from '@/data/mosques.json';
import defaults from '@/data/site-defaults.json';
import {safeUrl,validateSettings} from '@/lib/directory';
import {canConfirm,cleanJpeg,dhakaDate,prayers,validateReport} from '@/lib/prayers';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

function db(){if(!env.DB)throw Error('Database unavailable. Please try again later.');return env.DB;}
async function settings(){const r:any=await db().prepare("SELECT value FROM settings WHERE key='site'").first();if(!r)return defaults;const saved=JSON.parse(r.value);const categories=saved.categories||defaults.categories;return {...defaults,...saved,categories};}
async function allMosques(){const rows=await db().prepare('SELECT * FROM mosques').all();const map=new Map<string,any>(seed.map(m=>[m.id,{...m,category_id:(m as any).category_id||'unassigned',sort_order:100,hidden:false}]));for(const r of rows.results as any[]){map.set(r.id,{category_id:'unassigned',sort_order:100,hidden:false,...(map.get(r.id)||{}),id:r.id,name:r.name,name_bn:r.name_bn,lat:r.lat===''?null:Number(r.lat),lon:r.lon===''?null:Number(r.lon),area:r.area,source_url:r.source_url,...(r.details?JSON.parse(r.details):{})});}return Array.from(map.values());}
function report(r:any,uid:string|null){return {id:r.id,mosqueId:r.mosque_id,times:JSON.parse(r.times),observed:r.observed,validUntil:r.valid_until,created:r.created,source:r.source,note:r.note,status:r.status,photo:!!r.photo,authorName:r.author_name||'',proofNote:r.proof_note||'',mine:r.user_id===uid,reviewNote:r.review_note};}
async function limit(uid:string,kind:string,max:number){const key=uid+':'+dhakaDate()+':'+kind;const r:any=await db().prepare('INSERT INTO limits(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key).first();if(r.count>max)throw Error('Daily limit reached. Please try again tomorrow.');}
async function handle(req:Request){
 const url=new URL(req.url),path=url.pathname.slice(5).split('/');if(path[0]==='auth')return authRoute(req,env);const u=await identity(req,env),d=db();
 if(req.method==='GET'){
  if(path[0]==='data'){
   const rs=await d.prepare("SELECT * FROM reports WHERE status='approved' OR user_id=? ORDER BY observed DESC, created DESC LIMIT 2000").bind(url.searchParams.get('view')==='visitor'?'':u.id||'').all();
   const cs=await d.prepare('SELECT report_id,prayer,COUNT(*) AS n FROM confirmations WHERE date=? GROUP BY report_id,prayer').bind(dhakaDate()).all();
   const mine= u.id ? (await d.prepare('SELECT report_id,prayer FROM confirmations WHERE date=? AND user_id=?').bind(dhakaDate(),u.id).all()).results:[];
   const flags=(await d.prepare("SELECT payload FROM suggestions WHERE kind='flag' AND status='pending'").all()).results;
   return json({mosques:(await allMosques()).filter(m=>!m.hidden),settings:await settings(),reports:rs.results.map((r:any)=>({...report(r,u.id),confirmations:Object.fromEntries(cs.results.filter((c:any)=>c.report_id===r.id).map((c:any)=>[c.prayer,c.n])),confirmed:mine.filter((c:any)=>c.report_id===r.id).map((c:any)=>c.prayer),flags:flags.filter((f:any)=>{try{return JSON.parse(f.payload).reportId===r.id}catch{return false}}).length})),signedIn:!!u.id,isAdmin:u.admin,today:dhakaDate()});
  }
  if(path[0]==='photo'&&path[1]){const r:any=await d.prepare('SELECT * FROM reports WHERE id=?').bind(path[1]).first();if(!r?.photo||(r.status!=='approved'&&!u.admin&&r.user_id!==u.id))return json({error:'Photo unavailable.'},404);const file=await env.BUCKET?.get(r.photo);if(!file)return json({error:'Photo unavailable.'},404);return new Response(file.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}
  if(path[0]==='admin'){if(!u.admin)return json({error:'Owner access required.'},403);return json({mosques:await allMosques(),settings:await settings(),reports:(await d.prepare("SELECT * FROM reports WHERE status IN ('pending','approved') ORDER BY created DESC LIMIT 1000").all()).results.map((r:any)=>report(r,u.id)),suggestions:(await d.prepare("SELECT * FROM suggestions WHERE status='pending' ORDER BY created DESC LIMIT 1000").all()).results});}
  if(path[0]==='export'){if(!u.admin)return json({error:'Owner access required.'},403);const tables=['reports','confirmations','suggestions','mosques','audit','settings'];const out:any={exported:new Date().toISOString(),seed};for(const t of tables)out[t]=(await d.prepare('SELECT * FROM '+t).all()).results;return json(out);}
  return json({error:'Not found.'},404);
 }
 if(!u.id)return json({error:'Sign in to submit a report.'},401);
 if(req.headers.get('origin')!==url.origin)return json({error:'Please submit from this website.'},403);
 if(Number(req.headers.get('content-length')||0)>2500000)return json({error:'Photo must be under 2 MB.'},413);
 if(path[0]==='reports'){
  const form=await req.formData(),raw=String(form.get('report')||'');if(raw.length>10000)throw Error('Report too large.');const value=JSON.parse(raw),v=validateReport(value);
  if(typeof value.authorName!=='string'||value.authorName.trim().length<2||value.authorName.length>80||value.nameConsent!==true)throw Error('Add a public contributor name and agree to display it.');
  const proofNote=String(value.proofNote||'').trim();if(proofNote.length>400)throw Error('Keep the evidence explanation within 400 characters.');
  const suppliedPhoto=form.get('photo');if(!(suppliedPhoto instanceof File&&suppliedPhoto.size)&&proofNote.length<10)throw Error('Add a timetable photo or explain how you checked the time in at least 10 characters.');
  const mosque=(await allMosques()).find(m=>m.id===value.mosqueId&&!m.hidden);if(!mosque)throw Error('Choose a mosque from the list.');
  if(!/^[a-f0-9-]{36}$/.test(value.requestId))throw Error('Reload the report form.');const existing:any=await d.prepare('SELECT id,user_id,status FROM reports WHERE id=?').bind(value.requestId).first();if(existing)return existing.user_id===u.id?json({id:existing.id,status:existing.status}):json({error:'Request ID is already used.'},409);
  await limit(u.id,'report',15);let photo:string|null=null;const file=form.get('photo');
  if(file instanceof File&&file.size){if(file.size>2000000)throw Error('Photo must be under 2 MB.');if(!env.BUCKET)throw Error('Photo storage unavailable. Retry without a photo.');const bytes=cleanJpeg(new Uint8Array(await file.arrayBuffer()));photo='timelines/'+crypto.randomUUID()+'.jpg';await env.BUCKET.put(photo,bytes,{httpMetadata:{contentType:'image/jpeg'}});}
  try{const inserted=await d.prepare('INSERT OR IGNORE INTO reports(id,user_id,mosque_id,times,observed,valid_until,created,source,note,status,photo,author_name,proof_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(value.requestId,u.id,mosque.id,JSON.stringify(v.times),v.observed,v.validUntil,new Date().toISOString(),v.source,v.note,'pending',photo,value.authorName.trim(),proofNote).run();if(!inserted.meta.changes&&photo)await env.BUCKET?.delete(photo);}catch(e){if(photo)await env.BUCKET?.delete(photo);throw e;}
  return json({id:value.requestId,status:'pending'},201);
 }
 const raw=await req.text();if(raw.length>(path[0]==='settings'?600000:12000))throw Error('Submission too large.');const v=JSON.parse(raw);
 if(path[0]==='confirm'){
  const row:any=await d.prepare('SELECT * FROM reports WHERE id=?').bind(String(v.reportId)).first();if(!row||!prayers.includes(v.prayer)||typeof v.time!=='string'||!JSON.parse(row.times)[v.prayer]?.includes(v.time)||!canConfirm(report(row,u.id),v.prayer,row.user_id===u.id,new Date(),v.time))throw Error('You can confirm another person’s report after today’s jamaat, within its date range.');
  await limit(u.id,'confirm',40);await d.prepare('INSERT OR IGNORE INTO confirmations(report_id,user_id,prayer,date) VALUES(?,?,?,?)').bind(row.id,u.id,v.prayer+'@'+v.time,dhakaDate()).run();return json({confirmed:true});
 }
 if(path[0]==='suggestions'){
  if(!['mosque','flag','correction'].includes(v.kind))throw Error('Choose a valid submission type.');
  if(typeof v.note!=='string'||v.note.trim().length<5||v.note.length>600)throw Error('Add a short explanation between 5 and 600 characters.');
  if(v.kind==='mosque'){if(typeof v.name!=='string'||v.name.trim().length<3||v.name.length>160)throw Error('Add the mosque name.');const blank=(n:any)=>n===undefined||n===null||n==='';const pinless=blank(v.lat)&&blank(v.lon);const lat=pinless?null:Number(v.lat),lon=pinless?null:Number(v.lon);if(!pinless&&(blank(v.lat)||blank(v.lon)||!Number.isFinite(lat)||!Number.isFinite(lon)||lat!<24.80||lat!>25.02||lon!<91.70||lon!>92.05))throw Error('Choose a location in Sylhet or leave both coordinate fields empty.');v.lat=lat;v.lon=lon;v.nameBn=String(v.nameBn||'').slice(0,160);v.area=String(v.area||'').slice(0,160);}
  if(v.kind==='flag'){const row=await d.prepare("SELECT id FROM reports WHERE id=? AND status='approved'").bind(String(v.reportId)).first();if(!row)throw Error('Report not found.');}
  if(v.kind==='correction'&&!(await allMosques()).some(m=>m.id===v.mosqueId))throw Error('Mosque not found.');
  await limit(u.id,'suggestion',10);const id=crypto.randomUUID();await d.prepare('INSERT INTO suggestions(id,user_id,kind,payload,created,status) VALUES(?,?,?,?,?,?)').bind(id,u.id,v.kind,JSON.stringify(v),new Date().toISOString(),'pending').run();return json({id,status:'pending'},201);
 }

 if(path[0]==='settings'){
  if(!u.admin)return json({error:'Owner access required.'},403);const next=validateSettings(v),ms=await allMosques();if(!next.categories.some((c:any)=>c.id==='unassigned'))throw Error('Keep the Other localities group for new mosque suggestions.');
  if(next.featuredMosqueId&&!ms.some(m=>m.id===next.featuredMosqueId&&!m.hidden))throw Error('Choose a visible mosque for the first listing.');
  const old=await settings();const removed=old.categories.filter((c:any)=>!next.categories.some((n:any)=>n.id===c.id));
  if(ms.some(m=>removed.some((c:any)=>c.id===m.category_id)))throw Error('Move the mosques out of a locality before removing it.');
  await d.batch([d.prepare("INSERT INTO settings(key,value) VALUES('site',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(next)),d.prepare('INSERT INTO audit(id,user_id,action,target,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),u.id,'site-settings','site',new Date().toISOString())]);return json({saved:true});
 }
 if(path[0]==='directory'){
  if(!u.admin)return json({error:'Owner access required.'},403);
  const ms=await allMosques(),current=v.id?ms.find(m=>m.id===v.id):null;if(v.id&&!current)throw Error('Choose a mosque.');
  if(typeof v.name!=='string'||v.name.trim().length<3||v.name.length>160)throw Error('Add a mosque name between 3 and 160 characters.');
  const blank=(n:any)=>n===null||n===undefined||n==='';const pinless=blank(v.lat)&&blank(v.lon);const lat=pinless?null:Number(v.lat),lon=pinless?null:Number(v.lon);if(!pinless&&(blank(v.lat)||blank(v.lon)||!Number.isFinite(lat)||!Number.isFinite(lon)||lat!<24.80||lat!>25.02||lon!<91.70||lon!>92.05))throw Error('Choose a location in Sylhet or leave both coordinate fields empty.');
  const config=await settings(),category=v.category_id??current?.category_id??'unassigned';if(!config.categories.some((c:any)=>c.id===category))throw Error('Choose an existing locality group.');
  const order=Number(v.sort_order??current?.sort_order??100);if(!Number.isInteger(order)||order<0||order>9999)throw Error('Choose a listing order from 0 to 9999.');
  const id=current?.id||'community-'+crypto.randomUUID();if(v.hidden&&id===config.featuredMosqueId)throw Error('Choose a different first mosque before hiding this one.');
  const details={category_id:category,area_bn:String(v.area_bn??current?.area_bn??'').slice(0,160),address:String(v.address??current?.address??'').slice(0,400),address_bn:String(v.address_bn??current?.address_bn??'').slice(0,400),location_note:String(v.location_note??current?.location_note??'').slice(0,500),location_note_bn:String(v.location_note_bn??current?.location_note_bn??'').slice(0,500),location_confidence:['map-record','cross-checked','locally-confirmed'].includes(v.location_confidence)?v.location_confidence:current?.location_confidence||'map-record',sort_order:order,hidden:!!(v.hidden??current?.hidden),checked_at:dhakaDate()};
  const source=safeUrl(v.source_url??current?.source_url??'');
  await d.batch([d.prepare('INSERT INTO mosques(id,name,name_bn,lat,lon,area,source_url,details) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,name_bn=excluded.name_bn,lat=excluded.lat,lon=excluded.lon,area=excluded.area,source_url=excluded.source_url,details=excluded.details').bind(id,v.name.trim(),String(v.nameBn??current?.name_bn??'').slice(0,160),lat===null?'':String(lat),lon===null?'':String(lon),String(v.area??current?.area??'').slice(0,160),source,JSON.stringify(details)),d.prepare('INSERT INTO audit(id,user_id,action,target,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),u.id,'directory-edit',id,new Date().toISOString())]);return json({id,saved:true});
 }
 if(path[0]==='moderate'){
  if(!u.admin)return json({error:'Owner access required.'},403);if(!['approved','rejected'].includes(v.status))throw Error('Choose approve or reject.');if(typeof v.note!=='string'||v.note.length>400)throw Error('Add a review note under 400 characters.');
  const table=v.type==='report'?'reports':v.type==='suggestion'?'suggestions':null;if(!table)throw Error('Invalid review type.');const row:any=await d.prepare('SELECT * FROM '+table+' WHERE id=?').bind(String(v.id)).first();if(!row)throw Error('Submission not found.');
  const statements=[];
  if(table==='suggestions'&&v.status==='approved'&&row.status==='pending'){
   const p=JSON.parse(row.payload);if(row.kind==='mosque'){statements.push(d.prepare('INSERT OR IGNORE INTO mosques(id,name,name_bn,lat,lon,area,source_url) VALUES(?,?,?,?,?,?,?)').bind('community-'+row.id,p.name,p.nameBn||'',p.lat===null?'':String(p.lat),p.lon===null?'':String(p.lon),p.area||'',''));}
   else if(row.kind==='flag')statements.push(d.prepare("UPDATE reports SET status='rejected',review_note=? WHERE id=?").bind(v.note||'Withdrawn after a correction.',p.reportId));
   else if(row.kind==='correction'&&!v.note.trim())throw Error('Add a note describing the directory correction you made.');
  }
  statements.push(table==='reports'?d.prepare('UPDATE reports SET status=?,review_note=? WHERE id=?').bind(v.status,v.note,v.id):d.prepare('UPDATE suggestions SET status=? WHERE id=?').bind(v.status,v.id));
  statements.push(d.prepare('INSERT INTO audit(id,user_id,action,target,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),u.id,v.status,v.id,new Date().toISOString()));await d.batch(statements);
  return json({id:v.id,status:v.status});
 }
 return json({error:'Not found.'},404);
}
async function safe(req:Request){try{if(req.method==='POST'){const reader=req.body?.getReader();if(!reader)throw Error('Submission is empty.');const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2200000){await reader.cancel();return json({error:'Photo must be under 2 MB.'},413);}chunks.push(value);}const body=new Uint8Array(size);let offset=0;for(const c of chunks){body.set(c,offset);offset+=c.length;}req=new Request(req.url,{method:req.method,headers:req.headers,body});}return await handle(req)}catch(e){const msg=e instanceof Error?e.message:'';const known=/^(Move|Choose|Add|Use|Keep|The |Photo|Report|Daily|You can|Invalid|Reload|Submission|Database|Sign|Please)/.test(msg);return json({error:known?msg:'Could not save or load this information. Please try again.'},400)}}
export const GET=safe;export const POST=safe;
