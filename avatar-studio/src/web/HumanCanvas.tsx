// <HumanCanvas>: the realistic avatar in a React (web) app.
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping, Color, DirectionalLight, Euler, HemisphereLight, PMREMGenerator, PerspectiveCamera, Scene, SRGBColorSpace,
  Vector3, WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { HumanAvatar, HumanConfig, HumanPackage, TextureTier } from '../human/runtime';

export interface HumanCanvasProps {
  pkg: HumanPackage;
  config: Partial<HumanConfig>;
  framing?: 'face' | 'body';
  pose?: string;
  celebrateTrigger?: number;
  /** ARKit-style expression weights, e.g. { mouthSmile: 0.6 } */
  expressions?: Record<string, number>;
  background?: string;
  /** Drag to turn the avatar. Default true. */
  rotatable?: boolean;
  /** Texture tier: '512' | '1k' | '2k' (default '2k'). */
  textureSize?: TextureTier;
  className?: string;
  style?: React.CSSProperties;
  devPoseEditor?: boolean;
  onReady?: (avatar: HumanAvatar) => void;
}

export interface HumanCanvasHandle {
  avatar: HumanAvatar | null;
  render(): void;
  /** PNG data URL of the current view. */
  snapshot(): string | null;
  /** Set camera yaw angle in radians */
  setYaw(yaw: number): void;
}

interface Stage {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  avatar: HumanAvatar;
  tc: TransformControls;
  yaw: number;
  framing: 'face' | 'body';
  ready: boolean;
}

const MAJOR_BONES = [
  'mixamorig:Hips',
  'mixamorig:Spine',
  'mixamorig:Spine1',
  'mixamorig:Spine2',
  'mixamorig:Neck',
  'mixamorig:Head',
  'mixamorig:LeftShoulder',
  'mixamorig:LeftArm',
  'mixamorig:LeftForeArm',
  'mixamorig:LeftHand',
  'mixamorig:RightShoulder',
  'mixamorig:RightArm',
  'mixamorig:RightForeArm',
  'mixamorig:RightHand',
  'mixamorig:LeftUpLeg',
  'mixamorig:LeftLeg',
  'mixamorig:LeftFoot',
  'mixamorig:RightUpLeg',
  'mixamorig:RightLeg',
  'mixamorig:RightFoot',
];

