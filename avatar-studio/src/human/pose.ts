import { Bone, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { loadMixamoPose } from './fbxRetarget';

const WORLD_Z = new Vector3(0, 0, 1);
const WORLD_X = new Vector3(1, 0, 0);
const WORLD_Y = new Vector3(0, 1, 0);

export type FingerPresetType = 'open-relaxed' | 'light-fist' | 'waist-grip' | 'peace' | 'point';

export interface IKTargetSpec {
  target: [number, number, number]; // relative to body origin/hips: [x, y, z]
  pole: [number, number, number];   // elbow bend pole direction: [x, y, z]
  palmInward?: boolean;             // whether palm faces inward to body surface
}

export interface ContrappostoSpec {
  weightLeg: 'left' | 'right' | 'balanced';
  hipShift: number;     // lateral shift (meters)
  hipTilt: number;      // lateral tilt (radians)
  shoulderTilt: number; // counter-tilt (radians)
  freeKneeBend: number; // knee flexion (radians)
}

export interface PoseDefinition {
  id: string;
  name: string;
  label: string;
  icon: string;
  description: string;
  source: 'mixamo' | 'procedural';
  blendTime: number; // ms, default 500
  contrapposto: ContrappostoSpec;
  fingerLeft: FingerPresetType;
  fingerRight: FingerPresetType;
  ikLeftArm?: IKTargetSpec;
  ikRightArm?: IKTargetSpec;
  rotations?: Record<string, [number, number, number]>; // Euler xyz in radians
  headTilt?: [number, number, number];                  // Euler xyz
  genderVariant?: {
    maleStanceMultiplier?: number;
    maleHipTiltMultiplier?: number;
  };
}

/** 10 Fashion-Grade V1 Poses */
export const V1_POSES: PoseDefinition[] = [
  {
    id: 'natural',
    name: 'Natural',
    label: 'Natural',
    icon: '🌿',
    description: 'Effortless relaxed stance, contrapposto weight shift, palms inward against thighs, relaxed cascading fingers',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.035,
      hipTilt: -0.045,
      shoulderTilt: 0.035,
      freeKneeBend: 0.12,
    },
    fingerLeft: 'open-relaxed',
    fingerRight: 'open-relaxed',
    ikLeftArm: {
      target: [0.20, 0.82, -0.02],
      pole: [0.25, 1.05, -0.15],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.20, 0.82, -0.02],
      pole: [-0.25, 1.05, -0.15],
      palmInward: true,
    },
    headTilt: [0.02, 0.04, 0.03],
    genderVariant: { maleStanceMultiplier: 1.35, maleHipTiltMultiplier: 0.35 },
  },
  {
    id: 'chic-hip',
    name: 'Chic Hip',
    label: 'Chic Hip',
    icon: '🌸',
    description: 'Editorial fashion pose: left hand placed with precision IK on hip, flared elbow, weight on left leg',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.050,
      hipTilt: -0.070,
      shoulderTilt: 0.055,
      freeKneeBend: 0.16,
    },
    fingerLeft: 'waist-grip',
    fingerRight: 'open-relaxed',
    ikLeftArm: {
      target: [0.20, 1.04, 0.04],
      pole: [0.46, 1.15, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.20, 0.82, -0.02],
      pole: [-0.25, 1.05, -0.15],
      palmInward: true,
    },
    headTilt: [0.03, -0.06, 0.06],
    genderVariant: { maleStanceMultiplier: 1.25, maleHipTiltMultiplier: 0.4 },
  },
  {
    id: 'hands-waist',
    name: 'Hands on Waist',
    label: 'Hands on Waist',
    icon: '💖',
    description: 'Symmetric hourglass posture: dual two-bone IK to waist, flared elbows, cupped waist fingers',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'balanced',
      hipShift: 0.0,
      hipTilt: 0.0,
      shoulderTilt: 0.0,
      freeKneeBend: 0.06,
    },
    fingerLeft: 'waist-grip',
    fingerRight: 'waist-grip',
    ikLeftArm: {
      target: [0.20, 1.04, 0.04],
      pole: [0.46, 1.15, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.20, 1.04, 0.04],
      pole: [-0.46, 1.15, -0.10],
      palmInward: true,
    },
    headTilt: [-0.04, 0.0, 0.0],
    genderVariant: { maleStanceMultiplier: 1.3, maleHipTiltMultiplier: 0.3 },
  },
  {
    id: 'cute-wave',
    name: 'Cute Wave',
    label: 'Cute Wave',
    icon: '👋',
    description: 'High greeting wave: right hand raised to head height with live animation, left hand on hip',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.04,
      hipTilt: -0.05,
      shoulderTilt: 0.04,
      freeKneeBend: 0.12,
    },
    fingerLeft: 'waist-grip',
    fingerRight: 'open-relaxed',
    ikLeftArm: {
      target: [0.22, 1.04, 0.03],
      pole: [0.50, 1.16, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.26, 1.62, 0.18],
      pole: [-0.46, 1.30, 0.22],
      palmInward: false,
    },
    headTilt: [-0.02, 0.06, -0.07],
    genderVariant: { maleStanceMultiplier: 1.25, maleHipTiltMultiplier: 0.4 },
  },
  {
    id: 'cute-peace',
    name: 'Cute Peace',
    label: 'Cute Peace',
    icon: '✌️',
    description: 'Kawaii selfie pose: right hand V-sign near cheek, left hand on waist, sweet playful head tilt',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.045,
      hipTilt: -0.06,
      shoulderTilt: 0.045,
      freeKneeBend: 0.14,
    },
    fingerLeft: 'waist-grip',
    fingerRight: 'peace',
    ikLeftArm: {
      target: [0.20, 1.04, 0.04],
      pole: [0.46, 1.15, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.18, 1.44, 0.14],
      pole: [-0.36, 1.20, 0.16],
      palmInward: false,
    },
    headTilt: [0.03, -0.08, 0.11],
    genderVariant: { maleStanceMultiplier: 1.2, maleHipTiltMultiplier: 0.4 },
  },
  {
    id: 'runway-glam',
    name: 'Runway Glam',
    label: 'Runway Glam',
    icon: '✨',
    description: 'Mid-stride catwalk walk: right foot leading, left extending back, dynamic torso twist and model poise',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'right',
      hipShift: -0.03,
      hipTilt: 0.05,
      shoulderTilt: -0.04,
      freeKneeBend: 0.22,
    },
    fingerLeft: 'open-relaxed',
    fingerRight: 'waist-grip',
    ikLeftArm: {
      target: [0.32, 0.98, -0.15],
      pole: [0.44, 1.15, -0.18],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.20, 1.08, 0.06],
      pole: [-0.50, 1.20, -0.08],
      palmInward: true,
    },
    rotations: {
      'Hips': [0.0, 0.26, 0.02],
      'LeftUpLeg': [-0.18, 0.0, 0.0],
      'RightUpLeg': [0.24, 0.0, 0.0],
      'RightLeg': [0.08, 0.0, 0.0],
      'Spine': [0.0, -0.14, 0.0],
    },
    headTilt: [-0.06, -0.12, 0.02],
    genderVariant: { maleStanceMultiplier: 1.3, maleHipTiltMultiplier: 0.3 },
  },
  {
    id: 'arms-crossed',
    name: 'Arms Crossed',
    label: 'Arms Crossed',
    icon: '🙅‍♀️',
    description: 'Confident crossed arms pose: two-bone IK crossing chest, tucked hands, solid stance',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'right',
      hipShift: -0.04,
      hipTilt: 0.05,
      shoulderTilt: -0.04,
      freeKneeBend: 0.10,
    },
    fingerLeft: 'light-fist',
    fingerRight: 'light-fist',
    ikLeftArm: {
      target: [-0.14, 1.24, 0.18],
      pole: [0.42, 1.18, 0.22],
      palmInward: true,
    },
    ikRightArm: {
      target: [0.14, 1.20, 0.22],
      pole: [-0.42, 1.15, 0.26],
      palmInward: true,
    },
    headTilt: [0.02, 0.03, -0.03],
    genderVariant: { maleStanceMultiplier: 1.35, maleHipTiltMultiplier: 0.3 },
  },
  {
    id: 'hands-pockets',
    name: 'Hands in Pockets',
    label: 'Hands in Pockets',
    icon: '👖',
    description: 'Relaxed casual posture: hands tucked into front pockets via IK, casual slouch and weight shift',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.04,
      hipTilt: -0.05,
      shoulderTilt: 0.04,
      freeKneeBend: 0.15,
    },
    fingerLeft: 'light-fist',
    fingerRight: 'light-fist',
    ikLeftArm: {
      target: [0.17, 0.86, 0.06],
      pole: [0.30, 1.05, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.17, 0.86, 0.06],
      pole: [-0.30, 1.05, -0.10],
      palmInward: true,
    },
    rotations: {
      'Spine': [0.04, 0.0, 0.0],
    },
    headTilt: [0.02, 0.05, 0.03],
    genderVariant: { maleStanceMultiplier: 1.35, maleHipTiltMultiplier: 0.35 },
  },
  {
    id: 'over-shoulder',
    name: 'Over-the-Shoulder',
    label: 'Over Shoulder',
    icon: '💃',
    description: 'Photoshoot 3/4 turn looking back over shoulder toward camera, spiral torso twist',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.03,
      hipTilt: -0.04,
      shoulderTilt: 0.03,
      freeKneeBend: 0.14,
    },
    fingerLeft: 'open-relaxed',
    fingerRight: 'waist-grip',
    ikLeftArm: {
      target: [0.24, 0.96, -0.04],
      pole: [0.36, 1.15, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.16, 1.04, 0.05],
      pole: [-0.44, 1.18, -0.08],
      palmInward: true,
    },
    rotations: {
      'Hips': [0.0, 0.75, 0.0],
      'Spine': [0.0, -0.30, 0.0],
      'Spine1': [0.0, -0.25, 0.0],
      'Spine2': [0.0, -0.15, 0.0],
    },
    headTilt: [0.04, -0.85, 0.08],
    genderVariant: { maleStanceMultiplier: 1.25, maleHipTiltMultiplier: 0.35 },
  },
  {
    id: 'hair-touch',
    name: 'Hair Touch',
    label: 'Hair Touch',
    icon: '💇‍♀️',
    description: 'Sensual fashion pose: right hand lightly touching hair near temple/ear, left hand on hip, head tilt',
    source: 'procedural',
    blendTime: 500,
    contrapposto: {
      weightLeg: 'left',
      hipShift: 0.045,
      hipTilt: -0.065,
      shoulderTilt: 0.05,
      freeKneeBend: 0.16,
    },
    fingerLeft: 'waist-grip',
    fingerRight: 'open-relaxed',
    ikLeftArm: {
      target: [0.20, 1.04, 0.04],
      pole: [0.46, 1.15, -0.10],
      palmInward: true,
    },
    ikRightArm: {
      target: [-0.15, 1.50, 0.08],
      pole: [-0.38, 1.28, 0.10],
      palmInward: true,
    },
    headTilt: [0.05, 0.08, -0.14],
    genderVariant: { maleStanceMultiplier: 1.25, maleHipTiltMultiplier: 0.4 },
  },
];

