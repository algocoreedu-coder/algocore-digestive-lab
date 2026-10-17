import { Html } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import type { SceneProps } from '../types';
import { Arrow, Label, PALETTE as P, Surface, Tube, type Point } from '../shared';
import { complementaryDNA, TRANSLATION_EXAMPLE as EXAMPLE } from './modelState';

/**
 * Original procedural, unitless teaching specimens. No experimental coordinates,
 * downloaded models, fonts, textures or third-party assets are used here.
 * Scientific contract: REVIEW_WAVE2_SCIENCE_SPEC.md, BIO-015–017, 2026-10-17.
 * SceneProps is the complete state interface. There is no independent clock:
 * stepping, back, pausing and reset therefore restore the same geometry exactly.
 * Rings and enzyme shapes identify relationships; they are not atomic structures.
 */
const pick = (p: SceneProps, id: string) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); p.onSelect(id); };
const active = (p: SceneProps, id: string, related: string[] = []) => [id, ...related].includes(p.selected);
const shows = (p: SceneProps, id: string, related: string[] = []) =>
  ![id, ...related].some(key => p.hidden.includes(key)) && (!p.isolate || [id, ...related].includes(p.selected));
const stepOf = (p: SceneProps, last: number) => Math.max(0, Math.min(last, p.step));
const baseColors: Record<string, string> = { A: P.coral, T: P.teal, G: P.amber, C: P.violet, U: P.teal };
const mix = (a: Point, b: Point, t: number): Point => a.map((v, i) => v + (b[i] - v) * t) as Point;

function Ball({ at, color, r = .1, scale, selected = false }: { at: Point; color: string; r?: number; scale?: Point; selected?: boolean }) {
  return <mesh position={at} scale={scale}><sphereGeometry args={[r, 18, 12]} /><Surface color={color} selected={selected} /></mesh>;
}
function Link({ a, b, color = P.cream, r = .024, selected = false, opacity = 1 }: { a: Point; b: Point; color?: string; r?: number; selected?: boolean; opacity?: number }) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), delta = to.clone().sub(from);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
  return <mesh position={from.add(to).multiplyScalar(.5).toArray() as Point} quaternion={q}><cylinderGeometry args={[r, r, Math.max(.001, delta.length()), 9]} /><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
function Dashes({ a, b, color = P.blue, selected = false }: { a: Point; b: Point; color?: string; selected?: boolean }) {
  return <group>{[0, 1, 2].map(i => <Link key={i} a={mix(a, b, i / 3)} b={mix(a, b, (i + .55) / 3)} color={color} r={.013} selected={selected} />)}</group>;
}
function HydrogenSet({ a, b, base, selected = false }: { a: Point; b: Point; base: string; selected?: boolean }) {
  const count = base === 'A' || base === 'T' ? 2 : 3;
  const axis = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize();
  let spread = new THREE.Vector3(0, 1, 0).cross(axis);
  if (spread.lengthSq() < .01) spread = new THREE.Vector3(0, 0, 1);
  spread.normalize();
  return <group>{Array.from({ length: count }, (_, i) => {
    const offset = spread.clone().multiplyScalar((i - (count - 1) / 2) * .062);
    return <Dashes key={i} a={new THREE.Vector3(...a).add(offset).toArray() as Point} b={new THREE.Vector3(...b).add(offset).toArray() as Point} selected={selected} />;
  })}</group>;
}

/** HTML is attached to model coordinates; letters remain readable after rotation. */
function Stamp({ p, at, children, id, color = P.cream, small = false, essential = false, wideOnly = false }: { p: SceneProps; at: Point; children: ReactNode; id?: string; color?: string; small?: boolean; essential?: boolean; wideOnly?: boolean }) {
  const compact = useThree(state => state.size.width < 660);
  if (!p.labels || id && !shows(p, id) || !id && p.isolate || compact && (!essential || wideOnly)) return null;
  return <Html center position={at} zIndexRange={[6, 0]} style={{ pointerEvents: 'none' }}><span style={{ display: 'block', width: 'max-content', maxWidth: 'min(460px, 75vw)', whiteSpace: 'normal', textAlign: 'center', color, font: `${small ? 600 : 650} ${small ? 9 : 10}px/1.4 Montserrat, sans-serif`, letterSpacing: '.015em', padding: small ? '2px 4px' : '4px 7px', borderRadius: 5, border: '1px solid #ffffff18', background: '#14242ce8' }}>{children}</span></Html>;
}

function Sugar({ at, selected = false }: { at: Point; selected?: boolean }) {
  return <group position={at} rotation={[.13, .18, .05]}><mesh><cylinderGeometry args={[.115, .115, .09, 5]} /><Surface color={P.amber} selected={selected} /></mesh><Ball at={[-.075, .045, .06]} r={.035} color={P.cream} selected={selected} /><Ball at={[.06, -.045, -.065]} r={.028} color={P.coral} selected={selected} /></group>;
}
function Phosphate({ at, selected = false }: { at: Point; selected?: boolean }) {
  return <group position={at}><mesh rotation={[.3, .2, .2]}><octahedronGeometry args={[.09, 0]} /><Surface color={P.rose} selected={selected} /></mesh>{[-1, 1].map(side => <Ball key={side} at={[side * .074, .025, -.015]} r={.031} color={P.cream} selected={selected} />)}</group>;
}

/** One or two schematic rings distinguish pyrimidine and purine base families. */
function BaseHalf({ from, to, base, selected = false }: { from: Point; to: Point; base: string; selected?: boolean }) {
  const delta = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const length = delta.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), delta.clone().normalize());
  const purine = base === 'A' || base === 'G', radius = Math.min(.145, length * .26), color = baseColors[base] ?? P.cream;
  return <group position={from} quaternion={q}>
    <Link a={[0, 0, 0]} b={[length * .36, 0, 0]} color={P.cream} r={.025} selected={selected} />
    {(purine ? [.48, .72] : [.63]).map((t, i) => <group key={i} position={[length * t, 0, 0]}>
      <mesh><cylinderGeometry args={[radius, radius, .045, purine && i === 0 ? 5 : 6]} /><Surface color={color} selected={selected} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, .018, 6, purine && i === 0 ? 5 : 6]} /><Surface color={P.cream} selected={selected} /></mesh>
      <Ball at={[0, .032, radius * .9]} r={.025} color={color} selected={selected} />
    </group>)}
    <Link a={[length * .72, 0, 0]} b={[length, 0, 0]} color={color} r={.022} selected={selected} />
  </group>;
}

