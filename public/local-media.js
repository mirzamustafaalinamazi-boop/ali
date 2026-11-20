// OTD-APP-01 / local demo photo processing, without any network upload.
// Decoding and re-encoding onto a fresh canvas removes source EXIF/metadata.
// This is not a substitute for audited private media storage, moderation or virus scanning.
export const ALLOWED_IMAGE_TYPES=Object.freeze(['image/jpeg','image/png','image/webp']);
export function validateLocalPhoto(file){
 if(!file||!ALLOWED_IMAGE_TYPES.includes(file.type))return 'Choose a JPG, PNG or WebP garment photo.';
 if(!Number.isSafeInteger(file.size)||file.size<1||file.size>8*1024*1024)return 'The garment photo must be smaller than 8 MB.';
 return '';
}
export function scaledImageDimensions(width,height,maxEdge=1100){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('Image dimensions are invalid');
 const scale=Math.min(1,maxEdge/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export async function normalizeLocalGarmentImage(file){
 const validation=validateLocalPhoto(file);
 if(validation)throw new Error(validation);
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('The image cannot be decoded.'));img.src=url;});
  const size=scaledImageDimensions(img.naturalWidth,img.naturalHeight);
  const canvas=document.createElement('canvas');
  canvas.width=size.width;canvas.height=size.height;
  const context=canvas.getContext('2d');
  if(!context)throw new Error('Image conversion is not supported by this browser.');
  context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(img,0,0,size.width,size.height);
  const data=canvas.toDataURL('image/jpeg',.77);
  if(!data.startsWith('data:image/jpeg;base64,'))throw new Error('The photo could not be safely converted.');
  if(data.length>1500000)throw new Error('This photo exceeds available local demo storage. Try a smaller image.');
  return data;
 }finally{URL.revokeObjectURL(url);}
}
