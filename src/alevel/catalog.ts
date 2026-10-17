import type { ModuleId } from './types';
export interface Bundle { title: string; subtitle: string; level: 'AS' | 'A Level'; color: string; icon: string; ids: ModuleId[]; wave: 1 | 2 }
export const WAVE2_MOLECULE_IDS: ModuleId[] = ['BIO-002','BIO-004','BIO-005','BIO-006','BIO-007','BIO-009','BIO-012'];
export const WAVE2_DNA_IDS: ModuleId[] = ['BIO-015','BIO-016','BIO-017'];
export const WAVE2_ADVANCED_IDS: ModuleId[] = ['BIO-032','BIO-034','BIO-035','BIO-036','BIO-043','BIO-046'];
export const WAVE2_IDS = [...WAVE2_MOLECULE_IDS,...WAVE2_DNA_IDS,...WAVE2_ADVANCED_IDS];
export const BUNDLES: Bundle[] = [
  { title:'Membranes & transport',subtitle:'A boundary that controls exchange',level:'AS',color:'#72b9b0',icon:'membrane',ids:['BIO-010','BIO-011'],wave:1 },
  { title:'Mitochondria & ATP',subtitle:'Structure, gradients and energy transfer',level:'A Level',color:'#d8ad69',icon:'mitochondrion',ids:['BIO-031','BIO-033'],wave:1 },
  { title:'Chromosomes & mitosis',subtitle:'From DNA organisation to cell division',level:'AS',color:'#a293c2',icon:'chromosome',ids:['BIO-013','BIO-014'],wave:1 },
  { title:'Meiosis',subtitle:'Two divisions. Four haploid products.',level:'A Level',color:'#bd7e9a',icon:'meiosis',ids:['BIO-044'],wave:1 },
  { title:'Kidneys & water balance',subtitle:'Filtration, reabsorption and ADH',level:'A Level',color:'#d58b83',icon:'kidney',ids:['BIO-037','BIO-038'],wave:1 },
  { title:'Prokaryotic cells',subtitle:'Boundaries, genetic material and cell organisation',level:'AS',color:'#72b9b0',icon:'bacterium',ids:['BIO-002'],wave:2 },
  { title:'Biological molecules',subtitle:'How molecular structure supports function',level:'AS',color:'#d8ad69',icon:'molecule',ids:['BIO-004','BIO-005','BIO-006'],wave:2 },
  { title:'Enzymes & signalling',subtitle:'Binding, inhibition and selective responses',level:'AS',color:'#bd7e9a',icon:'enzyme',ids:['BIO-007','BIO-009','BIO-012'],wave:2 },
  { title:'DNA & gene expression',subtitle:'From complementary strands to a polypeptide',level:'AS',color:'#a293c2',icon:'dna',ids:['BIO-015','BIO-016','BIO-017'],wave:2 },
  { title:'Respiration pathways',subtitle:'Follow carbon and electron carriers between compartments',level:'A Level',color:'#d58b83',icon:'respiration',ids:['BIO-032'],wave:2 },
  { title:'Chloroplasts & photosynthesis',subtitle:'Light reactions, carbon fixation and regeneration',level:'A Level',color:'#72b9b0',icon:'chloroplast',ids:['BIO-034','BIO-035','BIO-036'],wave:2 },
  { title:'Genes & regulation',subtitle:'Homologous loci, alleles and the lac operon',level:'A Level',color:'#a293c2',icon:'gene',ids:['BIO-043','BIO-046'],wave:2 },
];
export function sceneFamily(id: ModuleId) {
  if(WAVE2_MOLECULE_IDS.includes(id))return 'wave2-molecules';
  if(WAVE2_DNA_IDS.includes(id))return 'wave2-dna';
  if(WAVE2_ADVANCED_IDS.includes(id))return 'wave2-advanced';
  return ['BIO-010','BIO-011','BIO-013','BIO-014'].includes(id)?'priority-as':'priority-advanced';
}