function BasePair({ p, a, b, base, basesId = 'bases', bondsId = 'hydrogen', related = [], letters = false }: { p: SceneProps; a: Point; b: Point; base: string; basesId?: string; bondsId?: string; related?: string[]; letters?: boolean }) {
  const opposite = complementaryDNA(base), mid = mix(a, b, .5), left = mix(a, b, .46), right = mix(a, b, .54);
  return <group>
    {shows(p, basesId, related) && <group onClick={pick(p, basesId)}><BaseHalf from={a} to={left} base={base} selected={active(p, basesId, related)} /><BaseHalf from={b} to={right} base={opposite} selected={active(p, basesId, related)} /></group>}
    {shows(p, bondsId, related) && <group onClick={pick(p, bondsId)}><HydrogenSet a={left} b={right} base={base} selected={active(p, bondsId, related)} /></group>}
    {letters && shows(p, basesId, related) && <>
      <Stamp p={p} at={[...mix(a, mid, .57).slice(0, 2), mix(a, mid, .57)[2] + .15] as Point} id={basesId} small>{base}</Stamp>
      <Stamp p={p} at={[...mix(b, mid, .57).slice(0, 2), mix(b, mid, .57)[2] + .15] as Point} id={basesId} small>{opposite}</Stamp>
    </>}
  </group>;
}

function DNAChain({ p, points, color = P.violet, sugarId = 'sugar', phosphateId = 'phosphate', backboneId = 'backbone', related = ['nucleotide'] }: { p: SceneProps; points: Point[]; color?: string; sugarId?: string; phosphateId?: string; backboneId?: string; related?: string[] }) {
  return <group>
    {shows(p, backboneId, related) && <group onClick={pick(p, backboneId)}><Tube points={points} radius={.047} color={color} selected={active(p, backboneId, related)} segments={Math.max(24, points.length * 5)} /></group>}
    {shows(p, sugarId, [...related, backboneId]) && <group onClick={pick(p, sugarId)}>{points.map((at, i) => <Sugar key={i} at={at} selected={active(p, sugarId, [...related, backboneId])} />)}</group>}
    {shows(p, phosphateId, [...related, backboneId]) && <group onClick={pick(p, phosphateId)}>{points.slice(1).map((at, i) => <Phosphate key={i} at={mix(points[i], at, .5)} selected={active(p, phosphateId, [...related, backboneId])} />)}</group>}
  </group>;
}

function NucleotideScene(p: SceneProps) {
  const sugar: Point = [-.7, -.05, .1], phosphate: Point = [-1.75, .68, .05], base: Point = [.95, -.05, .1];
  return <group scale={1.22}>
    {shows(p, 'sugar', ['nucleotide']) && <group onClick={pick(p, 'sugar')}><group position={sugar} scale={3}><Sugar at={[0, 0, 0]} selected={active(p, 'sugar', ['nucleotide'])} /></group></group>}
    {shows(p, 'phosphate', ['nucleotide']) && <group onClick={pick(p, 'phosphate')}><group position={phosphate} scale={2.5}><Phosphate at={[0, 0, 0]} selected={active(p, 'phosphate', ['nucleotide'])} /></group><Tube points={[phosphate, [-1.43, .43, .07], sugar]} radius={.052} color={P.rose} selected={active(p, 'phosphate', ['nucleotide'])} segments={18} /></group>}
    {shows(p, 'bases', ['nucleotide']) && <group onClick={pick(p, 'bases')}><group position={[-.45, -.05, .1]} scale={[1.3, 1.9, 1.9]}><BaseHalf from={[0, 0, 0]} to={[1.22, 0, 0]} base="A" selected={active(p, 'bases', ['nucleotide'])} /></group></group>}
    <Label id="phosphate" props={p} position={[-1.75, 1.05, .1]} />
    <Label id="sugar" props={p} position={[-.7, -.62, .1]} />
    <Label id="bases" props={p} position={[1.1, .55, .1]} />
    <Label id="nucleotide" props={p} position={[0, -1.2, .2]} />
    <Stamp p={p} at={base} id="bases">Adenine · A</Stamp>
    <Stamp p={p} at={[0, 1.55, .1]} essential>One nucleotide = phosphate + deoxyribose + one base</Stamp>
    <Stamp p={p} at={[0, -1.65, .1]} small>Schematic rings · no atomic coordinates</Stamp>
  </group>;
}

