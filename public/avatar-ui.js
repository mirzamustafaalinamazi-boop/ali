// OTD 2D styling avatar interface — illustrative only.
import {AVATAR_DEFAULTS,TONES,confirmedGarments,classifyGarment,resolveAvatarOutfit,sanitizeAvatar,avatarSvg} from './avatar-core.js';
const h=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const options=(choices,current)=>choices.map(v=>'<option value="'+h(v)+'" '+(v===current?'selected':'')+'>'+h(v)+'</option>').join('');
const TYPES=[['full','Full-body / traditional'],['top','Top / kurta'],['bottom','Bottom'],['layer','Outer layer'],['shoes','Shoes'],['accessory','Accessory / dupatta']];
function slotsInput(key,label,owned,resolved){
 const choices=owned.filter(g=>classifyGarment(g.category)===key);
 const current=resolved.slots[key]?.id||'';
 return '<label class="v31-field"><span>'+h(label)+'</span><select name="slot-'+key+'" '+(!choices.length?'disabled':'')+'><option value="">'+(!choices.length?'No confirmed pieces yet':'None selected')+'</option>'+choices.map(g=>'<option value="'+h(g.id)+'" '+(g.id===current?'selected':'')+'>'+h(g.name)+' · '+h(g.color)+'</option>').join('')+'</select></label>';
}
export function avatarPage(state={}){
 const config=sanitizeAvatar(state.avatar||AVATAR_DEFAULTS);
 const owned=confirmedGarments(state.wardrobe);
 const outfit=resolveAvatarOutfit(owned,config.selectedGarmentIds);
 const outfits=(state.looks||[]).filter(l=>Array.isArray(l.garmentIds)&&l.garmentIds.some(id=>owned.some(g=>g.id===id)));
 const sample=owned.filter(g=>g.demo).length;
 return '<section class="v31-content avatar-page"><div class="v31-kicker">OTD / FUTURE EXPERIENCE · INTERACTIVE PROTOTYPE</div><div class="v31-heading"><h1>Your look. <em>Your avatar.</em></h1></div><p class="v31-intro">Experiment with the clothes you own on a customizable <strong>2D illustrated fashion character</strong>. This is a visual styling board—not a photorealistic virtual try-on, 3D body scan, size recommendation or fit guarantee.</p>'+
 '<div class="avatar-layout"><section class="avatar-stage" aria-label="Fashion avatar visual preview"><div class="avatar-stage-top"><span>OTD · PERSONAL STYLE BOARD</span><span>'+h(config.view.toUpperCase())+' VIEW</span></div><div class="avatar-illustration">'+avatarSvg(config,owned,'Your style. Every place.')+'</div><div class="avatar-stage-bottom"><span>'+outfit.garments.length+' confirmed item(s) shown</span><span>'+(outfit.partial?'PARTIAL LOOK':'COMPLETE LOOK')+'</span></div></section>'+
 '<div class="avatar-tools"><section class="v31-panel"><div class="avatar-panel-title"><span class="v31-kicker">01 / CREATE YOUR AVATAR</span><h2>Make it yours.</h2></div><form id="avatar-form"><div class="v31-form-grid">'+
 '<label class="v31-field"><span>Illustration shape</span><select name="silhouette">'+options(['Classic','Relaxed','Curve'],config.silhouette)+'</select></label>'+
 '<label class="v31-field"><span>Skin tone (chosen, not inferred)</span><select name="tone">'+options(Object.keys(TONES),config.tone)+'</select></label>'+
 '<label class="v31-field"><span>Hair</span><select name="hair">'+options(['Short','Waves','Bun','None'],config.hair)+'</select></label>'+
 '<label class="v31-field"><span>Hair color</span><select name="hairColor">'+options(['Espresso','Chestnut','Black','Silver','Golden'],config.hairColor)+'</select></label></div>'+
 '<label class="v31-field"><span>Preview orientation</span><select name="view">'+options(['Front','Back'],config.view)+'</select></label>'+
 '<p class="v31-footnote">These choices adjust an illustration, not precise body measurements.</p><div class="avatar-divider"></div><p class="v31-kicker">02 / DRESS YOUR AVATAR</p><h2>From your closet.</h2>'+
 TYPES.map(([key,label])=>slotsInput(key,label,owned,outfit)).join('')+'<button type="submit" class="v31-primary avatar-apply">APPLY OUTFIT TO AVATAR ↗</button></form></section>'+
 '<section class="v31-panel avatar-shortcuts"><p class="v31-kicker">03 / STYLE REVISIONS</p><h2>Use a saved look.</h2>'+
 (outfits.length?'<div class="avatar-saved-list">'+outfits.map((l,i)=>'<button class="avatar-saved-choice" data-action="avatar-saved:'+h(l.id||i)+'"><strong>LOOK '+String(i+1).padStart(2,'0')+'</strong><span>'+h(l.garmentIds.map(id=>owned.find(g=>g.id===id)?.name).filter(Boolean).join(' + '))+'</span><span>TRY THIS LOOK →</span></button>').join('')+'</div>':'<p class="v31-intro">No saved closet outfits yet. Generate a look in Style, save it, and preview the result here.</p><button class="v31-secondary" data-action="nav:style">GO TO STYLIST →</button>')+
 (!owned.length?'<div class="v31-notice">No confirmed garments. Add your own clothes first, or load the clearly labeled fictional sample closet for an investor demonstration.</div><button class="v31-secondary" data-action="v31-sample-closet">LOAD SAMPLE WARDROBE</button>':'')+
 (sample?'<p class="v31-footnote">Some clothing pieces are fictional samples—not verified owned items.</p>':'')+
 '<div class="avatar-divider"></div><button class="v31-secondary" data-action="avatar-export-svg">SAVE ILLUSTRATION AS SVG ↓</button> <button class="v31-secondary" data-action="avatar-reset">RESET AVATAR</button></section></div></div>'+
 '<div class="photo-mode-invite"><div><p class="v31-kicker">NEW · REAL PHOTO STYLING</p><h2>Prefer seeing yourself, not an illustration?</h2><p>Use your own photo with manually placed clothing cutouts. Private to your browser, with no body scoring or automatic size judgments.</p></div><button class="v31-primary" data-action="nav:photo">OPEN PHOTO STUDIO ↗</button></div><div class="avatar-future-note"><div><p class="v31-kicker">FUTURE PRODUCT · NOT YET BUILT</p><h2>Beyond the illustration.</h2><p>Photo-based garment recognition, precise 3D avatars, cloth draping, size estimation and physically realistic fitting require dedicated computer-vision systems, consent, protected storage and measured accuracy. This prototype does not provide those functions.</p></div><div class="avatar-roadmap"><span>✓ Configurable 2D illustration</span><span>✓ Confirmed-wardrobe colors</span><span>◌ Photo garment extraction</span><span>◌ 3D fitting and cloth physics</span></div></div></section>';
}
