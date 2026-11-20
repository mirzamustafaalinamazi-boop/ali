import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rankOwnedOutfits} from '../public/closet-engine.js';
import {eligibleOwnedGarment,evaluateLook,reconcileSavedLooks,annotateCandidate,exportDemoUserData} from '../public/wardrobe-integrity.js';
import {validateLocalPhoto,scaledImageDimensions} from '../public/local-media.js';

const wardrobe=[
 {id:'t1',name:'Blue shirt',category:'Top',color:'Blue',confirmed:true},
 {id:'b1',name:'Brown trousers',category:'Bottom',color:'Brown',confirmed:true},
 {id:'s1',name:'Black shoes',category:'Shoes',color:'Black',confirmed:true},
 {id:'draft',name:'Not checked',category:'Top',color:'Green',confirmed:false},
 {id:'deleted',name:'Gone',category:'Shoes',confirmed:true,deleted:true}
];

test('unconfirmed, deleted or archived clothing is never considered owned',()=>{
 assert.deepEqual(wardrobe.filter(eligibleOwnedGarment).map(x=>x.id),['t1','b1','s1']);
 assert.equal(eligibleOwnedGarment({...wardrobe[0],archived:true}),false);
});
test('styling produces structured owned-garment provenance, not commerce suggestions',()=>{
 const r=rankOwnedOutfits(wardrobe,{occasion:'Casual'}).looks[0];
 assert.ok(r.complete);
 assert.deepEqual(r.items.map(x=>x.stable_id),r.garmentIds);
 assert.ok(r.items.every(x=>x.source==='wardrobe'&&x.provenance==='user-reviewed-local'));
 assert.ok(r.items.every(x=>x.wardrobeItemId==='t1'||x.wardrobeItemId==='b1'||x.wardrobeItemId==='s1'));
});
test('missing shoes is a partial fallback, never fabricated item',()=>{
 const r=rankOwnedOutfits(wardrobe.filter(x=>x.id!=='s1'),{occasion:'Casual'}).looks[0];
 assert.equal(r.complete,false);
 assert.ok(r.missingSlots.includes('footwear'));
 assert.ok(!r.garmentIds.includes('s1'));
});
test('saved look becomes review-required when owned garment is removed',()=>{
 const look={id:'look1',garmentIds:['t1','b1','s1'],complete:true};
 const r=reconcileSavedLooks([look],wardrobe.filter(x=>x.id!=='s1'));
 assert.equal(r[0].needsReview,true);
 assert.deepEqual(r[0].unavailableGarmentIds,['s1']);
 assert.equal(evaluateLook(r[0],wardrobe.filter(x=>x.id!=='s1')).valid,false);
});
test('legacy saved commerce examples remain untouched by wardrobe migration',()=>{
 const old={items:['p1','p2'],total:100};
 assert.deepEqual(reconcileSavedLooks([old],wardrobe),[old]);
});
test('unconfirmed candidate IDs are filtered and cannot be exported as owned recommendations',()=>{
 const annotated=annotateCandidate({garmentIds:['t1','draft','absent']},wardrobe);
 assert.deepEqual(annotated.garmentIds,['t1']);
 assert.equal(annotated.items[0].source,'wardrobe');
});
test('local export includes entire personal demo state and truthful privacy warning',()=>{
 const x=exportDemoUserData({wardrobe,looks:[{id:'l'}],plan:[],dna:{style:'Fusion'},avatar3d:{hair:'Bun'}},'2026-11-21T00:00:00Z');
 assert.equal(x.version,1);
 assert.equal(x.wardrobe.length,5);
 assert.equal(x.dna.style,'Fusion');
 assert.equal(x.avatar3d.hair,'Bun');
 assert.match(x.privacyNotice,/photos/);
 assert.match(x.storageScope,/browser only/);
});
test('local photo upload rejects unsafe types, oversized files and invalid dimensions',()=>{
 assert.equal(validateLocalPhoto({type:'image/jpeg',size:1024}),'');
 assert.match(validateLocalPhoto({type:'image/svg+xml',size:300}),/JPG/);
 assert.match(validateLocalPhoto({type:'image/png',size:10*1024*1024}),/8 MB/);
 assert.deepEqual(scaledImageDimensions(4000,2000),{width:1100,height:550});
 assert.throws(()=>scaledImageDimensions(0,1000));
});
test('planned outfit deletion uses the original index after date sorting',()=>{
 const src=readFileSync(new URL('../public/consumer-ui.js',import.meta.url),'utf8');
 assert.ok(src.includes("item.originalIndex"));
 assert.ok(src.includes('NEEDS REVIEW'));
});
test('manual gallery entry supports user-reviewed drafts without forced camera',()=>{
 const src=readFileSync(new URL('../public/consumer-ui.js',import.meta.url),'utf8');
 assert.ok(src.includes('SAVE GARMENT / DRAFT'));
 assert.ok(src.includes('confirm that I own'));
 assert.ok(!src.includes('capture="environment"'));
});
