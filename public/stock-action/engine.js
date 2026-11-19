export const seed = [
{id:"SA-101-M",name:"Oxford Shirt",category:"Shirts",size:"M",color:"White",qty:3,reorder:3,cost:650,price:1299,published:false},
{id:"SA-101-L",name:"Oxford Shirt",category:"Shirts",size:"L",color:"White",qty:7,reorder:3,cost:650,price:1299,published:true},
{id:"SA-204-34",name:"Straight Jeans",category:"Denim",size:"34",color:"Indigo",qty:0,reorder:2,cost:900,price:1899,published:true},
{id:"SA-108-XL",name:"Printed Kurta",category:"Ethnic",size:"XL",color:"Navy",qty:8,reorder:2,cost:800,price:1599,published:true},
{id:"SA-121-S",name:"Everyday Top",category:"Tops",size:"S",color:"Olive",qty:5,reorder:2,cost:420,price:899,published:true},
{id:"SA-225-32",name:"Tailored Trouser",category:"Bottoms",size:"32",color:"Beige",qty:4,reorder:2,cost:750,price:1499,published:false},
{id:"SA-301-M",name:"Utility Jacket",category:"Jackets",size:"M",color:"Black",qty:4,reorder:2,cost:1100,price:2499,published:true}
];
export const initialState=()=>({products:structuredClone(seed),moves:[],sales:[],counts:[],shop:"Sample Fashion Studio"});
export function sale(state,id,quantity,reference){const p=state.products.find(x=>x.id===id);if(!p)throw Error("SKU not found");if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error("Quantity must be a positive integer");if(p.qty<quantity)throw Error("Not enough stock");if(state.sales.some(s=>s.reference===reference))throw Error("Sale reference already used");p.qty-=quantity;const item={id:"sale-"+(state.sales.length+1),reference,sku:id,quantity,amount:p.price*quantity,date:new Date().toISOString()};state.sales.push(item);state.moves.push({type:"Sale",sku:id,delta:-quantity,date:item.date,reference});return item}
export function count(state,id,physical,note){const p=state.products.find(x=>x.id===id);if(!p)throw Error("SKU not found");if(!Number.isSafeInteger(physical)||physical<0)throw Error("Invalid physical count");const before=p.qty,delta=physical-before;p.qty=physical;const c={sku:id,before,physical,delta,note:String(note||"").slice(0,200),date:new Date().toISOString()};state.counts.push(c);if(delta)state.moves.push({type:"Count adjustment",sku:id,delta,date:c.date,note:c.note});return c}
export function receive(state,id,quantity){const p=state.products.find(x=>x.id===id);if(!p)throw Error("SKU not found");if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error("Invalid received quantity");p.qty+=quantity;state.moves.push({type:"Demo receipt",sku:id,delta:quantity,date:new Date().toISOString()})}
export function publish(state,id,value){const p=state.products.find(x=>x.id===id);if(!p)throw Error("SKU not found");p.published=Boolean(value)}
export function publicProducts(state){return state.products.filter(p=>p.published&&p.qty>0).map(p=>({id:p.id,name:p.name,category:p.category,size:p.size,color:p.color,price:p.price,available:p.qty}))}
export function metrics(s){return {skus:s.products.length,units:s.products.reduce((n,p)=>n+p.qty,0),low:s.products.filter(p=>p.qty<=p.reorder).length,value:s.products.reduce((n,p)=>n+p.qty*p.cost,0),revenue:s.sales.reduce((n,p)=>n+p.amount,0)}}
export function suggest(s){const available=publicProducts(s);const tops=available.filter(p=>["Shirts","Tops","Ethnic","Jackets"].includes(p.category));const bottoms=available.filter(p=>["Denim","Bottoms"].includes(p.category));if(!tops.length||!bottoms.length)return null;const top=tops[0],bottom=bottoms[0];return {items:[top,bottom],total:top.price+bottom.price,reason:"Demo rules choose available, published styles. No machine-learning model is connected."}}


