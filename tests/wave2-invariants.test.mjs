import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, getSteps } from '../src/alevel/content.ts';
import { WAVE2_MODULES, getWave2Steps } from '../src/alevel/wave2/content.ts';
import { BUNDLES, WAVE2_IDS, sceneFamily } from '../src/alevel/catalog.ts';
import { alleleState, calvinState, complementaryDNA, lacState, lightOutputs, TRANSLATION_EXAMPLE as protein } from '../src/alevel/wave2/modelState.ts';
import { enzymeBindingState, inhibitionState, receptorSignalState } from '../src/alevel/wave2/moleculeState.ts';
import { displayedStructures } from '../src/alevel/presentation.ts';
import { revealedBySelection, visible } from '../src/alevel/visibility.ts';

test('Wave 2 adds exactly ten AS and six additional A Level runtimes without double-counting induced fit',()=>{
  const expected=['BIO-002','BIO-004','BIO-005','BIO-006','BIO-007','BIO-009','BIO-012','BIO-015','BIO-016','BIO-017','BIO-032','BIO-034','BIO-035','BIO-036','BIO-043','BIO-046'];
  assert.deepEqual(WAVE2_MODULES.map(m=>m.id).sort(),expected);
  assert.deepEqual([...WAVE2_IDS].sort(),expected);
  assert.equal(WAVE2_MODULES.filter(m=>m.level==='AS').length,10);
  assert.equal(MODULES.length,25);
  const displayed=BUNDLES.flatMap(b=>b.ids);assert.equal(new Set(displayed).size,25);
  assert.deepEqual([...displayed].sort(),MODULES.map(m=>m.id).sort());
  for(const id of WAVE2_IDS)assert.ok(sceneFamily(id).startsWith('wave2-'));
  assert.ok(WAVE2_MODULES.find(m=>m.id==='BIO-007').variants.some(v=>v.id==='induced-fit'));
});
test('every Wave 2 preset has stable steps, valid structures and original answer keys',()=>{
  for(const m of WAVE2_MODULES){const ids=m.structures.map(s=>s.id);assert.equal(ids.length,new Set(ids).size);for(const variant of [...(m.variants||[]).map(v=>v.id),'unknown']){
    const steps=getWave2Steps(m,variant,'forward',true);assert.equal(steps.length,m.steps.length,`${m.id}/${variant} step count`);assert.deepEqual(steps,getWave2Steps(m,variant,'reverse',false),'transport globals must not alter another mechanism');assert.deepEqual(steps,getSteps(m,variant,'forward',true),'shared lesson resolver must select Wave 2');for(const s of steps){assert.ok(s.title&&s.description&&s.keyIdea);for(const focus of s.focus)assert.ok(ids.includes(focus),`${m.id}: ${focus}`);}}
    assert.ok(m.question.answer>=0&&m.question.answer<m.question.options.length);assert.ok(m.sources.every(s=>s.url.startsWith('https://')));
  }
});
test('cyclic photophosphorylation returns PSI electrons and does not produce NADPH or oxygen',()=>{
  assert.deepEqual(lightOutputs('cyclic'),{photosystems:['PSI'],atp:true,nadph:false,oxygen:false,waterSplit:false});
  assert.deepEqual(lightOutputs('noncyclic'),{photosystems:['PSII','PSI'],atp:true,nadph:true,oxygen:true,waterSplit:true});
});
test('Calvin snapshots account for all eighteen carbon atoms and regenerate the acceptor',()=>{
  for(let step=0;step<5;step++){const q=calvinState(step);const displayedCarbon=q.co2+q.rubp*5+q.gp*3+q.tp*3+q.netTp*3;assert.equal(displayedCarbon,18,`carbon lost at step ${step}`);}
  assert.equal(calvinState(1).gp,6);assert.equal(calvinState(2).tp,6);assert.equal(calvinState(3).netTp,1);assert.equal(calvinState(3).regeneratingTp,5);assert.equal(calvinState(4).rubp,3);
});
test('replication changes chromatid count but not chromosome number or matched allele copies',()=>{
  assert.equal(alleleState('heterozygous').chromosomes,2);assert.equal(alleleState('homozygous').genotype,'AA');const q=alleleState('replicated');assert.equal(q.chromosomes,2);assert.equal(q.chromatids,4);assert.deepEqual(q.maternalAlleles,['A','A']);assert.deepEqual(q.paternalAlleles,['a','a']);
});
test('lac presets hold glucose low and distinguish induced from low basal expression',()=>{
  assert.deepEqual(lacState('no-lactose'),{glucose:'low',allolactose:false,operatorOccupied:true,expression:'low basal'});
  assert.deepEqual(lacState('lactose'),{glucose:'low',allolactose:true,operatorOccupied:false,expression:'induced'});
});
test('DNA/template/mRNA and codon–anticodon examples agree and stop has no tRNA or amino acid',()=>{
  assert.equal(complementaryDNA(protein.codingDNA),protein.templateDNA3to5);
  assert.equal(protein.codingDNA.replaceAll('T','U'),protein.mrna);
  assert.equal(protein.codons.join(''),protein.mrna);
  assert.deepEqual(protein.aminoAcids,['Met','Glu','Phe']);
  const complement={A:'U',U:'A',G:'C',C:'G'};
  protein.anticodons3to5.forEach((anticodon,i)=>assert.equal(anticodon,[...protein.codons[i]].map(c=>complement[c]).join('')));
  assert.equal(protein.anticodons3to5.length,3);assert.equal(protein.codons[3],'UAA');assert.equal(protein.aminoAcids.length,3);assert.throws(()=>complementaryDNA('AUG'));
});

