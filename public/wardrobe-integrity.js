// OTD-APP-01 / P0 wardrobe reference integrity.
// Device-local prototype contracts only: NOT server authentication or row-level security.
export const OTD_SOURCE_WARDROBE='wardrobe';
export const OTD_SOURCE_COMMERCE='commerce';

export function eligibleOwnedGarment(g){
 return !!g && typeof g.id==='string' && g.id.trim().length>0
   && g.confirmed===true && g.deleted!==true && g.archived!==true;
}
export function getOwnedGarmentIds(wardrobe){
 return new Set((Array.isArray(wardrobe)?wardrobe:[]).filter(eligibleOwnedGarment).map(g=>g.id));
}
export function evaluateLook(look,wardrobe){
 const ids=getOwnedGarmentIds(wardrobe);
 const selected=Array.isArray(look?.garmentIds)?look.garmentIds.filter(x=>typeof x==='string'):[];
 const unavailable=[...new Set(selected.filter(id=>!ids.has(id)))];
 return {valid:selected.length>0 && unavailable.length===0,unavailable,needsReview:unavailable.length>0,
   empty:selected.length===0};
}
export function reconcileSavedLooks(looks,wardrobe){
 const safe=Array.isArray(looks)?looks:[];
 return safe.map(look=>{
   if(!look || typeof look!=='object')return look;
   if(!Array.isArray(look.garmentIds))return look; // preserve unrelated legacy mock-store looks
   const result=evaluateLook(look,wardrobe);
   return {...look,needsReview:result.needsReview,unavailableGarmentIds:result.unavailable,
     reviewReason:result.needsReview?'One or more owned garments were removed or are no longer confirmed.':''};
 });
}
export function annotateCandidate(look,wardrobe){
 const current=getOwnedGarmentIds(wardrobe);
 const ids=Array.isArray(look?.garmentIds)?look.garmentIds.filter(id=>typeof id==='string'&&current.has(id)):[];
 const byId=new Map((Array.isArray(wardrobe)?wardrobe:[]).filter(eligibleOwnedGarment).map(g=>[g.id,g]));
 return {...look,garmentIds:ids,items:ids.map(id=>({
  source:OTD_SOURCE_WARDROBE,stable_id:id,wardrobeItemId:id,
  explanation:byId.get(id)?.demo?'Clearly fictional wardrobe sample, for investor demonstration only':'Confirmed by user in the current device-local wardrobe',
  provenance:byId.get(id)?.demo?'fictional-demo-sample':'user-reviewed-local'
 }))};
}
export function exportDemoUserData(state,createdAt=new Date().toISOString()){
 // Deliberately contains photos encoded in wardrobe records. User-triggered download only.
 // Never call analytics/network/AI with this export.
 return {format:'OTD-LOCAL-DEMO-EXPORT',version:1,createdAt,
  storageScope:'this browser only - not a cloud account',
  privacyNotice:'May contain personal garment photos. Store this exported file securely.',
  wardrobe:Array.isArray(state?.wardrobe)?state.wardrobe:[],
  looks:Array.isArray(state?.looks)?state.looks:[],
  plan:Array.isArray(state?.plan)?state.plan:[],
  dna:state?.dna??{},
  avatar:state?.avatar??{},
  avatar3d:state?.avatar3d??{},
  favorites:Array.isArray(state?.favorites)?state.favorites:[]
 };
}
