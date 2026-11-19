import test from 'node:test';
import assert from 'node:assert/strict';
import {ACCEPTED_TYPES,validatePhotoFile,clamp,cleanLayer,placeLayerAt,calculateImageContain} from '../public/photo-engine.js';
const file=(type,size)=>({type,size});
test('accepts common image formats but not HTML, SVG or anything masquerading as photo',()=>{
 for(const type of ACCEPTED_TYPES)assert.equal(validatePhotoFile(file(type,10000)),'');
 for(const type of ['text/html','image/svg+xml','application/javascript',''])assert.match(validatePhotoFile(file(type,10000)),/JPG, PNG or WebP/);
});
test('limits oversized photos and empty uploads',()=>{
 assert.match(validatePhotoFile(file('image/jpeg',13*1024*1024)),/smaller/);
 assert.match(validatePhotoFile(file('image/png',0)),/smaller/);
 assert.match(validatePhotoFile(null),/JPG/);
});
test('constrains drag positions and sizing to safe ranges',()=>{
 assert.deepEqual(cleanLayer({x:-12,y:500,width:300,opacity:1.8}),{x:0,y:100,width:125,opacity:1});
 assert.deepEqual(cleanLayer({x:50,y:45,width:10,opacity:.5}),{x:50,y:45,width:10,opacity:.5});
});
test('coordinates map to relative positions independent of iPhone viewport size',()=>{
 assert.deepEqual(placeLayerAt(195,260,{width:390,height:520}),{x:50,y:50});
 assert.deepEqual(placeLayerAt(450,-30,{width:390,height:520}),{x:100,y:0});
});
test('image export respects contained portrait and landscape photos',()=>{
 assert.deepEqual(calculateImageContain(1200,1600,900,1200),{x:0,y:0,width:900,height:1200});
 assert.deepEqual(calculateImageContain(1600,800,900,1200),{x:0,y:375,width:900,height:450});
});
test('non-numeric transform inputs cannot become CSS NaN',()=>{
 assert.equal(clamp('garbage',0,100),0);
 assert.equal(cleanLayer({width:'fifteen',opacity:-1}).width,8);
});
