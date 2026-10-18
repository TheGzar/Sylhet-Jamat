import {Miniflare} from 'miniflare';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const names=(await fs.readdir('dist/server',{recursive:true})).filter(f=>f.endsWith('.js'));
const modules=['index.js',...names.filter(n=>n!=='index.js')].map(n=>({type:'ESModule',path:path.resolve('dist/server',n)}));
const mf=new Miniflare({modules,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],assets:{directory:'dist/client',routerConfig:{has_user_worker:true}}});
try{
 const db=await mf.getD1Database('DB');for(const file of (await fs.readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await fs.readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
 for(const path of ['/','/manage','/favicon.svg','/manifest.webmanifest','/fonts/bengali.ttf','/api/data?view=visitor']){const r=await mf.dispatchFetch('https://sylhet.example'+path);assert.equal(r.status,200,path);if(path.startsWith('/api/data')){const d=await r.json();assert.equal(d.mosques.length,166);assert(d.settings.noticeBn)}else{const b=await r.arrayBuffer();assert(b.byteLength>0)}console.log('PASS production route',path)}
 const admin=await mf.dispatchFetch('https://sylhet.example/api/admin',{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.test'}});assert.equal(admin.status,403);console.log('PASS production rejects forged owner headers');
 const r=await mf.dispatchFetch('https://sylhet.example/');const html=await r.text();const scripts=[...html.matchAll(/(?:src|href)="([^" ]+\.js)"/g)].map(m=>m[1]);assert(scripts.length>0,'compiled JS references');for(const url of scripts){const r=await mf.dispatchFetch(new URL(url,'https://sylhet.example'));assert.equal(r.status,200,'asset '+url)}console.log('PASS compiled page JavaScript loads');
}finally{await mf.dispose()}
