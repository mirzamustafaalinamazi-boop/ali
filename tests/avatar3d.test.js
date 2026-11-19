import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_3D_AVATAR,normalize3DAvatar,SKIN_PALETTE,HAIR_PALETTE,HAIR_STYLES,FACE_SHAPES,BODY_PRESETS,owned3DOutfit,avatar3DSelections,RENDERER_NOTE} from '../public/avatar3d-core.js';
const closet=[
 {id:'kurta',name:'Green kurta',category:'Kurta',color:'Green',confirmed:true},
 {id:'trousers',name:'Cream trousers',category:'Trousers',color:'Cream',confirmed:true},
 {id:'loafers',name:'Brown loafers',category:'Shoes',color:'Brown',confirmed:true},
 {id:'saree',name:'Blue saree',category:'Saree',color:'Blue',confirmed:true},
 {id:'draft',name:'Not reviewed',category:'Shirt',color:'Red',confirmed:false},
 {id:'removed',name:'Deleted',category:'Blouse',color:'White',confirmed:true,deleted:true}
];
test('3D avatar requires no photo and provides a neutral initial model',()=>{
 assert.ok(Object.hasOwn(DEFAULT_3D_AVATAR,'skin'));assert.equal(Object.hasOwn(DEFAULT_3D_AVATAR,'photo'),false);
 assert.ok(normalize3DAvatar().spin);assert.deepEqual(normalize3DAvatar({}),DEFAULT_3D_AVATAR);
});
test('avatar presets cover varied appearances without assuming identity',()=>{
 assert.ok(Object.keys(SKIN_PALETTE).length>=8);
 assert.ok(Object.keys(HAIR_PALETTE).length>=7);
 assert.ok(HAIR_STYLES.includes('Bald'));assert.ok(FACE_SHAPES.includes('Round'));
 assert.ok(BODY_PRESETS.includes('Relaxed'));
});
test('unknown inputs do not leak HTML or unsafe selectors into avatar controls',()=>{
 const v=normalize3DAvatar({skin:'<svg/onload=alert(1)>',eyes:'other',face:'nope',hairStyle:'unknown',selectedGarmentIds:['abc','abc',true,{},'x'.repeat(121)]});
 assert.equal(v.skin,DEFAULT_3D_AVATAR.skin);assert.equal(v.face,'Oval');
 assert.deepEqual(v.selectedGarmentIds,['abc']);
});
test('sliders constrain unrealistic numerical values and malformed data',()=>{
 const v=normalize3DAvatar({height:9999,waist:-500,nose:'oops',eyeSize:500,smile:-15});
 assert.equal(v.height,175);assert.equal(v.waist,15);assert.equal(v.nose,50);assert.equal(v.eyeSize,80);assert.equal(v.smile,0);
});
test('user confirmed clothes drive avatar dress, with no invented garment IDs',()=>{
 const v=normalize3DAvatar({selectedGarmentIds:['kurta','trousers','loafers','draft','removed','outside']});
 const o=owned3DOutfit(closet,v);
 assert.deepEqual(o.garments.map(g=>g.id),['kurta','trousers','loafers']);
 assert.deepEqual(o.unavailable,['draft','removed','outside']);
});
test('traditional full-body garments work and suppress separate top and bottom',()=>{
 const o=owned3DOutfit(closet,{selectedGarmentIds:['saree','kurta','trousers','loafers']});
 assert.deepEqual(o.garments.map(g=>g.id),['loafers','saree']);
 assert.equal(o.slots.top,null);assert.equal(o.slots.bottom,null);
});
test('garment slot options include traditional clothing and exclude drafts',()=>{
 assert.deepEqual(avatar3DSelections(closet,'top').map(g=>g.id),['kurta']);
 assert.deepEqual(avatar3DSelections(closet,'full').map(g=>g.id),['saree']);
 assert.deepEqual(avatar3DSelections(closet,'shoes').map(g=>g.id),['loafers']);
});
test('no wardrobe produces an empty owned-outfit result and explicit visual-only limitations',()=>{
 const o=owned3DOutfit([],{selectedGarmentIds:['not-mine']});
 assert.deepEqual(o.garments,[]);
 assert.match(RENDERER_NOTE,/Not a body scan or fit prediction|no garment scan, photorealistic body match/);
});