function DNAHelixScene(p: SceneProps) {
  const s = stepOf(p, 3);
  if (s === 0) return <NucleotideScene {...p} />;
  const flat = s === 2, count = flat ? 8 : 15, sequence = 'AGTCAGCTGACTAGC';
  const a: Point[] = [], b: Point[] = [];
  for (let i = 0; i < count; i++) {
    const y = -1.68 + i / (count - 1) * 3.36, theta = i * .54 + .22;
    // Right-handed helix in Three.js's right-handed x/y/z coordinates.
    a.push(flat ? [-.94, y, 0] : [Math.cos(theta) * .9, y, -Math.sin(theta) * .9]);
    b.push(flat ? [.94, y, 0] : [-Math.cos(theta) * .9, y, Math.sin(theta) * .9]);
  }
  return <group rotation={[0, -.16, s === 1 ? -.16 : -.04]}>
    <DNAChain p={p} points={a} />
    {s >= 2 && <DNAChain p={p} points={b} color={P.teal} />}
    {s === 1 && shows(p, 'bases', ['nucleotide']) && <group onClick={pick(p, 'bases')}>{a.map((at, i) => <BaseHalf key={i} from={at} to={[at[0] * .18, at[1], at[2] * .18]} base={sequence[i]} selected={active(p, 'bases', ['nucleotide'])} />)}</group>}
    {s >= 2 && a.map((at, i) => <BasePair key={i} p={p} a={at} b={b[i]} base={sequence[i]} related={['nucleotide']} letters={flat} />)}
    <Stamp p={p} at={[a[0][0] - .22, -1.93, a[0][2]]} id="backbone" essential>5′</Stamp>
    <Stamp p={p} at={[a[count - 1][0] - .22, 1.98, a[count - 1][2]]} id="backbone" essential>3′</Stamp>
    {s >= 2 && <><Stamp p={p} at={[b[0][0] + .23, -1.93, b[0][2]]} id="backbone" essential>3′</Stamp><Stamp p={p} at={[b[count - 1][0] + .23, 1.98, b[count - 1][2]]} id="backbone" essential>5′</Stamp></>}
    <Label id="backbone" props={p} position={[-1.72, .9, .1]} />
    <Label id="sugar" props={p} position={[-1.58, .23, .25]} />
    <Label id="phosphate" props={p} position={[-1.65, -.48, .3]} />
    <Label id="nucleotide" props={p} position={[1.9, 1.18, .3]} />
    <Label id="bases" props={p} position={[1.8, -.15, .35]} />
    {s >= 2 && <Label id="hydrogen" props={p} position={[1.9, -.93, .3]} />}
    {s === 2 && <><Stamp p={p} at={[2.05, .46, .25]} id="hydrogen">A–T · 2 hydrogen bonds</Stamp><Stamp p={p} at={[2.05, -.48, .25]} id="hydrogen">C–G · 3 hydrogen bonds</Stamp></>}
    <Stamp p={p} at={[0, -2.24, .3]} essential>{s === 1 ? 'One covalent sugar–phosphate strand' : s === 2 ? 'Complementary bases · dashed hydrogen bonds' : 'Two complementary strands · opposite 5′ / 3′ directions'}</Stamp>
  </group>;
}

/** Enzyme silhouettes are original folded lobes, not coordinate-derived proteins. */
function Enzyme({ p, id, at, color = P.teal, scale = 1, open = false }: { p: SceneProps; id: string; at: Point; color?: string; scale?: number; open?: boolean }) {
  if (!shows(p, id)) return null;
  return <group position={at} scale={scale} onClick={pick(p, id)}>
    {Array.from({ length: 7 }, (_, i) => {
      const a = i / 7 * Math.PI * 2;
      if (open && p.cutaway && i < 2) return null;
      return <mesh key={i} position={[Math.cos(a) * .24, Math.sin(a) * .3, .055 * Math.sin(a * 3)]} rotation={[a * .17, .1, a * .3]} scale={[.22, .25 + .035 * Math.cos(a), .26]}><sphereGeometry args={[1, 20, 14]} /><Surface color={i % 3 === 0 ? P.cream : color} selected={active(p, id)} /></mesh>;
    })}
    <mesh position={[0, 0, -.06]}><torusGeometry args={[.23, .035, 8, 32, open && p.cutaway ? Math.PI * 1.5 : Math.PI * 2]} /><Surface color={P.cream} selected={active(p, id)} /></mesh>
  </group>;
}