/** For backwards compatibility with HumanEditor / HumanCanvas */
export const POSE_PRESETS = V1_POSES;

/** Cache rest pose transforms for all bones */
export function initBoneRestPoses(bones: Bone[]) {
  for (const bone of bones) {
    if (!bone.userData.restQuaternion) {
      bone.userData.restQuaternion = bone.quaternion.clone();
      bone.userData.restPosition = bone.position.clone();
    }
  }
}

/** Reset all bones to their rest quaternions and positions */
export function resetToRestPose(bones: Bone[]) {
  initBoneRestPoses(bones);
  for (const bone of bones) {
    if (bone.userData.restQuaternion) {
      bone.quaternion.copy(bone.userData.restQuaternion);
      bone.position.copy(bone.userData.restPosition);
      bone.updateMatrix();
    }
  }
  if (bones.length > 0 && bones[0]) {
    bones[0].updateMatrixWorld(true);
  }
}

/** Per-bone joint limit safety check */
export function clampJointLimits(boneName: string, euler: Euler) {
  // Prevent hyperextension of elbows
  if (/ForeArm$/i.test(boneName)) {
    // Elbow hinge can only flex forward (min 5 degrees bend, max 145 degrees)
    euler.x = Math.max(-0.2, Math.min(2.5, euler.x));
    euler.z = Math.max(-2.5, Math.min(2.5, euler.z));
  }
  // Wrist neutral clamp: prevent painful dislocation angles
  if (/Hand$/i.test(boneName)) {
    euler.x = Math.max(-0.55, Math.min(0.55, euler.x));
    euler.y = Math.max(-0.45, Math.min(0.45, euler.y));
    euler.z = Math.max(-0.65, Math.min(0.65, euler.z));
  }
  // Knee hinge: only flexes backwards
  if (/Leg$/i.test(boneName) && !/UpLeg$/i.test(boneName)) {
    euler.x = Math.max(0.0, Math.min(2.4, euler.x));
    euler.y = Math.max(-0.15, Math.min(0.15, euler.y));
    euler.z = Math.max(-0.15, Math.min(0.15, euler.z));
  }
}

