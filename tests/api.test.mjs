import {sessionToken,SESSION_COOKIE} from '../lib/auth.ts';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {dhakaDate} from '../lib/prayers.ts';
await build({entryPoints:['tests/api-worker.ts'],bundle:true,outfile:'.test-runtime/api-worker.js',format:'esm',platform:'neutral',external:['cloudflare:workers'],tsconfig:'tsconfig.json'});
const mf=new Miniflare({modules:true,scriptPath:'.test-runtime/api-worker.js',compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{ADMIN_EMAIL:'owner@example.test',AUTH_SECRET:'test-only-secret-at-least-32-characters-long'}});
const seedCount=JSON.parse(await fs.readFile('data/mosques.json','utf8')).length;let checks=0;
try{
 const db=await mf.getD1Database('DB');for(const file of (await fs.readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await fs.readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
 const owner={id:'owner',email:'owner@example.test'},alice={id:'alice',email:'alice@example.test'},bob={id:'bob',email:'bob@example.test'};
 async function call(path,body,user=alice,origin='http://localhost'){const headers={};if(user){headers.cookie=SESSION_COOKIE+'='+await sessionToken(user.id,user.email,'test-only-secret-at-least-32-characters-long')}if(body){headers.origin=origin;if(!(body instanceof FormData))headers['content-type']='application/json'}let bytes=body?JSON.stringify(body):undefined;if(body instanceof FormData){const encoded=new Request('http://localhost',{method:'POST',body});headers['content-type']=encoded.headers.get('content-type');bytes=new Uint8Array(await encoded.arrayBuffer());}const r=await mf.dispatchFetch('http://localhost/api/'+path,{method:body?'POST':'GET',headers,body:bytes});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return {status:r.status,data};}
 function check(ok,label){assert.ok(ok,label);checks++;console.log('PASS',label)}
 let x=await call('data',null,null);check(x.status===200&&x.data.mosques.length===seedCount,'public reads the expanded seed directory without login');
 check((await call('admin',null,bob)).status===403,'non-owner cannot inspect moderation queue');
 check((await call('export',null,bob)).status===403,'non-owner cannot export private data');
 const id=crypto.randomUUID(),today=dhakaDate(),mosqueId=x.data.mosques[0].id;
 const payload={requestId:id,mosqueId,times:{fajr:['00:01']},observed:today,validUntil:today,source:'noticeboard',note:'Test report',authorName:'Test contributor',nameConsent:true,proofNote:'Checked the timetable in person'};
 function form(){const f=new FormData();f.append('report',JSON.stringify(payload));return f}
 check((await call('reports',form(),null)).status===401,'anonymous submission rejected');
 check((await call('reports',form(),alice,'https://evil.test')).status===403,'cross-origin submission rejected');
 x=await call('reports',form());if(x.status!==201)console.log(x);check(x.status===201,'report stored as pending');
 x=await call('reports',form());check(x.status===200,'retry returns existing report');
 check((await db.prepare('SELECT count(*) AS n FROM reports').first()).n===1,'retry does not duplicate data');
 x=await call('data',null,bob);check(x.data.reports.length===0,'pending report hidden from others');
 x=await call('data',null,alice);check(x.data.reports.length===1&&x.data.reports[0].mine,'author can find pending submission');
 check((await call('data?view=visitor',null,alice)).data.reports.length===0,'visitor view excludes own pending report');
 check((await call('moderate',{type:'report',id,status:'approved',note:''},bob)).status===403,'non-owner cannot publish');
 check((await call('moderate',{type:'report',id,status:'approved',note:''},owner)).status===200,'owner publishes report');
 x=await call('data',null,bob);check(x.data.reports[0].status==='approved','published report visible to another visitor');
 check(!JSON.stringify(x.data.reports).includes('alice@example'),'public report omits email');check(x.data.reports[0].authorName==='Test contributor'&&!!x.data.reports[0].proofNote,'published report includes contributor and evidence');
 check((await call('confirm',{reportId:id,prayer:'fajr',time:'00:01'},alice)).status===400,'self-confirmation rejected');
 check((await call('confirm',{reportId:id,prayer:'fajr',time:'00:01'},bob)).status===200,'independent attendance confirmation stored');
 await call('confirm',{reportId:id,prayer:'fajr',time:'00:01'},bob);x=await call('data',null,bob);check(x.data.reports[0].confirmations['fajr@00:01']===1,'same-user confirmation counted once per day');
 check((await call('directory',{id:mosqueId,name:'Test name',lat:24.89,lon:91.87},bob)).status===403,'directory edit requires owner');
 check((await call('directory',{id:mosqueId,name:'Corrected mosque',nameBn:'সংশোধিত নাম',lat:24.89,lon:91.87,area:'Test'},owner)).status===200,'owner corrects directory');
 x=await call('data',null,null);check(x.data.mosques.length===seedCount&&x.data.mosques.find(m=>m.id===mosqueId).name==='Corrected mosque','directory override updates without duplicating seed');
 const bad=form();bad.append('photo',new Blob(['<svg>'],{type:'image/jpeg'}),'x.jpg');payload.requestId=crypto.randomUUID();bad.set('report',JSON.stringify(payload));check((await call('reports',bad)).status===400,'disguised image rejected');
 const suggestion=await call('suggestions',{kind:'mosque',name:'Test mosque',lat:24.9,lon:91.88,note:'Local timetable verified'});check(suggestion.status===201,'missing mosque suggestion saved');
 check((await call('moderate',{type:'suggestion',id:suggestion.data.id,status:'approved',note:''},owner)).status===200,'owner approves missing mosque');
 check((await call('data',null,null)).data.mosques.length===seedCount+1,'approved mosque appears in shared directory');
 await call('moderate',{type:'report',id,status:'rejected',note:'Incorrect time'},owner);check((await call('data',null,bob)).data.reports.length===0,'withdrawn report removed from public results');

 const photoId=crypto.randomUUID();const photoForm=form();photoForm.set('report',JSON.stringify({...payload,requestId:photoId}));photoForm.append('photo',new Blob([await fs.readFile('tests/fixtures/timetable.jpg')],{type:'image/jpeg'}),'timetable.jpg');
 check((await call('reports',photoForm)).status===201,'valid timetable JPEG stored');
 check((await call('photo/'+photoId,null,bob)).status===404,'pending photo hidden from other visitors');
 check((await call('photo/'+photoId,null,owner)).status===200,'owner can inspect pending photo');
 await call('moderate',{type:'report',id:photoId,status:'approved',note:''},owner);
 check((await call('photo/'+photoId,null,null)).status===200,'approved photo publicly readable');
 await call('moderate',{type:'report',id:photoId,status:'rejected',note:'Remove photo'},owner);
 check((await call('photo/'+photoId,null,bob)).status===404,'withdrawn photo inaccessible publicly');
 const config=(await call('data',null,null)).data.settings;
 check((await call('settings',config,bob)).status===403,'settings require owner');
 check((await call('settings',{...config,headingEn:'Local jamaat times'},owner)).status===200,'owner can edit site wording');
 check((await call('data',null,null)).data.settings.headingEn==='Local jamaat times','site wording persists');
 check((await call('settings',{...config,primaryColor:'#ffffff'},owner)).status===400,'unreadable button colour rejected');
 check((await call('directory',{id:mosqueId,name:'Corrected mosque',lat:24.89,lon:91.87,source_url:'javascript:alert(1)'},owner)).status===400,'unsafe source link rejected');
 const textKey='Search mosque or area';const edited={...config,textOverrides:{[textKey]:{bn:'মসজিদ খুঁজুন',en:'Find a mosque nearby'}}};
 check((await call('settings',edited,owner)).status===200,'owner saves searchable interface text overrides');
 check((await call('data',null,null)).data.settings.textOverrides[textKey].en==='Find a mosque nearby','visitor receives saved text override');
 check((await call('settings',{...config,textOverrides:{unknown:{en:'x'}}},owner)).status===400,'unrecognised text key rejected');
 const pinless=(await call('data',null,null)).data.mosques.find(m=>m.lat===null);check(!!pinless&&pinless.lon===null,'address-only mosque keeps unset coordinates');
 check((await call('directory',{...pinless,nameBn:pinless.name_bn,address:'Edited address'},owner)).status===200,'owner can edit an address without inventing a pin');
 check((await call('data',null,null)).data.mosques.find(m=>m.id===pinless.id).lat===null,'unset pin survives database roundtrip');
 check((await call('directory',{...pinless,lat:24.89,lon:''},owner)).status===400,'half completed coordinate pair rejected');

 const noPinSuggestion=await call('suggestions',{kind:'mosque',name:'Address only mosque',area:'Central Sylhet',lat:'',lon:'',note:'Prayer room in the specified building'});
 check(noPinSuggestion.status===201,'visitor can suggest a mosque without guessed coordinates');
 check((await call('moderate',{type:'suggestion',id:noPinSuggestion.data.id,status:'approved',note:'Checked the address'},owner)).status===200,'owner can approve an address-only suggestion');
 x=await call('data',null,null);const added=x.data.mosques.find(m=>m.id==='community-'+noPinSuggestion.data.id);
 check(added.lat===null&&added.lon===null&&added.area==='Central Sylhet','approved address-only suggestion remains pinless');
 check((await call('suggestions',{kind:'mosque',name:'Partial coordinate mosque',lat:'24.89',lon:'',note:'Check the position in this area'})).status===400,'suggestions reject half-completed coordinates');
 const latest=(await call('data',null,null)).data.settings;
 check((await call('settings',{...latest,categories:latest.categories.filter(c=>c.id!=='unassigned')},owner)).status===400,'Other localities stays available for new suggestions');
 const emptyGroup={id:'empty-test-area',name:'Empty test area',nameBn:'খালি এলাকা',order:latest.categories.length};
 check((await call('settings',{...latest,categories:[...latest.categories,emptyGroup]},owner)).status===200,'owner can add an empty locality');
 check((await call('settings',latest,owner)).status===200,'owner can remove an empty locality');
 check(!(await call('data',null,null)).data.settings.categories.some(c=>c.id==='empty-test-area'),'removed locality stays removed after a fresh read');
 const misplaced='sheikhghat',destination='lamabazar-sheikhghat';
 for(const mosque of (await call('admin',null,owner)).data.mosques.filter(m=>m.category_id===misplaced)){
  const moved=await call('directory',{...mosque,nameBn:mosque.name_bn,category_id:destination},owner);assert.equal(moved.status,200);
 }
 const reduced={...latest,categories:latest.categories.filter(c=>c.id!==misplaced)};
 check((await call('settings',reduced,owner)).status===200,'owner can remove an emptied original locality');
 check(!(await call('data',null,null)).data.settings.categories.some(c=>c.id===misplaced),'removed original locality is not silently recreated');
 console.log(`Completed ${checks} API checks. Test database is isolated from production.`);
}finally{await mf.dispose()}
