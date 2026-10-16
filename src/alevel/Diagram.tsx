import type { SceneProps } from './types';
import { getSteps } from './content';
import DiagramChromosomes from './DiagramChromosomes';
import { visible } from './visibility';

export default function Diagram(props: SceneProps) {
  const { spec, selected, hidden, labels, onSelect, isolate, step } = props;
  const ids = spec.structures.filter(s => visible(s.id,props));
  const mito = ['BIO-031', 'BIO-033'].includes(spec.id), chromosome = ['BIO-013', 'BIO-014', 'BIO-044'].includes(spec.id), renal = ['BIO-037', 'BIO-038'].includes(spec.id);
  return <div className="al-diagram"><svg viewBox="0 0 760 590" role="group" aria-label={`${spec.title}: simplified 2D structure map`}>
    <defs><linearGradient id="diagram-tissue" x2="0" y2="1"><stop stopColor="#bc7f9a" stopOpacity=".32" /><stop offset="1" stopColor="#76bab0" stopOpacity=".12" /></linearGradient></defs>
    {mito ? <><ellipse cx="380" cy="242" rx="274" ry="140" fill="url(#diagram-tissue)" stroke="#d58b83" strokeWidth="12" /><path d="M150 245 Q180 130 220 215 T290 210 T360 210 T430 210 T500 210 T590 240 Q550 330 380 345 Q210 330 150 245" fill="none" stroke="#d8ad69" strokeWidth="9" /></> : chromosome ? <DiagramChromosomes props={props}/> : renal ? <><path d="M325 120 C140 88 162 400 330 382 C445 370 410 300 350 270 C310 247 390 209 389 178 C380 141 366 127 325 120Z" fill="url(#diagram-tissue)" stroke="#d58b83" strokeWidth="9" /><path d="M367 207C475 150 557 153 525 212S430 280 452 361S520 410 542 371V224" fill="none" stroke="#d8ad69" strokeWidth="8" /></> : <>{[229, 280].map(y => <g key={y}><path d={`M100 ${y}Q380 ${y-30}660 ${y}`} fill="none" stroke="#d58b83" strokeWidth="15" />{Array.from({length:25},(_,i) => <circle key={i} cx={104+i*23} cy={y} r="7" fill="#d8ad69" />)}</g>)}<rect x="353" y="204" width="54" height="103" rx="22" fill="#72b9b0" /></>}
    {ids.map((s, i) => { const left=i%2===0, row=Math.floor(i/2), x=left?16:549,y=36+row*63; return <g key={s.id} role="button" tabIndex={0} aria-label={`Select ${s.label} in diagram`} aria-pressed={selected===s.id} onClick={()=>onSelect(s.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(s.id);}}} className="al-diagram-node"><rect x={x} y={y} width="185" height="36" rx="8" fill={selected===s.id?'#304b56':'#182b33'} stroke={s.color}/><circle cx={x+14} cy={y+18} r="4" fill={s.color}/><text x={x+25} y={y+23} fill="#eaf1f1" fontSize="11">{labels?s.label:`Structure ${i+1}`}</text></g>; })}
    <text x="380" y="546" textAnchor="middle" fill="#dbe7e7" fontSize="13">{getSteps(spec, props.variant, props.gradient, props.energy)[step]?.title}</text>
  </svg><span>Schematic state and structure index · read the step explanation below</span></div>;
}
