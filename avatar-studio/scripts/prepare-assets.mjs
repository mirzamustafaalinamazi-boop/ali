import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { unzipSync } from 'fflate';

const root = process.cwd();
const pub = path.join(root, 'public');
const human = path.join(pub, 'human');
const model = path.join(pub, 'models', 'face_landmarker.task');
const wasm = path.join(pub, 'models', 'wasm');
const humanforgeCommit = '2226df1f50a04c5a8e1c02ea33780d28337dfbb1';
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const modelHash = '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff';

async function exists(filename) {
  try { await access(filename); return true; } catch { return false; }
}

if (!await exists(path.join(human, 'manifest.json'))) {
  if (process.env.HUMANFORGE_SOURCE_DIR) {
    await cp(path.join(process.env.HUMANFORGE_SOURCE_DIR, 'assets', 'human'), human, { recursive: true });
  } else {
    const url = `https://codeload.github.com/abdulrehman043/humanforge/zip/${humanforgeCommit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HumanForge asset download failed: ${response.status}`);
    const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
    const entries = Object.entries(archive).filter(([name]) => name.includes('/assets/human/') && !name.endsWith('/'));
    if (!entries.some(([name]) => name.endsWith('/assets/human/manifest.json'))) throw new Error('HumanForge asset manifest missing');
    for (const [name, bytes] of entries) {
      const relative = name.split('/assets/human/')[1];
      const destination = path.join(human, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
    }
  }
}

if (!await exists(model)) {
  const response = await fetch(modelUrl);
  if (!response.ok) throw new Error(`Face model download failed: ${response.status}`);
  await mkdir(path.dirname(model), { recursive: true });
  await writeFile(model, new Uint8Array(await response.arrayBuffer()));
}
const actualModelHash = createHash('sha256').update(await readFile(model)).digest('hex');
if (actualModelHash !== modelHash) throw new Error('Face model hash mismatch');

const mediapipeWasm = path.join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
await cp(mediapipeWasm, wasm, { recursive: true });
console.log('Pinned avatar mesh, face model and WASM assets are ready.');
