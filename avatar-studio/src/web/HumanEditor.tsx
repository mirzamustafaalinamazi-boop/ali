// <HumanEditor>: drop-in avatar customization UI for React (web).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { HumanConfig, HumanPackage } from '../human/runtime';
import { EditorControl, HumanEditorModel as EditorModel, HumanEditorOptions, createHumanEditor, GENDER_DEFAULTS } from '../human/editor';
import { HumanCanvas, HumanCanvasHandle } from './HumanCanvas';
import { softenSelfieDetail } from '../presets';
import { DETAIL_SLIDERS } from '../human/sliders';
import { POSE_PRESETS } from '../human/pose';

export interface HumanEditorProps {
  pkg: HumanPackage;
  options?: HumanEditorOptions;
  editor?: EditorModel;
  value?: Partial<HumanConfig>;
  defaultValue?: Partial<HumanConfig>;
  onChange?: (config: HumanConfig) => void;
  onGenderChange?: (gender: 'female' | 'male') => void;
  onSelfieFit?: (config: HumanConfig) => void;
  onSave?: (config: HumanConfig, snapshot: string | null) => void;
  saveLabel?: string;
  selfie?: boolean;
  randomize?: boolean;
  accentColor?: string;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function HumanEditor({
  pkg, options, editor: given, value, defaultValue, onChange, onGenderChange, onSelfieFit, onSave, saveLabel = 'Save', selfie = false, randomize = true,
  accentColor = '#1d1d1f', background = '#e9ecf1', className, style,
}: HumanEditorProps) {
  const editor = useMemo(() => given ?? createHumanEditor(pkg, options), [given, pkg, JSON.stringify(options)]);
  const [inner, setInner] = useState<HumanConfig>(() => editor.normalize(defaultValue ?? null));
  const config = value ? editor.normalize(value) : inner;
  const [tab, setTab] = useState(0);
  const [framing, setFraming] = useState<'face' | 'body'>('body');
  const [pose, setPose] = useState<string>('chic-hip');
  const [celebrateTrigger, setCelebrateTrigger] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const canvas = useRef<HumanCanvasHandle>(null);
  const file = useRef<HTMLInputElement>(null);
  const section = editor.sections[Math.min(tab, editor.sections.length - 1)];

  useEffect(() => { if (!value) setInner((c) => editor.normalize(c)); }, [editor]);
  useStyles();

  const update = (next: HumanConfig) => {
    const n = editor.normalize(next);
    if (!value) setInner(n);
    onChange?.(n);
  };

  const switchGender = (newGender: 'female' | 'male') => {
    if (onGenderChange) {
      onGenderChange(newGender);
    }
    const gDefaults = GENDER_DEFAULTS[newGender];
    const next = {
      ...config,
      ...gDefaults,
      gender: newGender === 'female' ? 0 : 1,
      clothes: newGender === 'female' ? ['toigo_halter_dress_midi', 'shoes02'] : ['toigo_male_suit_3', 'shoes01'],
      hair: newGender === 'female' ? 'toigo_curled_under_bob' : 'culturalibre_hair_02',
      skin: newGender === 'female' ? 'young_caucasian_female' : 'young_caucasian_male',
    } as HumanConfig;
    update(next);
    setPose(newGender === 'female' ? 'chic-hip' : 'runway-glam');
    setFraming('body');
    setCelebrateTrigger(t => t + 1);
  };

  const handlePoseClick = (poseId: string) => {
    setPose(poseId);
    setFraming('body');
    setCelebrateTrigger(t => t + 1);
  };

  const handleItemSelect = (nextConfig: HumanConfig, ctlId: string) => {
    update(nextConfig);
    // When an outfit, hair or shoe is chosen, celebrate with a cute pose in body view
    if (ctlId === 'outfit' || ctlId === 'shoes' || ctlId === 'hair' || ctlId === 'style') {
      setFraming('body');
      setCelebrateTrigger(t => t + 1);
      if (pose === 'natural') setPose('chic-hip');
    }
  };

  const fromSelfie = async (f: File) => {
    setBusy('Reading your photo…');
    try {
      const { createSelfieFitter } = await import('../human/selfie');
      const base = import.meta.env.BASE_URL;
      const fitter = await (fitterCache ??= createSelfieFitter({wasmPath:`${base}models/wasm`,modelPath:`${base}models/face_landmarker.task`}).catch((error) => { fitterCache = undefined; throw error; }));
      const g = editor.options.gender;
      const res = await fitter.fit(pkg, f, {
        base: { ...config, detail: {} },
        hints: g === 'female' ? { gender: 0 } : g === 'male' ? { gender: 1 } : { gender: config.gender },
        macros: [], lambda: 0.06, zWeight: 0.2, iterations: 5,
        detailIds: ['headWidth','headHeight','faceFat','headOval','headRound','headSquare','headHeart','jaw','chinWidth','cheekBones','eyeSize','eyeSpacing','noseWidth','noseLength','upperLip','lowerLip'],
      });
      const c = res.config;
      const neutralDetail = { ...config.detail };
      for (const slider of DETAIL_SLIDERS) if (slider.group !== 'body') delete neutralDetail[slider.id];
      const fitted = { ...config, skin: c.skin, skinTint: c.skinTint, eyes: c.eyes, detail: softenSelfieDetail(neutralDetail, c.detail) };
      setBusy('Refining your avatar…');
      setRevealing(true);
      update(fitted);
      onSelfieFit?.(fitted);
      setTab(0);
      setFraming('face');
      setBusy(null);
    } catch (e) {
      setRevealing(false);
      setBusy(`Couldn't read a face: ${(e as Error).message}`);
      setTimeout(() => setBusy(null), 3000);
    }
  };

  if (!section) return <div className="hf-editor">No editable sections.</div>;
  const isFemale = (config.gender ?? 0) < 0.5;

  return (
    <div className={`hf-root ${className ?? ''}`} style={{ ['--hf-accent' as any]: accentColor, ...style }}>
    <div className="hf-editor">
      <div className="hf-stage">
        <HumanCanvas
          ref={canvas}
          pkg={pkg}
          config={config}
          framing={framing}
          pose={pose}
          celebrateTrigger={celebrateTrigger}
          background={background}
          onReady={() => setRevealing(false)}
          className={revealing ? 'hf-revealing' : 'hf-avatar-view'}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Clean top controls: Gender & Camera Framing */}
        <div className="hf-toolbar-top">
          <div className="hf-seg hf-gender-seg" aria-label="Avatar Gender">
            <button className={isFemale ? 'on female' : ''} onClick={() => switchGender('female')} title="Switch to Feminine avatar">♀ Female</button>
            <button className={!isFemale ? 'on male' : ''} onClick={() => switchGender('male')} title="Switch to Masculine avatar">♂ Male</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="hf-seg hf-view-seg" aria-label="Camera Framing">
              <button className={framing === 'face' ? 'on' : ''} onClick={() => setFraming('face')}>Face</button>
              <button className={framing === 'body' ? 'on' : ''} onClick={() => setFraming('body')}>Body</button>
            </div>
            {randomize && <button className="hf-btn" title="Random look" onClick={() => update(editor.randomize())}>🎲</button>}
            {selfie && <button className="hf-btn" onClick={() => file.current?.click()} title="Generate from selfie">✦ Selfie</button>}
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" capture="user" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) fromSelfie(f); e.target.value = ''; }} />
          </div>
        </div>

        {/* Floating bottom pose and momentum bar */}
        <div className="hf-pose-bar" aria-label="Interactive poses and motion">
          <span className="hf-pose-label">POSE & MOTION:</span>
          {POSE_PRESETS.map((p) => (
            <button
              key={p.id}
              className={pose === p.id ? 'on' : ''}
              title={p.description}
              onClick={() => handlePoseClick(p.id)}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {busy && <div className="hf-toast">{busy}</div>}
      </div>

      <div className="hf-panel">
        <div className="hf-tabs" role="tablist">
          {editor.sections.map((s, i) => (
            <button key={s.id} role="tab" aria-selected={s === section} className={s === section ? 'on' : ''} onClick={() => setTab(i)}>
              {String(i + 1).padStart(2, '0')} {s.label}
            </button>
          ))}
        </div>
        <div className="hf-controls">
          {section.controls.map((ctl, i) => (
            <Control
              key={`${section.id}.${ctl.id}`}
              ctl={ctl}
              number={i + 1}
              config={config}
              onChange={(next) => handleItemSelect(next, ctl.id)}
            />
          ))}
        </div>
        {onSave && <button className="hf-save" onClick={() => onSave(config, canvas.current?.snapshot() ?? null)}>{saveLabel}</button>}
      </div>
    </div>
    </div>
  );
}
let fitterCache: Promise<any> | undefined;

function Control({ ctl, number, config, onChange }: { ctl: EditorControl; number: number; config: HumanConfig; onChange: (c: HumanConfig) => void }) {
  const title = `${String(number).padStart(2, '0')} ${ctl.label}`;
  if (ctl.kind === 'slider') {
    const v = ctl.value(config);
    return (
      <label className="hf-row">
        <span className="hf-label">{title}</span>
        <input type="range" min={ctl.min} max={ctl.max} step={ctl.step} value={v} onChange={(e) => onChange(ctl.apply(config, Number(e.target.value)))}
          aria-label={title} onDoubleClick={() => onChange(ctl.apply(config, ctl.min < 0 ? 0 : (ctl.min + ctl.max) / 2))} />
        <output>{v >= 0 ? '+' : ''}{v.toFixed(2)}</output>
      </label>
    );
  }
  if (ctl.kind === 'color') {
    const v = ctl.value(config).toLowerCase();
    return (
      <div className="hf-block">
        <span className="hf-label">{title} · {v}</span>
        <div className="hf-swatches">
          {ctl.colors.map((c) => (
            <button key={c} aria-label={c} className={`hf-swatch ${c.toLowerCase() === v ? 'on' : ''}`} style={{ background: c }} onClick={() => onChange(ctl.apply(config, c))} />
          ))}
        </div>
      </div>
    );
  }
  const v = ctl.value(config);
  if (ctl.display === 'swatch') {
    return (
      <div className="hf-block">
        <span className="hf-label">{title} · {ctl.options.find(o => o.id === v)?.label ?? 'None'}</span>
        <div className="hf-swatches">
          {ctl.options.map((o) => (
            <button key={o.id ?? 'none'} aria-label={o.label} title={o.label} className={`hf-swatch ${o.id === v ? 'on' : ''}`}
              style={{ background: o.preview ? `center/cover url("${o.preview}") ${o.swatch ?? ''}` : o.swatch ?? '#eee' }}
              onClick={() => onChange(ctl.apply(config, o.id))} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="hf-block">
      <span className="hf-label">{title} · {ctl.options.find(o => o.id === v)?.label ?? 'None'}</span>
      <div className="hf-tiles">
        {ctl.options.map((o) => (
          <button key={o.id ?? 'none'} aria-label={`${o.label}, option ${ctl.options.indexOf(o) + 1}`} title={o.label} className={`hf-tile ${o.id === v ? 'on' : ''}`} onClick={() => onChange(ctl.apply(config, o.id))}>
            <small className="hf-option-number">{String(ctl.options.indexOf(o) + 1).padStart(2, '0')}</small>{o.id === null ? <NoneIcon /> : o.preview ? <img src={o.preview} alt="" loading="lazy" draggable={false} /> : <span>{o.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="#9aa0a8" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" /><path d="M5.6 18.4 18.4 5.6" />
    </svg>
  );
}

const CSS = `
.hf-root{--hf-accent:#1d1d1f;container-type:inline-size;height:100%;min-height:500px}
.hf-editor{display:grid;grid-template-columns:minmax(0,1fr) 360px;height:100%;min-height:500px;font:13px/1.4 system-ui,-apple-system,sans-serif;color:#1d1d1f;background:#fff;border-radius:16px;overflow:hidden}
.hf-stage{position:relative;min-height:300px;min-width:0}
.hf-stage .hf-revealing,.hf-stage .hf-avatar-view{transition:opacity .55s ease}.hf-stage .hf-revealing{opacity:.48}.hf-stage .hf-avatar-view{opacity:1}
.hf-toolbar-top{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;gap:8px;pointer-events:none;z-index:10}
.hf-toolbar-top>*{pointer-events:auto}
.hf-seg{display:flex;background:rgba(255,255,255,.94);border-radius:999px;padding:3px;box-shadow:0 2px 10px rgba(0,0,0,.1);backdrop-filter:blur(8px)}
.hf-seg button,.hf-btn{border:0;background:transparent;border-radius:999px;padding:6px 13px;font:inherit;font-weight:600;font-size:12px;cursor:pointer;color:inherit;transition:all .18s ease}
.hf-seg button.on{background:var(--hf-accent);color:#fff}
.hf-gender-seg button.on.female{background:#e04f7b;color:#fff;box-shadow:0 2px 8px rgba(224,79,123,.35)}
.hf-gender-seg button.on.male{background:#2563eb;color:#fff;box-shadow:0 2px 8px rgba(37,99,235,.35)}
.hf-btn{background:rgba(255,255,255,.94);box-shadow:0 2px 10px rgba(0,0,0,.1);backdrop-filter:blur(8px)}
.hf-btn:hover{background:#fff}
.hf-pose-bar{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.95);border-radius:999px;padding:4px 8px;box-shadow:0 4px 18px rgba(0,0,0,.12);backdrop-filter:blur(10px);z-index:10;max-width:calc(100% - 24px);overflow-x:auto;scrollbar-width:none}
.hf-pose-bar::-webkit-scrollbar{display:none}
.hf-pose-label{font-size:10px;font-weight:700;letter-spacing:.6px;color:#888;padding:0 4px 0 6px;white-space:nowrap}
.hf-pose-bar button{display:inline-flex;align-items:center;gap:4px;border:0;background:transparent;border-radius:999px;padding:5px 12px;font:inherit;font-size:11.5px;font-weight:600;color:#444;cursor:pointer;white-space:nowrap;transition:all .18s ease}
.hf-pose-bar button:hover{background:rgba(0,0,0,.06)}
.hf-pose-bar button.on{background:var(--hf-accent);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.hf-toast{position:absolute;left:50%;top:64px;transform:translateX(-50%);background:rgba(29,29,31,.9);color:#fff;padding:8px 16px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.2);z-index:15;font-weight:500}
.hf-panel{display:flex;flex-direction:column;border-left:1px solid #eceef1;min-height:0;min-width:0}
.hf-tabs{display:flex;gap:4px;overflow-x:auto;padding:12px 12px 8px;border-bottom:1px solid #eceef1;scrollbar-width:none}
.hf-tabs::-webkit-scrollbar{display:none}
.hf-tabs button{flex:none;border:0;background:#f2f3f5;border-radius:999px;padding:7px 13px;font:inherit;font-weight:500;cursor:pointer;color:#444}
.hf-tabs button.on{background:var(--hf-accent);color:#fff}
.hf-controls{flex:1;overflow-y:auto;padding:8px 16px 16px}
.hf-row{display:grid;grid-template-columns:118px 1fr 48px;align-items:center;gap:10px;margin:9px 0}
.hf-row input{width:100%;accent-color:var(--hf-accent)}
.hf-row output{text-align:right;font-variant-numeric:tabular-nums;font-size:11px}
.hf-label{font-size:12px;color:#666}
.hf-block{margin:12px 0}
.hf-block>.hf-label{display:block;margin-bottom:8px;font-weight:600;color:#333}
.hf-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px}
.hf-tile{aspect-ratio:1;display:grid;place-items:center;border:1px solid #e1e3e7;background:#f4f5f7;border-radius:12px;padding:4px;cursor:pointer;overflow:hidden;font:inherit;font-size:11px;color:#555;transition:border-color .15s ease,box-shadow .15s ease}
.hf-option-number{position:absolute;top:3px;left:5px;font-size:9px;opacity:.6}.hf-tile{position:relative}
.hf-tile:hover{border-color:#c5c8ce}
.hf-tile.on{border-color:var(--hf-accent);box-shadow:inset 0 0 0 2px var(--hf-accent);background:#fff}
.hf-tile img{width:100%;height:100%;object-fit:contain;pointer-events:none}
.hf-swatches{display:flex;flex-wrap:wrap;gap:10px}
.hf-swatch{width:34px;height:34px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #d5d8dd;cursor:pointer;padding:0}
.hf-swatch.on{box-shadow:0 0 0 2px var(--hf-accent)}
.hf-save{margin:12px 16px 16px;border:0;border-radius:12px;padding:12px;background:var(--hf-accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
@container (max-width:720px){.hf-editor{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(280px,54%) minmax(0,1fr)}.hf-panel{border-left:0;border-top:1px solid #eceef1}}
`;
let injected = false;
function useStyles() {
  useEffect(() => {
    if (injected || typeof document === 'undefined') return;
    injected = true;
    const el = document.createElement('style');
    el.dataset.humanforge = '';
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}
