import { useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from '../types';
import { Arrow, Label as SharedLabel, PALETTE as P, Surface, Tube, visible, type Point } from '../shared';
import { enzymeBindingState, inhibitionState, lipidComponents, receptorSignalState } from './moleculeState';

/**
 * Original, editable teaching geometry for the Wave 2 AS molecular scenes.
 * Scientific contract: REVIEW_WAVE2_SCIENCE_SPEC.md + wave2/content.ts, 2026-10-17.
 * All coordinates are unitless schematic coordinates, NOT experimental molecular
 * structures. No downloaded meshes, textures, atomic coordinates or asset licences.
 * SceneProps is the sole state interface; no autonomous animation or local timeline.
 */
const choose = (props: SceneProps, id: string) => (event: ThreeEvent<MouseEvent>) => {
  event.stopPropagation(); props.onSelect(id);
};
const chosen = (props: SceneProps, id: string) => props.selected === id;
const clampStep = (props: SceneProps, max: number) => Math.max(0, Math.min(max, props.step));
const shows = (props: SceneProps, id: string, parents: string[] = []) => !props.hidden.includes(id) && !parents.some(parent => props.hidden.includes(parent)) && (!props.isolate || props.selected === id || parents.includes(props.selected));

/** Keep dependent labels off when their actual parent geometry was hidden. */
function Label({ id, position, props, offset }: { id: string; position: Point; props: SceneProps; offset?: [number, number] }) {
  const parents = props.moduleId === 'BIO-004' && ['glucose','bond','branch','hydrogen'].includes(id) ? ['chain', ...(props.variant === 'cellulose' && props.step >= 2 ? ['microfibril'] : [])]
    : props.moduleId === 'BIO-004' && id === 'chain' && props.variant === 'cellulose' && props.step >= 2 ? ['microfibril']
    : props.moduleId === 'BIO-005' && id === 'fatty-acids' ? ['tails']
    : props.moduleId === 'BIO-005' && id === 'phosphate' ? ['head']
    : props.moduleId === 'BIO-006' && props.step >= 3 && id !== 'subunits' ? ['subunits']
    : ['BIO-007','BIO-009'].includes(props.moduleId) && ['active-site','allosteric-site'].includes(id) ? ['enzyme'] : [];
  if (parents.some(parent => props.hidden.includes(parent))) return null;
  return <SharedLabel id={id} position={position} props={props} offset={offset} />;
}

function Caption({ props, position, children, color = P.cream }: { props: SceneProps; position: Point; children: React.ReactNode; color?: string }) {
  const compact = useThree(state => state.size.width < 660);
  if (!props.labels || props.isolate || compact) return null;
  return <Html center position={position} zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}><span style={{ display: 'block', whiteSpace: 'nowrap', color, background: '#14242cde', border: '1px solid #ffffff18', borderRadius: 5, padding: '5px 7px', font: '600 9px/1.5 Montserrat, sans-serif', letterSpacing: '.02em' }}>{children}</span></Html>;
}

function Bead({ position, color, radius = .1, scale, selected = false }: { position: Point; color: string; radius?: number; scale?: Point; selected?: boolean }) {
  return <mesh position={position} scale={scale}><sphereGeometry args={[radius, 16, 12]} /><Surface color={color} selected={selected} /></mesh>;
}

function Bond({ a, b, color = P.cream, radius = .035, selected = false }: { a: Point; b: Point; color?: string; radius?: number; selected?: boolean }) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
  return <mesh position={start.add(end).multiplyScalar(.5).toArray() as Point} quaternion={quaternion}><cylinderGeometry args={[radius, radius, delta.length(), 9]} /><Surface color={color} selected={selected} /></mesh>;
}

/** Dashes encode a non-covalent interaction; solid tubes encode covalent links. */
function DashedBond({ a, b, color = P.blue, radius = .018, selected = false }: { a: Point; b: Point; color?: string; radius?: number; selected?: boolean }) {
  const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), length = from.distanceTo(to);
  const count = Math.max(2, Math.ceil(length / .16));
  return <group>{Array.from({ length: count }, (_, i) => <Bond key={i} a={from.clone().lerp(to, i / count).toArray() as Point} b={from.clone().lerp(to, (i + .5) / count).toArray() as Point} color={color} radius={radius} selected={selected} />)}</group>;
}

function Diamond({ position, color, size = .14, selected = false }: { position: Point; color: string; size?: number; selected?: boolean }) {
  return <mesh position={position} rotation={[0, .2, Math.PI / 4]}><octahedronGeometry args={[size, 0]} /><Surface color={color} selected={selected} /></mesh>;
}

