// OTD v3.1 wardrobe-first, deterministic recommendation engine.
// No external AI service is invoked; only user-confirmed owned garments are used.
const family=c=>({Shirt:'Top',Tshirt:'Top',Kurta:'Top',Kurti:'Top',Blouse:'Top',Jacket:'Layer',Sweater:'Layer',Jeans:'Bottom',Trousers:'Bottom',Skirt:'Bottom',Leggings:'Bottom',Shoes:'Shoes',Sandals:'Shoes',Saree:'Full body',Dress:'Full body',Lehenga:'Full body',Accessory:'Accessory',Dupatta:'Accessory'}[c]||c);
import {eligibleOwnedGarment,annotateCandidate} from './wardrobe-integrity.js';
const valid=eligibleOwnedGarment;
export function rankOwnedOutfits(wardrobe,ctx={}){
 const items=(Array.isArray(wardrobe)?wardrobe:[]).filter(valid).filter(g=>!ctx.excludeRecentlyWorn||!g.lastWorn||Date.now()-new Date(g.lastWorn).getTime()>6*86400000);
 if(!items.length)return {looks:[],notice:'Add and confirm a garment in your closet to start. OTD will not invent clothes you do not own.'};
 const occasion=ctx.occasion||'Casual',mood=ctx.mood||'Comfortable',style=ctx.style||'Minimal',weather=ctx.weather||'Not provided',preferred=ctx.color||'Any';
 const score=g=>(Array.isArray(g.occasions)&&g.occasions.includes(occasion)?25:0)+(g.style===style?20:0)+(preferred!=='Any'&&g.color===preferred?15:0)+(weather==='Hot'&&['Cotton','Linen'].includes(g.material)?15:0)+(weather==='Cold'&&['Wool','Denim'].includes(g.material)?15:0)+(mood==='Comfortable'&&['Relaxed','Regular'].includes(g.fit)?15:0);
 const arr=items.map(g=>({...g,_family:family(g.category),_score:score(g)}));
 const sorted=type=>arr.filter(g=>g._family===type).sort((a,b)=>b._score-a._score);
 const tops=sorted('Top'),bottoms=sorted('Bottom'),full=sorted('Full body'),footwear=sorted('Shoes'),layers=sorted('Layer'),accessories=sorted('Accessory');
 const combinations=[];
 for(const item of full.slice(0,3)){const chosen=[item,footwear[0],accessories[0]].filter(Boolean);combinations.push(chosen)}
 for(const top of tops.slice(0,3))for(const bottom of bottoms.slice(0,3)){const chosen=[top,bottom,footwear[0],...(weather==='Cold'&&layers.length?[layers[0]]:[]),accessories[0]].filter(Boolean);combinations.push(chosen)}
 if(!combinations.length){const partial=[tops[0]||bottoms[0]||footwear[0]||layers[0]||accessories[0]].filter(Boolean);if(partial.length)combinations.push(partial)}
 const seen=new Set();const looks=combinations.filter(parts=>{const k=parts.map(x=>x.id).sort().join('|');if(seen.has(k))return false;seen.add(k);return true}).map(parts=>{
  const familySet=new Set(parts.map(x=>x._family));const hasBody=familySet.has('Full body')||(familySet.has('Top')&&familySet.has('Bottom'));
  const missingSlots=[];if(!hasBody){if(!familySet.has('Top')&&!familySet.has('Full body'))missingSlots.push('top');if(!familySet.has('Bottom')&&!familySet.has('Full body'))missingSlots.push('bottom');}
  if(!familySet.has('Shoes'))missingSlots.push('footwear');
  return annotateCandidate({garmentIds:parts.map(x=>x.id),complete:missingSlots.length===0,missingSlots,
   score:parts.reduce((total,x)=>total+x._score,0),reason:'From your confirmed closet, for '+occasion.toLowerCase()+' and a '+mood.toLowerCase()+' mood. '+(weather==='Not provided'?'Weather not verified.':'Weather entered manually: '+weather+'.'),
   missing:missingSlots.length?'Complete the look: missing '+missingSlots.join(', ')+'.':''},items);
 }).sort((a,b)=>Number(b.complete)-Number(a.complete)||b.score-a.score).slice(0,3);
 const message=looks.some(x=>x.complete)?'Recommendations use only confirmed wardrobe entries.':'A partial look is available. Add more garments for complete outfits.';
 return {looks,notice:message+(items.some(g=>g.demo)?' Fictional sample pieces are included for demonstration, not verified customer ownership.':'')};
}
export function validateGarment(g){
 const errors=[];if(!String(g.name||'').trim()||String(g.name).length>80)errors.push('Name must be 1–80 characters');
 if(!String(g.category||'').trim())errors.push('Category is required');
 if(!String(g.color||'').trim())errors.push('Color is required');
 return errors;
}
export function modelStatus(){return {technology:'rule-based wardrobe-first prototype',trainedVision:false,segmentation:false,weatherLive:false,ownershipVerification:'confirmed local input only'};}