/**
 * Analytical Two-Bone IK Solver.
 * Solves exact positions and quaternions for UpperArm and ForeArm so that
 * the Hand lands precisely on targetPos.
 */
export function solveTwoBoneIK(
  rootBone: Bone,
  midBone: Bone,
  endBone: Bone,
  targetPos: Vector3,
  polePos: Vector3,
  palmInward: boolean = true,
  isLeft: boolean = true,
) {
  rootBone.updateWorldMatrix(true, false);
  const rootPos = rootBone.getWorldPosition(new Vector3());
  const l1 = midBone.position.length(); // length of upper arm
  const l2 = endBone.position.length(); // length of forearm

  const d = Math.max(0.001, Math.min(l1 + l2 - 0.005, rootPos.distanceTo(targetPos)));
  const dir = new Vector3().subVectors(targetPos, rootPos).normalize();
  const poleDir = new Vector3().subVectors(polePos, rootPos);

  let normal = new Vector3().crossVectors(dir, poleDir).normalize();
  if (normal.lengthSq() < 0.0001) normal.set(0, 0, 1);
  const bendDir = new Vector3().crossVectors(normal, dir).normalize();

  // Law of Cosines
  const cosAlpha = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));

  const elbowPos = new Vector3()
    .copy(rootPos)
    .addScaledVector(dir, l1 * cosAlpha)
    .addScaledVector(bendDir, l1 * sinAlpha);

  // Upper arm and Forearm basis matrices (+Y points along bone)
  const yUpper = new Vector3().subVectors(elbowPos, rootPos).normalize();
  const yForearm = new Vector3().subVectors(targetPos, elbowPos).normalize();

  // Consistent elbow hinge axis normal to the bend plane
  let hingeZ = new Vector3().crossVectors(yUpper, yForearm).normalize();
  if (hingeZ.lengthSq() < 0.0001) hingeZ.copy(normal);
  if (!isLeft) hingeZ.negate();

  const xUpper = new Vector3().crossVectors(yUpper, hingeZ).normalize();
  hingeZ.crossVectors(xUpper, yUpper).normalize();
  const qUpper = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(xUpper, yUpper, hingeZ));

  const xForearm = new Vector3().crossVectors(yForearm, hingeZ).normalize();
  const qForearm = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(xForearm, yForearm, hingeZ));

  // Convert to local bone quaternions in Three.js hierarchy
  const parentWorldQ = rootBone.parent ? rootBone.parent.getWorldQuaternion(new Quaternion()) : new Quaternion();
  rootBone.quaternion.copy(parentWorldQ.clone().invert().multiply(qUpper));
  midBone.quaternion.copy(qUpper.clone().invert().multiply(qForearm));

  // Hand rotation: orient palm inward toward the body surface
  if (palmInward) {
    const handDir = new Vector3().subVectors(targetPos, elbowPos).normalize();
    const palmNormal = isLeft ? new Vector3(-1, 0, 0) : new Vector3(1, 0, 0);
    const handX = new Vector3().crossVectors(handDir, palmNormal).normalize();
    const handZ = new Vector3().crossVectors(handX, handDir).normalize();
    const qHand = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(handX, handDir, handZ));
    endBone.quaternion.copy(qForearm.clone().invert().multiply(qHand));
  }

  rootBone.updateMatrixWorld(true);
}

