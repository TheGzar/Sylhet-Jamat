// Independent hosting uses signed cookies. Caller-supplied identity headers are never trusted.
export const SESSION_COOKIE='__Host-sj-session';
const FLOW_COOKIE='__Host-sj-oauth';
const encoder=new TextEncoder();
export type AuthEnv={AUTH_SECRET?:string;PUBLIC_ORIGIN?:string;GOOGLE_CLIENT_ID?:string;GOOGLE_CLIENT_SECRET?:string;ADMIN_EMAIL?:string};
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function unb64(s:string){if(!/^[A-Za-z0-9_-]+$/.test(s))throw Error('Invalid encoding');return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0))}
async function key(secret:string){if(secret.length<32)throw Error('Authentication needs a strong secret.');return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function signPayload(payload:Record<string,unknown>,secret:string){const content=b64(encoder.encode(JSON.stringify(payload)));return content+'.'+b64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(content))))}
export async function readPayload(token:string|undefined,secret:string|undefined,purpose:string,now=Date.now()):Promise<any|null>{try{if(!token||token.length>6000||!secret)return null;const parts=token.split('.');if(parts.length!==2||!(await crypto.subtle.verify('HMAC',await key(secret),unb64(parts[1]),encoder.encode(parts[0]))))return null;const p=JSON.parse(new TextDecoder().decode(unb64(parts[0])));if(p.purpose!==purpose||!Number.isSafeInteger(p.exp)||!Number.isSafeInteger(p.iat)||p.exp<=now||p.iat>now+60000||p.exp-p.iat>7*86400000)return null;return p}catch{return null}}
function cookie(req:Request,name:string){const found=(req.headers.get('cookie')||'').split(';').map(c=>c.trim()).filter(c=>c.startsWith(name+'='));return found.length===1?found[0].slice(name.length+1):undefined}
const setCookie=(name:string,value:string,seconds:number)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;
export function safeReturnTo(value:string|null){try{if(!value?.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/';const u=new URL(value,'https://return.invalid');if(u.origin!=='https://return.invalid'||u.pathname.startsWith('/api/auth'))return '/';return u.pathname+u.search+u.hash}catch{return '/'}}
export async function sessionToken(id:string,email:string,secret:string,now=Date.now()){return signPayload({purpose:'session',id,email:email.toLowerCase(),iat:now,exp:now+7*86400000},secret)}
export async function identity(req:Request,env:AuthEnv){const p=await readPayload(cookie(req,SESSION_COOKIE),env.AUTH_SECRET,'session');const valid=p&&typeof p.id==='string'&&p.id.length<=200&&typeof p.email==='string'&&p.email.length<=320;const id=valid?p.id:null,email=valid?p.email:null;return {id,email,admin:!!id&&!!env.ADMIN_EMAIL&&email.toLowerCase()===env.ADMIN_EMAIL.toLowerCase()}}
function publicOrigin(env:AuthEnv){if(!env.PUBLIC_ORIGIN)throw Error('Set PUBLIC_ORIGIN before enabling sign-in.');const u=new URL(env.PUBLIC_ORIGIN);if(u.origin!==env.PUBLIC_ORIGIN||u.username||u.password||!(u.protocol==='https:'||(u.protocol==='http:'&&u.hostname==='localhost')))throw Error('Set a valid public origin.');return u.origin}
function redirect(to:string,cookies:string[]=[]){const headers=new Headers({'Location':to,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});for(const c of cookies)headers.append('Set-Cookie',c);return new Response(null,{status:303,headers})}
function error(message:string,status=400,cookies:string[]=[]){const h=new Headers({'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});for(const c of cookies)h.append('Set-Cookie',c);return new Response(message,{status,headers:h})}
const random=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
export async function authRoute(req:Request,env:AuthEnv,fetcher:typeof fetch=fetch):Promise<Response>{
 const u=new URL(req.url),clear=setCookie(FLOW_COOKIE,'',0);
 if(u.pathname==='/api/auth/signout'){
  if(req.method!=='POST'||req.headers.get('origin')!==u.origin)return error('Submit sign-out from this website.',403);
  return redirect('/',[setCookie(SESSION_COOKIE,'',0)]);
 }
 if(req.method!=='GET')return error('Method not allowed.',405);
 if(!env.AUTH_SECRET||env.AUTH_SECRET.length<32||!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.PUBLIC_ORIGIN)return error('Sign-in is not configured yet. Browsing does not require sign-in.',503);
 let origin:string;try{origin=publicOrigin(env)}catch{return error('Sign-in configuration needs to be checked.',503)}
 if(u.origin!==origin)return error('Use the main website address to sign in.',400);
 const callback=origin+'/api/auth/callback';
 if(u.pathname==='/api/auth/signin'){
  if(req.headers.get('sec-fetch-site')==='cross-site'||(req.headers.get('origin')&&req.headers.get('origin')!==origin))return error('Open sign-in from this website.',403);
  const state=random(),verifier=random(),iat=Date.now();const challenge=b64(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(verifier))));
  const flow=await signPayload({purpose:'oauth',state,verifier,returnTo:safeReturnTo(u.searchParams.get('return_to')),iat,exp:iat+600000},env.AUTH_SECRET);
  const dest=new URL('https://accounts.google.com/o/oauth2/v2/auth');dest.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email',state,code_challenge:challenge,code_challenge_method:'S256'}).toString();
  return redirect(dest.href,[setCookie(FLOW_COOKIE,flow,600)]);
 }
 if(u.pathname!=='/api/auth/callback')return error('Not found.',404);
 const flow=await readPayload(cookie(req,FLOW_COOKIE),env.AUTH_SECRET,'oauth');
 if(!flow||u.searchParams.get('state')!==flow.state||typeof flow.verifier!=='string'||!u.searchParams.get('code')||u.searchParams.has('error'))return error('Sign-in could not finish. Please return to the website and try again.',400,[clear]);
 try{
  const result=await fetcher('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,code:u.searchParams.get('code')!,code_verifier:flow.verifier,grant_type:'authorization_code',redirect_uri:callback}),signal:AbortSignal.timeout(10000)});
  if(!result.ok)throw Error();const token:any=await result.json();if(typeof token.access_token!=='string')throw Error();
  const profile=await fetcher('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(10000)});if(!profile.ok)throw Error();const p:any=await profile.json();
  if(typeof p.sub!=='string'||p.sub.length>180||typeof p.email!=='string'||p.email.length>320||p.email_verified!==true)throw Error();
  return redirect(safeReturnTo(flow.returnTo),[clear,setCookie(SESSION_COOKIE,await sessionToken('google:'+p.sub,p.email,env.AUTH_SECRET),7*86400)]);
 }catch{return error('Sign-in could not finish. Your timetable entries have not been changed. Please try again.',400,[clear])}
}
