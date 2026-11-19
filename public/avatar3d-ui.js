// OTD 3D Avatar Studio — independent no-photo character and wardrobe workbench.
import {normalize3DAvatar,DEFAULT_3D_AVATAR,SKIN_PALETTE,EYE_PALETTE,HAIR_PALETTE,HAIR_STYLES,FACE_SHAPES,BODY_PRESETS,avatar3DSelections,owned3DOutfit,RENDERER_NOTE} from './avatar3d-core.js';
import {confirmedGarments} from './avatar-core.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const opts=(values,value)=>values.map(v=>'<option value="'+esc(v)+'"'+(v===value?' selected':'')+'>'+esc(v)+'</option>').join('');
function select(label,key,choices,value){
 return '<label class="v31-field"><span>'+esc(label)+'</span><select name="'+esc(key)+'">'+opts(choices,value)+'</select></label>';
}
function slider(label,key,value,helper=''){
 return '<label class="avatar3d-slider"><span><strong>'+esc(label)+'</strong><b data-slider-output="'+key+'">'+value+'</b></span><input aria-label="'+esc(label)+'" type="range" min="'+(key==='height'?25:key==='smile'?0:key==='eyeSize'||key==='nose'||key==='jaw'?20:15)+'" max="'+(key==='height'?175:key==='smile'?100:key==='eyeSize'||key==='nose'||key==='jaw'?80:90)+'" name="'+key+'" value="'+value+'">'+(helper?'<small>'+esc(helper)+'</small>':'')+'</label>';
}
function garmentChoice(key,label,wardrobe,current){
 const garments=avatar3DSelections(wardrobe,key);
 return '<label class="v31-field"><span>'+esc(label)+'</span><select name="slot-'+key+'"><option value="">None selected</option>'+garments.map(g=>'<option value="'+esc(g.id)+'"'+(current?.id===g.id?' selected':'')+'>'+esc(g.name)+' · '+esc(g.color||'Color unspecified')+'</option>').join('')+'</select></label>';
}
export function avatar3DPage(state={}){
 const a=normalize3DAvatar(state.avatar3d||DEFAULT_3D_AVATAR);
 const wardrobe=confirmedGarments(state.wardrobe);
 const selected=owned3DOutfit(wardrobe,a);
 const owned=wardrobe.length;
 const saved=(state.looks||[]).map((l,i)=>({...l,originalIndex:i})).filter(l=>Array.isArray(l.garmentIds)&&l.garmentIds.some(id=>wardrobe.some(g=>g.id===id)));
 return '<section class="avatar3d-page v31-content"><div class="avatar3d-topline"><span class="v31-kicker">OTD / YOUR PRIVATE 3D AVATAR</span><span class="avatar3d-beta">LIVE 3D CHARACTER · BETA</span></div>'+
 '<div class="v31-heading"><h1>Meet the <em>other you.</em></h1></div><p class="v31-intro">Build a character with your own face, eyes, hair, skin tone and proportions—<strong>without submitting a selfie or any body photograph</strong>. Turn them all the way around and dress them from your confirmed closet. This is an interactive 3D styling character, not yet a scan-accurate digital twin or physical fitting engine.</p>'+
 '<div class="avatar3d-workspace"><div class="avatar3d-stage-wrap"><div class="avatar3d-badge"><span>✦ <strong>OTD / AVATAR STUDIO</strong></span><span>360° INTERACTIVE</span></div>'+
 '<div id="otd-3d-stage" class="avatar3d-stage"><div class="avatar3d-loading" id="avatar3d-loading"><div class="avatar3d-loading-symbol">OTD</div><p>Preparing your character...</p><small>A modern browser and internet connection are needed for the 3D engine.</small></div></div>'+
 '<div class="avatar3d-stage-actions"><button data-action="3d-left" aria-label="Turn avatar left">↶ ROTATE</button><button data-action="3d-spin" aria-label="Toggle automatic turn">'+(a.spin?'⏸ PAUSE SPIN':'▶ AUTO SPIN')+'</button><button data-action="3d-right" aria-label="Turn avatar right">ROTATE ↷</button><button data-action="3d-near" aria-label="Zoom in">＋</button><button data-action="3d-far" aria-label="Zoom out">－</button></div>'+
 '<div class="avatar3d-stage-footer"><span>ONE AVATAR · ALL YOUR LOOKS</span><span>Drag to rotate · arrows to turn</span></div>'+
 '<div class="avatar3d-stage-disclaimer">Procedural 3D visualization · Does not guarantee garment fit, exact fabric or your appearance.</div></div>'+
 '<div class="avatar3d-sidebar"><div class="avatar3d-status"><strong>YOUR DIGITAL CHARACTER</strong><p>Everything can be changed later. Start with your own preferences, not a prescribed appearance.</p></div>'+
 '<form id="avatar3d-form"><details class="avatar3d-accordion" open><summary><span>01</span> Face &amp; identity <b>⌄</b></summary><div class="avatar3d-accordion-body"><div class="v31-form-grid">'+
 select('Skin tone · your choice','skin',Object.keys(SKIN_PALETTE),a.skin)+select('Face shape','face',FACE_SHAPES,a.face)+
 select('Eye color','eyes',Object.keys(EYE_PALETTE),a.eyes)+select('Hairstyle','hairStyle',HAIR_STYLES,a.hairStyle)+
 select('Hair color','hairColor',Object.keys(HAIR_PALETTE),a.hairColor)+'</div>'+
 slider('Eye size','eyeSize',a.eyeSize)+slider('Nose profile','nose',a.nose)+slider('Jaw definition','jaw',a.jaw)+slider('Expression','smile',a.smile)+
 '<p class="avatar3d-small">All appearance choices are voluntary. OTD does not infer ethnicity, gender or attractiveness.</p></div></details>'+
 '<details class="avatar3d-accordion"><summary><span>02</span> Body &amp; posture <b>⌄</b></summary><div class="avatar3d-accordion-body"><div class="v31-form-grid">'+
 select('Proportion starting point','body',BODY_PRESETS,a.body)+select('Pose','pose',['Natural','Relaxed','Runway'],a.pose)+'</div>'+
 slider('Character height','height',a.height,'Artistic scale, not height in centimeters.')+
 slider('Shoulder proportion','shoulders',a.shoulders)+slider('Waist proportion','waist',a.waist)+slider('Hip proportion','hips',a.hips)+
 '<p class="avatar3d-small">Body controls change a model silhouette only. There are no body scores, weight judgments or size recommendations.</p></div></details>'+
 '<details class="avatar3d-accordion" open><summary><span>03</span> Dress the avatar <b>⌄</b></summary><div class="avatar3d-accordion-body"><p class="avatar3d-small">Your actual closet pieces are identified by ID. This beta maps category and basic colors onto the character; it does not scan their real cut or fabric.</p>'+
 garmentChoice('full','Dress / saree / lehenga',wardrobe,selected.slots.full)+
 garmentChoice('top','Top / shirt / kurti',wardrobe,selected.slots.top)+
 garmentChoice('bottom','Bottom / trousers / skirt',wardrobe,selected.slots.bottom)+
 garmentChoice('layer','Jacket / layer',wardrobe,selected.slots.layer)+
 garmentChoice('shoes','Footwear',wardrobe,selected.slots.shoes)+
 garmentChoice('accessory','Accessory / dupatta',wardrobe,selected.slots.accessory)+
 '<p class="avatar3d-small">Choosing a full-body garment replaces separate tops and bottoms on the avatar.</p>'+
 (owned?'<button class="v31-primary avatar3d-action" type="button" data-action="3d-style-me">✧ STYLE MY AVATAR FROM MY CLOSET</button>':'<div class="v31-notice">Start with a neutral 3D base outfit, or add clothing to your Closet to dress your character. The base outfit is not claimed as something you own.</div><button type="button" class="v31-primary avatar3d-action" data-action="v31-sample-closet">LOAD FICTIONAL DEMO CLOSET</button>')+
 (saved.length?'<div class="avatar3d-saved"><strong>YOUR SAVED OUTFITS</strong>'+saved.slice(0,7).map((l,i)=>'<button type="button" data-action="3d-saved:'+esc(l.id||l.originalIndex)+'">LOOK '+(i+1)+' → '+esc(l.garmentIds.map(id=>wardrobe.find(g=>g.id===id)?.name).filter(Boolean).join(' + ').slice(0,77))+'</button>').join('')+'</div>':'')+
 '</div></details></form>'+
 '<div class="avatar3d-extra"><button class="v31-primary" data-action="3d-capture">SAVE 3D PREVIEW ↓</button><button class="v31-secondary" data-action="3d-reset">RESET CHARACTER</button></div>'+
 '<div class="avatar3d-small">Changes save in this device browser only. 3D rendering requires an internet connection. <button type="button" data-action="nav:avatar" class="avatar3d-textlink">Use simplified 2D version</button>.</div></div></div>'+
 '<div class="avatar3d-roadmap"><div><p class="v31-kicker">WHAT WE ARE BUILDING TOWARD</p><h2>From expressive avatar to faithful virtual wardrobe.</h2><p>'+esc('This first interactive 3D model is fully code-driven, with a custom face and outfit geometry. To make individual garments look and fit like the real items, OTD will still need licensed production-quality 3D assets, garment reconstruction, rigging, size data, cloth simulation and measured testing on diverse bodies and Indian plus Western clothing.')+'</p></div><div class="avatar3d-roadmap-steps"><span>✓ No-photo, customizable 3D face and body</span><span>✓ Turn 360° and preview confirmed closet categories</span><span>◌ High-fidelity sculpted character assets</span><span>◌ Garment reconstruction and real cloth simulation</span><span>◌ Fit validation with physical measurements</span></div></div></section>';
}