/** Apply finger curling presets to all 15 finger bones of a hand */
export function applyFingerPreset(byName: Map<string, Bone>, side: 'Left' | 'Right', preset: FingerPresetType) {
  const isLeft = side === 'Left';
  const prefix = `mixamorig:${side}Hand`;
  const sign = isLeft ? 1 : -1;

  // Joint curl angles in radians [joint1, joint2, joint3]
  let curls: { index: number[]; middle: number[]; ring: number[]; pinky: number[]; thumb: number[] };

  switch (preset) {
    case 'open-relaxed':
      curls = {
        index: [0.18, 0.22, 0.15],
        middle: [0.22, 0.28, 0.18],
        ring: [0.26, 0.32, 0.22],
        pinky: [0.30, 0.38, 0.25],
        thumb: [0.12, 0.16, 0.14],
      };
      break;
    case 'light-fist':
      curls = {
        index: [1.10, 1.25, 0.95],
        middle: [1.15, 1.30, 1.00],
        ring: [1.20, 1.35, 1.05],
        pinky: [1.25, 1.40, 1.10],
        thumb: [0.65, 0.75, 0.55],
      };
      break;
    case 'waist-grip':
      curls = {
        index: [0.45, 0.55, 0.40],
        middle: [0.50, 0.60, 0.45],
        ring: [0.55, 0.65, 0.50],
        pinky: [0.60, 0.70, 0.55],
        thumb: [-0.15, 0.20, 0.15], // thumb extended backwards
      };
      break;
    case 'peace':
      curls = {
        index: [0.04, 0.02, 0.02], // extended straight
        middle: [0.04, 0.02, 0.02], // extended straight
        ring: [1.45, 1.55, 1.20],  // curled into palm
        pinky: [1.50, 1.60, 1.25], // curled into palm
        thumb: [0.85, 0.90, 0.60],  // over ring finger
      };
      break;
    case 'point':
      curls = {
        index: [0.02, 0.02, 0.02],
        middle: [1.40, 1.50, 1.15],
        ring: [1.45, 1.55, 1.20],
        pinky: [1.50, 1.60, 1.25],
        thumb: [0.80, 0.85, 0.55],
      };
      break;
  }

  const applyChain = (fingerName: string, angles: number[]) => {
    for (let i = 1; i <= 3; i++) {
      const bone = byName.get(`${prefix}${fingerName}${i}`);
      if (bone) {
        // Z is primary hinge axis for MakeHuman fingers
        const q = new Quaternion().setFromAxisAngle(WORLD_Z, angles[i - 1] * sign);
        bone.quaternion.copy(q);
      }
    }
  };

  applyChain('Index', curls.index);
  applyChain('Middle', curls.middle);
  applyChain('Ring', curls.ring);
  applyChain('Pinky', curls.pinky);
  applyChain('Thumb', curls.thumb);
}

