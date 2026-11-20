import test from 'node:test';
import assert from 'node:assert/strict';
import {FACE_SHAPES,BODY_TYPES,GUIDED_FACE_SHAPES,GUIDED_BODY_TYPES,applyFaceShape,applyBodyType,closestFaceShape,softenSelfieDetail,resetFaceDetails} from '../src/presets.ts';

const config={gender:0,age:.2,muscle:.5,weight:.5,height:.5,proportions:.5,cupSize:.5,firmness:.5,african:.3,asian:.3,caucasian:.4,detail:{eyeSize:.3,noseWidth:-.2,headWidth:.4},skin:'x',skinTint:'#fff',eyes:'brown',eyebrows:null,eyebrowColor:'#111',eyelashes:null,hair:null,hairColor:'#111',clothes:[]};

test('20 numbered face presets and eight body choices have unique ids',()=>{
 assert.equal(FACE_SHAPES.length,20);assert.equal(new Set(FACE_SHAPES.map(s=>s.id)).size,20);
 assert.equal(BODY_TYPES.length,8);assert.equal(new Set(BODY_TYPES.map(s=>s.id)).size,8);
 assert.equal(GUIDED_FACE_SHAPES.length,6);assert.equal(GUIDED_BODY_TYPES.length,6);
});
test('choosing a face shape preserves fitted eyes, nose and clothes',()=>{
 const next=applyFaceShape(config,FACE_SHAPES[3]);
 assert.equal(next.detail.eyeSize,.3);assert.equal(next.detail.noseWidth,-.2);
 assert.deepEqual(next.clothes,[]);assert.ok(Math.abs(next.detail.headRound-.525)<1e-9);
 assert.equal(config.detail.headWidth,.4);
});
test('selfie recommendation identifies an exact profile without changing it',()=>{
 const fitted=applyFaceShape(config,FACE_SHAPES[12]);
 assert.equal(closestFaceShape(fitted).id,FACE_SHAPES[12].id);
 assert.equal(fitted.detail.eyeSize,.3);
});
test('body choice preserves face and avatar height control',()=>{
 const next=applyBodyType(config,BODY_TYPES[2]);
 assert.equal(next.detail.headWidth,.4);assert.equal(next.detail.eyeSize,.3);
 assert.equal(next.height,.5);assert.equal(next.muscle,.78);
});
test('photo fit stays restrained and preserves manually selected non-face values',()=>{
 const next=softenSelfieDetail({buttocks:.25,eyeSize:0},{eyeSize:.95,noseWidth:-1,headWidth:.3});
 assert.equal(next.eyeSize,.48);assert.equal(next.noseWidth,-.48);
 assert.equal(next.buttocks,.25);assert.equal(next.headWidth,.21);
});
test('natural reset clears face extremes but keeps body and clothes',()=>{
 const next=resetFaceDetails({...config,detail:{eyeSize:.8,headWidth:.7,belly:.3}});
 assert.equal(next.detail.eyeSize,undefined);assert.equal(next.detail.headWidth,undefined);
 assert.equal(next.detail.belly,.3);assert.deepEqual(next.clothes,config.clothes);
});