const forkY = (x: number, side: number) => side * (.32 + Math.max(0, .82 - x) / 3.62 * .91);
function forkPoints(side: number): Point[] {
  return Array.from({ length: 43 }, (_, i) => {
    const x = -2.8 + i / 42 * 5.75;
    if (x < .82) return [x, forkY(x, side), .025 * Math.sin(x * 3)];
    const t = (x - .82) * 5.5;
    return [x, side * .32 * Math.cos(t), side * .32 * Math.sin(t)];
  });
}
function NewSegment({ p, id, lo, hi, side, color, primer = false }: { p: SceneProps; id: string; lo: number; hi: number; side: number; color: string; primer?: boolean }) {
  const related = primer ? [] : ['new-dna'];
  if (!shows(p, id, related)) return null;
  const count = Math.max(3, Math.ceil((hi - lo) / .15));
  const points: Point[] = Array.from({ length: count }, (_, i) => {
    const x = lo + i / (count - 1) * (hi - lo);
    return [x, forkY(x, side) - side * .23, .08];
  });
  return <group onClick={pick(p, id)}>
    <Tube points={points} radius={primer ? .062 : .05} color={color} selected={active(p, id, related)} segments={Math.max(18, points.length * 3)} />
    {points.map((at, i) => <group key={i}><mesh position={at} rotation={[Math.PI / 2, .12, i * .2]}><cylinderGeometry args={[primer ? .071 : .078, primer ? .071 : .078, .075, 5]} /><Surface color={color} selected={active(p, id, related)} /></mesh>{!primer && i % 2 === 0 && <Link a={at} b={[at[0], forkY(at[0], side) - side * .035, .02]} color={baseColors['ATGC'[i % 4]]} r={.026} />}</group>)}
  </group>;
}
function Daughter({ p, cy, leading }: { p: SceneProps; cy: number; leading: boolean }) {
  const old: Point[] = [], fresh: Point[] = [], seq = 'AGTCAGCTGACTAG';
  for (let i = 0; i < 18; i++) {
    const x = -2.8 + i / 17 * 5.6, t = i * .58;
    old.push([x, cy + Math.cos(t) * .31, Math.sin(t) * .31]);
    fresh.push([x, cy - Math.cos(t) * .31, -Math.sin(t) * .31]);
  }
  const id = leading ? 'leading' : 'lagging', color = leading ? P.amber : P.coral;
  return <group>
    <DNAChain p={p} points={old} color={P.violet} sugarId="template" phosphateId="template" backboneId="template" related={[]} />
    <DNAChain p={p} points={fresh} color={color} sugarId={id} phosphateId={id} backboneId={id} related={['new-dna']} />
    {old.map((at, i) => shows(p, 'template') && shows(p, id, ['new-dna']) ? <group key={i}>
      <BaseHalf from={at} to={mix(at, fresh[i], .46)} base={seq[i % seq.length]} />
      <BaseHalf from={fresh[i]} to={mix(at, fresh[i], .54)} base={complementaryDNA(seq[i % seq.length])} />
      <HydrogenSet a={mix(at, fresh[i], .46)} b={mix(at, fresh[i], .54)} base={seq[i % seq.length]} />
    </group> : null)}
    <Stamp p={p} at={[-3.05, old[0][1], old[0][2] + .1]} id="template" essential>{leading ? '3′ old' : '5′ old'}</Stamp>
    <Stamp p={p} at={[3.05, old[17][1], old[17][2] + .1]} id="template" essential>{leading ? '5′ old' : '3′ old'}</Stamp>
    <Stamp p={p} at={[-3.05, fresh[0][1], fresh[0][2] + .1]} id="new-dna" essential>{leading ? '5′ new' : '3′ new'}</Stamp>
    <Stamp p={p} at={[3.05, fresh[17][1], fresh[17][2] + .1]} id="new-dna" essential>{leading ? '3′ new' : '5′ new'}</Stamp>
  </group>;
}
function ReplicationScene(p: SceneProps) {
  const s = stepOf(p, 5), fragments = [[-2.73, -1.65], [-1.44, -.39], [-.18, .5]];
  if (s === 5) return <group>
    <Daughter p={p} cy={.98} leading /><Daughter p={p} cy={-.98} leading={false} />
    <Label id="template" props={p} position={[-.3, 1.58, .35]} />
    <Label id="new-dna" props={p} position={[.4, -.42, .4]} />
    <Label id="leading" props={p} position={[2.0, .45, .4]} />
    <Label id="lagging" props={p} position={[-2.05, -1.65, .3]} />
    <Stamp p={p} at={[0, 2.03, .1]} essential>Each daughter duplex: one parental strand + one new strand</Stamp>
    <Stamp p={p} at={[0, -2.12, .1]} essential>SEMICONSERVATIVE REPLICATION</Stamp>
  </group>;
  const parentA = forkPoints(1), parentB = forkPoints(-1);
  return <group rotation={[.03, -.06, 0]}>
    <DNAChain p={p} points={parentA} color={P.violet} sugarId="template" phosphateId="template" backboneId="template" related={[]} />
    <DNAChain p={p} points={parentB} color={P.violet} sugarId="template" phosphateId="template" backboneId="template" related={[]} />
    {shows(p, 'template') && parentA.slice(28).filter((_, i) => i % 2 === 0).map((at, i) => <group key={i} onClick={pick(p, 'template')}><BaseHalf from={at} to={mix(at, parentB[28 + i * 2], .46)} base={'AGTC'[i % 4]} /><BaseHalf from={parentB[28 + i * 2]} to={mix(at, parentB[28 + i * 2], .54)} base={complementaryDNA('AGTC'[i % 4])} /><HydrogenSet a={mix(at, parentB[28 + i * 2], .46)} b={mix(at, parentB[28 + i * 2], .54)} base={'AGTC'[i % 4]} /></group>)}
    {shows(p, 'helicase') && <group position={[.83, 0, 0]} rotation={[0, Math.PI / 2, 0]} onClick={pick(p, 'helicase')}>
      <mesh><torusGeometry args={[.43, .12, 12, 48, p.cutaway ? Math.PI * 1.48 : Math.PI * 2]} /><Surface color={P.rose} selected={active(p, 'helicase')} /></mesh>
      {Array.from({ length: 6 }, (_, i) => i < (p.cutaway ? 4 : 6) && <Ball key={i} at={[Math.cos(i / 6 * Math.PI * 2) * .43, Math.sin(i / 6 * Math.PI * 2) * .43, 0]} scale={[1, 1, .7]} r={.15} color={i % 2 ? P.rose : P.coral} selected={active(p, 'helicase')} />)}
    </group>}
    {s >= 1 && s < 4 && <><NewSegment p={p} id="primer" lo={-2.74} hi={-2.38} side={1} color={P.blue} primer />{(s < 3 ? [fragments[2]] : fragments).map(([lo, hi], i) => <NewSegment key={i} p={p} id="primer" lo={Math.max(lo, hi - .23)} hi={hi} side={-1} color={P.blue} primer />)}</>}
    {s >= 2 && <NewSegment p={p} id="leading" lo={s >= 4 ? -2.74 : -2.38} hi={s >= 3 ? .54 : .15} side={1} color={P.amber} />}
    {s === 3 && fragments.map(([lo, hi], i) => <NewSegment key={i} p={p} id="lagging" lo={lo} hi={hi - .24} side={-1} color={P.coral} />)}
    {s >= 4 && <NewSegment p={p} id="lagging" lo={-2.74} hi={.5} side={-1} color={P.coral} />}
    {s >= 1 && s <= 3 && <Enzyme p={p} id="polymerase" at={s === 1 ? [-2.24, forkY(-2.24, 1) - .23, .25] : [s === 2 ? .15 : .54, forkY(s === 2 ? .15 : .54, 1) - .23, .22]} scale={.63} open />}
    {s === 3 && <Enzyme p={p} id="polymerase" at={[-1.44, forkY(-1.44, -1) + .23, .22]} color={P.teal} scale={.6} open />}
    {s >= 4 && <><Enzyme p={p} id="ligase" at={[-.39, forkY(-.39, -1) + .24, .28]} color={P.rose} scale={.66} />{shows(p, 'ligase') && [-1.55, -.29].map((x, i) => <group key={i} position={[x, forkY(x, -1) + .23, .08]} rotation={[0, 0, Math.PI / 2]} onClick={pick(p, 'ligase')}><mesh><torusGeometry args={[.09, .025, 8, 20]} /><Surface color={P.cream} /></mesh></group>)}</>}
    {s >= 2 && shows(p, 'leading', ['new-dna']) && <Arrow from={[-1.65, 1.37, .15]} to={[-.2, 1.03, .15]} color={P.amber} />}
    {s === 3 && shows(p, 'lagging', ['new-dna']) && fragments.map(([lo, hi], i) => <Arrow key={i} from={[hi - .2, forkY(hi, -1) -.35, .1]} to={[lo, forkY(lo, -1) -.35, .1]} color={P.coral} />)}
    <Arrow from={[1.45, .92, -.1]} to={[2.8, .92, -.1]} color={P.cream} />
    <Stamp p={p} at={[2.12, 1.22, .1]} essential>Fork progression →</Stamp>
    <Stamp p={p} at={[-3.05, 1.42, .1]} id="template" essential>3′ old</Stamp><Stamp p={p} at={[-3.05, -1.44, .1]} id="template" essential>5′ old</Stamp>
    <Stamp p={p} at={[3.1, .43, .1]} id="template" essential>5′</Stamp><Stamp p={p} at={[3.1, -.43, .1]} id="template" essential>3′</Stamp>
    {s >= 2 && <Stamp p={p} at={[-1.8, 1.83, .15]} id="leading" essential>Leading · 5′ → 3′ toward fork</Stamp>}
    {s >= 3 && <Stamp p={p} at={[-1.2, -1.88, .15]} id="lagging" essential>Lagging · 3′ ← 5′ away from fork</Stamp>}
    <Label id="template" props={p} position={[2.15, -.88, .1]} offset={[10, 22]} />
    <Label id="helicase" props={p} position={[.85, -.8, .4]} offset={[-10, -12]} />
    {s >= 1 && s < 4 && <><Label id="primer" props={p} position={[-2.55, .58, .4]} /><Label id="polymerase" props={p} position={[-.1, .68, .55]} offset={[0, 20]} /></>}
    {s >= 2 && <Label id="leading" props={p} position={[-1.2, .68, .4]} offset={[0, -20]} />}
    {s >= 3 && <Label id="lagging" props={p} position={[-1.7, -.57, .4]} />}
    {s >= 4 && <><Label id="ligase" props={p} position={[-.45, -1.35, .5]} /><Label id="new-dna" props={p} position={[-2.3, .1, .3]} /></>}
    <Stamp p={p} at={[0, -2.24, .2]} essential wideOnly>{['Opening exposes two antiparallel templates', 'Blue RNA primers supply starting 3′ ends', 'Polymerase adds DNA only at a growing 3′ end', 'Each fragment begins near the fork and extends away', 'RNA primers replaced · backbone nicks sealed'][s]}</Stamp>
  </group>;
}

