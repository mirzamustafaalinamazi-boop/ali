import { Bone, Quaternion, Vector3 } from 'three';

const WORLD_Z = new Vector3(0, 0, 1);
const WORLD_X = new Vector3(1, 0, 0);

/** Bring the MakeHuman rest pose's spread arms gently toward the torso. */
export function applyRelaxedPose(bones: Bone[]) {
  const byName = new Map(bones.map(bone => [bone.name, bone]));
  const rotate = (name: string, axis: Vector3, angle: number) => {
    const bone = byName.get(`mixamorig:${name}`);
    if (!bone?.parent) return;
    bone.parent.updateWorldMatrix(true, false);
    const parentWorld = bone.parent.getWorldQuaternion(new Quaternion());
    const localAxis = axis.clone().applyQuaternion(parentWorld.invert()).normalize();
    bone.quaternion.premultiply(new Quaternion().setFromAxisAngle(localAxis, angle));
    bone.updateWorldMatrix(false, true);
  };
  rotate('LeftShoulder', WORLD_Z, -0.10);
  rotate('RightShoulder', WORLD_Z, 0.10);
  rotate('LeftArm', WORLD_Z, -0.30);
  rotate('RightArm', WORLD_Z, 0.30);
  rotate('LeftForeArm', WORLD_X, 0.16);
  rotate('RightForeArm', WORLD_X, 0.16);
}