/** A rod surface with true rounded end caps and an optional anterior opening. */
function rodGeometry(radius: number, halfLength: number, opening: boolean) {
  const positions: number[] = [], indices: number[] = [], axial = 38, radial = 56;
  const angleStart = opening ? Math.PI / 3 : 0, angleRange = opening ? Math.PI * 4 / 3 : Math.PI * 2;
  for (let i = 0; i <= axial; i++) {
    const t = i / axial, x = -halfLength - radius + t * (2 * halfLength + 2 * radius);
    const capDistance = Math.max(0, Math.abs(x) - halfLength);
    const r = Math.sqrt(Math.max(.00001, radius * radius - capDistance * capDistance));
    for (let j = 0; j <= radial; j++) {
      const angle = angleStart + j / radial * angleRange;
      positions.push(x, Math.sin(angle) * r, Math.cos(angle) * r * .83);
      if (i < axial && j < radial) { const a = i * (radial + 1) + j, b = a + radial + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
    }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

function RodLayer({ props, id, radius, color, opacity }: { props: SceneProps; id: string; radius: number; color: string; opacity: number }) {
  const geometry = useMemo(() => rodGeometry(radius, 1.35, props.cutaway), [radius, props.cutaway]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (!visible(id, props)) return null;
  const edge = (angle: number): Point[] => Array.from({ length: 45 }, (_, i) => {
    const x = -1.35 - radius + i / 44 * (2.7 + radius * 2), d = Math.max(0, Math.abs(x) - 1.35), r = Math.sqrt(Math.max(.00001, radius * radius - d * d));
    return [x, Math.sin(angle) * r, Math.cos(angle) * r * .83];
  });
  return <group onClick={choose(props, id)}><mesh geometry={geometry}><Surface color={color} selected={chosen(props, id)} opacity={opacity} /></mesh>{props.cutaway && [Math.PI / 3, Math.PI * 5 / 3].map(angle => <Tube key={angle} points={edge(angle)} radius={.024} color={color} selected={chosen(props, id)} segments={52} />)}</group>;
}

function ProkaryoteScene(props: SceneProps) {
  const step = clampStep(props, 3), emphasis = step === 0 ? ['capsule', 'wall', 'membrane'] : step === 1 ? ['cytoplasm', 'ribosomes'] : step === 2 ? ['nucleoid', 'plasmid'] : ['flagellum'];
  const opacity = (id: string, base: number) => !props.cutaway ? Math.min(base, .15) : emphasis.includes(id) || chosen(props, id) ? base : base * .55;
  const dna: Point[] = Array.from({ length: 83 }, (_, i) => { const t = i / 82 * Math.PI * 2; return [Math.cos(t) * (1.18 + .13 * Math.sin(t * 7)), Math.sin(t) * (.35 + .11 * Math.cos(t * 5)), .12 + .17 * Math.sin(t * 4)]; });
  const ribosomes: Point[] = Array.from({ length: 25 }, (_, i) => { const x = -1.8 + (i % 8) * .48, y = (Math.floor(i / 8) - 1) * .48 + .08 * Math.sin(i * 2.3); return [x, y, -.08 + .2 * Math.sin(i * 1.8)]; });
  const flagellum: Point[] = [[2.14, -.18, -.12], [2.47, -.27, -.12], ...Array.from({ length: 42 }, (_, i): Point => { const t = i / 41; return [2.48 + t * .9, -.28 - t * 1.55, -.1 + Math.sin(t * Math.PI * 5) * .23]; })];
  return <group scale={.91} position={[-.18, .15, 0]} rotation={[.05, -.06, -.04]}>
    <RodLayer props={props} id="capsule" radius={1.04} color={P.rose} opacity={opacity('capsule', .22)} />
    <RodLayer props={props} id="wall" radius={.96} color={P.coral} opacity={opacity('wall', .5)} />
    <RodLayer props={props} id="membrane" radius={.86} color={P.teal} opacity={opacity('membrane', .5)} />
    <RodLayer props={props} id="cytoplasm" radius={.80} color={P.blue} opacity={opacity('cytoplasm', .11)} />
    {visible('nucleoid', props) && <group onClick={choose(props, 'nucleoid')}><Tube points={dna} radius={step === 2 ? .058 : .046} color={P.violet} selected={chosen(props, 'nucleoid')} segments={180} />{step === 2 && <Tube points={dna.map(([x, y, z]) => [x, y + .08, z - .035] as Point)} radius={.021} color={P.cream} opacity={.65} segments={180} />}</group>}
    {visible('plasmid', props) && <group position={[1.46, -.32, .23]} rotation={[.2, -.1, -.3]} onClick={choose(props, 'plasmid')}><mesh scale={[1.35, .85, 1]}><torusGeometry args={[.19, .035, 9, 36]} /><Surface color={P.rose} selected={chosen(props, 'plasmid')} /></mesh></group>}
    {visible('ribosomes', props) && <group onClick={choose(props, 'ribosomes')}>{ribosomes.map((p, i) => <group key={i} position={p} rotation={[.3, i * .3, i * .9]}><Bead position={[0, 0, 0]} radius={.085} scale={[1.2, .85, .9]} color={P.cream} selected={chosen(props, 'ribosomes')} /><Bead position={[.025, .07, .016]} radius={.063} scale={[1.2, .7, .9]} color={P.amber} selected={chosen(props, 'ribosomes')} /></group>)}</group>}
    {visible('flagellum', props) && <group onClick={choose(props, 'flagellum')}><Tube points={flagellum} radius={.042} color={P.teal} selected={chosen(props, 'flagellum')} segments={100} /><mesh position={[2.14, -.18, -.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.075, .075, .15, 12]} /><Surface color={P.teal} selected={chosen(props, 'flagellum')} /></mesh>{step === 3 && <Arrow from={[2.98, -.5, .27]} to={[3.35, -1.1, .27]} color={P.teal} />}</group>}
    <Label id="capsule" position={[-1.8, .91, -.1]} props={props} offset={[-15, -16]} />
    <Label id="wall" position={[-2.04, -.48, .15]} props={props} offset={[-8, 10]} />
    <Label id="membrane" position={[-.75, -.72, .29]} props={props} offset={[0, 17]} />
    <Label id="cytoplasm" position={[-1.5, .1, .31]} props={props} offset={[-35, 0]} />
    <Label id="ribosomes" position={[.05, .55, .38]} props={props} offset={[0, -16]} />
    <Label id="nucleoid" position={[-.12, -.02, .42]} props={props} offset={[0, 6]} />
    <Label id="plasmid" position={[1.48, -.31, .42]} props={props} offset={[17, 13]} />
    <Label id="flagellum" position={[3.13, -1.19, .05]} props={props} offset={[-5, 17]} />
    <Caption props={props} position={[0, -1.55, .1]}>{['Layered boundary · one illustrative bacterium', '70S ribosomes lie in the cytoplasm', 'Circular DNA · no membrane-bound nucleus', 'Flagellum shown · not present in every bacterium'][step]}</Caption>
  </group>;
}

const RING_RADIUS = .19;
function glucoseRingShape() {
  const shape = new THREE.Shape(), hole = new THREE.Path();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i / 6 * Math.PI * 2, x = Math.cos(a) * RING_RADIUS, y = Math.sin(a) * RING_RADIUS; if (!i) shape.moveTo(x, y); else shape.lineTo(x, y); }
  shape.closePath();
  for (let i = 5; i >= 0; i--) { const a = Math.PI / 6 + i / 6 * Math.PI * 2, x = Math.cos(a) * RING_RADIUS * .58, y = Math.sin(a) * RING_RADIUS * .58; if (i === 5) hole.moveTo(x, y); else hole.lineTo(x, y); }
  hole.closePath(); shape.holes.push(hole); return shape;
}

function GlucoseRing({ props, position, flipped = false, color = P.amber }: { props: SceneProps; position: Point; flipped?: boolean; color?: string }) {
  const shape = useMemo(glucoseRingShape, []);
  if (!shows(props, 'glucose', ['chain', ...(props.variant === 'cellulose' && props.step >= 2 ? ['microfibril'] : [])])) return null;
  return <group position={position} rotation={[.05, .12, flipped ? Math.PI : 0]} onClick={choose(props, 'glucose')}><mesh position={[0, 0, -.035]}><extrudeGeometry args={[shape, { depth: .07, bevelEnabled: true, bevelSize: .013, bevelThickness: .014, bevelSegments: 2, steps: 1 }]} /><Surface color={color} selected={chosen(props, 'glucose')} /></mesh><Bond a={[-.09, .165, 0]} b={[-.09, .29, .02]} color={P.cream} radius={.025} selected={chosen(props, 'glucose')} /><mesh position={[-.09, .29, .02]}><boxGeometry args={[.07, .055, .06]} /><Surface color={P.cream} selected={chosen(props, 'glucose')} /></mesh></group>;
}

function SugarChain({ props, points, beta = false, color = P.amber }: { props: SceneProps; points: Point[]; beta?: boolean; color?: string }) {
  return <group>{points.map((point, i) => <GlucoseRing key={`ring-${i}`} props={props} position={point} flipped={beta && i % 2 === 1} color={color} />)}{shows(props, 'bond', ['chain', ...(beta && props.step >= 2 ? ['microfibril'] : [])]) && <group onClick={choose(props, 'bond')}>{points.slice(1).map((point, i) => { const direction = point[0] > points[i][0] ? 1 : -1; return <Bond key={i} a={[points[i][0] + direction * .16, points[i][1], points[i][2]]} b={[point[0] - direction * .16, point[1], point[2]]} radius={.027} color={P.coral} selected={chosen(props, 'bond')} />; })}</group>}</group>;
}

/** Three glycerol positions; the phosphate head never becomes a third acyl tail. */
function FattyTail({ props, start, index, compact = false, scale = 1 }: { props: SceneProps; start: Point; index: number; compact?: boolean; scale?: number }) {
  if (!shows(props, 'fatty-acids', ['tails'])) return null;
  const points: Point[] = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11, kink = index === 1 && i > 5 ? (i - 5) * .045 : 0;
    return [start[0] + t * 2.46 * scale, start[1] + ((i % 2 ? .065 : -.065) + kink + (compact ? index * .075 * t : 0)) * scale, start[2] + Math.sin(i * .85 + index) * .045 * scale];
  });
  return <group onClick={choose(props, 'fatty-acids')}><Tube points={points} radius={.054 * scale} color={P.amber} selected={chosen(props, 'fatty-acids') || chosen(props, 'tails')} segments={44} />{points.filter((_, i) => i % 2 === 0).map((point, i) => <Bead key={i} position={point} radius={.061 * scale} color={P.amber} selected={chosen(props, 'fatty-acids') || chosen(props, 'tails')} />)}</group>;
}

function MiniBilayer({ props }: { props: SceneProps }) {
  const cols = 13, depth = props.cutaway ? 1 : 3;
  return <group position={[0, -1.54, -.08]}>{Array.from({ length: cols }, (_, i) => Array.from({ length: depth }, (_, j) => [-1, 1].map(side => {
    const x = (i - (cols - 1) / 2) * .36, z = (j - (depth - 1) / 2) * .3, y = side * .29;
    return <group key={`${i}-${j}-${side}`}>{shows(props, 'head', ['phosphate']) && <group onClick={choose(props, 'head')}><Bead position={[x, y, z]} radius={.095} color={P.teal} selected={chosen(props, 'head')} /></group>}{shows(props, 'fatty-acids', ['tails']) && [-1, 1].map(tail => <group key={tail} onClick={choose(props, 'tails')}><Bond a={[x + tail * .035, y - side * .07, z]} b={[x + tail * .046, side * .03, z + .035]} color={P.amber} radius={.021} selected={chosen(props, 'tails')} /></group>)}</group>;
  })))}</group>;
}

function LipidScene(props: SceneProps) {
  const { phosphateHead: phospholipid } = lipidComponents(props.variant), step = clampStep(props, 3), assembling = step === 0;
  const moleculeScale = step === 3 && phospholipid ? .72 : 1;
  const glycerolX = assembling ? -2.05 : -1.26, acylStart = assembling ? -.2 : -.53;
  const rows = phospholipid ? [0, -.7] : [.7, 0, -.7];
  return <group rotation={[.04, -.12, -.05]}>
    <group scale={moleculeScale} position={step === 3 && phospholipid ? [0, .58, .06] : [0, -.05, .06]}>
      {visible('glycerol', props) && <group onClick={choose(props, 'glycerol')}><Bond a={[glycerolX, -.7, 0]} b={[glycerolX, .7, 0]} color={P.violet} radius={.07} selected={chosen(props, 'glycerol')} />{[-.7, 0, .7].map((y, i) => <group key={i}><Bead position={[glycerolX, y, 0]} radius={.14} color={P.violet} selected={chosen(props, 'glycerol')} />{assembling && <Bond a={[glycerolX + .12, y, 0]} b={[glycerolX + .36, y, 0]} color={P.cream} radius={.033} />}</group>)}</group>}
      {rows.map((y, i) => <FattyTail key={i} props={props} start={[acylStart, y, 0]} index={i} compact={step === 3 && !phospholipid} />)}
      {step >= 1 && visible('ester', props) && <group onClick={choose(props, 'ester')}>{rows.map((y, i) => <group key={i}><Bond a={[glycerolX + .12, y, 0]} b={[acylStart, y, 0]} color={P.coral} radius={.052} selected={chosen(props, 'ester')} /><mesh position={[-.76, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.086, .027, 8, 18]} /><Surface color={P.coral} selected={chosen(props, 'ester')} /></mesh><Bond a={[-.59, y + .025, -.01]} b={[-.59, y + .2, -.01]} color={P.coral} radius={.024} selected={chosen(props, 'ester')} /></group>)}</group>}
      {phospholipid && <>
        {shows(props, 'phosphate', ['head']) && <group onClick={choose(props, 'phosphate')}><Bond a={[glycerolX, .84, 0]} b={[assembling ? -1.3 : -1.58, 1.18, 0]} color={P.rose} radius={.05} /><mesh position={[assembling ? -1.3 : -1.58, 1.18, 0]} rotation={[.2, .1, .2]}><tetrahedronGeometry args={[.18]} /><Surface color={P.rose} selected={chosen(props, 'phosphate') || chosen(props, 'head')} /></mesh></group>}
        {shows(props, 'head') && <group onClick={choose(props, 'head')}><Bond a={[assembling ? -1.3 : -1.58, 1.18, 0]} b={[assembling ? -.78 : -2.08, 1.4, .04]} color={P.teal} radius={.044} /><mesh position={[assembling ? -.78 : -2.08, 1.4, .04]} scale={[1.25, .8, .85]}><icosahedronGeometry args={[.23, 1]} /><Surface color={P.teal} selected={chosen(props, 'head')} /></mesh></group>}
      </>}
      {visible('tails', props) && <group onClick={choose(props, 'tails')}><Tube points={[[.05, -.95, -.13], [1.28, -1.02, -.13], [2.4, -.92, -.13]]} radius={.014} color={P.amber} selected={chosen(props, 'tails')} segments={16} /></group>}
      <Label id="glycerol" position={[glycerolX, -.05, .25]} props={props} offset={[-18, -3]} />
      <Label id="fatty-acids" position={[1.55, .03, .2]} props={props} offset={[10, -14]} />
      {step >= 1 && <Label id="ester" position={[-.75, -.67, .2]} props={props} offset={[0, 18]} />}
      {phospholipid && <><Label id="phosphate" position={[assembling ? -1.3 : -1.58, 1.18, .2]} props={props} offset={[32, -2]} /><Label id="head" position={[assembling ? -.78 : -2.08, 1.43, .2]} props={props} offset={[-18, -22]} /></>}
      <Label id="tails" position={[1.55, -.96, .1]} props={props} offset={[8, 20]} />
    </group>
    {step === 3 && phospholipid && <MiniBilayer props={props} />}
    <Caption props={props} position={[0, 2.1, .1]}>{phospholipid ? 'Glycerophospholipid · 2 fatty-acid tails · 2 acyl ester links' : 'Triglyceride · 3 fatty-acid tails · 3 ester links'}</Caption>
    <Caption props={props} position={[0, -2.08, .1]}>{step === 0 ? 'Separate components · schematic assembly' : step === 1 ? 'Solid connections highlight ester links' : step === 2 ? phospholipid ? 'Polar head + non-polar tails' : 'Glycerol joined to three fatty acids' : phospholipid ? 'Heads face water · tails face the bilayer core' : 'Compact non-polar molecule · energy storage'}</Caption>
  </group>;
}

function PrimaryProtein({ props }: { props: SceneProps }) {
  const points: Point[] = Array.from({ length: 14 }, (_, i) => [-2.93 + i * .45, Math.sin(i * .7) * .1, .05 * Math.cos(i)]);
  return <group>
    {shows(props, 'backbone') && <group onClick={choose(props, 'backbone')}><Tube points={points} radius={.039} color={P.teal} selected={chosen(props, 'backbone')} segments={65} /></group>}
    {shows(props, 'amino-acids') && <group onClick={choose(props, 'amino-acids')}>{points.map((point, i) => <Bead key={i} position={point} radius={.125} color={[P.coral, P.teal, P.amber, P.violet][i % 4]} selected={chosen(props, 'amino-acids')} />)}</group>}
    {shows(props, 'peptide') && <group onClick={choose(props, 'peptide')}>{points.slice(1).map((point, i) => <Bond key={i} a={[points[i][0] + .12, points[i][1], points[i][2]]} b={[point[0] - .12, point[1], point[2]]} color={P.cream} radius={.052} selected={chosen(props, 'peptide')} />)}</group>}
    {shows(props, 'r-groups') && <group onClick={choose(props, 'r-groups')}>{points.map(([x,y,z], i) => { const side = i % 2 ? -1 : 1; return <group key={i}><Bond a={[x, y, z]} b={[x, y + side * .38, z + .02]} color={P.rose} radius={.024} selected={chosen(props, 'r-groups')} /><Diamond position={[x, y + side * .43, z + .02]} size={.1} color={i % 3 ? P.rose : P.amber} selected={chosen(props, 'r-groups')} /></group>; })}</group>}
    <Label id="amino-acids" position={[-2.45, .04, .2]} props={props} offset={[-5, -24]} /><Label id="peptide" position={[-1.82, -.03, .2]} props={props} offset={[0, 24]} /><Label id="backbone" position={[1.8, -.13, .2]} props={props} offset={[0, 25]} /><Label id="r-groups" position={[1.12, .47, .2]} props={props} offset={[0, -15]} />
    <Caption props={props} position={[-2.96, -1.03, .1]}>N end</Caption><Caption props={props} position={[2.96, -1.03, .1]}>C end</Caption>
  </group>;
}

function secondaryPath() {
  const helix: Point[] = Array.from({ length: 75 }, (_, i) => { const t = i / 74; return [-1.65 + Math.cos(t * Math.PI * 8) * .4, -1.25 + t * 2.5, Math.sin(t * Math.PI * 8) * .4]; });
  const sheet: Point[] = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i <= 10; i++) { const t = row % 2 ? 1 - i / 10 : i / 10; sheet.push([.55 + row * .59, 1.18 - t * 2.36, (i % 2 ? -.11 : .11)]); }
  return { helix, sheet, points: [...helix, [-1.25, 1.58, .08] as Point, [-.1, 1.55, .1] as Point, ...sheet] };
}

