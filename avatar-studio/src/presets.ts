import type { HumanConfig } from './human/runtime';

// These are editable starting profiles, not diagnostic face classifications.
const FACE_KEYS = ['headWidth','headHeight','faceFat','headOval','headRound','headSquare','headHeart','foreheadHeight','jaw','chinWidth','chinHeight','cheekBones','cheekVolume'] as const;
type FaceValues = Partial<Record<(typeof FACE_KEYS)[number], number>>;
export interface ShapePreset { id: string; name: string; family: string; values: FaceValues }
const face = (id: string, name: string, family: string, values: FaceValues): ShapePreset => ({ id, name, family, values });
export const FACE_SHAPES: ShapePreset[] = [
  face('oval','Oval','Oval',{headOval:.65,headWidth:-.12,jaw:-.12,chinWidth:-.1}),
  face('long-oval','Long oval','Oval',{headOval:.7,headHeight:.32,headWidth:-.22,jaw:-.17}),
  face('soft-oval','Soft oval','Oval',{headOval:.55,faceFat:.18,cheekVolume:.2,jaw:-.15}),
  face('round','Round','Round',{headRound:.7,headHeight:-.25,faceFat:.25,cheekVolume:.3}),
  face('soft-round','Soft round','Round',{headRound:.65,faceFat:.4,cheekVolume:.42,jaw:-.15}),
  face('wide-round','Wide round','Round',{headRound:.62,headWidth:.3,faceFat:.24,cheekVolume:.25}),
  face('square','Square','Square',{headSquare:.72,headWidth:.2,jaw:.42,chinWidth:.28}),
  face('soft-square','Soft square','Square',{headSquare:.55,headWidth:.12,jaw:.24,cheekVolume:.14}),
  face('wide-square','Wide square','Square',{headSquare:.7,headWidth:.38,jaw:.4,chinWidth:.34}),
  face('heart','Heart','Heart',{headHeart:.7,foreheadHeight:.18,jaw:-.26,chinWidth:-.38}),
  face('soft-heart','Soft heart','Heart',{headHeart:.52,cheekVolume:.18,jaw:-.2,chinWidth:-.27}),
  face('inverted-triangle','Inverted triangle','Heart',{headHeart:.62,headWidth:.18,jaw:-.4,chinWidth:-.46}),
  face('diamond','Diamond','Diamond',{headWidth:-.12,cheekBones:.55,cheekVolume:.08,jaw:-.3,chinWidth:-.3}),
  face('soft-diamond','Soft diamond','Diamond',{headOval:.2,cheekBones:.45,cheekVolume:.25,jaw:-.23,chinWidth:-.2}),
  face('oblong','Oblong','Oblong',{headHeight:.45,headWidth:-.18,jaw:.1,chinHeight:.24}),
  face('narrow-oblong','Narrow oblong','Oblong',{headHeight:.5,headWidth:-.35,jaw:-.12,chinHeight:.22}),
  face('rectangle','Rectangle','Oblong',{headSquare:.45,headHeight:.42,jaw:.28,chinWidth:.2}),
  face('triangle','Triangle','Triangle',{headWidth:-.2,jaw:.5,chinWidth:.26,cheekBones:-.12}),
  face('soft-triangle','Soft triangle','Triangle',{jaw:.36,chinWidth:.12,cheekVolume:.2}),
  face('pear','Pear','Triangle',{headWidth:-.18,jaw:.48,chinWidth:.24,faceFat:.16}),
];
const guidedFaceIds = new Set(['oval','round','square','heart','diamond','oblong']);
export const GUIDED_FACE_SHAPES = FACE_SHAPES.filter(shape => guidedFaceIds.has(shape.id));

export function closestFaceShape(config: Pick<HumanConfig,'detail'>, choices: ShapePreset[] = FACE_SHAPES): ShapePreset {
  let best = choices[0], distance = Infinity;
  for (const shape of choices) {
    let sum = 0;
    for (const key of FACE_KEYS) {
      const delta = (config.detail[key] ?? 0) - (shape.values[key] ?? 0);
      sum += delta * delta;
    }
    if (sum < distance) { best = shape; distance = sum; }
  }
  return best;
}

export function applyFaceShape(config: HumanConfig, shape: ShapePreset): HumanConfig {
  const detail = { ...config.detail };
  for (const key of FACE_KEYS) detail[key] = (shape.values[key] ?? 0) * 0.75;
  return { ...config, detail };
}

/** A photo cannot justify an extreme morph, so offer a restrained editable first pass. */
export function softenSelfieDetail(current: Record<string, number>, fitted: Record<string, number>) {
  const next = { ...current };
  for (const [key, value] of Object.entries(fitted)) {
    if (Number.isFinite(value)) next[key] = Math.max(-0.48, Math.min(0.48, value * 0.7));
  }
  return next;
}
export function resetFaceDetails(config: HumanConfig): HumanConfig {
  const bodyKeys = new Set(['neckWidth','neckLength','shoulders','chest','waist','hips','vShape','belly','buttocks']);
  const detail = Object.fromEntries(Object.entries(config.detail).filter(([key]) => bodyKeys.has(key)));
  return { ...config, detail };
}

export interface BodyPreset { id: string; name: string; description: string; weight: number; muscle: number; details: Record<string,number> }
export const BODY_TYPES: BodyPreset[] = [
  {id:'balanced',name:'Balanced',description:'Even proportions',weight:.5,muscle:.5,details:{}},
  {id:'slender',name:'Slender',description:'Narrower frame',weight:.25,muscle:.36,details:{shoulders:-.16,waist:-.2,hips:-.16}},
  {id:'athletic',name:'Athletic',description:'Defined frame',weight:.46,muscle:.78,details:{shoulders:.23,waist:-.15,vShape:.24}},
  {id:'curvy',name:'Curvy',description:'Fuller bust and hips',weight:.6,muscle:.42,details:{chest:.23,waist:-.18,hips:.35}},
  {id:'pear',name:'Pear',description:'Fuller hips',weight:.57,muscle:.46,details:{shoulders:-.16,waist:-.07,hips:.38}},
  {id:'inverted',name:'Inverted triangle',description:'Broader shoulders',weight:.52,muscle:.55,details:{shoulders:.36,hips:-.18,vShape:.28}},
  {id:'straight',name:'Straight',description:'Similar shoulder and hip width',weight:.45,muscle:.42,details:{shoulders:.03,waist:.08,hips:.03}},
  {id:'full',name:'Fuller',description:'Fuller frame',weight:.75,muscle:.37,details:{chest:.24,waist:.27,hips:.27,belly:.15}},
];
const guidedBodyIds = new Set(['balanced','slender','athletic','curvy','pear','full']);
export const GUIDED_BODY_TYPES = BODY_TYPES.filter(body => guidedBodyIds.has(body.id));
export function applyBodyType(config: HumanConfig, preset: BodyPreset): HumanConfig {
  const detail = { ...config.detail };
  for (const key of ['shoulders','chest','waist','hips','vShape','belly']) detail[key] = preset.details[key] ?? 0;
  return { ...config, weight: preset.weight, muscle: preset.muscle, detail };
}
