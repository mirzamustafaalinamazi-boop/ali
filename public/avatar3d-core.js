// OTD 3D Avatar: independently authored parametric geometry parameters.
// Beta: visual approximate garment silhouettes. Not a body scan or fit prediction.
import {confirmedGarments,resolveAvatarOutfit} from './avatar-core.js';
export const SKIN_PALETTE=Object.freeze({
 'Porcelain':'#f5d8c4','Light warm':'#e9bd9d','Golden':'#d7a17b',
 'Olive':'#b88b65','Medium':'#b27b57','Warm brown':'#9d6847',
 'Deep brown':'#805336','Dark':'#603f2c','Ebony':'#422a21'
});
export const EYE_PALETTE=Object.freeze({Brown:'#68422b',Hazel:'#87764b',Green:'#567b65',Blue:'#557e9e',Gray:'#6c7379',Dark:'#292827'});
export const HAIR_PALETTE=Object.freeze({Black:'#171412',Espresso:'#2f211d',Chestnut:'#6e422a',Auburn:'#954c34',Gold:'#b99254',Silver:'#a9a6a3',White:'#e0ded7',Rose:'#a56b80'});
export const HAIR_STYLES=Object.freeze(['Short','Layered','Wavy','Long','Curly','Buzz','Bun','Ponytail','Bald']);
export const FACE_SHAPES=Object.freeze(['Oval','Round','Angular','Heart']);
export const BODY_PRESETS=Object.freeze(['Classic','Soft','Athletic','Relaxed']);
export const DEFAULT_3D_AVATAR=Object.freeze({
 skin:'Medium',eyes:'Brown',hairColor:'Espresso',hairStyle:'Layered',face:'Oval',
 body:'Classic',height:100,shoulders:50,waist:50,hips:50,
 eyeSize:50,nose:50,jaw:50,smile:35,pose:'Natural',spin:true,selectedGarmentIds:[]
});
const bound=(value,min,max,fallback)=>{const n=Number(value);return Number.isFinite(n)?Math.round(Math.min(max,Math.max(min,n))):fallback;};
const pick=(value,allowed,fallback)=>allowed.includes(value)?value:fallback;
export function normalize3DAvatar(data={}){
 const d=data&&typeof data==='object'?data:{};
 return {
  skin:pick(d.skin,Object.keys(SKIN_PALETTE),DEFAULT_3D_AVATAR.skin),
  eyes:pick(d.eyes,Object.keys(EYE_PALETTE),DEFAULT_3D_AVATAR.eyes),
  hairColor:pick(d.hairColor,Object.keys(HAIR_PALETTE),DEFAULT_3D_AVATAR.hairColor),
  hairStyle:pick(d.hairStyle,HAIR_STYLES,DEFAULT_3D_AVATAR.hairStyle),
  face:pick(d.face,FACE_SHAPES,DEFAULT_3D_AVATAR.face),
  body:pick(d.body,BODY_PRESETS,DEFAULT_3D_AVATAR.body),
  height:bound(d.height,25,175,100),
  shoulders:bound(d.shoulders,15,90,50),
  waist:bound(d.waist,15,90,50),
  hips:bound(d.hips,15,90,50),
  eyeSize:bound(d.eyeSize,20,80,50),
  nose:bound(d.nose,20,80,50),
  jaw:bound(d.jaw,20,80,50),
  smile:bound(d.smile,0,100,35),
  pose:pick(d.pose,['Natural','Relaxed','Runway'],DEFAULT_3D_AVATAR.pose),
  spin:d.spin!==false,
  selectedGarmentIds:Array.isArray(d.selectedGarmentIds)
    ?[...new Set(d.selectedGarmentIds.filter(x=>typeof x==='string'&&x.length<=120))].slice(0,10):[]
 };
}
export const RENDERER_NOTE='Interactive procedural 3D representation. Styling colors and category silhouettes are approximate; no garment scan, photorealistic body match, measurements or fit prediction.';
export function owned3DOutfit(wardrobe,config){
 const valid=confirmedGarments(wardrobe);
 const clean=normalize3DAvatar(config);
 const outfit=resolveAvatarOutfit(valid,clean.selectedGarmentIds);
 return {...outfit,selectedIds:outfit.garments.map(g=>g.id),unavailable:clean.selectedGarmentIds.filter(id=>!valid.some(g=>g.id===id))};
}
export function avatar3DSelections(wardrobe,slot){
 const mapping={full:['Saree','Dress','Lehenga','Full body'],top:['Shirt','Tshirt','Kurta','Kurti','Blouse','Top'],bottom:['Jeans','Trousers','Skirt','Leggings','Bottom'],layer:['Jacket','Sweater','Layer'],shoes:['Shoes','Sandals'],accessory:['Accessory','Dupatta']};
 const choices=mapping[slot]||[];
 return confirmedGarments(wardrobe).filter(g=>choices.includes(g.category));
}
