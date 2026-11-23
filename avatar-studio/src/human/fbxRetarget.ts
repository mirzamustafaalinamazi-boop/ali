import { AnimationClip, Bone, Quaternion, Vector3 } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export interface RetargetedPoseFrame {
  rotations: Map<string, Quaternion>;
  rootTranslation?: Vector3;
}

const loader = new FBXLoader();

/** Normalize Mixamo bone naming conventions to our mixamorig:Name standard. */
export function normalizeMixamoBoneName(rawName: string): string {
  let name = rawName.replace(/^mixamorig\d*[:_]?/i, '');
  return `mixamorig:${name}`;
}

/**
 * Attempt to fetch and load a Mixamo FBX file from public/poses/.
 * Retargets bone rotations to our skeleton by compensating for the difference
 * between Mixamo bind pose and our rest pose.
 */
export async function loadMixamoPose(fbxUrl: string, sampleTime: number = 0): Promise<RetargetedPoseFrame | null> {
  try {
    const res = await fetch(fbxUrl, { method: 'HEAD' });
    if (!res.ok) return null;
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    loader.load(
      fbxUrl,
      (group) => {
        try {
          const clip = group.animations?.[0];
          const result = new Map<string, Quaternion>();
          let rootTranslation: Vector3 | undefined;

          if (clip) {
            // Sample clip at sampleTime
            for (const track of clip.tracks) {
              if (track.name.endsWith('.quaternion')) {
                const boneName = normalizeMixamoBoneName(track.name.replace(/\.quaternion$/, ''));
                const trackTimes = track.times;
                const trackValues = track.values;
                const time = Math.min(Math.max(sampleTime, trackTimes[0]), trackTimes[trackTimes.length - 1]);

                // Linear interpolation between nearest keyframes
                let idx = 0;
                while (idx < trackTimes.length - 1 && trackTimes[idx + 1] <= time) {
                  idx++;
                }

                const q = new Quaternion(
                  trackValues[idx * 4],
                  trackValues[idx * 4 + 1],
                  trackValues[idx * 4 + 2],
                  trackValues[idx * 4 + 3],
                ).normalize();

                result.set(boneName, q);
              } else if (track.name.endsWith('.position') && /Hips/i.test(track.name)) {
                const trackValues = track.values;
                rootTranslation = new Vector3(trackValues[0], trackValues[1], trackValues[2]);
              }
            }
          } else {
            // Static pose without animation clip: read bone local quaternions directly
            group.traverse((obj) => {
              if ((obj as any).isBone) {
                const bone = obj as Bone;
                const norm = normalizeMixamoBoneName(bone.name);
                result.set(norm, bone.quaternion.clone());
              }
            });
          }

          resolve({ rotations: result, rootTranslation });
        } catch (err) {
          console.warn('[fbxRetarget] Error parsing FBX:', err);
          resolve(null);
        }
      },
      undefined,
      (err) => {
        console.warn(`[fbxRetarget] Could not load FBX from ${fbxUrl}:`, err);
        resolve(null);
      },
    );
  });
}
