import {readFile,writeFile,appendFile} from 'node:fs/promises';
const token=process.env.CLOUDFLARE_API_TOKEN,account=process.env.CLOUDFLARE_ACCOUNT_ID;
if(!token||!account)throw Error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in GitHub Actions secrets first.');
if(!/^[a-f0-9]{32}$/i.test(account))throw Error('Check your Cloudflare account ID.');
const base='https://api.cloudflare.com/client/v4/accounts/'+account;
async function api(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok||d.success===false)throw Error('Cloudflare setup failed for '+path+' (HTTP '+r.status+'). Check token permissions, workers.dev setup and R2 activation.');return d.result}
const cfg=JSON.parse(await readFile('wrangler.jsonc','utf8'));
// Discover by the existing configured name. Never clear, recreate or replace an existing database.
const list=await api('/d1/database?name='+encodeURIComponent(cfg.d1_databases[0].database_name));
let db=list.find(x=>x.name===cfg.d1_databases[0].database_name);
if(!db)db=await api('/d1/database',{name:cfg.d1_databases[0].database_name});
cfg.d1_databases[0].database_id=db.uuid;
const buckets=await api('/r2/buckets?name_contains='+encodeURIComponent(cfg.r2_buckets[0].bucket_name));
if(!(buckets.buckets||[]).some(x=>x.name===cfg.r2_buckets[0].bucket_name))await api('/r2/buckets',{name:cfg.r2_buckets[0].bucket_name});
const sub=await api('/workers/subdomain');if(!sub?.subdomain)throw Error('Choose your free workers.dev subdomain in the Cloudflare dashboard first.');
const origin=process.env.PUBLIC_ORIGIN||`https://${cfg.name}.${sub.subdomain}.workers.dev`;
const u=new URL(origin);if(u.protocol!=='https:'||u.origin!==origin)throw Error('PUBLIC_ORIGIN must be an https origin without a trailing slash.');
cfg.vars={...cfg.vars,PUBLIC_ORIGIN:origin};
await writeFile('wrangler.jsonc',JSON.stringify(cfg,null,2)+'\n');
if(process.env.GITHUB_ENV)await appendFile(process.env.GITHUB_ENV,'PUBLIC_ORIGIN='+origin+'\n');
console.log('Database and photo bucket ready. Website origin: '+origin);
console.log('Google OAuth redirect URI: '+origin+'/api/auth/callback');