function SecondaryProtein({ props }: { props: SceneProps }) {
  const { points, helix, sheet } = useMemo(secondaryPath, []);
  return <group>
    {shows(props, 'backbone') && <group onClick={choose(props, 'backbone')}><Tube points={points} radius={.07} color={P.teal} selected={chosen(props, 'backbone')} segments={220} /></group>}
    {shows(props, 'amino-acids') && <group onClick={choose(props, 'amino-acids')}>{points.filter((_, i) => i % 6 === 0).map((point, i) => <Bead key={i} position={point} radius={.082} color={i % 2 ? P.teal : P.coral} selected={chosen(props, 'amino-acids')} />)}</group>}
    {shows(props, 'peptide') && <group onClick={choose(props, 'peptide')}>{points.filter((_, i) => i % 9 === 0).map((point, i) => <Bead key={i} position={point} radius={.073} color={P.cream} selected={chosen(props, 'peptide')} />)}</group>}
    {shows(props, 'hydrogen') && <group onClick={choose(props, 'hydrogen')}>{[8, 17, 26, 35, 44, 53].map(i => <DashedBond key={i} a={helix[i]} b={helix[i + 18]} color={P.blue} selected={chosen(props, 'hydrogen')} />)}{[0,1].flatMap(row => [2, 5, 8].map(i => <DashedBond key={`${row}-${i}`} a={sheet[row * 11 + i]} b={sheet[(row + 1) * 11 + 10 - i]} color={P.blue} selected={chosen(props, 'hydrogen')} />))}</group>}
    <Label id="backbone" position={[-1.75, 1.1, .35]} props={props} offset={[-20, -18]} /><Label id="hydrogen" position={[1.15, .35, .35]} props={props} offset={[10, -5]} /><Label id="amino-acids" position={[-2.03, -.75, .4]} props={props} offset={[-10, 18]} /><Label id="peptide" position={[-.6, 1.55, .2]} props={props} offset={[0, -15]} />
    <Caption props={props} position={[-1.6, -1.68, .2]}>α helix</Caption><Caption props={props} position={[1.22, -1.68, .2]}>β pleated sheet</Caption>
  </group>;
}