/** Check garment mesh boundary to prevent hands/limbs from clipping into dresses or jackets */
export function checkGarmentClipping(target: Vector3, garmentRadius: number = 0.22): Vector3 {
  const out = target.clone();
  // Check lateral distance from torso axis (x=0, z=0)
  const lateralDist = Math.sqrt(out.x * out.x + out.z * out.z);
  if (lateralDist < garmentRadius) {
    const factor = garmentRadius / Math.max(0.001, lateralDist);
    out.x *= factor;
    out.z *= factor;
    console.log(`[GarmentClipCheck] Hand target pushed outward to clear garment: ${lateralDist.toFixed(3)}m -> ${garmentRadius.toFixed(3)}m`);
  }
  return out;
}

/**
 * Apply complete fashion pose:
 * 1. Reset to rest pose
 * 2. Apply contrapposto weight shift & shoulder counter-tilt
 * 3. Solve 2-bone IK for arms to body surface targets
 * 4. Apply finger presets
 * 5. Apply natural breathing & micro-sway momentum
 * 6. Keep both feet grounded
 */
export function applyPose(
  bones: Bone[],
  poseId: string = 'relaxed',
  timeSeconds: number = 0,
  gender: 'female' | 'male' = 'female',
  garmentRadius: number = 0.22,
) {
  resetToRestPose(bones);
  const byName = new Map(bones.map((b) => [b.name, b]));
  const pose = V1_POSES.find((p) =>
    p.id === poseId ||
    (poseId === 'relaxed' && p.id === 'natural') ||
    (poseId === 'cute-waist' && p.id === 'hands-waist') ||
    (poseId === 'hands-in-pockets' && p.id === 'hands-pockets')
  ) || V1_POSES[0];

  const isMale = gender === 'male';
  const stanceMult = isMale ? (pose.genderVariant?.maleStanceMultiplier ?? 1.3) : 1.0;
  const hipTiltMult = isMale ? (pose.genderVariant?.maleHipTiltMultiplier ?? 0.35) : 1.0;

  // 1. Contrapposto: Hips, Spine, and Legs
  const cp = pose.contrapposto;
  const hips = byName.get('mixamorig:Hips');
  const spine = byName.get('mixamorig:Spine');
  const spine1 = byName.get('mixamorig:Spine1');
  const spine2 = byName.get('mixamorig:Spine2');
  const leftUpLeg = byName.get('mixamorig:LeftUpLeg');
  const rightUpLeg = byName.get('mixamorig:RightUpLeg');
  const leftLeg = byName.get('mixamorig:LeftLeg');
  const rightLeg = byName.get('mixamorig:RightLeg');
  const leftFoot = byName.get('mixamorig:LeftFoot');
  const rightFoot = byName.get('mixamorig:RightFoot');

  if (hips) {
    hips.position.x += cp.hipShift * hipTiltMult;
    hips.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_Z, cp.hipTilt * hipTiltMult));

    // Stance width adjustment
    if (leftUpLeg) leftUpLeg.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_Z, -0.04 * (stanceMult - 1)));
    if (rightUpLeg) rightUpLeg.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_Z, 0.04 * (stanceMult - 1)));

    // Counter-tilt spine to balance shoulders
    if (spine2) {
      spine2.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_Z, cp.shoulderTilt * hipTiltMult));
    }

    // Free leg knee flexion
    if (cp.weightLeg === 'left' && rightLeg && rightFoot) {
      rightLeg.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_X, cp.freeKneeBend));
      rightFoot.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_X, -cp.freeKneeBend * 0.5));
    } else if (cp.weightLeg === 'right' && leftLeg && leftFoot) {
      leftLeg.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_X, cp.freeKneeBend));
      leftFoot.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_X, -cp.freeKneeBend * 0.5));
    }
  }

  // 2. Extra per-bone rotations specified in the pose preset
  if (pose.rotations) {
    for (const [boneName, rot] of Object.entries(pose.rotations)) {
      const bone = byName.get(`mixamorig:${boneName}`) || byName.get(boneName);
      if (bone) {
        const q = new Quaternion().setFromEuler(new Euler(rot[0], rot[1], rot[2]));
        bone.quaternion.multiply(q);
      }
    }
  }

  // Update world matrices up to shoulders before solving arm IK
  if (bones[0]) bones[0].updateMatrixWorld(true);

  // 3. Two-Bone IK for Left Arm
  if (pose.ikLeftArm) {
    const leftArm = byName.get('mixamorig:LeftArm');
    const leftForeArm = byName.get('mixamorig:LeftForeArm');
    const leftHand = byName.get('mixamorig:LeftHand');
    if (leftArm && leftForeArm && leftHand) {
      let target = new Vector3(...pose.ikLeftArm.target);
      target = checkGarmentClipping(target, garmentRadius);
      const pole = new Vector3(...pose.ikLeftArm.pole);
      solveTwoBoneIK(leftArm, leftForeArm, leftHand, target, pole, pose.ikLeftArm.palmInward ?? true, true);
    }
  }

  // 4. Two-Bone IK for Right Arm
  if (pose.ikRightArm) {
    const rightArm = byName.get('mixamorig:RightArm');
    const rightForeArm = byName.get('mixamorig:RightForeArm');
    const rightHand = byName.get('mixamorig:RightHand');
    if (rightArm && rightForeArm && rightHand) {
      let target = new Vector3(...pose.ikRightArm.target);
      target = checkGarmentClipping(target, garmentRadius);
      const pole = new Vector3(...pose.ikRightArm.pole);

      // Live waving motion in Cute Wave
      if (poseId === 'cute-wave' && timeSeconds > 0) {
        const waveAngle = Math.sin(timeSeconds * 6.0) * 0.05;
        target.x += waveAngle;
      }

      solveTwoBoneIK(rightArm, rightForeArm, rightHand, target, pole, pose.ikRightArm.palmInward ?? true, false);
    }
  }

  // 5. Head tilt
  const head = byName.get('mixamorig:Head');
  if (head && pose.headTilt) {
    const qHead = new Quaternion().setFromEuler(new Euler(...pose.headTilt));
    head.quaternion.multiply(qHead);
  }

  // 6. Finger Presets
  applyFingerPreset(byName, 'Left', pose.fingerLeft);
  applyFingerPreset(byName, 'Right', pose.fingerRight);

  // 7. Subtle procedural momentum (breathing & micro-sway under 0.5 degrees)
  if (timeSeconds > 0) {
    const breath = Math.sin(timeSeconds * 2.0) * 0.007; // < 0.4 degrees
    if (spine1) spine1.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_X, breath));

    const microSway = Math.sin(timeSeconds * 1.0) * 0.005; // < 0.3 degrees
    if (head) head.quaternion.multiply(new Quaternion().setFromAxisAngle(WORLD_Z, microSway));
  }

  // Ensure grounded feet: adjust root height so lowest foot rests precisely at y = 0
  if (bones[0]) bones[0].updateMatrixWorld(true);
  if (leftFoot && rightFoot && hips) {
    const lPos = leftFoot.getWorldPosition(new Vector3());
    const rPos = rightFoot.getWorldPosition(new Vector3());
    const lowestY = Math.min(lPos.y, rPos.y);
    const footOffset = 0.08; // approximate ankle-to-sole height
    const groundDelta = (lowestY - footOffset);
    if (Math.abs(groundDelta) > 0.005) {
      hips.position.y -= groundDelta;
      if (bones[0]) bones[0].updateMatrixWorld(true);
    }
  }
}