/** A cutaway envelope locates nuclear processes without hiding the gene. */
function Nucleus({ p, at = [-1.05, .2, -.15], scale = [1.95, 1.56, .82], miniature = false }: { p: SceneProps; at?: Point; scale?: Point; miniature?: boolean }) {
  return <group position={at} scale={scale}>
    {shows(p, 'nucleus') && <group onClick={pick(p, 'nucleus')}>
      <mesh><sphereGeometry args={[1, 48, 28, p.cutaway ? Math.PI : 0, p.cutaway ? Math.PI : Math.PI * 2]} /><Surface color={P.violet} selected={active(p, 'nucleus')} opacity={p.cutaway ? .16 : .11} /></mesh>
      <mesh><torusGeometry args={[1, .016, 8, 96]} /><Surface color={P.violet} selected={active(p, 'nucleus')} opacity={.66} /></mesh>
      {!miniature && <mesh scale={[.975, .975, .98]}><torusGeometry args={[1, .008, 6, 96]} /><Surface color={P.rose} opacity={.5} /></mesh>}
    </group>}
    {shows(p, 'pore') && !miniature && <group position={[.95, -.35, .06]} rotation={[0, 0, -.18]} scale={[.085, .19, .2]} onClick={pick(p, 'pore')}><mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[1, .26, 10, 32]} /><Surface color={P.blue} selected={active(p, 'pore')} /></mesh>{Array.from({ length: 8 }, (_, i) => <Ball key={i} at={[0, Math.sin(i / 4 * Math.PI), Math.cos(i / 4 * Math.PI)]} r={.23} color={P.cream} />)}</group>}
  </group>;
}

function RNA({ p, points, sequence, codons = true, primary = false, scale = 1 }: { p: SceneProps; points: Point[]; sequence: string; codons?: boolean; primary?: boolean; scale?: number }) {
  if (!shows(p, 'mrna')) return null;
  const r = .039 * scale;
  return <group onClick={pick(p, 'mrna')}>
    {(primary ? [points.slice(0, 3), points.slice(3)] : [points]).map((exon, i) => <Tube key={i} points={exon} radius={r} color={P.amber} selected={active(p, 'mrna')} segments={Math.max(24, exon.length * 4)} />)}
    {points.map((at, i) => <group key={i}><mesh position={at} rotation={[0, 0, i * .13]}><dodecahedronGeometry args={[.059 * scale, 0]} /><Surface color={P.amber} selected={active(p, 'mrna')} /></mesh><Link a={at} b={[at[0], at[1] + .14 * scale, at[2] + .025]} color={baseColors[sequence[i]]} r={.032 * scale} /><Ball at={[at[0], at[1] + .17 * scale, at[2] + .025]} color={baseColors[sequence[i]]} r={.048 * scale} /></group>)}
    {codons && Array.from({ length: Math.floor(sequence.length / 3) }, (_, i) => <Stamp key={i} p={p} id="mrna" at={[points[i * 3 + 1][0], points[i * 3 + 1][1] - .23 * scale, points[i * 3 + 1][2] + .11]} color={sequence.slice(i * 3, i * 3 + 3) === EXAMPLE.stopCodon ? P.rose : P.amber} small>{sequence.slice(i * 3, i * 3 + 3)}</Stamp>)}
    {primary && <Tube points={[[points[2][0], points[2][1], points[2][2]], [points[2][0] + .08, points[2][1] - .45, .25], [points[3][0] -.08, points[3][1] -.45, .25], points[3]]} radius={r} color={P.violet} selected={active(p, 'mrna')} segments={28} />}
  </group>;
}