function foldedPoints(): Point[] {
  return Array.from({ length: 139 }, (_, i) => {
    const t = i / 138 * Math.PI * 1.88;
    return [(1.18 + .26 * Math.sin(t * 3)) * Math.cos(t) + .16 * Math.sin(t * 11), .87 * Math.sin(t) + .21 * Math.sin(t * 7), .42 * Math.sin(t * 3) + .2 * Math.cos(t * 8)];
  });
}

function FoldedProtein({ props, position = [0,0,0], scale = 1, color = P.teal, subunit = false, spread = false }: { props: SceneProps; position?: Point; scale?: number; color?: string; subunit?: boolean; spread?: boolean }) {
  const points = useMemo(foldedPoints, []), parents = subunit ? ['subunits'] : [];
  return <group position={position} scale={scale} rotation={spread ? [.13, -.16, .1] : [0, 0, 0]}>
    {shows(props, 'backbone', parents) && <group onClick={choose(props, subunit ? 'subunits' : 'backbone')}><Tube points={points} radius={.075} color={color} selected={chosen(props, 'backbone') || subunit && chosen(props, 'subunits')} segments={250} /></group>}
    {shows(props, 'amino-acids', parents) && <group onClick={choose(props, 'amino-acids')}>{points.filter((_, i) => i % 9 === 0).map((point, i) => <Bead key={i} position={point} radius={.091} color={i % 3 ? color : P.coral} selected={chosen(props, 'amino-acids')} />)}</group>}
    {shows(props, 'peptide', parents) && <group onClick={choose(props, 'peptide')}>{[9, 26, 49, 80, 109, 127].map(i => <Bond key={i} a={points[i]} b={points[i+1]} radius={.081} color={P.cream} selected={chosen(props, 'peptide')} />)}</group>}
    {shows(props, 'r-groups', parents) && <group onClick={choose(props, 'r-groups')}>{[12, 32, 57, 75, 98, 119].map((i, j) => { const p = points[i], target: Point = [p[0] * .48, p[1] * .48, p[2] * .45 + .1]; return <group key={i}><Bond a={p} b={target} color={P.violet} radius={.028} selected={chosen(props, 'r-groups')} /><Diamond position={target} color={j % 2 ? P.amber : P.violet} size={.135} selected={chosen(props, 'r-groups')} /></group>; })}<DashedBond a={[-.37,.12,.2]} b={[.25,.22,.16]} color={P.violet} selected={chosen(props,'r-groups')} /><DashedBond a={[.32,-.17,.16]} b={[-.2,-.31,.24]} color={P.violet} selected={chosen(props,'r-groups')} /></group>}
    {shows(props, 'hydrogen', parents) && <group onClick={choose(props, 'hydrogen')}>{[[18, 59], [69, 116], [36, 124]].map(([a,b]) => <DashedBond key={a} a={points[a]} b={points[b]} color={P.blue} selected={chosen(props, 'hydrogen')} />)}</group>}
    {shows(props, 'disulfide', parents) && <group onClick={choose(props, 'disulfide')}><Bond a={points[9]} b={[.56, .34, .52]} color={P.amber} radius={.039} selected={chosen(props, 'disulfide')} /><Bond a={[.56, .34, .52]} b={points[53]} color={P.amber} radius={.039} selected={chosen(props, 'disulfide')} /><Bead position={[.56, .34, .52]} radius={.075} color={P.amber} selected={chosen(props, 'disulfide')} /></group>}
  </group>;
}