test('preset lesson focus follows the actual products and missing structures are explained',()=>{
  const module=id=>WAVE2_MODULES.find(m=>m.id===id);
  const steps=(id,preset)=>getWave2Steps(module(id),preset,'forward',true);
  assert.equal(steps('BIO-005','triglyceride').at(-1).focus[0],'fatty-acids');
  for(const preset of ['competitive-low','noncompetitive-low','noncompetitive-high'])assert.equal(steps('BIO-009',preset).at(-1).focus[0],'inhibitor');
  assert.equal(steps('BIO-009','competitive-high').at(-1).focus[0],'products');
  assert.equal(steps('BIO-036','default')[2].focus[0],'tp');
  const cyclic=displayedStructures(module('BIO-035'),'cyclic');
  assert.match(cyclic.find(s=>s.id==='psii').description,/Not shown/);
  assert.match(displayedStructures(module('BIO-005'),'triglyceride').find(s=>s.id==='head').description,/Absent/);
});
test('selecting a DNA component restores its hidden ancestors without revealing unrelated structures',()=>{
  const cases=[
    ['BIO-015',0,'sugar','nucleotide'],['BIO-015',0,'phosphate','nucleotide'],['BIO-015',0,'bases','nucleotide'],
    ['BIO-015',1,'sugar','backbone'],['BIO-015',1,'phosphate','backbone'],['BIO-015',1,'backbone','nucleotide'],['BIO-015',2,'hydrogen','nucleotide'],
    ['BIO-016',2,'leading','new-dna'],['BIO-016',3,'lagging','new-dna'],
    ['BIO-017',0,'template','dna'],['BIO-017',1,'amino-acids','trna'],
  ];
  for(const [moduleId,step,selected,parent] of cases){
    const before={moduleId,step,selected,hidden:[selected,parent,'unrelated'],isolate:true};
    assert.equal(visible(selected,{...before,hidden:[parent]}),false,`${moduleId}/${selected}: hidden ancestor also hides its label`);
    const revealed=revealedBySelection(moduleId,selected);
    const after={...before,hidden:before.hidden.filter(id=>!revealed.includes(id))};
    assert.equal(visible(selected,after),true,`${moduleId}/${selected}: selection restores the structure and label`);
    assert.deepEqual(after.hidden,['unrelated']);
  }
});
test('selecting a DNA group restores its participating parts and respects independent structures',()=>{
  for(const [moduleId,step,parent,children] of [
    ['BIO-015',2,'nucleotide',['sugar','phosphate','bases','hydrogen','backbone']],
    ['BIO-015',1,'backbone',['sugar','phosphate']],
    ['BIO-016',4,'new-dna',['leading','lagging']],
    ['BIO-017',0,'dna',['template']],['BIO-017',1,'trna',['amino-acids']],
  ]){
    const reveal=revealedBySelection(moduleId,parent);
    const props={moduleId,step,selected:parent,hidden:children.filter(id=>!reveal.includes(id)),isolate:false};
    for(const child of children)assert.equal(visible(child,props),true,`${moduleId}/${parent}: restore ${child}`);
  }
  assert.equal(visible('sugar',{moduleId:'BIO-015',step:0,selected:'sugar',hidden:['backbone'],isolate:false}),true,'the free nucleotide is not yet a joined backbone');
  assert.equal(visible('bases',{moduleId:'BIO-015',step:2,selected:'bases',hidden:['backbone'],isolate:false}),true,'base pairs can be viewed independently of backbone geometry');
  assert.equal(visible('template',{moduleId:'BIO-016',step:5,selected:'template',hidden:['new-dna'],isolate:false}),true,'hiding new DNA preserves the parental strand');
  assert.equal(visible('polypeptide',{moduleId:'BIO-017',step:3,selected:'polypeptide',hidden:['trna'],isolate:false}),true,'a joined polypeptide is independent of the free tRNA cargo');
});
test('allele labels and descriptions follow AA/Aa presets without mutating the catalog',()=>{
  const spec=MODULES.find(m=>m.id==='BIO-043'),original=structuredClone(spec.structures);
  for(const variant of ['heterozygous','homozygous','replicated','heterozygous']){
    const state=alleleState(variant),structures=displayedStructures(spec,variant);
    for(const [id,parent,allele] of [['allele-a','Maternal',state.maternalAlleles[0]],['allele-b','Paternal',state.paternalAlleles[0]]]){
      const structure=structures.find(s=>s.id===id);
      assert.equal(structure.label,`${parent} allele ${allele}`);
      assert.match(structure.description,new RegExp(`Allele ${allele} at`));
    }
    if(variant==='replicated')assert.match(structures.find(s=>s.id==='allele-b').description,/Both sister chromatids/);
  }
  assert.deepEqual(spec.structures,original,'changing presets must not contaminate later displays');
});
test('one illustrative substrate yields two products while the enzyme remains reusable',()=>{
  for(const variant of ['lock-key','induced-fit']){
    const first=enzymeBindingState(0,variant);
    for(let step=0;step<=4;step++){
      const state=enzymeBindingState(step,variant);
      assert.equal(state.enzymeCount,1);
      assert.equal(state.substrateCount+state.productCount/2,1,'substrate-equivalent mass is conserved');
    }
    assert.equal(enzymeBindingState(2,variant).substrateCount,1);assert.equal(enzymeBindingState(2,variant).bound,true);
    assert.equal(enzymeBindingState(3,variant).substrateCount,0);assert.equal(enzymeBindingState(3,variant).productCount,2);
    const released=enzymeBindingState(4,variant);assert.equal(released.bound,false);assert.equal(released.reusable,true);assert.equal(released.productCount,2);
    assert.deepEqual(enzymeBindingState(0,variant),first,'replaying restores the initial free enzyme/substrate state');
  }
  assert.ok(enzymeBindingState(2,'induced-fit').opening<enzymeBindingState(0,'induced-fit').opening);
  assert.equal(enzymeBindingState(2,'lock-key').opening,enzymeBindingState(0,'lock-key').opening);
});
test('inhibition preserves molecular counts and distinguishes competitive rescue from inhibited capacity',()=>{
  for(const variant of ['competitive-low','competitive-high','noncompetitive-low','noncompetitive-high']){
    for(let step=0;step<=3;step++){
      const state=inhibitionState(step,variant);
      assert.equal(state.enzymeCount,1);assert.equal(state.inhibitorCount,1);
      assert.equal(state.substrateCount+state.productCount/2,state.initialSubstrateCount,'products consume one substrate rather than duplicating it');
    }
    assert.equal(inhibitionState(1,variant).inhibitorBound,true,'the illustrated inhibitor binds before testing substrate opportunity');
  }
  const low=inhibitionState(3,'competitive-low'),high=inhibitionState(3,'competitive-high');
  assert.equal(low.initialSubstrateCount,2);assert.equal(high.initialSubstrateCount,6);
  assert.equal(low.productCount,0);assert.equal(high.productCount,2);assert.equal(high.substrateCount,5);
  assert.equal(low.inhibitorBound,true);assert.equal(high.inhibitorBound,false);
  for(const supply of ['low','high']){
    const state=inhibitionState(3,'noncompetitive-'+supply);
    assert.equal(state.boundEnzymeInactive,true);assert.equal(state.productCount,0);assert.equal(state.substrateCanOutcompeteInhibitor,false);
  }
});
test('receptor binding and relay activation never transport the ligand into cytoplasm',()=>{
  const states=Array.from({length:4},(_,step)=>receptorSignalState(step));
  assert.ok(states.every(state=>state.ligandCompartment==='extracellular'));
  assert.deepEqual(states.map(state=>state.ligandBound),[false,true,true,false]);
  assert.deepEqual(states.map(state=>state.relayActive),[false,false,true,false]);
  assert.equal(states[3].terminating,true);
  assert.deepEqual(receptorSignalState(0),states[0],'returning to the first step restores the unbound state');
});