function NuclearDNA({ p, opened }: { p: SceneProps; opened: boolean }) {
  const coding: Point[] = [], template: Point[] = [];
  for (let i = 0; i < 12; i++) {
    const x = -2.65 + i * .23, bubble = opened && i >= 2 && i <= 7 ? .14 * Math.sin((i - 1) / 7 * Math.PI) : 0;
    coding.push([x, .92 + bubble, -.06]); template.push([x, .56 - bubble, .04]);
  }
  return <group>
    <DNAChain p={p} points={coding} color={P.violet} sugarId="dna" phosphateId="dna" backboneId="dna" related={[]} />
    <DNAChain p={p} points={template} color={P.rose} sugarId="template" phosphateId="template" backboneId="template" related={['dna']} />
    {coding.map((at, i) => shows(p, 'dna') && (!opened || i < 2 || i > 7) ? <Link key={i} a={at} b={template[i]} color={baseColors[EXAMPLE.codingDNA[i]]} r={.026} /> : null)}
    <Stamp p={p} at={[-1.4, 1.33, .2]} id="dna" small essential>Exonic coding sequence · 5′ ATG GAA TTT TAA 3′</Stamp>
    <Stamp p={p} at={[-1.4, .27, .25]} id="template" small essential>Exonic template · 3′ TAC CTT AAA ATT 5′</Stamp>
    <Stamp p={p} at={[-1.4, 1.58, .2]} id="dna" small>DNA panel omits the symbolic intron</Stamp>
  </group>;
}
function TranscriptionScene(p: SceneProps) {
  const s = stepOf(p, 5), primary = s === 3;
  const len = s === 2 ? 7 : 12;
  const rna: Point[] = Array.from({ length: len }, (_, i) => {
    if (s === 5) return [1.15 + i * .17, -.55 + Math.sin(i * .3) * .08, .2];
    return [-2.65 + i * .23 + (primary && i >= 3 ? .3 : 0), s === 2 ? -.36 + i * .08 : -.3, .3];
  });
  return <group>
    {shows(p, 'cytoplasm') && <group onClick={pick(p, 'cytoplasm')}>
      <Tube points={[[1.15, 1.65, -.7], [2.7, 1.58, -.7], [3.25, .85, -.7], [3.25, -1.25, -.7], [2.6, -1.67, -.7], [1.15, -1.67, -.7]]} radius={.018} color={P.blue} opacity={.4} segments={40} />
    </group>}
    <Nucleus p={p} />
    <NuclearDNA p={p} opened={s === 1 || s === 2} />
    {(s === 1 || s === 2) && <Enzyme p={p} id="rna-polymerase" at={[s === 1 ? -2.15 : -1.17, .63, .2]} color={P.teal} scale={.82} open />}
    {s >= 2 && <RNA p={p} points={rna} sequence={EXAMPLE.mrna.slice(0, len)} primary={primary} />}
    {s === 2 && shows(p, 'mrna') && <><Arrow from={[-2.45, -.75, .3]} to={[-1.28, -.24, .3]} color={P.amber} /><Stamp p={p} at={[-2.8, -.6, .4]} id="mrna" small essential>5′</Stamp><Stamp p={p} at={[-1.15, -.12, .42]} id="mrna" small essential>3′ growing end</Stamp></>}
    {s === 3 && <Stamp p={p} at={[-1.8, -1.06, .35]} id="mrna" small essential>Symbolic intron · sequence omitted</Stamp>}
    {s === 4 && shows(p, 'mrna') && <>
      <Tube points={[[-2.04, -.92, .25], [-1.88, -1.19, .25], [-1.5, -1.19, .25], [-1.4, -.92, .25], [-1.7, -.82, .25], [-2.04, -.92, .25]]} radius={.035} color={P.violet} selected={active(p, 'mrna')} segments={38} />
      <Stamp p={p} at={[-1.7, -1.43, .35]} id="mrna" small essential>Intron removed · exons joined</Stamp>
    </>}
    {s >= 3 && s < 5 && <><Stamp p={p} at={[-2.85, -.31, .4]} id="mrna" small essential>5′</Stamp><Stamp p={p} at={[primary ? .32 : .01, -.32, .4]} id="mrna" small essential>3′</Stamp></>}
    {s === 5 && <><Arrow from={[.3, -.5, .35]} to={[1.2, -.53, .35]} color={P.amber} /><Stamp p={p} at={[2.05, -.05, .3]} id="mrna" essential>5′ AUG GAA UUU UAA 3′</Stamp><Stamp p={p} at={[2.05, -1.04, .3]} id="mrna" small>Mature message · cytoplasm</Stamp></>}
    {s === 4 && <Stamp p={p} at={[-1.35, -.7, .35]} id="mrna" small essential>Mature mRNA · 5′ AUG GAA UUU UAA 3′</Stamp>}
    <Stamp p={p} at={[-1.05, 1.98, .1]} id="nucleus" essential>NUCLEUS · transcription + processing</Stamp>
    <Stamp p={p} at={[2.05, 1.7, .1]} id="cytoplasm" essential>CYTOPLASM</Stamp>
    <Label id="nucleus" props={p} position={[-2.55, -1.2, .1]} />
    <Label id="dna" props={p} position={[-2.48, 1.63, .15]} />
    <Label id="template" props={p} position={[-2.55, .35, .3]} offset={[-8, 11]} />
    {(s === 1 || s === 2) && <Label id="rna-polymerase" props={p} position={[-.45, .65, .55]} />}
    {s >= 2 && <Label id="mrna" props={p} position={s === 5 ? [2.1, -.72, .5] : [-.4, -.91, .45]} />}
    <Label id="pore" props={p} position={[.86, -.55, .2]} offset={[8, 15]} />
    <Label id="cytoplasm" props={p} position={[2.2, .86, .1]} />
    <Stamp p={p} at={[0, -2.13, .2]} essential>{['DNA stays inside the nucleus', 'Polymerase selects one DNA template', 'Template read 3′ → 5′ · RNA grows 5′ → 3′', 'Primary RNA released · DNA re-pairs', 'RNA processing precedes export', 'Only mature mRNA passes through the pore'][s]}</Stamp>
  </group>;
}