function ProteinScene(props: SceneProps) {
  const step = clampStep(props, 4), multi = step >= 3;
  return <group>
    {step === 0 ? <PrimaryProtein props={props} /> : step === 1 ? <SecondaryProtein props={props} /> : multi ? <>
      <FoldedProtein props={props} position={[-1.08, .1, 0]} scale={.91} color={P.teal} subunit spread={step === 4} />
      <FoldedProtein props={props} position={[1.08, -.1, -.05]} scale={.91} color={P.violet} subunit spread={step === 4} />
      {shows(props, 'hydrogen', ['subunits']) && <group onClick={choose(props, 'hydrogen')}><DashedBond a={[-.2, .52, .2]} b={[.25, .22, .25]} color={P.blue} /><DashedBond a={[-.2, -.48, .15]} b={[.27, -.4, .17]} color={P.rose} /></group>}
      <Label id="subunits" position={[0, 1.22, .45]} props={props} offset={[0, -16]} /><Label id="backbone" position={[-2.05, -.63, .3]} props={props} offset={[-10, 17]} /><Label id="r-groups" position={[1.12, .08, .6]} props={props} offset={[10, -3]} /><Label id="hydrogen" position={[0, -.56, .3]} props={props} offset={[0, 17]} /><Label id="disulfide" position={[-.55, .36, .55]} props={props} offset={[-12, -22]} />
      <Caption props={props} position={[-1.6, -1.65, .1]}>Chain 1</Caption><Caption props={props} position={[1.6, -1.65, .1]}>Chain 2</Caption>
    </> : <><FoldedProtein props={props} scale={1.32} /><Label id="backbone" position={[-1.6, .4, .4]} props={props} offset={[-15, -20]} /><Label id="r-groups" position={[-.14, -.03, .65]} props={props} offset={[-25, 8]} /><Label id="hydrogen" position={[.65, -.73, .4]} props={props} offset={[25, 5]} /><Label id="disulfide" position={[.74, .45, .7]} props={props} offset={[15, -15]} /><Label id="amino-acids" position={[-1.1, -1.18, .2]} props={props} offset={[-20, 8]} /><Label id="peptide" position={[1.62, -.18, .4]} props={props} offset={[8, 7]} /></>}
    <Caption props={props} position={[0, 2.08, .1]}>{['Primary · one amino-acid sequence', 'Secondary · local backbone folding in one chain', 'Tertiary · the overall fold of ONE chain', 'Quaternary · TWO folded polypeptide chains', 'Structure–function · a specific three-dimensional arrangement'][step]}</Caption>
    {step >= 2 && <Caption props={props} position={[0, -2.08, .1]}>Solid: covalent · dashed: non-covalent interactions · generic protein</Caption>}
  </group>;
}

function BranchingSugar({ props, y, frequent = false, count }: { props: SceneProps; y: number; frequent?: boolean; count: number }) {
  const points: Point[] = Array.from({ length: count }, (_, i) => [-2.67 + i * .53, y + Math.sin(i * .8) * .07, Math.sin(i * .65) * .11]);
  const sites = frequent ? [1, 3, 5, 7, 9] : [3, 7];
  return <group><SugarChain props={props} points={points} color={frequent ? P.coral : P.amber} />{props.step >= 2 && sites.filter(i => i < count).map((index, j) => {
    const origin = points[index], side = frequent && j % 2 ? -1 : 1, direction = index >= 7 ? -1 : 1, branch: Point[] = [0, 1, 2].map((_, i) => [origin[0] + direction * (.16 + i * .49), origin[1] + side * (.55 + i * .18), origin[2] - .1 - .08 * i]);
    return <group key={index}><SugarChain props={props} points={branch} color={frequent ? P.rose : P.cream} />{shows(props,'branch',['chain']) && <group onClick={choose(props, 'branch')}><Bond a={[origin[0] - .09, origin[1] + side * .22, origin[2]]} b={[branch[0][0] - .09, branch[0][1] - side * .19, branch[0][2]]} radius={.042} color={P.rose} selected={chosen(props, 'branch')} /><Diamond position={[origin[0] -.08, origin[1] + side * .23, origin[2] + .02]} size={.075} color={P.rose} selected={chosen(props, 'branch')} /></group>}</group>;
  })}{visible('chain', props) && <group onClick={choose(props, 'chain')}><Tube points={points.map(([x, yy, z]) => [x, yy - .24, z - .1] as Point)} radius={.014} color={frequent ? P.coral : P.amber} opacity={.6} segments={32} /></group>}</group>;
}

