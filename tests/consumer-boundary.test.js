import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const consumer=readFileSync(new URL('../public/consumer-ui.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');

test('consumer entrance does not link to retailer inventory or internal admin',()=>{
  assert.doesNotMatch(html,/data-page="(?:retailer|admin)"/);
  assert.doesNotMatch(consumer,/data-action="nav:(?:retailer|admin)"/);
});
test('consumer homepage prioritizes outfit creation; optional shopping stays secondary',()=>{
  assert.match(html,/data-page="style">CREATE MY LOOK/);
  assert.match(consumer,/shopping suggestions are a future, optional feature/i);
  assert.doesNotMatch(consumer,/Explore separate retail demo/);
});
test('prototype retail routes remain separately available until independently migrated',()=>{
  assert.match(app,/['"]retailer['"]/);
  assert.match(app,/['"]admin['"]/);
});
