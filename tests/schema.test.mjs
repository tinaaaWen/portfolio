import {test} from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/portfolio.json' with {type:'json'};
import {normalizePortfolio,escapeHTML,safeUrl} from '../src/schema.js';
test('Three modules yield exactly three scene slots',()=>{
 const d=structuredClone(data);d.modules=d.modules.slice(0,3);
 const {categories}=normalizePortfolio(d);assert.equal(categories.length,3);assert.equal(categories.at(-1).number,'03');
});
test('Unsupported counts and duplicate ids rejected',()=>{
 const d=structuredClone(data);d.modules=d.modules.slice(0,2);assert.throws(()=>normalizePortfolio(d));
 d.modules=structuredClone(data.modules);d.modules[1].id=d.modules[0].id;assert.throws(()=>normalizePortfolio(d));
});
test('Untrusted captions stay text and executable links are not emitted',()=>{
 assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
 assert.equal(safeUrl('javascript:alert(1)'), '');assert.equal(safeUrl('data:text/html,abc'),'');
 assert.equal(safeUrl('https://example.org/work'), 'https://example.org/work');
});

test('Empty sections require explicit confirmation and retain all four scene slots',()=>{
 const d=structuredClone(data);
 if(d.modules.length===3) d.modules.push({...structuredClone(d.modules[0]),id:'fourth-section'});
 for (const m of d.modules) m.items=[];
 assert.throws(()=>normalizePortfolio(d));
 for (const m of d.modules) m.emptyConfirmed=true;
 const {categories}=normalizePortfolio(d);
 assert.equal(categories.length,4);
 assert.deepEqual(categories.map(m=>m.number),['01','02','03','04']);
 assert.ok(categories.every(m=>m.items.length===0));
});

test('Photo lists must point at staged assets',()=>{
 const d=structuredClone(data);
 d.modules[0].items[0].images=[{src:'https://evil.example/x.jpg'}];
 assert.throws(()=>normalizePortfolio(d));
 d.modules[0].items[0].images=[{src:'/assets/ok-photo.jpg',alt:'fine'}];
 assert.doesNotThrow(()=>normalizePortfolio(d));
});

test('Map places need valid coordinates',()=>{
 const d=structuredClone(data);
 const m=d.modules.find(x=>x.kind==='map');
 assert.ok(m);
 m.items[0].lat='north';
 assert.throws(()=>normalizePortfolio(d));
 m.items[0].lat=40;m.items[0].lng=200;
 assert.throws(()=>normalizePortfolio(d));
 m.items[0].lng=116;
 assert.doesNotThrow(()=>normalizePortfolio(d));
});
