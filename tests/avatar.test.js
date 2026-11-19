import test from 'node:test';
import assert from 'node:assert/strict';
import {AVATAR_DEFAULTS,sanitizeAvatar,confirmedGarments,classifyGarment,resolveAvatarOutfit,avatarSvg,TONES} from '../public/avatar-core.js';
const own=[
 {id:'top1',name:'Blue cotton kurta',category:'Kurta',color:'Blue',confirmed:true},
 {id:'bottom1',name:'Ivory trousers',category:'Trousers',color:'Cream',confirmed:true},
 {id:'shoe1',name:'Loafers',category:'Shoes',color:'Brown',confirmed:true},
 {id:'saree1',name:'Rose saree',category:'Saree',color:'Pink',confirmed:true},
 {id:'draft1',name:'Unapproved item',category:'Top',color:'Black',confirmed:false},
 {id:'deleted',name:'Removed item',category:'Jacket',color:'Black',confirmed:true,deleted:true}
];
test('avatar starts with an illustrative default and valid SVG',()=>{
 const s=avatarSvg(AVATAR_DEFAULTS,own);
 assert.match(s,/<svg[^>]+viewBox="0 0 360 580"/);
 assert.match(s,/2D STYLE PREVIEW/);
 assert.match(s,/not a virtual fitting simulation/);
});
test('avatar only resolves confirmed owned garment IDs',()=>{
 const r=resolveAvatarOutfit(own,['top1','bottom1','draft1','deleted','not-an-id']);
 assert.deepEqual(r.garments.map(g=>g.id),['top1','bottom1']);
 assert.deepEqual(r.ignoredIds,['draft1','deleted','not-an-id']);
 assert.equal(r.partial,false);
});
test('full body traditional garment works without bottoms',()=>{
 const r=resolveAvatarOutfit(own,['saree1','top1','bottom1']);
 assert.deepEqual(r.garments.map(x=>x.id),['saree1']);
 assert.equal(r.partial,false);
});
test('traditional kurta is correctly treated as a top',()=>{assert.equal(classifyGarment('Kurta'),'top');assert.equal(classifyGarment('Lehenga'),'full');});
test('avatar preview reflects user-chosen skin tone and garment colors',()=>{
 const s=avatarSvg({tone:'Deep',selectedGarmentIds:['top1','bottom1']},own);
 assert.ok(s.includes(TONES.Deep));
 assert.ok(s.includes('#527395'));
 assert.ok(s.includes('#F0E5CF'));
});
test('avatar sanitizes unknown options and enforces 7 garment id limit',()=>{
 const c=sanitizeAvatar({tone:'javascript:alert(1)',hair:'unknown',silhouette:'bad',selectedGarmentIds:['a','a','b','c','d','e','f','g','h','i']});
 assert.equal(c.tone,'Medium');assert.equal(c.hair,'Waves');assert.equal(c.silhouette,'Classic');assert.equal(c.selectedGarmentIds.length,7);
});
test('back view differs from front view',()=>{
 const f=avatarSvg({view:'Front'},own);
 const b=avatarSvg({view:'Back'},own);
 assert.notEqual(f,b);
 assert.ok(!b.includes('M165 100Q170 97'));
});
test('label is safely escaped in the exported SVG',()=>{
 const svg=avatarSvg({},own,'<script>alert(1)</script>');
 assert.ok(!svg.includes('<script>'));
 assert.ok(svg.includes('&lt;SCRIPT&gt;'));
});
test('unconfirmed garments cannot change avatar colors',()=>{
 const s=avatarSvg({selectedGarmentIds:['draft1','deleted']},own);
 assert.ok(!s.includes('Unapproved item'));
 assert.equal(resolveAvatarOutfit(own,['draft1','deleted']).garments.length,0);
});
