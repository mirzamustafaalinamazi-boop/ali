import test from 'node:test';import assert from 'node:assert/strict';import {rankOwnedOutfits,validateGarment,modelStatus} from '../public/closet-engine.js';
const sample=[
 {id:'top1',name:'Blue linen shirt',category:'Top',color:'Blue',fit:'Regular',material:'Linen',style:'Minimal',occasions:['College','Casual'],confirmed:true},
 {id:'bottom1',name:'Beige trousers',category:'Bottom',color:'Beige',fit:'Relaxed',material:'Cotton',style:'Minimal',occasions:['College'],confirmed:true},
 {id:'shoe1',name:'Brown shoes',category:'Shoes',color:'Brown',fit:'Regular',material:'Leather',style:'Classic',occasions:['College'],confirmed:true},
 {id:'draft',name:'Unconfirmed jacket',category:'Layer',color:'Black',confirmed:false},
];
test('no invented wardrobe garments or unsupported empty-clothes recommendation',()=>{const r=rankOwnedOutfits([],{occasion:'College'});assert.deepEqual(r.looks,[]);assert.match(r.notice,/will not invent/);});
test('stylist only uses confirmed owned garments',()=>{const r=rankOwnedOutfits(sample,{occasion:'College',style:'Minimal'});assert.ok(r.looks.length);assert.ok(r.looks.every(l=>l.garmentIds.every(id=>['top1','bottom1','shoe1'].includes(id))));});
test('complete owned outfit contains actual top and bottom',()=>{const r=rankOwnedOutfits(sample,{occasion:'College'});assert.equal(r.looks[0].complete,true);assert.deepEqual(r.looks[0].garmentIds,['top1','bottom1','shoe1']);});
test('incomplete closet supplies useful partial look instead of blocking',()=>{const r=rankOwnedOutfits(sample.slice(0,1),{occasion:'Casual'});assert.equal(r.looks.length,1);assert.equal(r.looks[0].complete,false);assert.match(r.looks[0].missing,/Complete the look/);});
test('saree without confirmed footwear is reported as a partial outfit, never invented footwear',()=>{const r=rankOwnedOutfits([{id:'s1',name:'Silk saree',category:'Saree',color:'Red',confirmed:true}],{occasion:'Wedding'});assert.equal(r.looks[0].complete,false);assert.deepEqual(r.looks[0].garmentIds,['s1']);assert.deepEqual(r.looks[0].missingSlots,['footwear']);});
test('wear history exclusion omits garments worn within past week',()=>{const garment={...sample[0],lastWorn:new Date().toISOString()};const r=rankOwnedOutfits([garment],{excludeRecentlyWorn:true});assert.deepEqual(r.looks,[]);});
test('name and category are validated before storing',()=>{assert.ok(validateGarment({name:'',category:'Top',color:'Blue'}).length);assert.ok(validateGarment({name:'Valid',category:'',color:'Blue'}).length);assert.deepEqual(validateGarment({name:'Valid',category:'Kurti',color:'Blue'}),[])});
test('feature limitations must never imply trained AI or weather access',()=>{const r=modelStatus();assert.equal(r.trainedVision,false);assert.equal(r.weatherLive,false)});
