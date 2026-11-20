// Stock Action retail upgrade: isolated, testable browser-demo workflows.
// No real authorization, banking integration, or shared persistence is implied.
import {checkout, findByScan} from "./engine.js";
export const STYLE_OPTIONS=["minimal","editorial","classic"];
export function normalizeCode(raw){
  const s=String(raw??"").trim().replace(/^OTD:/i,"").toUpperCase();
  if(!/^[A-Z0-9_-]{3,40}$/.test(s))throw Error("Scan a valid OTD QR code, product barcode or SKU");
  return s;
}
export function paymentDraft(method,total,fields={}){
  if(!Number.isFinite(total)||total<0)throw Error("Invalid sale total");
  if(!["Cash","UPI","Card"].includes(method))throw Error("Unsupported payment method");
  const payment={method,amount:total,status:"operator-recorded",reference:"",collected:0,change:0};
  if(method==="Cash"){
    const tendered=Number(fields.tendered);
    if(!Number.isFinite(tendered)||tendered<total)throw Error("Cash received must cover the sale total");
    payment.collected=tendered;payment.change=+(tendered-total).toFixed(2);
    payment.status="cash-recorded";
  }else{
    const reference=String(fields.reference||"").trim();
    if(!/^[A-Za-z0-9/_.-]{4,60}$/.test(reference))throw Error(method+" needs an operator-entered bank/terminal transaction reference");
    payment.reference=reference;
    if(method==="Card"){
      const last4=String(fields.last4||"").trim();
      if(last4&&!/^\d{4}$/.test(last4))throw Error("Card last four digits must be four numbers");
      payment.last4=last4||"";
    }
    payment.status="unverified-reference";
  }
  return payment;
}
export function recordSale(state,lines,method,fields,reference,at){
  const amount=lines.reduce((sum,line)=>{
    const item=findByScan(state,normalizeCode(line.sku));
    if(!item)throw Error("Unknown item in cart");
    return sum+item.price*line.quantity;
  },0);
  const payment=paymentDraft(method,amount,fields);
  const result=checkout(state,lines,method,reference,at);
  result.payment=payment;
  return result;
}
export function ownerPublish(state,id,{photos,publicName,style,enabled}={},role){
  if(role!=="owner")throw Error("Only the owner can configure e-commerce publishing");
  const p=state.products.find(x=>x.id===id);if(!p)throw Error("Product not found");
  const incoming=photos===undefined?(p.photos||[]):photos;
  if(!Array.isArray(incoming)||incoming.length>3||incoming.some(x=>typeof x!=="string"||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x)||x.length>250000))throw Error("Upload up to three compressed JPEG/PNG/WebP product photos (max 250KB each)");
  if(style!==undefined&&!STYLE_OPTIONS.includes(style))throw Error("Invalid storefront layout");
  const name=String(publicName===undefined?(p.publicName||p.name):publicName).trim();
  if(!name||name.length>100)throw Error("Customer-facing product name is required (maximum 100 characters)");
  if(enabled===true&&incoming.length!==3)throw Error("Upload exactly three pictures before owner approval to publish");
  p.photos=incoming;p.publicName=name;p.listingStyle=style||p.listingStyle||"minimal";
  if(enabled!==undefined)p.published=Boolean(enabled);
  else p.published=false; // Saving an edited draft revokes approval until the owner republishes.
  p.ownerApprovedAt=p.published?new Date().toISOString():null;
  return p;
}
export function ecommerceFeed(state){
  return state.products.filter(p=>p.published&&p.qty>0&&Array.isArray(p.photos)&&p.photos.length===3)
    .map(p=>({sku:p.id,code:p.barcode||p.id,name:p.publicName||p.name,category:p.category,size:p.size,color:p.color,price:p.price,available:p.qty,photos:p.photos.slice(0,3),style:p.listingStyle||"minimal"}));
}
export function paymentQrUri({vpa,payee,amount,reference}){
  const address=String(vpa||"").trim();
  if(!/^[A-Za-z0-9._-]{2,120}@[A-Za-z0-9._-]{2,60}$/.test(address))throw Error("Owner must configure a valid merchant UPI ID");
  if(!Number.isFinite(Number(amount))||Number(amount)<=0)throw Error("Invalid payment amount");
  if(!/^[A-Za-z0-9_-]{4,80}$/.test(String(reference||"")))throw Error("Invalid payment reference");
  const p=new URLSearchParams({pa:address,pn:String(payee||"Stock Action merchant").slice(0,60),am:Number(amount).toFixed(2),cu:"INR",tr:reference});
  return "upi://pay?"+p.toString();
}

export function receiptQrPayload(sale){
 if(!/^POS-[A-Za-z0-9-]{5,80}$/.test(String(sale?.reference||"")))throw Error("Invalid receipt reference");
 return "OTD-SALE:"+sale.reference;
}
export function verifyLocalReceipt(state,raw){
 const code=String(raw||"").trim();
 if(!code.startsWith("OTD-SALE:"))return {found:false};
 const ref=code.slice("OTD-SALE:".length);
 const row=state.sales.find(x=>x.reference===ref);
 if(!row)return {found:false};
 return {found:true,receiptNo:row.receiptNo||row.reference,total:row.amount,method:row.method,paymentStatus:row.payment?.status||"demo-only"};
}
