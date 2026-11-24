import {test} from 'node:test';
import assert from 'node:assert/strict';

test('Confirmed empty sections render a neutral state for every layout, then allow real content',async()=>{
 globalThis.document={addEventListener(){},getElementById(){return {addEventListener(){}};}};
 try {
  const {categories}=await import('../src/content.js');
  const {mountExhibit}=await import('../src/exhibits.js');
  const host={innerHTML:''};
  for(const module of categories){
   const items=module.items;
   if(!items.length) continue;
   try {
    module.items=[];
    mountExhibit(host,module.id);
    assert.match(host.innerHTML,/Nothing to show yet/);
    assert.ok(!host.innerHTML.includes(items[0].title));
    module.items=items;
    mountExhibit(host,module.id);
    assert.ok(!host.innerHTML.includes('Nothing to show yet'));
   } finally {module.items=items;}
  }
 } finally {delete globalThis.document;}
});

test('Coming-soon sections render a placeholder instead of an empty state',async()=>{
 globalThis.document={addEventListener(){},getElementById(){return {addEventListener(){}};}};
 try {
  const {categories}=await import('../src/content.js');
  const {mountExhibit}=await import('../src/exhibits.js');
  const host={innerHTML:''};
  for(const module of categories.filter(m=>m.comingSoon)){
   mountExhibit(host,module.id);
   assert.match(host.innerHTML,/Coming soon/);
  }
 } finally {delete globalThis.document;}
});

test('Map sections render a pin and a stop for every place, with the first place card open',async()=>{
 globalThis.document={addEventListener(){},getElementById(){return {addEventListener(){}};}};
 try {
  const {categories}=await import('../src/content.js');
  const {mountExhibit}=await import('../src/exhibits.js');
  const host={innerHTML:''};
  for(const module of categories.filter(m=>m.kind==='map')){
   mountExhibit(host,module.id);
   assert.equal((host.innerHTML.match(/class="map-pin"/g)||[]).length,module.items.length);
   assert.equal((host.innerHTML.match(/<button data-place=/g)||[]).length,module.items.length);
   assert.ok(host.innerHTML.includes('place-card'));
  }
 } finally {delete globalThis.document;}
});
