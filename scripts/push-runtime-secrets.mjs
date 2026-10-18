import {spawnSync} from 'node:child_process';
const keys=['AUTH_SECRET','ADMIN_EMAIL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET'];
const secrets={};for(const k of keys){if(!process.env[k])throw Error('Missing GitHub Actions secret: '+k);secrets[k]=process.env[k]}
if(secrets.AUTH_SECRET.length<32)throw Error('AUTH_SECRET must have at least 32 random characters.');
const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk','--config','wrangler.jsonc'],{input:JSON.stringify(secrets),stdio:['pipe','inherit','inherit'],env:process.env});
if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);
