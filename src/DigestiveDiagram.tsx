import type { ReactNode } from 'react';
import { ORGANS, STEPS, type OrganId } from './content';
import type { LessonMode } from './lessonState';

export default function DigestiveDiagram({ selectedId, mode, step, labels, context, isolate, hiddenIds, onSelect }: {
  selectedId: OrganId; mode: LessonMode; step: number; labels: boolean; context: boolean; isolate: boolean; hiddenIds: OrganId[]; onSelect: (id: OrganId) => void;
}) {
  const visible = (id: OrganId) => !hiddenIds.includes(id) && (!isolate || id === selectedId);
  const shape = (id: OrganId, children: ReactNode) => {
    if (!visible(id)) return null;
    const organ = ORGANS.find((item) => item.id === id)!;
    return <g key={id} className={`digestive-part ${selectedId === id ? 'is-selected' : ''}`} style={{ color: organ.color }} role="button" tabIndex={0} aria-label={`Select ${organ.en} in the 2D diagram`} aria-pressed={selectedId === id} onClick={() => onSelect(id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id); } }}><title>{organ.en}</title>{children}</g>;
  };
  const label = (id: OrganId, x: number, y: number, anchor: 'start' | 'end' = 'start') => {
    const organ = ORGANS.find((item) => item.id === id)!;
    return labels && visible(id) && <text key={`label-${id}`} x={x} y={y} textAnchor={anchor} className="digestive-diagram-label"><tspan x={x}>{organ.en}</tspan></text>;
  };
  const foodPositions: [number, number][] = [[282, 86], [281, 163], [331, 243], [284, 343], [385, 347], [281, 452]];
  const [foodX, foodY] = foodPositions[step];
  return <svg className="digestive-diagram" viewBox="0 0 580 510" aria-label="Digestive system diagram, viewed from the front of the body">
    <defs><marker id="digestive-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5L0 9" fill="none" stroke="#f8e2a5" strokeWidth="1.7" /></marker></defs>
    {context && <path d="M245 42Q225 52 220 88L218 117Q190 124 168 158L151 225Q172 248 178 320L188 431Q220 453 281 448Q347 453 382 431L394 320Q403 250 419 225L400 158Q377 124 345 117L344 88Q339 51 318 42" fill="#cad3d7" fillOpacity=".035" stroke="#778d95" strokeOpacity=".35" strokeWidth="2" />}
    {shape('mouth', <g><path d="M260 82Q280 68 303 82Q282 105 260 82" stroke="currentColor" strokeWidth="7" fill="#12232a" /><path d="M277 92L281 123" stroke="currentColor" strokeWidth="9" fill="none" strokeLinecap="round" /></g>)}
    {shape('oesophagus', <path d="M281 121L281 192Q280 210 307 215" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />)}
    {shape('stomach', <g><path d="M305 215Q328 228 338 204Q359 190 374 218Q388 251 363 271Q340 292 311 267L288 253" fill="currentColor" fillOpacity=".63" stroke="currentColor" strokeWidth="5" /><path d="M288 253Q271 249 260 267L255 283" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" /></g>)}
    {shape('large-intestine', <path d="M222 382L209 382Q191 382 191 363L191 299Q191 282 210 282L369 282Q389 282 389 300L389 382Q389 402 366 402L305 402Q281 402 281 420L281 437" fill="none" stroke="currentColor" strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" />)}
    {shape('small-intestine', <g><path d="M255 283L255 301Q255 311 273 311L339 311Q356 311 356 325Q356 337 337 337L241 337Q227 337 227 351Q227 364 243 364L339 364Q353 364 353 377Q353 389 337 389L245 389Q233 389 233 381L222 382" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" /></g>)}
    {shape('anus', <g><path d="M281 437L281 451" stroke="currentColor" strokeWidth="12" strokeLinecap="round" /><ellipse cx="281" cy="453" rx="10" ry="5" fill="currentColor" /></g>)}
    {mode === 'journey' && visible(STEPS[step].organId) && <g className="diagram-step-state" pointerEvents="none">
      {step === 0 ? <g><circle cx="274" cy="84" r="3.5" fill="#f8e2a5" /><circle cx="285" cy="84" r="3" fill="#f8e2a5" /><circle cx="294" cy="84" r="2.5" fill="#f8e2a5" /></g> : <circle cx={foodX} cy={foodY} r={step === 5 ? 5 : 6} fill="#f8e2a5" stroke="#6c4a25" strokeWidth="1.5" />}
      {step === 1 && <path d="M281 147L281 181" fill="none" stroke="#f8e2a5" strokeWidth="2.3" markerEnd="url(#digestive-arrow)" />}
      {step === 2 && <path d="M335 226Q362 231 350 250Q337 263 325 244" fill="none" stroke="#f8e2a5" strokeWidth="2.3" markerEnd="url(#digestive-arrow)" />}
      {step === 3 && <g><path d="M242 364L212 350M340 337L367 347" fill="none" stroke="#f8e2a5" strokeWidth="2.3" markerEnd="url(#digestive-arrow)" /><text x="290" y="474" className="diagram-process-note" textAnchor="middle">Nutrients cross the intestine’s wall into the body</text></g>}
      {step === 4 && <g><path d="M390 346L424 346" fill="none" stroke="#a6e3f0" strokeWidth="2.5" markerEnd="url(#digestive-arrow)" /><circle cx="418" cy="336" r="3" fill="#a6e3f0" /><text x="290" y="474" className="diagram-process-note" textAnchor="middle">More water is absorbed; the remaining material forms faeces</text></g>}
      {step === 5 && <path d="M281 459L281 481" fill="none" stroke="#f8e2a5" strokeWidth="2.3" markerEnd="url(#digestive-arrow)" />}
    </g>}
    {label('mouth', 235, 76, 'end')}{label('oesophagus', 314, 151)}{label('stomach', 407, 226)}{label('small-intestine', 165, 337, 'end')}{label('large-intestine', 419, 371)}{label('anus', 250, 441, 'end')}
  </svg>;
}