/** Backward-compatible relaxed pose helper. */
export function applyRelaxedPose(bones: Bone[]) {
  initBoneRestPoses(bones);
  applyPose(bones, 'natural', 0);
}

/**
 * Smooth pose blender:
 * Slerps bone rotations between poses over 400-600ms using cubic ease-in-out curve.
 * Interpolates root hips position to eliminate snapping.
 */
export class PoseBlender {
  private currentPoseId: string = 'natural';
  private targetPoseId: string = 'natural';
  private startRotations = new Map<string, Quaternion>();
  private startHipsPos = new Vector3();
  private transitionStart: number = 0;
  private transitionDuration: number = 500;
  private isTransitioning: boolean = false;
  private needsCapture: boolean = false;

  public paused: boolean = false;

  setTarget(poseId: string, duration?: number) {
    if (poseId === this.targetPoseId) return;
    const pose = V1_POSES.find((p) =>
      p.id === poseId ||
      (poseId === 'relaxed' && p.id === 'natural') ||
      (poseId === 'cute-waist' && p.id === 'hands-waist') ||
      (poseId === 'hands-in-pockets' && p.id === 'hands-pockets')
    );
    this.targetPoseId = poseId;
    this.transitionDuration = duration ?? (pose?.blendTime ?? 500);
    this.needsCapture = true;
  }

