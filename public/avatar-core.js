// OTD Avatar Studio — illustrative 2D vector styling preview.
// Not photorealistic virtual try-on, 3D fitting, image inference or a body-measurement model.
// Only confirmed wardrobe IDs may be applied to the character.
export const AVATAR_DEFAULTS=Object.freeze({silhouette:'Classic',tone:'Medium',hair:'Waves',hairColor:'Espresso',view:'Front',selectedGarmentIds:[]});
export const TONES=Object.freeze({Porcelain:'#F6D7BE',Warm:'#DDA780',Medium:'#B97F60',Deep:'#895738',Ebony:'#513324'});
export const GARMENT_COLORS=Object.freeze({Black:'#27252B',White:'#F9F5EB',Cream:'#F0E5CF',Brown:'#765039',Beige:'#CAB399',Blue:'#527395',Green:'#63836E',Red:'#A4444D',Pink:'#C3879D',Gold:'#C29B59',Multi:'#B57D74',Other:'#8A7B68',Ink:'#27252B',Ivory:'#F1E8D7',Sand:'#D2B995',Rose:'#BF8298',Sage:'#789481'});
const HAIR_COLORS={Espresso:'#221915',Chestnut:'#70432E',Black:'#151211',Silver:'#A7A19B',Golden:'#B0824D'};
export const classifyGarment=category=>({Shirt:'top',Tshirt:'top',Kurta:'top',Kurti:'top',Blouse:'top',Top:'top',Jacket:'layer',Sweater:'layer',Layer:'layer',Jeans:'bottom',Trousers:'bottom',Skirt:'bottom',Leggings:'bottom',Bottom:'bottom',Shoes:'shoes',Sandals:'shoes',Saree:'full',Dress:'full',Lehenga:'full','Full body':'full',Accessory:'accessory',Dupatta:'accessory'}[category]||'accessory');
export function sanitizeAvatar(config={}){
 const value=(v,allowed,def)=>allowed.includes(v)?v:def;
 return {silhouette:value(config.silhouette,['Classic','Relaxed','Curve'],AVATAR_DEFAULTS.silhouette),tone:value(config.tone,Object.keys(TONES),AVATAR_DEFAULTS.tone),hair:value(config.hair,['Short','Waves','Bun','None'],AVATAR_DEFAULTS.hair),hairColor:value(config.hairColor,Object.keys(HAIR_COLORS),AVATAR_DEFAULTS.hairColor),view:value(config.view,['Front','Back'],AVATAR_DEFAULTS.view),selectedGarmentIds:Array.isArray(config.selectedGarmentIds)?[...new Set(config.selectedGarmentIds.filter(x=>typeof x==='string'))].slice(0,7):[]};
}
export function confirmedGarments(wardrobe){return(Array.isArray(wardrobe)?wardrobe:[]).filter(g=>g&&g.confirmed===true&&!g.deleted&&typeof g.id==='string');}
export function resolveAvatarOutfit(wardrobe,ids){
 const owned=confirmedGarments(wardrobe),wanted=new Set((Array.isArray(ids)?ids:[]).filter(x=>typeof x==='string'));
 const selected=owned.filter(g=>wanted.has(g.id));
 const slots={top:null,layer:null,bottom:null,shoes:null,full:null,accessory:null};
 for(const g of selected){const key=classifyGarment(g.category);if(!slots[key])slots[key]=g;}
 if(slots.full){slots.top=null;slots.bottom=null;}
 return {slots,garments:Object.values(slots).filter(Boolean),ignoredIds:[...wanted].filter(id=>!owned.some(g=>g.id===id)),partial:!slots.full&&(!slots.top||!slots.bottom)};
}
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function avatarSvg(config={},wardrobe=[],label='OTD · YOUR STYLE'){
 const a=sanitizeAvatar(config),resolved=resolveAvatarOutfit(wardrobe,a.selectedGarmentIds),s=resolved.slots;
 const tone=TONES[a.tone],hairColor=HAIR_COLORS[a.hairColor],color=g=>GARMENT_COLORS[g?.color]||GARMENT_COLORS.Other;
 const shoulder=a.silhouette==='Relaxed'?124:a.silhouette==='Curve'?127:134,waist=a.silhouette==='Curve'?139:145,hip=a.silhouette==='Curve'?123:132;
 const outline='#332723',side=a.view==='Back',g=(path,fill,stroke=outline,strokeWidth=2.6)=>'<path d="'+path+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+strokeWidth+'" stroke-linejoin="round"/>';
 const bg='<defs><linearGradient id="ground" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F6EEE3"/><stop offset="1" stop-color="#DEC9B2"/></linearGradient><linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient></defs><rect width="360" height="580" rx="28" fill="url(#ground)"/><circle cx="180" cy="218" r="145" fill="#FCF8EE" opacity=".5"/><circle cx="180" cy="216" r="122" fill="none" stroke="#BA9A78" stroke-dasharray="3 10" opacity=".42"/><ellipse cx="180" cy="535" rx="103" ry="12" fill="#785A47" opacity=".15"/>';
 const legs=g('M153 330L178 330L173 502L166 523L143 523L145 470Z',tone)+g('M182 330L205 330L215 515L191 523L183 500L181 383Z',tone);
 const torso=g('M165 142L196 142L207 163L'+(360-shoulder)+' 173L'+(360-waist)+' 304L'+(360-hip)+' 349L'+hip+' 349L'+waist+' 304L'+shoulder+' 173L153 162Z',tone);
 const arms=g('M'+shoulder+' 173L108 187L88 305Q85 325 102 327L117 303L141 233Z',tone)+g('M'+(360-shoulder)+' 173L252 187L272 305Q276 325 259 327L242 303L219 233Z',tone);
 const head='<ellipse cx="180" cy="101" rx="34" ry="44" fill="'+tone+'" stroke="'+outline+'" stroke-width="2.6"/><path d="M164 132L166 158L196 158L194 132Z" fill="'+tone+'" stroke="'+outline+'" stroke-width="2.6"/>';
 const face=side?'': '<path d="M165 100Q170 97 175 100M186 100Q191 97 197 100" fill="none" stroke="#583B2A" stroke-width="2" stroke-linecap="round"/><path d="M178 105L175 117Q180 120 185 117" fill="none" stroke="#9A654A" stroke-width="1.5"/><path d="M171 126Q180 130 189 126" fill="none" stroke="#9A5D55" stroke-width="2" stroke-linecap="round"/>';
 const hairBack=a.hair==='None'?'':a.hair==='Short'?'<path d="M144 91Q140 48 181 50Q217 52 218 94L206 78L194 75L179 80L162 77Z" fill="'+hairColor+'"/>':a.hair==='Bun'?'<circle cx="180" cy="47" r="24" fill="'+hairColor+'"/><path d="M144 91Q141 51 180 49Q219 51 218 91L203 73L162 74Z" fill="'+hairColor+'"/>':'<path d="M144 92Q137 53 178 51Q222 50 219 92L222 168Q206 181 191 159L204 82L153 82L161 159Q139 175 137 161Z" fill="'+hairColor+'"/>';
 const base='<g>'+legs+torso+arms+head+'</g>'+hairBack+face;
 const pants=s.bottom&& !s.full?(()=>{
  const f=color(s.bottom);if(['Skirt','Lehenga'].includes(s.bottom.category))return g('M'+waist+' 310L'+(360-waist)+' 310L270 485Q180 500 91 485Z',f);
  return g('M'+hip+' 307L'+(360-hip)+' 307L'+(360-hip+6)+' 515L186 515L181 353L176 515L'+(hip-7)+' 515Z',f);
 })():'';
 const top=s.top&&!s.full?(()=>{
  const f=color(s.top),isKurta=['Kurta','Kurti'].includes(s.top.category);
  const bottom=isKurta?425:320;
  return g('M'+shoulder+' 171L157 155L171 163Q180 179 190 163L202 155L'+(360-shoulder)+' 171L'+(360-shoulder+17)+' 234L'+(360-shoulder-7)+' 246L'+(360-waist)+' 215L'+(360-hip)+' '+bottom+'L'+hip+' '+bottom+'L'+waist+' 215L'+(shoulder+7)+' 246L'+(shoulder-17)+' 234Z',f)+(!side?'<path d="M171 165L180 186L189 165" stroke="#E8D5B6" fill="none" stroke-width="3"/>':'');
 })():'';
 const full=s.full?(()=>{
  const f=color(s.full);if(s.full.category==='Saree')return g('M132 170L166 152L192 166L222 166L235 224L218 335L270 484Q177 506 93 485L140 334Z',f)+g('M203 154L230 181L188 354L143 470L114 478L164 313Z','#E3C9AA','#997454',1.7);
  return g('M130 170L159 152L180 166L200 152L230 170L245 239L218 300L267 490Q179 518 93 490L141 300L114 238Z',f);
 })():'';
 const layer=s.layer?g('M'+(shoulder-8)+' 173L157 154L174 188L172 321L'+(waist-7)+' 338L'+(shoulder-12)+' 313L'+(shoulder-21)+' 240L105 303L95 295L'+(shoulder-12)+' 188Z',color(s.layer))+g('M'+(360-shoulder+8)+' 173L203 154L187 187L189 322L'+(360-waist+7)+' 338L'+(360-shoulder+12)+' 314L'+(360-shoulder+21)+' 239L255 303L265 295L'+(360-shoulder+12)+' 188Z',color(s.layer)):''; 
 const shoes=s.shoes?g('M145 503L174 503L178 528L136 532Q124 524 145 503Z',color(s.shoes))+g('M184 503L210 503L236 528L191 531Q184 521 184 503Z',color(s.shoes)):'';
 const accessory=s.accessory?('<circle cx="210" cy="208" r="9" fill="'+color(s.accessory)+'" stroke="#674D33" stroke-width="2"/><path d="M210 217L214 240" stroke="'+color(s.accessory)+'" stroke-width="6"/>'):'';
 const baseDecor='<text x="20" y="33" fill="#6B4A2E" font-family="sans-serif" font-size="10" letter-spacing="2.4">OTD / AVATAR STUDIO</text><text x="180" y="555" text-anchor="middle" fill="#694B36" font-family="sans-serif" font-size="10" letter-spacing="1.8">'+xml(label.slice(0,36).toUpperCase())+'</text>';
 return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrative two-dimensional fashion avatar, not a virtual fitting simulation" viewBox="0 0 360 580">'+bg+base+pants+top+full+layer+shoes+accessory+baseDecor+'<rect x="14" y="48" rx="5" width="112" height="19" fill="#3A2418" opacity=".88"/><text x="70" y="61" font-family="sans-serif" text-anchor="middle" font-size="9" fill="#F9ECDD" letter-spacing=".7">2D STYLE PREVIEW</text></svg>';
}
