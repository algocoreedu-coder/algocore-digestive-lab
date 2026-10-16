import type { SceneProps } from './types';
export function revealedBySelection(moduleId: string, id: string) {
  if (moduleId === 'BIO-010' && ['bilayer', 'heads', 'tails'].includes(id)) return id === 'bilayer' ? ['bilayer', 'heads', 'tails'] : [id, 'bilayer'];
  if (moduleId === 'BIO-013' && ['chromatid', 'sisters'].includes(id)) return ['chromatid', 'sisters'];
  if (moduleId === 'BIO-044' && ['homologs', 'sisters', 'gametes'].includes(id)) return ['homologs', 'sisters', 'gametes'];
  return [id];
}
export function visible(id: string, props: SceneProps) {
  const parentHidden = props.moduleId === 'BIO-010' && ['heads', 'tails'].includes(id) && props.hidden.includes('bilayer')
    || props.moduleId === 'BIO-013' && ['chromatid', 'sisters'].includes(id) && (props.hidden.includes('chromatid') || props.hidden.includes('sisters'))
    || props.moduleId === 'BIO-044' && ['homologs', 'sisters'].includes(id) && (props.hidden.includes('homologs') || props.hidden.includes('sisters'));
  return !parentHidden && !props.hidden.includes(id) && (!props.isolate || props.selected === id);
}
