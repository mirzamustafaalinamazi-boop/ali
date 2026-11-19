// OTD Photo Styling Board: local manual photo collage, NOT real virtual try-on.
// Never upload photo data, estimate measurements or infer body characteristics.
export const ACCEPTED_TYPES=Object.freeze(['image/jpeg','image/png','image/webp']);
export function validatePhotoFile(file,maxMB=12){
 if(!file||!ACCEPTED_TYPES.includes(file.type))return 'Please choose a JPG, PNG or WebP image.';
 if(!Number.isFinite(file.size)||file.size<=0||file.size>maxMB*1024*1024)return 'Image must be smaller than '+maxMB+' MB.';
 return '';
}
export function clamp(number,min,max){const n=Number(number);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;}
export function cleanLayer(input={}){
 return {x:clamp(input.x??50,0,100),y:clamp(input.y??45,0,100),width:clamp(input.width??50,8,125),opacity:clamp(input.opacity??1,.2,1)};
}
export function placeLayerAt(localX,localY,rect){
 return {x:clamp(100*localX/Math.max(1,rect.width),0,100),y:clamp(100*localY/Math.max(1,rect.height),0,100)};
}
export function calculateImageContain(iw,ih,tw,th){
 const scale=Math.min(tw/Math.max(1,iw),th/Math.max(1,ih));
 const w=iw*scale,h=ih*scale;
 return {x:(tw-w)/2,y:(th-h)/2,width:w,height:h};
}