function PolysaccharideScene(props: SceneProps) {
  const kind = props.variant === 'cellulose' ? 'cellulose' : props.variant === 'glycogen' ? 'glycogen' : 'starch', step = clampStep(props, 3);
  const count = step === 0 ? 3 : step === 1 ? 7 : 11;
  const amylose: Point[] = Array.from({ length: count }, (_, i) => [-2.65 + i * .53, .9 + Math.sin(i * .95) * .33, Math.cos(i * .95) * .38]);
  const rows = step < 2 ? 1 : step === 2 ? 3 : 5;
  return <group rotation={[.06, -.08, 0]}>
    {kind === 'starch' ? <><SugarChain props={props} points={amylose} /><BranchingSugar props={props} y={-.95} count={count} />{visible('chain', props) && <group onClick={choose(props, 'chain')}><Tube points={amylose.map(([x,y,z]) => [x,y,z-.16] as Point)} radius={.019} color={P.amber} opacity={.55} segments={70} /></group>}<Caption props={props} position={[-2.2, 1.7, .25]}>Amylose · unbranched coil</Caption><Caption props={props} position={[-1.9, -1.75, .2]}>Amylopectin · branched</Caption></> : kind === 'glycogen' ? <><BranchingSugar props={props} y={-.05} frequent count={count} /><Caption props={props} position={[0, -1.65, .1]}>Glycogen · more frequent α 1→6 branches</Caption></> : <>
      {Array.from({ length: rows }, (_, row) => { const y = (row - (rows - 1) / 2) * .66, z = row % 2 ? -.2 : .08; return <SugarChain key={row} props={props} beta color={P.teal} points={Array.from({ length: count }, (_, i): Point => [-2.65 + i * .53, y, z])} />; })}
      {step >= 2 && shows(props,'hydrogen',['chain','microfibril']) && <group onClick={choose(props, 'hydrogen')}>{Array.from({ length: rows - 1 }, (_, row) => Array.from({ length: Math.min(count, 10) }, (_, i) => <DashedBond key={`${row}-${i}`} a={[-2.65 + i * .53, (row - (rows - 1) / 2) * .66 + .21, row % 2 ? -.2 : .08]} b={[-2.65 + i * .53, (row + 1 - (rows - 1) / 2) * .66 - .19, row % 2 ? .08 : -.2]} color={P.violet} selected={chosen(props, 'hydrogen')} />))}</group>}
      {shows(props,'chain',step>=2?['microfibril']:[]) && <group onClick={choose(props, 'chain')}><Bond a={[-2.65, -.25, -.3]} b={[-2.65+(count-1)*.53, -.25, -.3]} color={P.teal} radius={.013} selected={chosen(props, 'chain')} /></group>}
      {step === 3 && visible('microfibril', props) && <group onClick={choose(props, 'microfibril')}>{[-1, 1].map(side => <Tube key={side} points={[[side * 2.94, -1.55, .01], [side * 3.05, -1.55, .01], [side * 3.05, 1.55, .01], [side * 2.94, 1.55, .01]]} radius={.036} color={P.cream} selected={chosen(props, 'microfibril')} segments={6} />)}</group>}
      <Caption props={props} position={[0, -1.9, .15]}>{step < 2 ? 'β 1→4 · alternate rings rotated 180°' : 'Parallel unbranched chains · interchain hydrogen bonds'}</Caption>
    </>}
    <Label id="glucose" position={kind === 'starch' ? [-2.65, 1.03, .5] : [-2.65, .1, .35]} props={props} offset={[-10, -20]} />
    {step > 0 && <Label id="bond" position={kind === 'starch' ? [-1.84, .98, .3] : [-1.84, .02, .34]} props={props} offset={[0, -3]} />}
    {step >= 2 && kind !== 'cellulose' && <Label id="branch" position={kind === 'starch' ? [-1, -.51, .3] : [-1.95, .43, .25]} props={props} offset={[0, -12]} />}
    {step >= 1 && <Label id="chain" position={kind === 'starch' ? [Math.min(2.2,-2.65+(count-1)*.53), 1, .35] : [Math.min(2.1,-2.65+(count-1)*.53), -.24, .15]} props={props} offset={[0, 16]} />}
    {step >= 2 && kind === 'cellulose' && <Label id="hydrogen" position={[.28, .35, .3]} props={props} offset={[0, -8]} />}
    {step === 3 && kind === 'cellulose' && <Label id="microfibril" position={[3.04, .8, .15]} props={props} offset={[-15, -8]} />}
    <Caption props={props} position={[0, 2.05, .1]}>{kind === 'cellulose' ? 'Cellulose · β-glucose' : kind === 'glycogen' ? 'Glycogen · α-glucose' : 'Starch · α-glucose · two components'}</Caption>
  </group>;
}

function enzymeShape(opening: number, inactive: boolean) {
  const shape = new THREE.Shape(), w = opening;
  shape.moveTo(-1.79, -.57);
  shape.bezierCurveTo(-1.87, -1.12, -1.17, -1.29, -.52, -1.12);
  shape.bezierCurveTo(.05, -1.33, 1.07, -1.26, 1.6, -.88);
  shape.bezierCurveTo(2.03, -.55, 1.87, .22, 1.52, .57);
  shape.bezierCurveTo(1.31, .86, 1.1, 1.17, .78, 1.14);
  shape.bezierCurveTo(w + .12, 1.19, w - .01, .94, w, .74);
  shape.lineTo(w, inactive ? .54 : .48);
  shape.lineTo(inactive ? .1 : .3, inactive ? .42 : .23);
  shape.lineTo(-.3, inactive ? .42 : .23);
  shape.lineTo(-w, .48); shape.lineTo(-w, .74);
  shape.bezierCurveTo(-w - .01, .95, -w - .07, 1.15, -.87, 1.16);
  shape.bezierCurveTo(-1.47, 1.14, -1.9, .47, -1.79, -.57);
  shape.closePath(); return shape;
}

function EnzymeBody({ props, opening = .53, inactive = false, position = [0,-.57,0], scale = 1 }: { props: SceneProps; opening?: number; inactive?: boolean; position?: Point; scale?: number }) {
  const shape = useMemo(() => enzymeShape(opening, inactive), [opening, inactive]);
  const cleft: Point[] = [[-opening, .84, .51], [-opening, .48, .51], [-.3, inactive ? .42 : .23, .51], [inactive ? .1 : .3, inactive ? .42 : .23, .51], [opening, inactive ? .54 : .48, .51], [opening, .84, .51]];
  return <group position={position} scale={scale}>
    {visible('enzyme', props) && <group onClick={choose(props, 'enzyme')}><mesh position={[0,0,-.28]}><extrudeGeometry args={[shape, { depth: .65, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .15, bevelThickness: .16, curveSegments: 24 }]} /><Surface color={P.teal} selected={chosen(props, 'enzyme')} /></mesh>{[-1,1].map(side => <Tube key={side} points={[[side * 1.2,-.85,.49], [side * 1.42,-.4,.55], [side * 1.25,.07,.57], [side * .98,.41,.55]]} radius={.022} color={P.cream} opacity={.3} segments={24} />)}</group>}
    {shows(props, 'active-site', ['enzyme']) && <group onClick={choose(props, 'active-site')}><Tube points={cleft} radius={.052} color={inactive ? P.rose : P.violet} selected={chosen(props, 'active-site')} segments={36} />{[-1,1].map(side => <Bead key={side} position={[side * .37, inactive ? .47 : .35, .53]} radius={.065} color={P.coral} selected={chosen(props, 'active-site')} />)}</group>}
  </group>;
}

