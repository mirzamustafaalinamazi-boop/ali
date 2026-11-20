import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const ui=readFileSync(new URL('../public/consumer-ui.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/app.css',import.meta.url),'utf8');
test('mobile primary navigation follows familiar five-tab design rule',()=>{
 const nav=html.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
 assert.ok(nav,'primary mobile navigation should exist');
 const pages=[...nav.matchAll(/data-page="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(pages,['home','closet','style','avatar3d','profile']);
});
test('removing Plan from primary tab does not remove planner access',()=>{
 assert.ok(ui.includes('data-action="nav:plan"'));
 assert.ok(ui.includes('OPEN MY OUTFIT PLANNER'));
});
test('mobile layout is five columns and honors reduced motion',()=>{
 assert.match(css,/\.nav\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