  getTargetPoseId(): string {
    return this.targetPoseId;
  }

  update(
    bones: Bone[],
    timeSeconds: number = 0,
    gender: 'female' | 'male' = 'female',
    garmentRadius: number = 0.22,
  ) {
    if (this.paused) return;

    const hips = bones.find((b) => b.name === 'mixamorig:Hips');

    if (this.needsCapture) {
      this.startRotations.clear();
      for (const b of bones) {
        this.startRotations.set(b.name, b.quaternion.clone());
      }
      if (hips) this.startHipsPos.copy(hips.position);
      this.transitionStart = performance.now();
      this.isTransitioning = true;
      this.needsCapture = false;
    }

    // Apply target pose
    applyPose(bones, this.targetPoseId, timeSeconds, gender, garmentRadius);

    if (this.isTransitioning) {
      const elapsed = performance.now() - this.transitionStart;
      const u = Math.min(1.0, Math.max(0.0, elapsed / Math.max(1, this.transitionDuration)));
      // Smooth cubic ease-in-out
      const t = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

      for (const b of bones) {
        const startQ = this.startRotations.get(b.name);
        if (startQ) {
          const targetQ = b.quaternion.clone();
          b.quaternion.copy(startQ).slerp(targetQ, t);
        }
      }

      if (hips) {
        const targetHipsPos = hips.position.clone();
        hips.position.lerpVectors(this.startHipsPos, targetHipsPos, t);
      }

      if (u >= 1.0) {
        this.isTransitioning = false;
        this.currentPoseId = this.targetPoseId;
      }
      if (bones[0]) bones[0].updateMatrixWorld(true);
    }
  }
}

