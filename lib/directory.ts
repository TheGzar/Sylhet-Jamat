import catalog from '../data/text-catalog.json' with {type:'json'};
export type Category={id:string;name:string;nameBn:string;order:number};
export type DirectoryMosque={id:string;name:string;name_bn:string;lat:number|null;lon:number|null;area:string;source_url:string;category_id?:string;area_bn?:string;address?:string;address_bn?:string;location_confidence?:string;location_note?:string;location_note_bn?:string;checked_at?:string;sort_order?:number;hidden?:boolean;additional_sources?:string[]};
export function compareMosques(a:DirectoryMosque,b:DirectoryMosque,categories:Category[],featured:string,locale='en'){if(a.id===featured&&b.id!==featured)return -1;if(b.id===featured&&a.id!==featured)return 1;const rank=(m:DirectoryMosque)=>categories.find(c=>c.id===m.category_id)?.order??999;return rank(a)-rank(b)||(a.sort_order??100)-(b.sort_order??100)||(locale==='bn'?(a.name_bn||a.name):a.name).localeCompare(locale==='bn'?(b.name_bn||b.name):b.name,locale);}
export function safeUrl(v:unknown){if(!v)return '';if(typeof v!=='string'||v.length>700)throw Error('Use a valid source link.');try{const u=new URL(v);if(!['https:','http:'].includes(u.protocol))throw Error();return u.href;}catch{throw Error('Use an https or http source link.');}}
export function validateSettings(v:any){
 const textKeys=['titleBn','titleEn','headingBn','headingEn','introBn','introEn','noticeBn','noticeEn','contributeBn','contributeEn'];const out:any={};
 for(const k of textKeys){if(typeof v[k]!=='string'||v[k].length>500||(!k.startsWith('notice')&&!v[k].trim()))throw Error('Add the site text, up to 500 characters per field.');out[k]=v[k].trim();}
 for(const k of ['primaryColor','backgroundColor']){if(typeof v[k]!=='string'||!/^#[0-9a-fA-F]{6}$/.test(v[k]))throw Error('Choose a valid colour.');out[k]=v[k];}
 const lum=(s:string)=>{const c=s.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
 if(1.05/(lum(v.primaryColor)+.05)<4.5)throw Error('Choose a darker button colour so white text stays readable.');
 if((lum(v.backgroundColor)+.05)/(lum('#173d30')+.05)<4.5)throw Error('Choose a lighter background so text stays readable.');
 if(!Array.isArray(v.categories)||v.categories.length<1||v.categories.length>60)throw Error('Keep between 1 and 60 locality groups.');
 const ids=new Set();out.categories=v.categories.map((c:any,i:number)=>{if(!/^[a-z0-9-]{1,60}$/.test(c.id)||ids.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>100||typeof c.nameBn!=='string'||!c.nameBn.trim()||c.nameBn.length>100)throw Error('Add unique locality groups with names in both languages.');ids.add(c.id);return {id:c.id,name:c.name.trim(),nameBn:c.nameBn.trim(),order:i};});
 out.textOverrides={};if(v.textOverrides!==undefined){if(!v.textOverrides||typeof v.textOverrides!=='object'||Array.isArray(v.textOverrides)||Object.keys(v.textOverrides).length>300)throw Error('Use valid website text.');const keys=new Set(catalog.map(c=>c.key));for(const [key,val] of Object.entries(v.textOverrides) as [string,any][]){if(!keys.has(key)||!val||typeof val!=='object'||Array.isArray(val))throw Error('Use an existing website text entry.');const item:any={};for(const lang of ['bn','en'])if(val[lang]!==undefined){if(typeof val[lang]!=='string'||val[lang].length>1500)throw Error('Keep website text under 1500 characters.');item[lang]=val[lang];}out.textOverrides[key]=item;}}
 out.featuredMosqueId=String(v.featuredMosqueId||'').slice(0,100);return out;
}

export function hasCoordinates<T extends {lat:unknown;lon:unknown}>(m:T):m is T & {lat:number;lon:number}{return typeof m.lat==='number'&&Number.isFinite(m.lat)&&typeof m.lon==='number'&&Number.isFinite(m.lon)&&m.lat>=24.8&&m.lat<=25.02&&m.lon>=91.7&&m.lon<=92.05}
