// OTD Photo Studio: realistic personal photograph with manual garment image placement.
// In-memory only. Uploaded photos are never sent to OTD or saved in browser storage.
import {validatePhotoFile,cleanLayer,placeLayerAt,calculateImageContain} from './photo-engine.js';
const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let session={person:null,layers:[],active:-1};
export function clearPhotoSession(){session={person:null,layers:[],active:-1};}
let mounted=false,renderUI=()=>{},getState=()=>({});
const asUrl=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('The image could not be read.'));reader.readAsDataURL(file)});
const layerUI=(layer,index)=>'<img class="photo-garment-layer '+(index===session.active?'is-active':'')+'" src="'+safe(layer.src)+'" alt="'+safe(layer.name)+' overlay — drag to place" data-photo-layer="'+index+'" draggable="false" style="left:'+layer.x+'%;top:'+layer.y+'%;width:'+layer.width+'%;opacity:'+layer.opacity+'">';
const selectWardrobe=state=>{const images=(state.wardrobe||[]).filter(g=>g?.confirmed&&typeof g.photo==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(g.photo));return '<label class="v31-field"><span>Use a photographed closet item</span><select id="photo-closet-picker"><option value="">Select a garment with a photo...</option>'+images.map(g=>'<option value="'+safe(g.id)+'">'+safe(g.name)+' · '+safe(g.color)+'</option>').join('')+'</select></label>'+(images.length?'':'<p class="v31-footnote">Your closet has no confirmed garment photos yet. You can upload a transparent garment image below or add a garment in Closet.</p>');};
export function photoPage(state={}){
 const active=session.layers[session.active];
 return '<section class="v31-content photo-preview-page"><p class="v31-kicker">OTD / PERSONAL PHOTO STYLING EXPERIMENT</p><div class="v31-heading"><h1>See your own <em>style story.</em></h1></div>'+
 '<p class="v31-intro">Use a photograph you choose and arrange actual clothing cutout images over it. This gives you a <strong>photo-based styling collage</strong> rather than a generic illustrated avatar. It does <strong>not</strong> automatically fit garments, change body shape, predict size or reproduce realistic fabric physics.</p>'+
 '<div class="photo-privacy-banner"><strong>PRIVATE BY DESIGN</strong><span>Photos stay in this open browser tab. Nothing is sent to our servers. Closing or refreshing clears this photo preview.</span></div>'+
 '<div class="photo-layout"><section class="photo-stage-wrap"><div class="photo-stage-toolbar"><span>PERSONAL PHOTO PREVIEW</span><span>'+(session.person?'LOCAL ONLY':'UPLOAD TO BEGIN')+'</span></div><div class="photo-stage" id="photo-stage" aria-label="Interactive local photo styling preview">'+
 (session.person?'<img class="photo-person-image" src="'+safe(session.person)+'" alt="Your chosen full-body photograph" draggable="false">':'<div class="photo-stage-empty"><div class="photo-empty-mark">OTD</div><h2>You decide how to appear.</h2><p>Choose a full-length photograph in the controls to start a realistic personal photo preview.</p><span>No account · No upload to cloud · No body scoring</span></div>')+
 session.layers.map(layerUI).join('')+'</div><div class="photo-stage-bottom"><span>'+session.layers.length+' garment image'+(session.layers.length===1?'':'s')+'</span><span>MANUAL COLLAGE · NOT REAL VIRTUAL TRY-ON</span></div></section>'+
 '<div class="photo-controls"><section class="v31-panel"><p class="v31-kicker">01 / YOUR PHOTO</p><h2>Look like yourself.</h2><label class="v31-field"><span>Choose your photo (JPG / PNG / WebP, max 12 MB)</span><input id="photo-person-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="v31-footnote">Any appearance, gender expression, body shape or clothing style is welcome. This is your private picture; there is no beauty score or automated assessment.</p><div class="photo-divider"></div><p class="v31-kicker">02 / YOUR CLOTHES</p><h2>Add a garment image.</h2>'+
 selectWardrobe(state)+
 '<label class="v31-field"><span>Or add a garment cutout (PNG recommended)</span><input id="photo-garment-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="v31-footnote">For believable overlays, use a garment photo with its background removed. OTD does not automatically remove backgrounds or reconstruct how garments fit your body.</p></section>'+
 '<section class="v31-panel"><p class="v31-kicker">03 / MAKE IT YOURS</p><h2>Arrange your styling board.</h2>'+
 (active?'<label class="v31-field"><span>Selected garment</span><strong>'+safe(active.name)+'</strong></label><label class="v31-field"><span>Garment size in collage · '+active.width+'%</span><input id="photo-layer-size" type="range" min="8" max="125" value="'+active.width+'"></label><label class="v31-field"><span>Opacity · '+Math.round(active.opacity*100)+'%</span><input id="photo-layer-opacity" type="range" min="20" max="100" value="'+Math.round(active.opacity*100)+'"></label><p class="v31-footnote">Drag the selected garment directly on the photo to position it. Tap a garment to select it.</p><button class="v31-secondary" data-photo-action="remove">REMOVE SELECTED GARMENT</button>':'<div class="v31-notice">Add a garment image above to enable drag, size and opacity adjustments.</div>')+
 '<div class="photo-layer-list">'+session.layers.map((l,i)=>'<button class="photo-layer-choice '+(i===session.active?'active':'')+'" data-photo-action="select" data-photo-index="'+i+'"><span>'+safe(l.name)+'</span><span>EDIT →</span></button>').join('')+'</div><div class="photo-divider"></div>'+
 '<button class="v31-primary" data-photo-action="export" '+(!session.person?'disabled':'')+'>SAVE PRIVATE PHOTO COLLAGE ↓</button> <button class="v31-secondary" data-photo-action="clear">CLEAR ALL PHOTOS</button><p class="v31-footnote">The saved image includes a manual-preview label so it cannot be mistaken for an AI-generated fit prediction.</p></section></div></div>'+
 '<div class="photo-future-note"><p class="v31-kicker">OTD / DEVELOPMENT ROADMAP</p><h2>Realism without false promises.</h2><p>Our next major milestone is garment segmentation and consent-based image-to-image virtual try-on, benchmarked on diverse faces, body types, poses and Indian plus Western fashion. Those features require specialist ML infrastructure and real testing. This version is a local photo styling tool with manual overlays.</p><button class="v31-secondary" data-action="nav:avatar">BACK TO 2D AVATAR STUDIO →</button></div></section>';
}
async function imageFromSrc(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not decode an image for export'));im.src=src;});}
async function exportPhoto(){
 if(!session.person)throw Error('Choose your personal photo first.');
 const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1200;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#eee1d0';ctx.fillRect(0,0,canvas.width,canvas.height);
 const userImage=await imageFromSrc(session.person),bg=calculateImageContain(userImage.naturalWidth,userImage.naturalHeight,canvas.width,canvas.height);ctx.drawImage(userImage,bg.x,bg.y,bg.width,bg.height);
 for(const layer of session.layers){const im=await imageFromSrc(layer.src);const w=canvas.width*(layer.width/100);const h=w*im.naturalHeight/Math.max(1,im.naturalWidth);ctx.globalAlpha=layer.opacity;ctx.drawImage(im,(layer.x/100)*canvas.width-w/2,(layer.y/100)*canvas.height-h/2,w,h);ctx.globalAlpha=1;}
 ctx.fillStyle='rgba(26,18,14,.75)';ctx.fillRect(0,1166,900,34);ctx.fillStyle='#fff8ee';ctx.font='15px sans-serif';ctx.fillText('OTD · MANUAL PHOTO STYLING COLLAGE · NOT A FIT PREDICTION',20,1189);
 const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='OTD-private-photo-styling.png';a.click();
}
export function installPhotoControls(update,stateGetter){
 if(mounted)return;mounted=true;renderUI=update;getState=stateGetter;
 const redraw=()=>{if(document.querySelector('#photo-stage'))renderUI();};
 const addLayer=(src,name)=>{const clean=cleanLayer({x:50,y:43,width:52,opacity:1});session.layers.push({src,name,...clean});session.active=session.layers.length-1;redraw();};
 document.addEventListener('change',async ev=>{
  const t=ev.target;if(!(t instanceof HTMLInputElement||t instanceof HTMLSelectElement))return;
  if(t.id==='photo-closet-picker'&&t.value){const garment=(getState().wardrobe||[]).find(g=>g.id===t.value&&g.confirmed&&typeof g.photo==='string');if(garment)addLayer(garment.photo,garment.name);return;}
  if(!['photo-person-upload','photo-garment-upload'].includes(t.id))return;
  const file=t.files?.[0];if(!file)return;
  const error=validatePhotoFile(file);if(error){alert(error);t.value='';return;}
  try{const data=await asUrl(file);if(t.id==='photo-person-upload'){session.person=data;redraw();}else addLayer(data,file.name.slice(0,55));}
  catch(err){alert(err.message||'Could not read the picture.');}finally{t.value='';}
 });
 document.addEventListener('input',e=>{
  const t=e.target;if(!t||session.active<0||!session.layers[session.active])return;
  const l=session.layers[session.active],img=document.querySelector('.photo-garment-layer.is-active');
  if(t.id==='photo-layer-size'){l.width=cleanLayer({width:t.value}).width;if(img)img.style.width=l.width+'%';const label=t.closest('.v31-field')?.querySelector('span');if(label)label.textContent='Garment size in collage · '+l.width+'%';}
  if(t.id==='photo-layer-opacity'){l.opacity=cleanLayer({opacity:Number(t.value)/100}).opacity;if(img)img.style.opacity=l.opacity;const label=t.closest('.v31-field')?.querySelector('span');if(label)label.textContent='Opacity · '+Math.round(l.opacity*100)+'%';}
 });
 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-photo-action]');if(!b)return;
  const action=b.dataset.photoAction;
  if(action==='select'){session.active=Number(b.dataset.photoIndex);redraw();}
  else if(action==='remove'){if(session.active>=0){session.layers.splice(session.active,1);session.active=Math.min(session.active,session.layers.length-1);redraw();}}
  else if(action==='clear'){if(confirm('Clear your photo and all garment images from this tab?')){session={person:null,layers:[],active:-1};redraw();}}
  else if(action==='export'){try{await exportPhoto()}catch(err){alert(err.message||'Photo export failed.');}}
 });
 let drag=null;document.addEventListener('pointerdown',e=>{
  const target=e.target.closest('[data-photo-layer]');if(!target)return;
  const stage=document.getElementById('photo-stage');if(!stage)return;
  const n=Number(target.dataset.photoLayer);if(!session.layers[n])return;
  session.active=n;drag={pointerId:e.pointerId,index:n,stage};stage.setPointerCapture?.(e.pointerId);e.preventDefault();
  stage.querySelectorAll('[data-photo-layer]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.photoLayer)===n));
 });
 document.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  const rect=drag.stage.getBoundingClientRect(),pos=placeLayerAt(e.clientX-rect.left,e.clientY-rect.top,rect);
  Object.assign(session.layers[drag.index],pos);
  const el=drag.stage.querySelector('[data-photo-layer="'+drag.index+'"]');if(el){el.style.left=pos.x+'%';el.style.top=pos.y+'%';}
 });
 const done=e=>{if(drag&&e.pointerId===drag.pointerId){drag=null;redraw();}};
 document.addEventListener('pointerup',done);document.addEventListener('pointercancel',done);
}
