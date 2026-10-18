import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareMosques,validateSettings,hasCoordinates} from '../lib/directory.ts';
const data=JSON.parse(fs.readFileSync('data/mosques.json'));
const config=JSON.parse(fs.readFileSync('data/site-defaults.json'));
test('Kudrat Ullah leads the directory',()=>assert.equal([...data].sort((a,b)=>compareMosques(a,b,config.categories,config.featuredMosqueId))[0].id,'osm-W531388592'));
test('Bodikuna and Collectorate have separate locality groups',()=>assert.notEqual(data.find(m=>m.id==='osm-W531899519').category_id,data.find(m=>m.id==='osm-W531385301').category_id));
test('every seed has an existing category and bounded coordinate',()=>{for(const m of data){assert(config.categories.some(c=>c.id===m.category_id));if(m.lat!==null)assert(hasCoordinates(m));else assert.equal(m.lon,null)}});
test('ordinary names sort alphabetically inside a locality',()=>{const base=data[0];assert(compareMosques({...base,id:'a',name:'Alpha'},{...base,id:'b',name:'Zeta'},config.categories,'none')<0)});
test('default settings validate and duplicate categories fail',()=>{assert(validateSettings(config));assert.throws(()=>validateSettings({...config,categories:[config.categories[0],config.categories[0]]}))});

test('required shopping-centre mosques are searchable',()=>{assert(data.some(m=>m.name.includes('Al-Hamra Shopping')));assert(data.some(m=>m.name.includes('Al-Marjan Shopping')));assert(data.some(m=>m.name.includes('Stadium Market')))});
test('directory IDs stay unique and sources use safe URLs',()=>{assert.equal(new Set(data.map(m=>m.id)).size,data.length);for(const m of data)assert(/^https:\/\//.test(m.source_url))});
test('pinless entries never count as valid map positions',()=>{assert(!hasCoordinates({lat:null,lon:null}));assert(!hasCoordinates({lat:0,lon:0}));assert(!hasCoordinates({lat:'24.89',lon:'91.87'}))});
test('interface text overrides validate without changing the disclaimer',()=>{const x=validateSettings({...config,textOverrides:{'Search mosque or area':{en:'Find a mosque'}}});assert.equal(x.textOverrides['Search mosque or area'].en,'Find a mosque');assert.equal(x.noticeBn,config.noticeBn)});