/** Noorkhan Bazaar 5: extended demo engine. No persistent/server-side authorization. */
export function barcodeFor(product){return product.barcode||product.code||product.id}
export function findByScan(state,raw){const code=String(raw??"").trim().toUpperCase();return state.products.find(p=>[barcodeFor(p),p.id].some(v=>String(v).toUpperCase()===code))||null}
export function addProduct(state,input){
 const id=String(input.id||"").trim().toUpperCase(),barcode=String(input.barcode||id).trim().toUpperCase();
 const name=String(input.name||"").trim(),category=String(input.category||"").trim();
 const qty=Number(input.qty),price=Number(input.price),cost=Number(input.cost),reorder=Number(input.reorder??2);
 if(!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(id)||!name||!category)throw Error("A unique SKU, product name and category are required");
 if(!/^[A-Z0-9_-]{3,40}$/.test(barcode))throw Error("Invalid scan code");
 if(state.products.some(p=>p.id===id||barcodeFor(p).toUpperCase()===barcode))throw Error("Duplicate SKU or barcode");
 if(![qty,price,cost,reorder].every(Number.isSafeInteger)||qty<0||price<0||cost<0||reorder<0)throw Error("Use valid non-negative whole-number quantities and rupee prices");
 const p={id,barcode,name,category,size:String(input.size||"One size").slice(0,30),color:String(input.color||"Unspecified").slice(0,40),qty,reorder,cost,price,published:false};
 state.products.push(p);
 if(qty)state.moves.push({type:"Opening balance",sku:id,delta:qty,before:0,after:qty,reference:"OPEN-"+id,date:new Date().toISOString()});
 return p
}
export function cartAdd(state,lines,code,quantity=1){
 const p=findByScan(state,code);if(!p)throw Error("Product/barcode not found");
 if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error("Invalid quantity");
 const next=lines.map(x=>({...x}));const existing=next.find(x=>x.sku===p.id);
 const updated=(existing?.quantity||0)+quantity;if(updated>p.qty)throw Error("Not enough stock");
 if(existing)existing.quantity=updated;else next.push({sku:p.id,quantity});
 return next;
}
export function checkout(state,lines,method,reference,at=new Date().toISOString()){
 if(!Array.isArray(lines)||!lines.length)throw Error("Cart cannot be empty");
 if(!["Cash","UPI","Card"].includes(method))throw Error("Choose a valid demo payment method");
 if(!/^POS-[A-Za-z0-9-]{5,80}$/.test(String(reference)))throw Error("Invalid sale reference");
 if(!Number.isFinite(Date.parse(at)))throw Error("Invalid sale date");
 const existing=state.sales.find(x=>x.reference===reference);
 if(existing)throw Error("Duplicate checkout blocked; existing sale "+reference);
 const totals=new Map();
 for(const line of lines){
  const p=findByScan(state,line.sku);if(!p)throw Error("Unknown product");
  if(!Number.isSafeInteger(line.quantity)||line.quantity<=0)throw Error("Invalid cart quantity");
  totals.set(p.id,(totals.get(p.id)||0)+line.quantity);
 }
 for(const [sku,qty] of totals){const p=state.products.find(x=>x.id===sku);if(p.qty<qty)throw Error("Insufficient stock: "+sku)}
 const items=Array.from(totals,([sku,quantity])=>{const p=state.products.find(x=>x.id===sku);return {sku,description:p.name+" / "+p.color+" / "+p.size,quantity,unitPrice:p.price,amount:p.price*quantity}});
 const amount=items.reduce((n,x)=>n+x.amount,0);
 const transaction={id:"sale-"+reference,reference,items,method,amount,quantity:items.reduce((n,x)=>n+x.quantity,0),date:at,status:"demo-completed",receiptNo:"DEMO-"+reference.slice(4)};
 // All validations above, mutations below. Browser-local only; not a true ACID transaction.
 for(const [sku,quantity] of totals){const p=state.products.find(x=>x.id===sku),before=p.qty;p.qty-=quantity;state.moves.push({type:"Sale",sku,delta:-quantity,before,after:p.qty,reference,date:at})}
 state.sales.push(transaction);return transaction;
}
export function purchaseReceive(state,code,quantity,supplier,ref,role){
 if(role!=="owner")throw Error("Only demo owner can access purchasing");
 const p=findByScan(state,code);if(!p)throw Error("SKU not found");
 if(!Number.isSafeInteger(quantity)||quantity<=0)throw Error("Invalid receipt quantity");
 if(!/^GRN-[A-Za-z0-9-]{4,70}$/.test(String(ref)))throw Error("Invalid receipt reference");
 if(!String(supplier||"").trim())throw Error("Supplier required");
 state.purchases??=[];if(state.purchases.some(x=>x.ref===ref))throw Error("Duplicate goods receipt blocked");
 const record={ref,sku:p.id,quantity,supplier:String(supplier).slice(0,100),date:new Date().toISOString(),status:"received"};
 const before=p.qty;p.qty+=quantity;state.moves.push({type:"Goods receipt",sku:p.id,delta:quantity,before,after:p.qty,reference:ref,date:record.date});state.purchases.push(record);return record
}
export function salesReport(state,now=new Date()){
 const t=now.getTime(),local=d=>{const x=new Date(d);return Number.isFinite(x.getTime())?x:null},startDay=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),startWeek=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()+6)%7)).getTime(),startMonth=new Date(now.getFullYear(),now.getMonth(),1).getTime();
 const rows=state.sales.filter(s=>local(s.date)&&new Date(s.date).getTime()<=t);
 const fold=since=>{const chosen=rows.filter(x=>new Date(x.date).getTime()>=since);return {transactions:chosen.length,amount:chosen.reduce((n,x)=>n+x.amount,0),units:chosen.reduce((n,x)=>n+(x.quantity||1),0)}};
 const byCategory={};for(const x of rows){for(const i of x.items||[{sku:x.sku,amount:x.amount,quantity:x.quantity||1}]){const p=state.products.find(p=>p.id===i.sku),key=p?.category||"Other";byCategory[key]=(byCategory[key]||0)+i.amount}}
 return {today:fold(startDay),week:fold(startWeek),month:fold(startMonth),byCategory};
}
