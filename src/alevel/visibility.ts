import type { SceneProps } from './types';
export function revealedBySelection(moduleId: string, id: string) {
  const hierarchy:Record<string,Record<string,string[]>>={
    'BIO-004':{glucose:['chain','microfibril'],bond:['chain','microfibril'],branch:['chain'],chain:['microfibril','glucose','bond','branch'],hydrogen:['microfibril'],microfibril:['chain','glucose','bond','hydrogen']},
    'BIO-005':{'fatty-acids':['tails'],tails:['fatty-acids'],phosphate:['head'],head:['phosphate']},
    'BIO-006':{'amino-acids':['subunits'],peptide:['subunits'],backbone:['subunits'],hydrogen:['subunits'],'r-groups':['subunits'],disulfide:['subunits'],subunits:['amino-acids','peptide','backbone','hydrogen','r-groups','disulfide']},
    'BIO-007':{'active-site':['enzyme'],enzyme:['active-site']},
    'BIO-009':{'active-site':['enzyme'],'allosteric-site':['enzyme'],enzyme:['active-site','allosteric-site']},
    'BIO-015':{nucleotide:['sugar','phosphate','bases','hydrogen','backbone'],sugar:['nucleotide','backbone'],phosphate:['nucleotide','backbone'],bases:['nucleotide'],hydrogen:['nucleotide'],backbone:['nucleotide','sugar','phosphate']},
    'BIO-016':{leading:['new-dna'],lagging:['new-dna'],'new-dna':['leading','lagging']},
    'BIO-017':{template:['dna'],dna:['template'],'amino-acids':['trna'],trna:['amino-acids']},
    'BIO-034':{thylakoid:['granum'],lumen:['granum'],granum:['thylakoid','lumen']},
    'BIO-043':{sisters:['maternal','paternal'],maternal:['sisters'],paternal:['sisters'],'allele-a':['maternal'],'allele-b':['paternal'],locus:['maternal','paternal']},
  };
  if(hierarchy[moduleId]?.[id])return [id,...hierarchy[moduleId][id]];
  if (moduleId === 'BIO-010' && ['bilayer', 'heads', 'tails'].includes(id)) return id === 'bilayer' ? ['bilayer', 'heads', 'tails'] : [id, 'bilayer'];
  if (moduleId === 'BIO-013' && ['chromatid', 'sisters'].includes(id)) return ['chromatid', 'sisters'];
  if (moduleId === 'BIO-044' && ['homologs', 'sisters', 'gametes'].includes(id)) return ['homologs', 'sisters', 'gametes'];
  return [id];
}
export function visible(id: string, props: SceneProps) {
  const dependent:Record<string,Record<string,string[]>>={
    'BIO-004':{glucose:['chain'],bond:['chain'],branch:['chain']},
    'BIO-005':{'fatty-acids':['tails'],phosphate:['head']},
    'BIO-007':{'active-site':['enzyme']},
    'BIO-009':{'active-site':['enzyme'],'allosteric-site':['enzyme']},
    'BIO-015':{sugar:['nucleotide'],phosphate:['nucleotide'],bases:['nucleotide'],hydrogen:['nucleotide'],backbone:['nucleotide']},
    'BIO-016':{leading:['new-dna'],lagging:['new-dna']},
    'BIO-017':{template:['dna'],'amino-acids':['trna']},
    'BIO-034':{thylakoid:['granum'],lumen:['granum']},
    'BIO-043':{'allele-a':['maternal'],'allele-b':['paternal'],locus:['maternal','paternal'],sisters:['maternal','paternal']},
  };
  if(dependent[props.moduleId]?.[id]?.some(parent=>props.hidden.includes(parent)))return false;
  if(props.moduleId==='BIO-015'&&props.step>=1&&['sugar','phosphate'].includes(id)&&props.hidden.includes('backbone'))return false;
  if(props.moduleId==='BIO-004'&&props.variant==='cellulose'&&props.step>=2&&['chain','glucose','bond','hydrogen'].includes(id)&&props.hidden.includes('microfibril'))return false;
  if(props.moduleId==='BIO-006'&&props.step>=3&&['amino-acids','peptide','backbone','hydrogen','r-groups','disulfide'].includes(id)&&props.hidden.includes('subunits'))return false;
  if(props.moduleId==='BIO-043'&&props.variant==='replicated'&&['maternal','paternal'].includes(id)&&props.hidden.includes('sisters'))return false;
  const parentHidden = props.moduleId === 'BIO-010' && ['heads', 'tails'].includes(id) && props.hidden.includes('bilayer')
    || props.moduleId === 'BIO-013' && ['chromatid', 'sisters'].includes(id) && (props.hidden.includes('chromatid') || props.hidden.includes('sisters'))
    || props.moduleId === 'BIO-044' && ['homologs', 'sisters'].includes(id) && (props.hidden.includes('homologs') || props.hidden.includes('sisters'));
  return !parentHidden && !props.hidden.includes(id) && (!props.isolate || props.selected === id);
}
