import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, getSteps } from '../src/alevel/content.ts';
import { meiosisChromosomes, cristaPoint } from '../src/alevel/biologyModel.ts';
import { revealedBySelection, visible } from '../src/alevel/visibility.ts';

test('the approved release has four AS and five additional A Level modules',()=>{
  assert.deepEqual(MODULES.map(m=>m.id).sort(),['BIO-010','BIO-011','BIO-013','BIO-014','BIO-031','BIO-033','BIO-037','BIO-038','BIO-044']);
  assert.equal(MODULES.filter(m=>m.level==='AS').length,4);
  for(const m of MODULES){const ids=m.structures.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);for(const step of m.steps)for(const id of step.focus)assert.ok(ids.includes(id),`${m.id}: unknown focus ${id}`);assert.ok(m.question.answer>=0&&m.question.answer<m.question.options.length);}
});
test('passive transport follows its gradient; active transport opposes it',()=>{
  const spec=MODULES.find(m=>m.id==='BIO-011');
  const expected={forward:{simple:'outside → cytoplasm',facilitated:'outside → cytoplasm',osmosis:'outside → cytoplasm',active:'cytoplasm → outside'},reverse:{simple:'cytoplasm → outside',facilitated:'cytoplasm → outside',osmosis:'cytoplasm → outside',active:'outside → cytoplasm'}};
  for(const [gradient,routes] of Object.entries(expected))for(const [variant,direction] of Object.entries(routes)){const steps=getSteps(spec,variant,gradient,true);assert.equal(steps[2].metrics[0].value,direction);if(variant==='osmosis')assert.match(steps[0].description,/water potential/);}
  for(const variant of ['simple','facilitated','osmosis'])assert.doesNotMatch(getSteps(spec,variant,'forward',false)[2].title,/blocked/);
  for(const variant of ['active','endocytosis','exocytosis'])assert.match(getSteps(spec,variant,'forward',false)[2].title,/blocked/);
  assert.equal(getSteps(spec,'endocytosis','reverse',true)[2].metrics[0].value,'outside → cytoplasm');
  assert.equal(getSteps(spec,'exocytosis','forward',true)[2].metrics[0].value,'cytoplasm → outside');
});
test('meiosis preserves all eight chromatids after one replication and reduces each product to two chromosomes',()=>{
  for(const orientation of ['orientation-a','orientation-b'])for(let step=0;step<10;step++){
    const data=meiosisChromosomes(step,orientation);
    assert.equal(data.length,step<7?4:8,`${orientation} step${step}: chromosome objects`);
    assert.equal(data.reduce((sum,c)=>sum+(c.replicated?2:1),0),step===0?4:8,`${orientation} step${step}: chromatids`);
    assert.deepEqual(data,meiosisChromosomes(step,orientation),'replay must be deterministic');
    if(step>=8){const products=new Map();for(const c of data){const key=`${Math.sign(c.position[0])}/${Math.sign(c.position[1])}`;products.set(key,[...(products.get(key)||[]),c]);}assert.equal(products.size,4);for(const set of products.values()){assert.deepEqual(set.map(c=>c.pair).sort(),[0,1]);assert.ok(set.every(c=>!c.replicated));}assert.equal(new Set(data.map(c=>`${c.pair}/${c.parent}/${c.sister}`)).size,8,'every original chromatid appears exactly once');const exchanged=data.filter(c=>c.recombined&&c.sister===(c.parent===0?1:0));assert.equal(exchanged.length,2,'one reciprocal crossover involves two non-sister chromatids');}
  }
  const a=meiosisChromosomes(9,'orientation-a'),b=meiosisChromosomes(9,'orientation-b');
  assert.deepEqual(a.filter(c=>c.pair===0),b.filter(c=>c.pair===0));
  for(let i=0;i<a.length;i++)if(a[i].pair===1)assert.equal(a[i].parent,1-b[i].parent,'second pair independently reverses orientation');
});
test('each reconstructed crista attaches to the inner membrane at both roots',()=>{
  for(const x of [-2.23,-1.66,-1.1,-.52,.08,.7,1.32,1.93,2.4])for(let i=0;i<=28;i++)for(const side of [0,1]){
    const [px,y,z]=cristaPoint(x,i/28,side);const centerY=.19*(1-(px/3.04)**2);
    const residual=(px/2.736)**2+((y-centerY)/1.017)**2+(z/.819)**2;
    assert.ok(Math.abs(residual-1)<1e-10,`detached crista at ${x}/${i}/${side}`);
  }
});
test('ADH changes water recovery and the predicted urine outcome',()=>{
  const spec=MODULES.find(m=>m.id==='BIO-038');
  assert.deepEqual(getSteps(spec,'high','forward',true)[4].metrics.map(m=>m.value),['Smaller','More concentrated']);
  assert.deepEqual(getSteps(spec,'low','forward',true)[4].metrics.map(m=>m.value),['Larger','More dilute']);
});
test('selecting a component restores hidden ancestors and parent hiding removes child labels',()=>{
  assert.ok(revealedBySelection('BIO-010','heads').includes('bilayer'));
  assert.ok(revealedBySelection('BIO-013','chromatid').includes('sisters'));
  assert.ok(revealedBySelection('BIO-044','gametes').includes('homologs'));
  assert.equal(visible('heads',{moduleId:'BIO-010',hidden:['bilayer'],isolate:false,selected:'heads'}),false);
  assert.equal(visible('sisters',{moduleId:'BIO-013',hidden:['chromatid'],isolate:false,selected:'sisters'}),false);
});
