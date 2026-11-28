import {test} from 'node:test';
import assert from 'node:assert/strict';
import en from '../src/portfolio.json' with {type:'json'};
import zh from '../src/portfolio.zh.json' with {type:'json'};
import {overlay} from '../src/i18n.js';
import {normalizePortfolio} from '../src/schema.js';

// The Chinese file mirrors the English one: same keys, and lists of the same length,
// so a new item added in English without its translation is caught here.
function mirror(e,z,path='') {
 if (Array.isArray(z)) { assert.ok(Array.isArray(e),`${path} should be a list`); assert.equal(z.length,e.length,`${path} length`); z.forEach((v,i)=>mirror(e[i],v,`${path}[${i}]`)); }
 else if (z && typeof z==='object') { for (const k of Object.keys(z)) { assert.ok(e && k in e,`${path}.${k} is not in the English content`); mirror(e[k],z[k],`${path}.${k}`); } }
}
test('Chinese content lines up with the English content',()=>{
 mirror(en,zh);
 assert.equal(zh.modules.length,en.modules.length);
 en.modules.forEach((m,i)=>assert.equal(zh.modules[i].items.length,m.items.length,`${m.id} items`));
});
test('Merged Chinese portfolio is valid and keeps links, coordinates and map regions',()=>{
 const merged=overlay(en,zh);
 const {categories,profile}=normalizePortfolio(merged);
 assert.equal(profile.links.length,en.profile.links.length);
 const travel=categories.find(c=>c.kind==='map');
 const src=en.modules.find(m=>m.kind==='map');
 travel.items.forEach((it,i)=>{
  assert.equal(it.lat,src.items[i].lat); assert.equal(it.region,src.items[i].region);
  (it.spots||[]).forEach((sp,j)=>sp.images?.forEach((im,k)=>assert.equal(im.src,src.items[i].spots[j].images[k].src)));
 });
 assert.notEqual(travel.items[0].title,src.items[0].title);
});
