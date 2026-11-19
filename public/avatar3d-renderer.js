// OTD parametric 3D fashion-character renderer.
// three.js MIT license, pinned module via CDN (internet is required for the demo).
// This is NOT a scan-derived identity, exact garment mesh, or physical-fit model.
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {normalize3DAvatar,owned3DOutfit,SKIN_PALETTE,EYE_PALETTE,HAIR_PALETTE} from './avatar3d-core.js';
import {GARMENT_COLORS} from './avatar-core.js';

const smooth=new T.SphereGeometry(1,24,20);
function mat(hex,kind='cloth'){
 return new T.MeshPhysicalMaterial({color:hex,roughness:kind==='skin'?.55:kind==='hair'?.85:kind==='silk'?.38:.8,
   metalness:kind==='silk'?.04:0,clearcoat:kind==='skin'?.13:kind==='eye'?.45:0,
   clearcoatRoughness:.32,side:T.DoubleSide});
}
function ball(group,at,size,material){
 const m=new T.Mesh(smooth,material);m.position.set(...at);m.scale.set(...size);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
}
function tube(group,points,radius,material){
 const p=points.map(p=>new T.Vector3(...p));
 const c=new T.CatmullRomCurve3(p),m=new T.Mesh(new T.TubeGeometry(c,Math.max(10,points.length*5),radius,7,false),material);
 m.castShadow=true;group.add(m);return m;
}
function limb(group,start,end,width,width2,material){
 const a=new T.Vector3(...start),b=new T.Vector3(...end),delta=b.clone().sub(a);
 const mesh=new T.Mesh(new T.CylinderGeometry(width,width2,delta.length(),18,1),material);
 mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
 mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
 mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 ball(group,start,[width,width,width],material);
 ball(group,end,[width2,width2,width2],material);
 return mesh;
}
function bodyShape(group,layers,material,rxScale=1,rzScale=1){
 const points=layers.map(([y,r])=>new T.Vector2(r,y));
 const mesh=new T.Mesh(new T.LatheGeometry(points,42,0,Math.PI*2),material);
 mesh.scale.set(rxScale,1,rzScale);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
}
function dressSurface(group,yBottom,yTop,hem,body,material){
 const layers=[[yBottom,hem],[yBottom+.08,hem*.98],[yBottom+.31,hem*.79],[1.43,body*.95],[yTop-.16,body*.92],[yTop,body]];
 return bodyShape(group,layers,material,1.0,.71);
}
function addEyes(group,a,head){
 const white=mat('#fff8eb','eye'),iris=mat(EYE_PALETTE[a.eyes],'eye'),pupil=mat('#171716','eye'),lash=mat('#33231f','hair');
 const eyeR=.034+(a.eyeSize-50)*.00018;const by=2.973,zz=.293;
 for(const sign of [-1,1]){
  const x=sign*.115;ball(group,[x,by,zz],[eyeR*1.18,eyeR*.84,eyeR*.5],white);
  ball(group,[x,by,zz+eyeR*.40],[eyeR*.55,eyeR*.61,eyeR*.19],iris);
  ball(group,[x,by,zz+eyeR*.51],[eyeR*.27,eyeR*.35,eyeR*.08],pupil);
  ball(group,[x-.008,by+.008,zz+eyeR*.59],[.008,.007,.004],mat('#ffffff','eye'));
  tube(group,[[x-.041,by+.018,zz-.004],[x,by+.034,zz+.007],[x+.042,by+.014,zz-.001]],.007,lash);
  tube(group,[[x-.052,by+.087,.266],[x,by+.097,.283],[x+.051,by+.084,.266]],.009,mat(a.hairColor==='Black'?'#201a19':HAIR_PALETTE[a.hairColor],'hair'));
 }
 const noseSize=.048+(a.nose-50)*.00030;
 ball(group,[0,2.885,.304],[noseSize*.48,.073,.055],head);
 ball(group,[0,2.85,.342],[noseSize,.030,.029],head);
 for(const sign of [-1,1])ball(group,[sign*noseSize*.63,2.843,.337],[.020,.012,.014],head);
 const lips=mat('#ad7069','skin');const smile=(a.smile-50)*.00015;
 tube(group,[[-.059,2.803,.296],[-.020,2.802+smile,.318],[.020,2.802+smile,.318],[.059,2.803,.296]],.009,lips);
 tube(group,[[-.05,2.796,.302],[0,2.788,.311],[.05,2.796,.302]],.008,lips);
}
function addHair(g,a){
 const hair=mat(HAIR_PALETTE[a.hairColor],'hair');
 if(a.hairStyle==='Bald')return;
 const headY=3.008;
 if(a.hairStyle==='Buzz'){
  const cap=new T.Mesh(new T.SphereGeometry(.319,32,16,0,Math.PI*2,0,Math.PI*.42),hair);
  cap.position.set(0,headY,0);cap.scale.set(1.03,1.08,1);g.add(cap);return;
 }
 const cap=new T.Mesh(new T.SphereGeometry(.331,30,18,0,Math.PI*2,0,Math.PI*.47),hair);
 cap.position.set(0,headY+.006,0);cap.scale.set(1.02,1.03,1.01);g.add(cap);cap.castShadow=true;
 const segments=a.hairStyle==='Curly'?23:12;
 const long=['Long','Wavy','Ponytail','Bun','Curly'].includes(a.hairStyle);
 for(let i=0;i<segments;i++){
  const angle=(i/(segments-1))*Math.PI*1.80+.25;
  const x=.30*Math.cos(angle),z=.30*Math.sin(angle);
  const target=long?2.51:2.79;
  const loosen=a.hairStyle==='Curly'?.025:a.hairStyle==='Wavy'?.014:.005;
  const r=a.hairStyle==='Curly'?.060:.043;
  const p=[[x,3.24,z],[x*1.02,3.08,z*1.02],
   [x+(Math.sin(i*1.9)*loosen),2.86,z+(Math.cos(i*1.4)*loosen)]];
  if(long)p.push([x+(Math.cos(i*3)*loosen),target,z+(Math.sin(i*3)*loosen)]);
  tube(g,p,r,hair);
 }
 if(a.hairStyle==='Layered'||a.hairStyle==='Short'){
  for(let i=0;i<7;i++)tube(g,[[(-.22+i*.067),3.30,.05],[(-.22+i*.065),3.22,.19],[(-.2+i*.06),3.17,.245]],.036,hair);
 }
 if(a.hairStyle==='Bun'){
  ball(g,[0,3.19,-.30],[.18,.18,.15],hair);
 }
 if(a.hairStyle==='Ponytail'){
  tube(g,[[0,3.16,-.28],[.11,3.0,-.37],[.08,2.62,-.42],[.06,2.41,-.40]],.115,hair);
 }
}
function addFace(g,a,skin){
 const shape={Oval:[.29,.37,.265],Round:[.318,.345,.280],Angular:[.31,.355,.26],Heart:[.305,.365,.265]}[a.face];
 const jaw=(a.jaw-50)*.0011;
 const head=ball(g,[0,3.006,0],[shape[0]+jaw*.18,shape[1],shape[2]],skin);
 ball(g,[0,2.835,.02],[.205+jaw,.155,.23],skin);
 // Eyes are spatially placed, not applied as a texture.
 for(const sign of [-1,1])ball(g,[sign*.295,2.985,-.015],[.052,.087,.049],skin);
 addEyes(g,a,skin);
 addHair(g,a);
 return head;
}
function garmentMaterial(g){const color=GARMENT_COLORS[g?.color]||GARMENT_COLORS.Other;return mat(color,['Silk','Satin'].includes(g?.material)?'silk':'cloth');}
function bodyGeometry(g,a,outfit){
 const skin=mat(SKIN_PALETTE[a.skin],'skin'),body=a.body;
 const shoulders=(.44+(a.shoulders-50)*.002)*(body==='Athletic'?1.12:body==='Relaxed'?1.07:1);
 const waist=(.345+(a.waist-50)*.0021)*(body==='Soft'?1.09:1),hips=(.39+(a.hips-50)*.002)*(body==='Soft'?1.08:1);
 const t=outfit.slots,upper=t.full||t.top,lower=t.full||t.bottom;
 // Neck + natural body core
 limb(g,[0,2.61,0],[0,2.77,0],.095,.094,skin);
 bodyShape(g,[[1.31,hips],[1.42,hips],[1.62,waist],[2.13,waist+.02],[2.43,shoulders],[2.5,.27]],skin,1,.72);
 // Arms; deliberately gender-neutral.
 for(const sign of [-1,1]){
  const sx=sign*(shoulders+.08),elbowX=sign*(shoulders+.19),handX=sign*(shoulders+.26);
  limb(g,[sx,2.41,0],[elbowX,1.87,.025],.128,.110,skin);
  limb(g,[elbowX,1.87,.025],[handX,1.30,.08],.105,.075,skin);
  ball(g,[handX,1.21,.08],[.087,.145,.061],skin);
 }
 for(const sign of [-1,1]){
  limb(g,[sign*.215,1.36,0],[sign*.24,.76,.06],.206,.155,skin);
  limb(g,[sign*.24,.76,.06],[sign*.25,.24,.10],.153,.100,skin);
  ball(g,[sign*.25,.13,.20],[.145,.15,.255],lower?garmentMaterial(t.shoes||t.bottom||t.full):skin);
 }
 // Base outfit color-coded silhouettes: no real cloth matching.
 if(t.full){
  const dress=garmentMaterial(t.full);
  dressSurface(g,.24,2.50,t.full.category==='Lehenga'?.87:.71,waist+.04,dress);
  if(t.full.category==='Saree'){
   const pallu=garmentMaterial(t.full);
   tube(g,[[shoulders-.12,2.46,.08],[.10,2.24,.30],[-.06,1.72,.33],[-.39,.70,.15]],.096,pallu);
   for(let i=0;i<6;i++)tube(g,[[-.46+i*.14,.42,.37],[-.45+i*.14,.23,.35]],.008,mat('#fff4de','silk'));
  }
 }else{
  if(t.bottom){
   const pants=garmentMaterial(t.bottom);
   if(t.bottom.category==='Skirt'){
    dressSurface(g,.42,1.47,.69,hips,pants);
   }else{
    bodyShape(g,[[1.31,hips+.015],[1.42,hips+.04],[1.53,waist]],pants,1,.73);
    for(const sign of [-1,1]){
     limb(g,[sign*.215,1.36,0],[sign*.24,.76,.06],.215,.17,pants);
     limb(g,[sign*.24,.76,.06],[sign*.25,.26,.10],.16,.112,pants);
    }
   }
  }
  if(t.top){
   const shirt=garmentMaterial(t.top);
   const isTunic=['Kurta','Kurti'].includes(t.top.category);
   bodyShape(g,[[isTunic?.99:1.47,isTunic?hips+.10:hips*.97],[1.55,waist+.035],[2.13,waist+.06],[2.4,shoulders+.04],[2.52,.26]],shirt,1,.76);
   for(const sign of [-1,1])limb(g,[sign*(shoulders+.06),2.37,0],[sign*(shoulders+.16),1.98,.025],.152,.119,shirt);
   if(!isTunic)tube(g,[[0,2.49,.22],[0,1.50,.32]],.006,mat('#ddd5c7'));
  }
 }
 if(t.layer){
  const jacket=garmentMaterial(t.layer);
  for(const sign of [-1,1]){
   limb(g,[sign*(shoulders+.07),2.38,.005],[sign*(shoulders+.17),1.85,.03],.166,.142,jacket);
   bodyShape(g,[[1.38,waist+.095],[2.12,waist+.10],[2.42,shoulders+.09],[2.48,.32]],jacket,1,.87);
  }
 }
 if(t.shoes){
  for(const sign of [-1,1])ball(g,[sign*.25,.135,.265],[.16,.14,.29],garmentMaterial(t.shoes));
 }
 if(t.accessory){
  const accessory=garmentMaterial(t.accessory);
  if(t.accessory.category==='Dupatta')tube(g,[[-shoulders,2.44,.08],[.05,2.26,.35],[shoulders+.06,1.12,.26]],.095,accessory);
  else ball(g,[0,2.48,.29],[.055,.07,.025],accessory);
 }
 const gHeight=.91+(a.height-100)*.0018;
 g.scale.set(1,gHeight,1);
 if(a.pose==='Runway')g.rotation.z=.025;
 if(a.pose==='Relaxed')g.rotation.z=-.016;
}
function modelFromConfig(a,wardrobe){
 const group=new T.Group();const actual=owned3DOutfit(wardrobe,a);
 const outfit=actual.garments.length?actual:{...actual,slots:{top:{category:'Tshirt',color:'Cream',material:'Cotton'},bottom:{category:'Trousers',color:'Brown',material:'Cotton'},shoes:{category:'Shoes',color:'White'},layer:null,full:null,accessory:null}};
 const skin=mat(SKIN_PALETTE[a.skin],'skin');
 bodyGeometry(group,a,outfit);addFace(group,a,skin);
 return group;
}
function disposeGroup(group){
 group.traverse(n=>{if(n.geometry&&n.geometry!==smooth)n.geometry.dispose();if(n.material){const mats=Array.isArray(n.material)?n.material:[n.material];mats.forEach(m=>m.dispose?.());}});
}
export function mountAvatar3D(target,config,wardrobe,onError){
 let disposed=false,raf=0;
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});}
 catch(err){onError?.('Your browser could not start WebGL. Try Safari or Chrome on a supported device.');return null;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(32,1,.1,100);
 camera.position.set(0,2.03,6.75);camera.lookAt(0,1.85,0);
 const backdrop=new T.Mesh(new T.CircleGeometry(2.2,64),new T.MeshBasicMaterial({color:0xdbc6af,transparent:true,opacity:.06}));
 backdrop.position.set(0,1.80,-.55);scene.add(backdrop);
 const stage=new T.Mesh(new T.CylinderGeometry(1.42,1.51,.13,64),mat('#ad8c6e','silk'));
 stage.position.y=-.06;stage.receiveShadow=true;scene.add(stage);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),mat('#efdfcf'));floor.rotation.x=-Math.PI/2;floor.position.y=-.15;floor.receiveShadow=true;scene.add(floor);
 const hemi=new T.HemisphereLight('#fff9f0','#937258',2.2);scene.add(hemi);
 const key=new T.DirectionalLight('#ffffff',3.2);key.position.set(4,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=.5;key.shadow.camera.far=18;key.shadow.bias=-.0002;scene.add(key);
 const rim=new T.DirectionalLight('#d9b28b',1.7);rim.position.set(-5,3,-4);scene.add(rim);
 const fill=new T.DirectionalLight('#fff3e6',1.1);fill.position.set(-3,3,4);scene.add(fill);
 let a=normalize3DAvatar(config),model=modelFromConfig(a,wardrobe),yaw=0,tilt=.0,zoom=6.75;
 scene.add(model);
 target.innerHTML='';target.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Interactive 3D fashion avatar. Drag horizontally to rotate through 360 degrees.');
 renderer.domElement.setAttribute('tabindex','0');
 const canvas=renderer.domElement;
 canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;cursor:grab';
 let last=null;
 const down=e=>{last={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId);canvas.style.cursor='grabbing';};
 const move=e=>{if(!last||e.pointerId!==last.id)return;const dx=e.clientX-last.x,dy=e.clientY-last.y;yaw+=dx*.014;tilt=Math.max(-.08,Math.min(.28,tilt+dy*.0015));last={x:e.clientX,y:e.clientY,id:e.pointerId};};
 const up=e=>{if(last&&last.id===e.pointerId)last=null;canvas.style.cursor='grab';};
 const wheel=e=>{e.preventDefault();zoom=Math.min(9,Math.max(4.2,zoom+e.deltaY*.006));};
 const keydown=e=>{if(e.key==='ArrowLeft'){yaw-=.2;e.preventDefault()}else if(e.key==='ArrowRight'){yaw+=.2;e.preventDefault()}else if(e.key==='+'||e.key==='='){zoom=Math.max(4.2,zoom-.3);e.preventDefault()}else if(e.key==='-'){zoom=Math.min(9,zoom+.3);e.preventDefault()}};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',keydown);
 const resize=()=>{if(disposed)return;const rect=target.getBoundingClientRect(),w=Math.max(280,Math.floor(rect.width)),h=Math.max(330,Math.floor(rect.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(target);resize();
 let lastFrame=0;const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;
 function frame(time){
  if(disposed)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(time-lastFrame)/1000||0);lastFrame=time;
  if(a.spin&&!reduced&&!last)yaw+=dt*.13;
  model.rotation.y=yaw;
  camera.position.set(0,2.03+tilt,zoom);camera.lookAt(0,1.85,0);
  renderer.render(scene,camera);
 }
 raf=requestAnimationFrame(frame);
 return {
  update(settings,items){
   if(disposed)return;a=normalize3DAvatar(settings);scene.remove(model);disposeGroup(model);model=modelFromConfig(a,items);scene.add(model);
  },
  rotate(dir){yaw+=dir*.45;},
  zoom(dir){zoom=Math.max(4.2,Math.min(9,zoom+dir*.45));},
  setSpin(value){a.spin=!!value;},
  capture(){
   if(disposed)return false;renderer.render(scene,camera);const link=document.createElement('a');link.href=renderer.domElement.toDataURL('image/png');link.download='otd-3d-avatar-preview.png';link.click();return true;
  },
  destroy(){
   if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();
   canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',keydown);
   scene.remove(model);disposeGroup(model);[stage,floor,backdrop].forEach(o=>{o.geometry.dispose();o.material.dispose();});renderer.dispose();canvas.remove();
  }
 };
}