function productShape(side: -1 | 1) {
  const shape = new THREE.Shape();
  const points = side === -1 ? [[-.48,.22],[-.075,.22],[-.075,-.2],[-.3,-.2],[-.48,-.015]] : [[.075,.22],[.48,.22],[.48,-.015],[.3,-.2],[.075,-.2]];
  points.forEach(([x,y], i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath(); return shape;
}

function ProductPiece({ side, color, selected = false }: { side: -1 | 1; color: string; selected?: boolean }) {
  const shape = useMemo(() => productShape(side), [side]);
  return <mesh position={[0,0,-.12]}><extrudeGeometry args={[shape, { depth: .29, bevelEnabled: true, bevelSize: .044, bevelThickness: .045, bevelSegments: 3, steps: 1 }]} /><Surface color={color} selected={selected} /></mesh>;
}

/** One connected two-part substrate becomes exactly two separate product meshes. */
function Substrate({ props, position, scale = 1 }: { props: SceneProps; position: Point; scale?: number }) {
  if (!visible('substrate', props)) return null;
  return <group position={position} scale={scale} onClick={choose(props, 'substrate')}><ProductPiece side={-1} color={P.amber} selected={chosen(props,'substrate')} /><ProductPiece side={1} color={P.coral} selected={chosen(props,'substrate')} /><Bond a={[-.11,0,.02]} b={[.11,0,.02]} color={P.cream} radius={.064} selected={chosen(props,'substrate')} /></group>;
}

function Products({ props, left, right, scale = 1 }: { props: SceneProps; left: Point; right: Point; scale?: number }) {
  if (!visible('products', props)) return null;
  return <group onClick={choose(props, 'products')}><group position={left} scale={scale}><ProductPiece side={-1} color={P.amber} selected={chosen(props, 'products')} /></group><group position={right} scale={scale}><ProductPiece side={1} color={P.coral} selected={chosen(props, 'products')} /></group></group>;
}

function EnzymeBindingScene(props: SceneProps) {
  const state = enzymeBindingState(props.step, props.variant), { phase: step, induced, opening } = state;
  const substratePosition: Point = step === 0 ? [.32,1.41,.4] : step === 1 ? [.1,.79,.4] : [0,-.08,.4];
  const left: Point = step === 4 ? [-1.05,1.08,.4] : [-.08,-.08,.4], right: Point = step === 4 ? [1.05,1.08,.4] : [.08,-.08,.4];
  return <group>
    <EnzymeBody props={props} opening={opening} />
    {state.substrateCount ? <Substrate props={props} position={substratePosition} /> : <Products props={props} left={left} right={right} />}
    {step === 1 && visible('substrate', props) && <Arrow from={[.98,1.26,.2]} to={[.98,.3,.2]} color={P.amber} />}
    {step === 2 && induced && visible('active-site', props) && <><Arrow from={[-.94,.39,.6]} to={[-.62,.24,.6]} color={P.coral} /><Arrow from={[.94,.39,.6]} to={[.62,.24,.6]} color={P.coral} /></>}
    {step === 4 && visible('products', props) && <><Arrow from={[-.54,.61,.25]} to={[-1.05,1.04,.25]} color={P.amber} /><Arrow from={[.54,.61,.25]} to={[1.05,1.04,.25]} color={P.coral} /></>}
    <Label id="enzyme" position={[-1.39,-1.17,.52]} props={props} offset={[-8, 15]} />
    <Label id="active-site" position={[-.6,.04,.59]} props={props} offset={[-38,-5]} />
    {step < 3 ? <Label id="substrate" position={[substratePosition[0], substratePosition[1] + .29, .53]} props={props} offset={[8,-13]} /> : <Label id="products" position={step === 4 ? [1.4,1.1,.5] : [.25,.11,.53]} props={props} offset={[25,-15]} />}
    <Caption props={props} position={[0,2.06,.1]}>{induced ? 'Induced fit · binding changes enzyme conformation' : 'Lock and key · historical rigid-pocket simplification'}</Caption>
    <Caption props={props} position={[0,-2.1,.1]}>{['E + S · enzyme and one connected substrate', 'Recognition · a complementary binding opportunity', 'ES · substrate bound in the active site', 'Hydrolysis · one substrate becomes TWO products', 'E + P + Q · products released; enzyme reusable'][step]}</Caption>
  </group>;
}

function Inhibitor({ props, position, competitive }: { props: SceneProps; position: Point; competitive: boolean }) {
  if (!visible('inhibitor', props)) return null;
  return <group position={position} onClick={choose(props,'inhibitor')}>{competitive ? <><mesh rotation={[0,0,Math.PI / 2]}><cylinderGeometry args={[.27,.27,.31,3]} /><Surface color={P.coral} selected={chosen(props,'inhibitor')} /></mesh><Bond a={[-.3,-.09,.02]} b={[.3,-.09,.02]} color={P.coral} radius={.075} selected={chosen(props,'inhibitor')} /></> : <><mesh rotation={[.2,.25,.2]}><dodecahedronGeometry args={[.25,0]} /><Surface color={P.coral} selected={chosen(props,'inhibitor')} /></mesh><Bead position={[.2,0,0]} color={P.rose} radius={.09} selected={chosen(props,'inhibitor')} /></>}</group>;
}

function InhibitionScene(props: SceneProps) {
  const state = inhibitionState(props.step, props.variant), { phase: step, noncompetitive, high, inhibitorBound: bound, substrateWinsOpportunity: succeeds } = state;
  const competitive = !noncompetitive;
  const inhibitor: Point = step === 0 ? [2.35,.44,.35] : bound ? noncompetitive ? [1.69,-.91,.43] : [0,-.055,.43] : [2.25,.37,.4];
  const pool: Point[] = high ? [[-2.6,1.15,.1],[-1.6,1.45,-.1],[-.55,1.5,0],[.55,1.5,-.1],[1.65,1.43,.05],[2.65,1.14,-.05]] : [[-1.72,1.3,.05],[1.63,1.33,.05]];
  return <group>
    <EnzymeBody props={props} inactive={state.boundEnzymeInactive} opening={state.boundEnzymeInactive ? .65 : .53} />
    {shows(props,'allosteric-site',['enzyme']) && <group onClick={choose(props,'allosteric-site')}><Tube points={[[1.54,-.64,.48],[1.72,-.72,.51],[1.86,-.91,.5],[1.69,-1.1,.5],[1.52,-1.06,.5]]} color={P.rose} radius={.04} selected={chosen(props,'allosteric-site')} segments={26} /></group>}
    <Inhibitor props={props} position={inhibitor} competitive={competitive} />
    {pool.slice(1).map((position,i) => <Substrate key={i} props={props} position={position} scale={.46} />)}
    {state.productCount ? <Products props={props} left={[-1.22,.78,.4]} right={[1.0,.77,.4]} /> : <Substrate props={props} position={step >= 2 && (succeeds || noncompetitive) ? [0,noncompetitive?.11:-.08,.4] : pool[0]} scale={step >= 2 && (succeeds || noncompetitive) ? 1 : .46} />}
    {step === 2 && succeeds && visible('substrate',props) && <Arrow from={[.89,.64,.35]} to={[.7,.05,.35]} color={P.amber} />}
    {step === 3 && succeeds && visible('products',props) && <><Arrow from={[-.53,.29,.3]} to={[-1.05,.75,.3]} color={P.amber} /><Arrow from={[.53,.29,.3]} to={[1.05,.75,.3]} color={P.coral} /></>}
    {step >= 2 && noncompetitive && visible('active-site',props) && <group position={[.06,-.55,.58]} rotation={[0,0,Math.PI / 4]}><mesh><boxGeometry args={[.27,.035,.025]} /><Surface color={P.rose} /></mesh><mesh rotation={[0,0,Math.PI / 2]}><boxGeometry args={[.27,.035,.025]} /><Surface color={P.rose} /></mesh></group>}
    <Label id="enzyme" position={[-1.35,-1.25,.52]} props={props} offset={[-13,13]} /><Label id="active-site" position={[-.57,.03,.59]} props={props} offset={[-34,0]} /><Label id="allosteric-site" position={[1.78,-1.07,.56]} props={props} offset={[25,17]} /><Label id="inhibitor" position={[inhibitor[0],inhibitor[1]+.22,.59]} props={props} offset={[22,-14]} />
    <Label id="substrate" position={pool[pool.length - 1]} props={props} offset={[0,-24]} />
    {step === 3 && succeeds && <Label id="products" position={[-1.5,.8,.52]} props={props} offset={[-12,16]} />}
    <Caption props={props} position={[0,2.1,.1]}>{noncompetitive ? 'Non-competitive · separate allosteric binding site' : 'Competitive · inhibitor competes for the active site'}</Caption>
    <Caption props={props} position={[0,-2.02,.1]}>{step === 0 ? `${high ? 'Higher' : 'Lower'} substrate · same enzyme, inhibitor and time window` : step === 1 ? competitive ? 'Active site occupied by the illustrated inhibitor' : 'Inhibitor binds away from the active site' : noncompetitive ? 'Illustrated bound enzyme inactive · population capacity reduced' : succeeds ? 'Higher substrate wins one binding opportunity · inhibitor remains' : 'Illustrated inhibitor occupies the active site'}</Caption>
  </group>;
}

function SignalMembrane({ props }: { props: SceneProps }) {
  if (!visible('membrane', props)) return null;
  const depth = props.cutaway ? 2 : 5;
  return <group onClick={choose(props,'membrane')}>{Array.from({ length: 19 }, (_, i) => Array.from({ length: depth }, (_, j) => {
    const x = (i - 9) * .335, z = (j - (depth - 1) / 2) * .29;
    if (Math.abs(x) < .5 && Math.abs(z) < .48) return null;
    return [-1,1].map(side => <group key={`${i}-${j}-${side}`}><Bead position={[x,side*.28,z]} color={P.coral} radius={.11} selected={chosen(props,'membrane')} />{[-1,1].map(tail => <Bond key={tail} a={[x+tail*.038,side*.2,z]} b={[x+tail*.047,side*.018,z+.025]} color={P.rose} radius={.023} selected={chosen(props,'membrane')} />)}</group>);
  }))}</group>;
}

function SignalReceptor({ props, bound }: { props: SceneProps; bound: boolean }) {
  if (!visible('receptor',props)) return null;
  const separation = bound ? .32 : .43;
  const helix: Point[] = Array.from({ length: 52 }, (_, i) => { const t = i / 51; return [Math.cos(t*Math.PI*8)*.12,-.45+t*.99,Math.sin(t*Math.PI*8)*.12+.05]; });
  return <group onClick={choose(props,'receptor')}>
    <Tube points={helix} radius={.09} color={P.violet} selected={chosen(props,'receptor')} segments={110} />
    {[-1,1].map(side => <group key={side}><Tube points={[[0,.4,.05],[side*.21,.62,.06],[side*separation,.9,.09],[side*.3,1.16,.09]]} radius={.12} color={P.violet} selected={chosen(props,'receptor')} segments={40} /><mesh position={[side*separation,.9,.06]} rotation={[0,side*.18,side*.25]} scale={[.19,.38,.23]}><capsuleGeometry args={[1,.5,5,16]} /><Surface color={P.violet} selected={chosen(props,'receptor')} /></mesh></group>)}
    <Tube points={[[0,-.44,.05],[bound?.14:0,-.7,.08],[bound?.28:.12,-.86,.14]]} radius={.085} color={bound?P.amber:P.violet} selected={chosen(props,'receptor')} segments={22} />
    <Bond a={[-separation,1.04,.24]} b={[-.13,.78,.24]} color={P.cream} radius={.032} selected={chosen(props,'receptor')} /><Bond a={[separation,1.04,.24]} b={[.13,.78,.24]} color={P.cream} radius={.032} selected={chosen(props,'receptor')} />
  </group>;
}

function ReceptorScene(props: SceneProps) {
  const { phase: step, ligandBound: bound, relayActive: active } = receptorSignalState(props.step);
  const ligand: Point = step === 0 ? [-1.8,1.63,.15] : step === 3 ? [1.85,1.6,.15] : [0,1.08,.22];
  const relay: Point[] = [[.28,-.85,.2],[.75,-1.1,.22],[1.26,-1.4,.23]];
  return <group>
    <SignalMembrane props={props} /><SignalReceptor props={props} bound={bound} />
    {visible('ligand',props) && <group position={ligand} onClick={choose(props,'ligand')}><mesh rotation={[0,.12,Math.PI / 2]}><cylinderGeometry args={[.23,.23,.3,3]} /><Surface color={P.amber} selected={chosen(props,'ligand')} /></mesh><Bead position={[0,.16,.03]} color={P.cream} radius={.075} selected={chosen(props,'ligand')} /></group>}
    {visible('relay',props) && <group onClick={choose(props,'relay')}>{relay.map((position,i) => <group key={i}><Diamond position={position} size={active?.14:.105} color={active?P.amber:P.blue} selected={chosen(props,'relay')} />{i<relay.length-1 && <DashedBond a={position} b={relay[i+1]} color={active?P.amber:P.blue} selected={chosen(props,'relay')} />}</group>)}{active&&<Arrow from={[1.25,-1.4,.23]} to={[1.77,-1.64,.23]} color={P.amber} />}</group>}
    {visible('response',props) && <group position={[2.12,-1.7,.12]} onClick={choose(props,'response')}><mesh><torusGeometry args={[.29,.046,10,32]} /><Surface color={active?P.amber:P.blue} selected={chosen(props,'response')} opacity={step===3?.65:1} /></mesh>{Array.from({length:active?6:step===3?2:0},(_,i)=>{const a=i/6*Math.PI*2;return <Bond key={i} a={[Math.cos(a)*.12,Math.sin(a)*.12,.04]} b={[Math.cos(a)*.23,Math.sin(a)*.23,.04]} color={active?P.amber:P.blue} radius={.025} selected={chosen(props,'response')}/>;})}</group>}
    {step===0&&visible('ligand',props)&&<Arrow from={[-1.21,1.6,.2]} to={[-.55,1.25,.2]} color={P.amber}/>}
    {step===3&&visible('ligand',props)&&<Arrow from={[.65,1.29,.2]} to={[1.34,1.55,.2]} color={P.amber}/>}
    <Label id="membrane" position={[-2.2,.28,.35]} props={props} offset={[-8,-18]}/><Label id="receptor" position={[-.37,.63,.35]} props={props} offset={[-37,-3]}/><Label id="ligand" position={[ligand[0],ligand[1]+.2,.35]} props={props} offset={[12,-12]}/><Label id="relay" position={[.75,-1.08,.35]} props={props} offset={[-15,18]}/><Label id="response" position={[2.16,-1.69,.3]} props={props} offset={[0,24]}/>
    <Caption props={props} position={[1.6,.75,-.2]}>EXTRACELLULAR</Caption><Caption props={props} position={[-2,-.84,-.1]}>CYTOPLASM</Caption>
    <Caption props={props} position={[0,2.1,.1]}>Ligand stays outside · receptor spans the membrane</Caption>
    <Caption props={props} position={[0,-2.22,.1]}>{['A specific extracellular signal approaches', 'Recognition · ligand binds the receptor', 'Transduction · abstract intracellular relay and response', 'Signal removed · relay switches off; response subsides'][step]}</Caption>
  </group>;
}

export default function MoleculeScenes(props: SceneProps) {
  switch (props.moduleId) {
    case 'BIO-002': return <ProkaryoteScene {...props} />;
    case 'BIO-004': return <PolysaccharideScene {...props} />;
    case 'BIO-005': return <LipidScene {...props} />;
    case 'BIO-006': return <ProteinScene {...props} />;
    // BIO-008 is the induced-fit concept represented by the BIO-007 preset.
    case 'BIO-007': return <EnzymeBindingScene {...props} />;
    case 'BIO-009': return <InhibitionScene {...props} />;
    case 'BIO-012': return <ReceptorScene {...props} />;
    default: return null;
  }
}