const codonX = [-1.95, -.65, .65, 1.95];
function Ribosome({ p, x, separated = false, terminal = false }: { p: SceneProps; x: number; separated?: boolean; terminal?: boolean }) {
  if (!shows(p, 'ribosome')) return null;
  const shift = separated ? .63 : terminal ? .27 : 0;
  return <group position={[x, 0, 0]} onClick={pick(p, 'ribosome')}>
    <mesh position={[0, -1.12 - (separated ? .24 : 0), -.12]} scale={[.93, .29, .53]}><sphereGeometry args={[1, 32, 20]} /><Surface color={P.teal} selected={active(p, 'ribosome')} /></mesh>
    <mesh position={[-.2, -.04 + shift, -.28]} rotation={[.03, -.1, -.12]} scale={[.87, .64, .56]}><sphereGeometry args={[1, 32, 22]} /><Surface color={P.teal} selected={active(p, 'ribosome')} opacity={p.cutaway ? .82 : .9} /></mesh>
    <mesh position={[.47, -.19 + shift, -.25]} rotation={[.1, .18, .32]} scale={[.5, .49, .45]}><sphereGeometry args={[1, 28, 18]} /><Surface color={P.blue} selected={active(p, 'ribosome')} /></mesh>
    {(!p.cutaway || separated) && <mesh position={[-.16, -.14 + shift, .34]} scale={[.86, .54, .35]}><sphereGeometry args={[1, 28, 18]} /><Surface color={P.teal} selected={active(p, 'ribosome')} opacity={.3} /></mesh>}
    <Tube points={[[-.83, -.64 + shift, .1], [-.58, -.74 + shift, .28], [.15, -.74 + shift, .28], [.67, -.63 + shift, .13]]} radius={.032} color={P.cream} segments={32} />
    <mesh position={[-.35, .43 + shift, -.1]} rotation={[.2, -.15, .1]}><torusGeometry args={[.13, .038, 10, 28]} /><Surface color={P.cream} /></mesh>
    <Stamp p={p} id="ribosome" at={[-.9, .28 + shift, .2]} small>Large subunit</Stamp>
    <Stamp p={p} id="ribosome" at={[.0, -1.65 - (separated ? .1 : 0), .15]} small>Small subunit</Stamp>
  </group>;
}
function TRNA({ p, index, x, departed = false }: { p: SceneProps; index: number; x: number; departed?: boolean }) {
  if (!shows(p, 'trna')) return null;
  const points: Point[] = [[-.1, .64, .15], [-.1, .35, .15], [-.29, .43, .12], [-.4, .27, .1], [-.29, .06, .1], [-.1, .14, .13], [-.12, -.16, .15], [-.25, -.38, .14], [-.2, -.63, .16], [0, -.72, .16], [.2, -.63, .16], [.25, -.38, .14], [.12, -.16, .15], [.1, .12, .14], [.33, .1, .11], [.39, .31, .1], [.25, .46, .13], [.1, .35, .15], [.1, .64, .15]];
  return <group position={[x, departed ? .22 : 0, departed ? -.08 : .2]} rotation={[0, 0, departed ? -.25 : .02]} onClick={pick(p, 'trna')}>
    <Tube points={points} radius={.035} color={index === 1 ? P.rose : P.violet} selected={active(p, 'trna')} segments={80} />
    {Array.from({ length: 5 }, (_, i) => <Dashes key={i} a={[-.09, .58 - i * .13, .15]} b={[.09, .58 - i * .13, .15]} color={P.cream} selected={active(p, 'trna')} />)}
    {[0, 1, 2].map(i => <Ball key={i} at={[-.115 + i * .115, -.69 + Math.abs(i - 1) * .04, .18]} color={baseColors[EXAMPLE.anticodons3to5[index][i]]} r={.052} selected={active(p, 'trna')} />)}
    <Stamp p={p} id="trna" at={[0, -.47, .32]} small essential>3′ {EXAMPLE.anticodons3to5[index]} 5′</Stamp>
  </group>;
}
function AminoAcid({ p, at, index, chain = false }: { p: SceneProps; at: Point; index: number; chain?: boolean }) {
  const id = chain ? 'polypeptide' : 'amino-acids';
  if (!shows(p, id, chain ? [] : ['trna'])) return null;
  return <group onClick={pick(p, id)}>
    <Ball at={at} color={[P.coral, P.amber, P.rose][index]} r={.145} selected={active(p, id)} />
    <mesh position={[at[0], at[1] + .13, at[2]]} rotation={[.3, .2, .3]}><octahedronGeometry args={[.082, 0]} /><Surface color={[P.coral, P.amber, P.rose][index]} selected={active(p, id)} /></mesh>
    <Stamp p={p} id={id} at={[at[0], at[1] + .32, at[2] + .08]} small essential>{EXAMPLE.aminoAcids[index]}</Stamp>
  </group>;
}
function Peptide({ p, points, released = false }: { p: SceneProps; points: Point[]; released?: boolean }) {
  if (!shows(p, 'polypeptide')) return null;
  return <group onClick={pick(p, 'polypeptide')}>
    {points.slice(1).map((at, i) => <Link key={i} a={points[i]} b={at} color={P.cream} r={.038} selected={active(p, 'polypeptide')} />)}
    {points.map((at, i) => <AminoAcid key={i} p={p} at={at} index={i} chain />)}
    <Stamp p={p} id="polypeptide" at={[points[0][0] - .3, points[0][1] + .02, .5]} small essential>N</Stamp>
    <Stamp p={p} id="polypeptide" at={[points[points.length - 1][0] + .25, points[points.length - 1][1] + .02, .5]} small essential>C</Stamp>
    {released && <Stamp p={p} id="polypeptide" at={[points[1][0], points[1][1] + .67, .45]} essential wideOnly>Released Met–Glu–Phe</Stamp>}
  </group>;
}
function TranslationScene(p: SceneProps) {
  const s = stepOf(p, 5);
  const x = s === 0 ? .7 : s <= 1 ? codonX[0] : s <= 3 ? -1.3 : s === 4 ? 0 : codonX[3];
  const message: Point[] = Array.from({ length: 12 }, (_, i) => [codonX[Math.floor(i / 3)] + (i % 3 - 1) * .28, -.92, .28]);
  const peptide: Point[] = s === 3 ? [[-.98, 1.05, .4], [-.65, .82, .4]] : s === 4 ? [[-.12, 1.24, .4], [.31, 1.03, .4], [.65, .82, .4]] : [[.55, 1.22, .4], [.99, 1.41, .4], [1.43, 1.22, .4]];
  return <group>
    <Nucleus p={p} at={[-2.75, 1.16, -.7]} scale={[.52, .53, .34]} miniature />
    {shows(p, 'dna') && <group onClick={pick(p, 'dna')}><Tube points={[[-2.95, 1.14, -.53], [-2.82, 1.32, -.5], [-2.65, 1.08, -.5], [-2.51, 1.28, -.53]]} radius={.034} color={P.violet} segments={24} /><Tube points={[[-2.95, 1.28, -.53], [-2.82, 1.08, -.5], [-2.65, 1.32, -.5], [-2.51, 1.14, -.53]]} radius={.028} color={P.rose} segments={24} /></group>}
    {shows(p, 'cytoplasm') && <group onClick={pick(p, 'cytoplasm')}><Tube points={[[-3.25, -.18, -.8], [-3.25, -1.85, -.8], [-2.65, -2.03, -.8], [2.7, -2.03, -.8], [3.25, -1.65, -.8], [3.25, .83, -.8]]} radius={.016} color={P.blue} opacity={.36} segments={50} /></group>}
    <RNA p={p} points={message} sequence={EXAMPLE.mrna} scale={1.25} codons={false} />
    <Ribosome p={p} x={x} separated={s === 0} terminal={s === 5} />
    {s === 1 && <><TRNA p={p} index={0} x={codonX[0]} /><AminoAcid p={p} at={[codonX[0], .82, .4]} index={0} /></>}
    {s === 2 && <><TRNA p={p} index={0} x={codonX[0]} /><TRNA p={p} index={1} x={codonX[1]} /><AminoAcid p={p} at={[codonX[0], .82, .4]} index={0} /><AminoAcid p={p} at={[codonX[1], .82, .4]} index={1} /></>}
    {s === 3 && <><TRNA p={p} index={0} x={-2.65} departed /><TRNA p={p} index={1} x={codonX[1]} /><Peptide p={p} points={peptide} /></>}
    {s === 4 && <><TRNA p={p} index={1} x={-1.5} departed /><TRNA p={p} index={2} x={codonX[2]} /><Peptide p={p} points={peptide} /></>}
    {s === 5 && <>
      <Peptide p={p} points={peptide} released />
      {shows(p, 'ribosome') && <group position={[codonX[3], -.19, .37]} onClick={pick(p, 'ribosome')}><Ball at={[0, 0, 0]} color={P.cream} r={.17} scale={[.7, 1.5, .8]} /><Ball at={[.13, .2, 0]} color={P.rose} r={.12} /><Stamp p={p} id="ribosome" at={[.48, .2, .1]} small essential>Release factor</Stamp></group>}
    </>}
    {EXAMPLE.codons.map((codon, i) => <group key={codon + i}>
      <Stamp p={p} id="mrna" at={[codonX[i], -1.4, .46]} color={i === 3 ? P.rose : P.amber} essential>{codon}</Stamp>
      {shows(p, 'mrna') && <Link a={[codonX[i] - .38, -1.13, .32]} b={[codonX[i] + .38, -1.13, .32]} color={i === 3 ? P.rose : P.amber} r={.012} />}
    </group>)}
    <Stamp p={p} id="mrna" at={[-2.86, -.94, .4]} small essential>5′</Stamp><Stamp p={p} id="mrna" at={[2.86, -.94, .4]} small essential>3′</Stamp>
    <Stamp p={p} id="nucleus" at={[-2.75, 1.91, -.4]} small essential>DNA remains nuclear</Stamp>
    <Stamp p={p} id="cytoplasm" at={[1.84, 1.93, -.1]} essential wideOnly>CYTOPLASM · translation</Stamp>
    {s === 2 && <Stamp p={p} id="amino-acids" at={[1.85, .82, .4]} essential>GAA ↔ 3′ CUU 5′</Stamp>}
    {s === 3 && <Stamp p={p} id="polypeptide" at={[1.8, 1.02, .4]} essential>Peptide bond · Met—Glu</Stamp>}
    {s === 5 && <Stamp p={p} id="trna" at={[-1.95, -.1, .45]} essential>UAA: no amino acid · no stop tRNA</Stamp>}
    {s >= 1 && s < 5 && shows(p, 'ribosome') && <Arrow from={[x - .65, -1.84, .05]} to={[x + .65, -1.84, .05]} color={P.teal} />}
    <Label id="mrna" props={p} position={[0, -1.77, .35]} />
    <Label id="ribosome" props={p} position={[x + .1, s === 0 ? .94 : .47, .6]} />
    {s >= 1 && s < 5 && <Label id="trna" props={p} position={s <= 2 ? [-.65, .22, .6] : [.65, .22, .6]} />}
    {s >= 1 && s <= 2 && <Label id="amino-acids" props={p} position={[s === 1 ? -1.95 : -.65, 1.45, .5]} />}
    {s >= 3 && <Label id="polypeptide" props={p} position={[s === 5 ? -.25 : .52, 1.65, .5]} />}
    <Label id="cytoplasm" props={p} position={[2.6, -.21, -.2]} />
    <Label id="nucleus" props={p} position={[-2.75, .47, -.35]} />
    <Stamp p={p} at={[0, -2.28, .2]} essential>{['Mature mRNA is outside the nucleus', 'Initiator tRNA establishes the AUG reading frame', 'Codon and anticodon pair complementarily, antiparallel', 'A peptide bond transfers the chain to the incoming tRNA', 'Ribosome reads 5′ → 3′ · peptide grows N → C', 'Stop recognition releases the completed polypeptide'][s]}</Stamp>
  </group>;
}

export default function DNAScenes(props: SceneProps) {
  if (props.moduleId === 'BIO-015') return <DNAHelixScene {...props} />;
  if (props.moduleId === 'BIO-016') return <ReplicationScene {...props} />;
  return props.variant === 'translation' ? <TranslationScene {...props} /> : <TranscriptionScene {...props} />;
}