export const HumanCanvas = forwardRef<HumanCanvasHandle, HumanCanvasProps>(function HumanCanvas(
  { pkg, config, framing = 'face', pose = 'natural', celebrateTrigger = 0, expressions, background = '#e9ecf1', rotatable = true, textureSize = '2k', className, style, devPoseEditor, onReady }, ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const ready = useRef(onReady);
  ready.current = onReady;
  const activePoseRef = useRef(pose);
  activePoseRef.current = pose;
  const genderRef = useRef<'female' | 'male'>((config.gender ?? 0) > 0.5 ? 'male' : 'female');
  genderRef.current = (config.gender ?? 0) > 0.5 ? 'male' : 'female';
  const celebrateUntil = useRef(0);
  const isGizmoDragging = useRef(false);

  // Dev pose editor state
  const [isDevOpen, setIsDevOpen] = useState(() => {
    if (devPoseEditor) return true;
    if (typeof window !== 'undefined') {
      const q = window.location.search;
      return q.includes('poseEditor=1') || q.includes('dev=1');
    }
    return false;
  });
  const [selectedBone, setSelectedBone] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [controlMode, setControlMode] = useState<'rotate' | 'translate'>('rotate');
  const [jsonText, setJsonText] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    if (celebrateTrigger > 0) {
      celebrateUntil.current = performance.now() + 1400;
    }
  }, [celebrateTrigger]);

  useEffect(() => {
    const el = host.current!;
    const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02; // Luminous, flattering skin tones
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: rotatable ? 'grab' : 'default' });
    el.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.background = new Color(background);
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;

    // Studio 3-point beauty lighting for soft, radiant facial features
    const key = new DirectionalLight('#fff5ed', 1.25);
    key.position.set(1.2, 2.2, 2.5);
    const beautyFill = new DirectionalLight('#fff1e6', 0.55);
    beautyFill.position.set(0, 0.4, 2.2); // Soft low-fill to illuminate chin & under-eyes
    const rim = new DirectionalLight('#eae5df', 0.75);
    rim.position.set(-2, 2, -2);
    const hemi = new HemisphereLight('#fff8f2', '#b8a899', 0.38);

    scene.add(key, beautyFill, rim, hemi);

    const avatar = new HumanAvatar(pkg);
    avatar.textureSize = textureSize;
    scene.add(avatar.group);

    const camera = new PerspectiveCamera(24, 1, 0.05, 50);

    // TransformControls for Dev Pose Editor
    const tc = new TransformControls(camera, renderer.domElement);
    tc.setMode('rotate');
    tc.space = 'local';
    tc.size = 0.75;
    tc.addEventListener('dragging-changed', (event: any) => {
      isGizmoDragging.current = !!event.value;
    });
    scene.add(tc.getHelper());

    const s: Stage = { renderer, scene, camera, avatar, tc, yaw: 0, framing, ready: false };
    stage.current = s;

    const resize = () => {
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let drag: number | null = null;
    const canvas = renderer.domElement;
    canvas.onpointerdown = (e) => {
      if (!rotatable || isGizmoDragging.current) return;
      drag = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    canvas.onpointermove = (e) => {
      if (drag === null || isGizmoDragging.current) return;
      s.yaw -= (e.clientX - drag) * 0.01;
      drag = e.clientX;
    };
    canvas.onpointerup = canvas.onpointercancel = () => {
      drag = null;
      canvas.style.cursor = rotatable ? 'grab' : 'default';
    };

    // Continuous lifelike momentum animation loop
    let animId = 0;
    let nextBlink = performance.now() + 2000;
    let blinkStart = 0;
    const BLINK_DURATION = 170;

    const renderFrame = () => {
      if (!stage.current) return;
      const st = stage.current;
      const now = performance.now();
      const timeSeconds = now * 0.001;

      if (st.ready) {
        // 1. Natural eye blinking
        let blinkWeight = 0;
        if (now >= nextBlink && blinkStart === 0) {
          blinkStart = now;
        }
        if (blinkStart > 0) {
          const elapsed = now - blinkStart;
          if (elapsed < BLINK_DURATION) {
            blinkWeight = Math.sin((elapsed / BLINK_DURATION) * Math.PI);
          } else {
            blinkStart = 0;
            nextBlink = now + 2600 + Math.random() * 2400;
          }
        }

        // 2. Expressions: cute smile & friendly expression
        const isCelebrating = now < celebrateUntil.current;
        const baseSmile = expressions?.mouthSmile ?? 0.28;
        const smile = isCelebrating ? Math.min(0.55, baseSmile + 0.22) : baseSmile;

        st.avatar.setExpression('mouthSmile', smile);
        st.avatar.setExpression('eyeBlinkLeft', blinkWeight);
        st.avatar.setExpression('eyeBlinkRight', blinkWeight);
        st.avatar.setExpression('browUpLeft', 0.06);
        st.avatar.setExpression('browUpRight', 0.06);
        st.avatar.setExpression('eyeSquintLeft', 0.03 + (isCelebrating ? 0.06 : 0));
        st.avatar.setExpression('eyeSquintRight', 0.03 + (isCelebrating ? 0.06 : 0));

        // 3. Pose momentum & smooth slerp transitions with gender-specific adaptations
        st.avatar.setPose(activePoseRef.current, timeSeconds, genderRef.current);

        // 4. Camera target and rendering
        const m = st.avatar.metrics();
        const face = st.framing === 'face';
        const target = face ? new Vector3(0, m.headY - 0.05, 0) : new Vector3(0, m.height * 0.48, 0);
        const h = face ? 0.48 : m.height * 1.28;
        const dist = h / 2 / Math.tan((st.camera.fov * Math.PI) / 360) / Math.min(1, st.camera.aspect * 0.95);
        st.camera.position.set(Math.sin(st.yaw) * dist, target.y + (face ? dist * 0.02 : dist * 0.01), Math.cos(st.yaw) * dist);
        st.camera.lookAt(target);
        st.renderer.render(st.scene, st.camera);
      }

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      tc.dispose();
      avatar.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
      stage.current = null;
    };
  }, [pkg]);

  // Dev Pose Editor: Bone Attachment and Mode
  useEffect(() => {
    const s = stage.current;
    if (!s || !s.tc) return;
    if (!selectedBone) {
      s.tc.detach();
      return;
    }
    const bone = s.avatar.skeleton.bones.find((b) => b.name === selectedBone);
    if (bone) {
      s.tc.attach(bone);
      s.tc.setMode(controlMode);
      s.tc.space = 'local';
    } else {
      s.tc.detach();
    }
  }, [selectedBone, controlMode]);

  // Dev Pose Editor: Pause/Resume animation loop
  useEffect(() => {
    const s = stage.current;
    if (s?.avatar) {
      s.avatar.poseBlender.paused = isPaused;
    }
  }, [isPaused]);

  const handleMirror = () => {
    const s = stage.current;
    if (!s?.avatar) return;
    const bones = s.avatar.skeleton.bones;
    for (const b of bones) {
      if (b.name.startsWith('mixamorig:Left')) {
        const rightName = b.name.replace('mixamorig:Left', 'mixamorig:Right');
        const rb = bones.find((r) => r.name === rightName);
        if (rb) {
          const e = new Euler().setFromQuaternion(b.quaternion);
          rb.quaternion.setFromEuler(new Euler(e.x, -e.y, -e.z));
        }
      }
    }
    s.avatar.group.updateMatrixWorld(true);
    s.avatar.skeleton.update();
    showToast('Mirrored Left to Right (L ➔ R)');
  };

  const handleExportJson = () => {
    const s = stage.current;
    if (!s?.avatar) return;
    const rotations: Record<string, [number, number, number]> = {};
    for (const b of s.avatar.skeleton.bones) {
      const e = new Euler().setFromQuaternion(b.quaternion);
      if (Math.abs(e.x) > 0.015 || Math.abs(e.y) > 0.015 || Math.abs(e.z) > 0.015) {
        const cleanName = b.name.replace('mixamorig:', '');
        rotations[cleanName] = [
          Number(e.x.toFixed(3)),
          Number(e.y.toFixed(3)),
          Number(e.z.toFixed(3)),
        ];
      }
    }
    const poseObj = {
      id: 'custom-pose',
      name: 'Custom Fashion Pose',
      label: 'Custom',
      icon: '✨',
      source: 'procedural',
      blendTime: 500,
      fingerLeft: 'open-relaxed',
      fingerRight: 'open-relaxed',
      rotations,
    };
    const jsonStr = JSON.stringify(poseObj, null, 2);
    setJsonText(jsonStr);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(jsonStr).then(() => showToast('Pose JSON copied to clipboard!'));
    } else {
      showToast('Generated Pose JSON');
    }
  };

  const handleLoadJson = () => {
    const s = stage.current;
    if (!s?.avatar) return;
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.rotations) {
        for (const [boneName, rot] of Object.entries(parsed.rotations as Record<string, [number, number, number]>)) {
          const b = s.avatar.skeleton.bones.find((bone) => bone.name === `mixamorig:${boneName}` || bone.name === boneName);
          if (b && Array.isArray(rot) && rot.length === 3) {
            b.quaternion.setFromEuler(new Euler(rot[0], rot[1], rot[2]));
          }
        }
        s.avatar.group.updateMatrixWorld(true);
        s.avatar.skeleton.update();
        showToast('Custom pose applied to avatar!');
      }
    } catch (e) {
      showToast('Error parsing JSON');
    }
  };

  const key = JSON.stringify(config);
  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    let live = true;
    s.avatar.setConfig(config).then(() => {
      if (!live) return;
      s.ready = true;
      ready.current?.(s.avatar);
    });
    return () => { live = false; };
  }, [key, pkg]);

  useEffect(() => {
    const s = stage.current;
    if (!s) return;
    s.framing = framing;
    (s.scene.background as Color).set(background);
    for (const name of s.avatar.expressionNames) s.avatar.setExpression(name, expressions?.[name] ?? 0);
  }, [framing, background, JSON.stringify(expressions)]);

  useImperativeHandle(ref, () => ({
    get avatar() { return stage.current?.avatar ?? null; },
    render() {
      const s = stage.current;
      if (!s || !s.ready) return;
      s.renderer.render(s.scene, s.camera);
    },
    snapshot() {
      const s = stage.current;
      if (!s || !s.ready) return null;
      s.renderer.render(s.scene, s.camera);
      return s.renderer.domElement.toDataURL('image/png');
    },
    setYaw(yaw: number) {
      if (stage.current) {
        stage.current.yaw = yaw;
      }
    },
  }));

  useEffect(() => {
    (window as any).__avatarControl = {
      getAvatar: () => stage.current?.avatar,
      getStage: () => stage.current,
      setPose: (poseId: string) => {
        activePoseRef.current = poseId;
        if (stage.current?.avatar) {
          stage.current.avatar.poseBlender.setTarget(poseId, 0); // Immediate for snapshot capture
        }
      },
      setYaw: (yaw: number) => {
        if (stage.current) stage.current.yaw = yaw;
      },
      setGender: (g: 'female' | 'male') => {
        genderRef.current = g;
      },
      snapshot: () => {
        const s = stage.current;
        if (!s || !s.ready) return null;
        s.renderer.render(s.scene, s.camera);
        return s.renderer.domElement.toDataURL('image/png');
      },
      isReady: () => stage.current?.ready ?? false,
    };
    return () => {
      delete (window as any).__avatarControl;
    };
  }, []);

  return (
    <div ref={host} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Dev Pose Editor Floating Panel (?poseEditor=1) */}
      {isDevOpen && (
        <div style={{
          position: 'absolute', top: 12, right: 12, width: 280,
          background: 'rgba(28, 28, 34, 0.94)', color: '#fff', borderRadius: 12,
          padding: '12px 14px', zIndex: 100, fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.4px' }}>🛠️ POSE DEV EDITOR</span>
            <button
              onClick={() => setIsDevOpen(false)}
              style={{ background: 'transparent', border: 0, color: '#999', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#aaa', marginBottom: 4 }}>SELECT BONE:</label>
            <select
              value={selectedBone}
              onChange={(e) => setSelectedBone(e.target.value)}
              style={{ width: '100%', background: '#2c2c36', color: '#fff', border: '1px solid #444', borderRadius: 6, padding: '5px 8px', fontSize: 11 }}
            >
              <option value="">-- None (Deselect) --</option>
              {MAJOR_BONES.map((b) => (
                <option key={b} value={b}>{b.replace('mixamorig:', '')}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 0, background: isPaused ? '#e04f7b' : '#3d3d4d', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={() => setControlMode(controlMode === 'rotate' ? 'translate' : 'rotate')}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 0, background: '#3d3d4d', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Mode: {controlMode === 'rotate' ? 'Rotate' : 'Translate'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button
              onClick={handleMirror}
              title="Mirror left bone rotations to right"
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 0, background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Mirror L ➔ R
            </button>
            <button
              onClick={handleExportJson}
              title="Export pose to JSON"
              style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 0, background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Export JSON
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste pose JSON here..."
            rows={5}
            style={{ width: '100%', background: '#191920', color: '#a3e635', border: '1px solid #333', borderRadius: 6, padding: 6, fontSize: 10, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
          />

          <button
            onClick={handleLoadJson}
            style={{ width: '100%', marginTop: 6, padding: '6px 8px', borderRadius: 6, border: 0, background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Apply JSON to Avatar
          </button>

          {toastMsg && (
            <div style={{ marginTop: 8, padding: '4px 8px', background: '#3b82f6', color: '#fff', borderRadius: 6, textAlign: 'center', fontSize: 11 }}>
              {toastMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
