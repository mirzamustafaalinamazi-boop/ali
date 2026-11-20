import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function unusedPort() {
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}

test('public demo serves the improved avatar studio and its model assets', async () => {
  const port = await unusedPort();
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });
  try {
    let home;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { home = await fetch(`http://127.0.0.1:${port}/avatar-studio/`); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.ok(home, 'local demo server started');
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /OTD · Avatar Studio/);
    const script = html.match(/src="(\/avatar-studio\/assets\/index-[^"]+\.js)"/);
    assert.ok(script, 'studio entry script is referenced');
    const entry = await fetch(`http://127.0.0.1:${port}${script[1]}`);
    assert.equal(entry.status, 200);
    assert.match(entry.headers.get('content-type'), /javascript/);
    const model = await fetch(`http://127.0.0.1:${port}/avatar-studio/models/face_landmarker.task`, { method: 'HEAD' });
    assert.equal(model.status, 200);
    const mesh = await fetch(`http://127.0.0.1:${port}/avatar-studio/human/shapes.bin.gz`, { method: 'HEAD' });
    assert.equal(mesh.status, 200);
    const app = await (await fetch(`http://127.0.0.1:${port}/app.js`)).text();
    assert.match(app, /location\.assign\('\/avatar-studio\/'\)/);
  } finally {
    child.kill();
  }
});
