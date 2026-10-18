const origin=process.env.PUBLIC_ORIGIN;if(!origin)throw Error('PUBLIC_ORIGIN is missing.');
for(const path of ['/','/manage','/favicon.svg','/manifest.webmanifest','/fonts/bengali.ttf','/api/data?view=visitor']){
 const r=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(30000)});if(r.status!==200)throw Error(path+' returned HTTP '+r.status);
 if(path.startsWith('/api/data')){const d=await r.json();if(!Array.isArray(d.mosques)||d.mosques.length<166||!d.settings?.noticeBn)throw Error('Directory or settings missing.');console.log('Verified '+d.mosques.length+' mosque entries.')}else await r.arrayBuffer();
 console.log('OK '+path);
}
const admin=await fetch(origin+'/api/admin',{headers:{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':process.env.ADMIN_EMAIL||'owner@example.test'}});if(admin.status!==403)throw Error('Anonymous management access must be refused.');
const auth=await fetch(origin+'/api/auth/signin',{redirect:'manual'});if(auth.status!==303||new URL(auth.headers.get('location')).origin!=='https://accounts.google.com')throw Error('Google sign-in not configured.');
console.log('Public routes, static assets, anonymous permissions and OAuth redirect verified. Complete one real Google sign-in and a timetable publication before inviting contributors.');
