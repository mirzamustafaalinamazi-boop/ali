import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {HumanEditor,useHumanPackage} from './web';
import {createHumanEditor, GENDER_DEFAULTS} from './human/editor';
import type {HumanConfig} from './human/runtime';
import {GUIDED_FACE_SHAPES,GUIDED_BODY_TYPES,applyFaceShape,applyBodyType,closestFaceShape,resetFaceDetails} from './presets';
import type {ShapePreset,BodyPreset} from './presets';
import './style.css';

const storageKey='otd-avatar-pro-v1';
const profileKey='otd-avatar-profile-v1';
const closetKey='otd-working-demo-v1';
const handoffKey='otd-avatar-handoff-v1';
type Profile={heightCm:string;weightKg:string;faceId:string;bodyId:string;wardrobeIds:string[]};
type Garment={id:string;name:string;category:string;color?:string;photo?:string;confirmed?:boolean};
type Handoff={appearance?:'male'|'female';heightCm?:string;weightKg?:string;wardrobeIds?:string[];wardrobe?:Garment[];outfitTitle?:string};
const emptyProfile:Profile={heightCm:'',weightKg:'',faceId:'',bodyId:'',wardrobeIds:[]};
function readJson(key:string):unknown{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function handoffStored():Handoff|null{try{const data=JSON.parse(sessionStorage.getItem(handoffKey)||'null');return data&&typeof data==='object'?data as Handoff:null}catch{return null}}
function stored():Partial<HumanConfig>|undefined{
  const data=readJson(storageKey);
  if(data&&typeof data==='object'){
    const c=data as Partial<HumanConfig>;
    if(c.gender===0.5||c.gender===undefined){
      c.gender=0;
    }
    if(!c.clothes||!c.clothes.length){
      c.clothes=c.gender===1?['toigo_male_suit_3','shoes01']:['toigo_halter_dress_midi','shoes02'];
    }
    if(!c.hair||c.hair==='bob02'){
      c.hair=c.gender===1?'culturalibre_hair_02':'toigo_curled_under_bob';
    }
    return c;
  }
  return undefined;
}
function profileStored():Profile{const data=readJson(profileKey);const saved=data&&typeof data==='object'?{...emptyProfile,...data as Partial<Profile>}:emptyProfile;const handoff=handoffStored();return handoff?{...saved,heightCm:handoff.heightCm||saved.heightCm,weightKg:handoff.weightKg||saved.weightKg,wardrobeIds:Array.isArray(handoff.wardrobeIds)?handoff.wardrobeIds:saved.wardrobeIds}:saved}
function closetStored():Garment[]{const handoff=handoffStored();const data=handoff?.wardrobe?handoff:readJson(closetKey) as {wardrobe?:unknown}|null;return Array.isArray(data?.wardrobe)?data.wardrobe.filter((g:Garment)=>g&&g.confirmed&&typeof g.id==='string'&&typeof g.name==='string'):[]}
function download(name:string,data:string){const a=document.createElement('a');a.download=name;a.href=data;a.click()}
function FaceGlyph({shape}:{shape:ShapePreset}){
 const v=shape.values,top=20+(v.headWidth??0)*6+(v.headHeart??0)*3,cheek=23+(v.headWidth??0)*5+(v.cheekBones??0)*4,jaw=16+(v.jaw??0)*8,chin=7+(v.chinWidth??0)*5,height=46+(v.headHeight??0)*8;
 return <svg className="shape-glyph" viewBox="0 0 100 72" aria-hidden="true"><path d={`M 50 ${58-height} C ${50-top} ${58-height}, ${50-top} 24, ${50-cheek} 31 Q ${50-jaw} 52 ${50-chin} 62 Q 50 70 ${50+chin} 62 Q ${50+jaw} 52 ${50+cheek} 31 C ${50+top} 24, ${50+top} ${58-height}, 50 ${58-height} Z`} fill="#e9c5aa" stroke="#7b5038" strokeWidth="1.8"/><path d="M 40 35 Q 44 33 47 35 M 53 35 Q 56 33 60 35 M 45 51 Q 50 54 55 51" fill="none" stroke="#855840" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function BodyGlyph({body}:{body:BodyPreset}){
 const s=19+(body.details.shoulders??0)*12,w=12+(body.details.waist??0)*11,h=16+(body.details.hips??0)*10;
 return <svg className="body-glyph" viewBox="0 0 80 76" aria-hidden="true"><path d={`M 35 5 L 45 5 L 48 13 L ${40+s} 20 L ${40+s-3} 31 L ${40+w} 43 L ${40+h} 52 L ${40+h-4} 72 L 44 72 L 40 52 L 36 72 L ${40-h+4} 72 L ${40-h} 52 L ${40-w} 43 L ${40-s+3} 31 L ${40-s} 20 L 32 13 Z`} fill="#dfb49a" stroke="#7b5038" strokeWidth="1.5"/></svg>;
}
function App(){
 const {pkg,error}=useHumanPackage(`${import.meta.env.BASE_URL}human`);
 const [config,setConfig]=useState<Partial<HumanConfig>|undefined>(stored);
 const [profile,setProfile]=useState<Profile>(profileStored);
 const [wardrobe,setWardrobe]=useState<Garment[]>(closetStored);
 const [appearance,setAppearance]=useState<'female'|'male'>(handoffStored()?.appearance||(config?.gender===1?'male':'female'));
 const [message,setMessage]=useState('');
 const options=useMemo(()=>({
  gender:appearance,mode:'guided' as const,sections:['face','body','hair','outfit','shoes'] as const,detailRange:.55,
  skinTones:['fair','light','warm','olive','tan','caramel','chestnut','brown','ebony'],
  items:{
   eyes:['brown','brownlight','blue','green','grey','bluegreen'],
   hair:appearance==='female'
     ?['toigo_curled_under_bob','cortu_straight_bangs','long01','ponytail01','toigo_blunt_bob_with_bangs','rehmanpolanski_hair_bun_brown','braid01','bob02','short01']
     :['culturalibre_hair_02','short02','short03','short04','short01','afro01'],
   outfit:appearance==='female'
     ?['toigo_halter_dress_midi','toigo_camisole_dress_with_full_skirt','toigo_bodice_dress_with_lace_ruffle_skirt','dress_knee01','toigo_halter_dress_knee_length','toigo_strapless_ruffle_top_dress','female_casualsuit02','female_elegantsuit01','toigo_female_suit_2','dress_maxi01','abaya01','female_casualsuit01']
     :['toigo_male_suit_3','toigo_suit_with_dinner_jacket','male_casualsuit02','male_casualsuit01','male_casualsuit05','male_elegantsuit01','male_worksuit01'],
   shoes:['shoes02','shoes01','shoes03','shoes04'],
  },
 }),[appearance]);
 const complete=()=>pkg?createHumanEditor(pkg,{...options,sections:[...options.sections]}).normalize(config):null;
 const update=(next:HumanConfig)=>{setConfig(next);try{localStorage.setItem(storageKey,JSON.stringify(next))}catch{setMessage('Device storage is full. Save a preview before leaving.')}};
 const switchAppearance=(newGender:'female'|'male')=>{
  setAppearance(newGender);
  const gDefaults=GENDER_DEFAULTS[newGender];
  const nextConfig={
   ...config,
   ...gDefaults,
   gender:newGender==='female'?0:1,
   clothes:newGender==='female'?['toigo_halter_dress_midi','shoes02']:['toigo_male_suit_3','shoes01'],
   hair:newGender==='female'?'toigo_curled_under_bob':'culturalibre_hair_02',
   skin:newGender==='female'?'young_caucasian_female':'young_caucasian_male',
   detail:{...gDefaults.detail},
  };
  update(nextConfig as HumanConfig);
  setMessage(`Switched to ${newGender==='female'?'Feminine':'Masculine'} starting style.`);
 };
 const updateProfile=(patch:Partial<Profile>)=>{const next={...profile,...patch};setProfile(next);try{localStorage.setItem(profileKey,JSON.stringify(next))}catch{setMessage('Device storage is full. Your measurements were not saved.')}};
 const save=(next:HumanConfig,png:string|null)=>{update(next);if(png)download('otd-my-avatar.png',png);setMessage(png?'Avatar saved on this device and PNG downloaded.':'Avatar saved on this device; PNG preview was unavailable.');};
 const chooseFace=(id:string)=>{const shape=GUIDED_FACE_SHAPES.find(s=>s.id===id),current=complete();if(!shape||!current)return;update(applyFaceShape(current,shape));updateProfile({faceId:id});setMessage(`${shape.name} starting shape applied. Fine tune the essential Face controls.`)};
 const resetFace=()=>{const current=complete();if(!current)return;update(resetFaceDetails(current));updateProfile({faceId:''});setMessage('Face detail returned to a natural starting point. Hair, skin, outfit and body were kept.');};
 const chooseBody=(id:string)=>{const body=GUIDED_BODY_TYPES.find(s=>s.id===id),current=complete();if(!body||!current)return;update(applyBodyType(current,body));updateProfile({bodyId:id});setMessage(`${body.name} body start applied. Fine tune chest, waist, belly, hips and more in Body.`)};
 const onSelfieFit=(fitted:HumanConfig)=>{const match=closestFaceShape(fitted,GUIDED_FACE_SHAPES);updateProfile({faceId:match.id});setMessage(`Selfie fitted with a gentle shape adjustment. ${match.name} is the closest starting label; your face remains fully editable.`)};
 const selected=wardrobe.filter(g=>profile.wardrobeIds.includes(g.id));
 const toggleGarment=(id:string)=>updateProfile({wardrobeIds:profile.wardrobeIds.includes(id)?profile.wardrobeIds.filter(x=>x!==id):[...profile.wardrobeIds,id]});
 return <div className="otd-pro">
  <header className="site-head"><a className="back" href="/#home" aria-label="Back to OTD">← BACK TO OTD</a><div className="brand">OTD<span>FASHION AI</span></div><span className="header-tag">AVATAR STUDIO</span></header>
  <main>
   <div className="eyebrow">CREATE · CUSTOMIZE · STYLE</div>
   <div className="intro"><div><h1>Your face. <em>Your avatar.</em></h1><p>Start with a selfie or choose a shape. Adjust the few details that matter most, then style the look.</p></div><div className="appearance"><span>STARTING FORM</span><button className={appearance==='female'?'active':''} onClick={()=>switchAppearance('female')}>Feminine</button><button className={appearance==='male'?'active':''} onClick={()=>switchAppearance('male')}>Masculine</button></div></div>
   <div className="privacy"><strong>✦ YOUR PHOTO STAYS HERE</strong><span>Selfie analysis runs in this browser. The photo is not uploaded or saved. It suggests a restrained first fit that you can change.</span></div>
   <div className="studio-frame">{error?<div className="loading">Could not load the 3D assets: {error.message}</div>:!pkg?<div className="loading">Preparing your 3D avatar and wardrobe…</div>:<HumanEditor key={appearance} pkg={pkg} options={{...options,sections:[...options.sections]}} value={config} onChange={update} onGenderChange={switchAppearance} onSelfieFit={onSelfieFit} onSave={save} saveLabel="SAVE AVATAR & PNG" selfie randomize={false} accentColor="#58351f" background="#d7bda9"/>}</div>
   {message&&<p className="notice" role="status">{message}</p>}
   <section className="choice-section" aria-labelledby="face-shape-heading"><div className="section-heading"><span>01 / FACE SHAPE</span><h2 id="face-shape-heading">A face that feels like you.</h2><p>Twenty familiar starting shapes. The selfie fit suggests one, and you can adjust width, jaw, cheeks, eyes, nose and lips in the Face tab.</p></div><button className="natural-reset" onClick={resetFace}>RESET FACE TO NATURAL</button><div className="shape-grid face-shapes">{GUIDED_FACE_SHAPES.map((s,i)=><button key={s.id} className={`shape-card ${profile.faceId===s.id?'selected':''}`} aria-pressed={profile.faceId===s.id} onClick={()=>chooseFace(s.id)}><FaceGlyph shape={s}/><small>{String(i+1).padStart(2,'0')} · {s.family}</small><strong>{s.name}</strong></button>)}</div><p className="section-note">These are editable visual starting points, not fixed labels for anyone's face.</p></section>
   <section className="choice-section" aria-labelledby="body-type-heading"><div className="section-heading"><span>02 / BODY TYPE</span><h2 id="body-type-heading">A relaxed, natural body.</h2><p>Pick a shape yourself, then adjust shoulders, chest, waist, hips, belly and buttocks. The default pose keeps arms comfortably at the sides.</p></div><div className="measurements"><label>Height (cm)<input type="number" min="80" max="250" step="0.1" inputMode="decimal" value={profile.heightCm} onChange={e=>updateProfile({heightCm:e.target.value})} placeholder="Optional"/></label><label>Weight (kg)<input type="number" min="20" max="350" step="0.1" inputMode="decimal" value={profile.weightKg} onChange={e=>updateProfile({weightKg:e.target.value})} placeholder="Optional"/></label><p>Measurements are recorded only. They never select or change a body type.</p></div><div className="shape-grid body-grid">{GUIDED_BODY_TYPES.map((s,i)=><button key={s.id} className={`shape-card ${profile.bodyId===s.id?'selected':''}`} aria-pressed={profile.bodyId===s.id} onClick={()=>chooseBody(s.id)}><BodyGlyph body={s}/><small>{String(i+1).padStart(2,'0')} / 08</small><strong>{s.name}</strong><span>{s.description}</span></button>)}</div></section>
   <section className="choice-section" aria-labelledby="closet-heading"><div className="section-heading"><span>03 / YOUR WARDROBE</span><h2 id="closet-heading">Bring your pieces into the plan.</h2><p>Select confirmed items from your OTD closet. Their photos and categories appear here for review. The 3D outfit and shoe tabs currently contain sample assets; the app cannot yet generate a fitted 3D shirt, trouser, shoe or accessory from a wardrobe photo.</p></div><button className="refresh-closet" onClick={()=>{setWardrobe(closetStored());setMessage('Closet refreshed from this browser.')}}>REFRESH CLOSET</button>{wardrobe.length?<div className="wardrobe-grid">{wardrobe.map((g,i)=><button key={g.id} className={`wardrobe-card ${profile.wardrobeIds.includes(g.id)?'selected':''}`} aria-pressed={profile.wardrobeIds.includes(g.id)} onClick={()=>toggleGarment(g.id)}>{g.photo?<img src={g.photo} alt={g.name} loading="lazy"/>:<div className="garment-placeholder">{g.category}</div>}<small>{String(i+1).padStart(2,'0')} · {g.category}</small><strong>{g.name}</strong><span>{g.color||'Color unspecified'} · {profile.wardrobeIds.includes(g.id)?'Selected':'Select'}</span></button>)}</div>:<p className="closet-empty">No confirmed pieces found on this device. Add clothes in <a href="/#closet">Your Closet</a>, then refresh here.</p>}{selected.length>0&&<div className="selected-garments"><strong>Selected for this avatar:</strong> {selected.map(g=>g.name).join(' + ')}</div>}<p className="section-note">3D garment generation, exact fit and closeup rendering require garment specific 3D meshes and a generation service. Selected wardrobe photos are reference only in this version.</p></section>
   <div className="footnotes"><p><strong>Face likeness:</strong> the selfie fit uses face landmarks, skin and iris color. Hair, hair color, fine detail and side views need your edits. It is a stylized approximation.</p><p><strong>Future styling:</strong> face and body aware hair, makeup and beard recommendations, plus photo to 3D wardrobe generation, need separate assets and model validation.</p></div>
  </main><footer>OTD · Own the day <span>Original OTD experience using licensed open source 3D foundations</span></footer>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
