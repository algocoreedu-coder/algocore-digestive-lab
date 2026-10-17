import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Arrow, Label, PALETTE as C, Surface, Tube, visible, type Point } from '../shared';
import type { SceneProps } from '../types';
import { alleleState, calvinState, lacState, lightOutputs } from './modelState';

// Original editable schematic geometry. Coordinates are arbitrary scene units,
// not experimental anatomy, molecular coordinates or quantitative trajectories.
// The approved Wave 2 teacher contract owns biological states and invariants.
function useGeometry(factory: () => THREE.BufferGeometry, deps: unknown[]) {
  const geometry = useMemo(factory, deps);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}
function Pick({ id, props, children }: { id: string; props: SceneProps; children: ReactNode }) {
  if (!visible(id, props)) return null;
  return <group onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); props.onSelect(id); }}>{children}</group>;
}
function Bead({ position, color, radius = .085, scale = [1, 1, 1], selected = false, opacity = 1 }: { position: Point; color: string; radius?: number; scale?: Point; selected?: boolean; opacity?: number }) {
  return <mesh position={position} scale={scale}><sphereGeometry args={[radius, 20, 14]} /><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
function Box({ position, scale, color, selected = false, opacity = 1 }: { position: Point; scale: Point; color: string; selected?: boolean; opacity?: number }) {
  const geometry = useGeometry(() => new RoundedBoxGeometry(1, 1, 1, 3, .12), []);
  return <mesh geometry={geometry} position={position} scale={scale}><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
const NotesVisible = createContext(true);
function Note({ position, children, color = C.cream }: { position: Point; children: ReactNode; color?: string }) {
  const labels = useContext(NotesVisible), compact = useThree(state => state.size.width < 660);
  if (!labels || compact) return null;
  return <Html position={position} center zIndexRange={[8, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}><span style={{ display: 'block', padding: '3px 7px', border: `1px solid ${color}66`, borderRadius: 6, background: '#15252ee8', color, font: '600 11px/1.35 system-ui, sans-serif', textAlign: 'center', boxShadow: '0 2px 8px #0003' }}>{children}</span></Html>;
}
function Flow({ points, color, props, count = 4, radius = .055, active = true }: { points: Point[]; color: string; props: SceneProps; count?: number; radius?: number; active?: boolean }) {
  const group = useRef<THREE.Group>(null), phase = useRef(0);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  useEffect(() => { phase.current = 0; }, [props.step, props.variant]);
  useFrame((_, delta) => {
    if (active && props.playing && !props.reducedMotion) phase.current += Math.min(delta, .05) * .15;
    group.current?.children.forEach((child, i) => child.position.copy(curve.getPointAt(((i + .3) / count + phase.current) % 1)));
  });
  if (!active) return null;
  return <group ref={group}>{Array.from({ length: count }, (_, i) => <Bead key={i} position={curve.getPointAt((i + .3) / count).toArray() as Point} radius={radius} color={color} />)}</group>;
}
function ellipse(rx: number, ry: number, z = 0, points = 64): Point[] {
  return Array.from({ length: points + 1 }, (_, i) => [Math.cos(i / points * Math.PI * 2) * rx, Math.sin(i / points * Math.PI * 2) * ry, z]);
}
function shellGeometry(rx: number, ry: number, rz: number, cutaway: boolean) {
  const rows = 40, cols = 48, vertices: number[] = [], indices: number[] = [];
  for (let i = 0; i <= rows; i++) {
    const a = i / rows * Math.PI;
    for (let j = 0; j <= cols; j++) {
      const b = (cutaway ? Math.PI : 0) + j / cols * Math.PI * (cutaway ? 1 : 2);
      vertices.push(Math.cos(a) * rx, Math.sin(a) * Math.cos(b) * ry, Math.sin(a) * Math.sin(b) * rz);
      if (i < rows && j < cols) { const p = i * (cols + 1) + j, q = p + cols + 1; indices.push(p, q, p + 1, q, q + 1, p + 1); }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
function Envelope({ radii, color, props, id, opacity = 1 }: { radii: Point; color: string; props: SceneProps; id: string; opacity?: number }) {
  const geometry = useGeometry(() => shellGeometry(...radii, props.cutaway), [radii[0], radii[1], radii[2], props.cutaway]);
  return <Pick id={id} props={props}><mesh geometry={geometry}><Surface color={color} opacity={opacity} selected={props.selected === id} /></mesh>{props.cutaway && <Tube points={ellipse(radii[0], radii[1], .006)} radius={.04} color={color} selected={props.selected === id} />}</Pick>;
}
function CarbonGroup({ carbons, position, color, selected = false, scale = 1 }: { carbons: number; position: Point; color: string; selected?: boolean; scale?: number }) {
  const sites = Array.from({ length: carbons }, (_, i): Point => [(i - (carbons - 1) / 2) * .145, i % 2 * .075, i % 2 * .07]);
  return <group position={position} scale={scale}>{sites.length > 1 && <Tube points={sites} radius={.023} color={color} segments={12} />}{sites.map((site, i) => <Bead key={i} position={site} radius={.073} color={color} selected={selected} />)}</group>;
}
function ATPToken({ position, props, id = 'atp' }: { position: Point; props: SceneProps; id?: string }) {
  return <group position={position}><Bead position={[-.17, 0, 0]} radius={.12} color={C.teal} selected={props.selected === id} />{[0, 1, 2].map(i => <Bead key={i} position={[.04 + i * .13, 0, 0]} radius={.068} color={C.amber} selected={props.selected === id} />)}<Tube points={[[-.1, 0, 0], [.3, 0, 0]]} radius={.027} color={C.cream} segments={8} /></group>;
}

function RespirationOverview(props: SceneProps) {
  const step = props.step, sel = (id: string) => props.selected === id;
  const active = step >= 3;
  const krebs = useMemo(() => ellipse(.66, .5, .38).map(([x, y, z]): Point => [x + .42, y - .25, z]), []);
  const electronRoute: Point[] = [[-2.35, .75, .6], [-1.35, 1.3, .5], [.5, 1.22, .5], [1.75, .8, .55]];
  return <group>
    <Pick id="cytoplasm" props={props}><Box position={[-2.47, -.03, -.48]} scale={[1.65, 3.14, .72]} color={C.blue} opacity={.1} selected={sel('cytoplasm')} /><Tube points={[[-3.25, 1.56, .05], [-3.25, -1.55, .05], [-1.66, -1.55, .05]]} color={C.blue} radius={.027} /></Pick>
    <group position={[.93, .02, -.16]}>
      <Envelope id="mitochondrion" props={props} radii={[2.28, 1.44, .86]} color={C.coral} opacity={props.cutaway ? .67 : .97} />
      <Envelope id="inner-membrane" props={props} radii={[2.1, 1.23, .73]} color={C.teal} opacity={.71} />
      <Pick id="matrix" props={props}><Bead position={[0, -.07, -.44]} radius={1} scale={[1.94, 1.1, .3]} color="#849d94" opacity={.28} selected={sel('matrix')} /></Pick>
      <Pick id="intermembrane" props={props}><Tube points={ellipse(2.2, 1.34, .025)} radius={.033} color={C.violet} selected={sel('intermembrane')} /></Pick>
    </group>
    <Pick id="glycolysis" props={props}><CarbonGroup carbons={6} position={[-2.47, .78, .4]} color={C.amber} selected={sel('glycolysis')} /><Arrow from={[-2.47, .51, .45]} to={[-2.47, -.12, .45]} color={C.amber} /><ATPToken position={[-2.47, -.88, .5]} props={props} id="glycolysis" /><Note position={[-2.47, 1.16, .6]}>Glucose · 6C</Note><Note position={[-2.47, -1.23, .55]}>2 net ATP · 2 NADH</Note></Pick>
    <Pick id="pyruvate" props={props}>{[-.2, .2].map((y, i) => <CarbonGroup key={i} carbons={3} position={[-2.47, y - .12, .48]} color={C.coral} selected={sel('pyruvate')} />)}{step >= 1 && <Arrow from={[-1.99, -.15, .55]} to={[-1.05, -.15, .55]} color={C.coral} />}<Note position={[-2.47, -.55, .55]}>2 pyruvate · 3C each</Note></Pick>
    {step >= 1 && <Pick id="acetyl-coa" props={props}>{[-.2, .2].map((y, i) => <CarbonGroup key={i} carbons={2} position={[-.89, y - .06, .42]} color={C.amber} selected={sel('acetyl-coa')} />)}<Note position={[-.85, -.77, .62]}>2 acetyl-CoA · 2C each</Note><Note position={[-.89, .53, .65]} color={C.coral}>Link: 2 CO₂ released</Note>{step >= 2 && <Arrow from={[-.53, -.13, .5]} to={[-.2, -.13, .5]} color={C.amber} />}</Pick>}
    {step >= 2 && <Pick id="krebs" props={props}><Tube points={krebs} radius={.05} color={C.teal} selected={sel('krebs')} />{[0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * Math.PI * 2; return <Bead key={i} position={[.42 + .66 * Math.cos(a), -.25 + .5 * Math.sin(a), .38]} radius={.096} color={i % 2 ? C.teal : C.cream} selected={sel('krebs')} />; })}<Arrow from={[.87, .05, .45]} to={[1.01, -.18, .45]} color={C.teal} /><Note position={[.42, -.25, .6]}>2 turns / glucose</Note><Note position={[.42, -1.05, .6]} color={C.coral}>Krebs: 4 CO₂ released</Note></Pick>}
    <Pick id="carriers" props={props}><Tube points={electronRoute} radius={.023} color={C.violet} opacity={.65} /><Flow points={electronRoute} color={C.violet} props={props} active={active} count={5} /><Note position={[-.4, 1.63, .55]} color={C.violet}>{step >= 5 ? '10 NADH + 2 FADH₂ / glucose' : 'Reduced carriers → electron transport'}</Note></Pick>
    <Pick id="etc" props={props}>{[1.43, 1.9, 2.33].map((x, i) => <group key={i}><Box position={[x, .82, .35]} scale={[.29, .49, .43]} color={i % 2 ? C.violet : C.coral} selected={sel('etc')} />{active && <><Arrow from={[x, .45, .6]} to={[x, 1.29, .6]} color={C.rose} /><Bead position={[x, 1.34, .45]} radius={.06} color={C.rose} /></>}</group>)}{active && <Note position={[1.88, 1.75, .55]} color={C.rose}>H⁺: matrix → intermembrane space</Note>}</Pick>
    <Pick id="atp-synthase" props={props}><group position={[2.77, .56, .4]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.16, .067, 12, 28]} /><Surface color={C.amber} selected={sel('atp-synthase')} /></mesh><Box position={[0, -.29, 0]} scale={[.07, .45, .07]} color={C.cream} /><Bead position={[0, -.57, 0]} radius={.23} scale={[1.1, .75, 1]} color={C.amber} selected={sel('atp-synthase')} />{step >= 4 && <><Arrow from={[0, .78, .22]} to={[0, -.36, .22]} color={C.rose} /><ATPToken position={[0, -.98, .12]} props={props} id="atp-synthase" /></>}</group>{step >= 4 && <Note position={[2.19, -1.18, .62]}>O₂ accepts e⁻ + H⁺ → water</Note>}</Pick>
    <Note position={[.65, -1.83, .65]}>{step === 0 ? 'Glycolysis occurs outside the mitochondrion' : step < 3 ? 'Carbon is released as CO₂ in the matrix' : step < 5 ? 'Electron flow → H⁺ gradient → ATP synthesis' : '6 CO₂ / glucose · ATP total varies with conditions'}</Note>
    <Label id="cytoplasm" position={[-3.02, -1.48, .25]} props={props} offset={[-5, 23]} /><Label id="mitochondrion" position={[2.59, -1.01, .3]} props={props} offset={[0, 27]} /><Label id="inner-membrane" position={[1.1, -1.2, .22]} props={props} offset={[0, 22]} /><Label id="matrix" position={[1.56, -.5, .18]} props={props} offset={[0, 13]} /><Label id="intermembrane" position={[.65, 1.32, .18]} props={props} offset={[0, -24]} />
    <Label id="glycolysis" position={[-2.47, .41, .6]} props={props} offset={[-39, -3]} /><Label id="pyruvate" position={[-2.47, -.25, .6]} props={props} offset={[-38, 7]} />{step >= 1 && <Label id="acetyl-coa" position={[-.88, -.04, .6]} props={props} offset={[-8, 27]} />}{step >= 2 && <Label id="krebs" position={[.49, -.72, .6]} props={props} offset={[0, 22]} />}<Label id="carriers" position={[-.55, 1.23, .65]} props={props} offset={[0, -25]} /><Label id="etc" position={[1.88, .85, .6]} props={props} offset={[0, -28]} /><Label id="atp-synthase" position={[2.78, -.05, .65]} props={props} offset={[24, 3]} />
  </group>;
}

function ThylakoidDisc({ position, radius, props, showLumen }: { position: Point; radius: number; props: SceneProps; showLumen: boolean }) {
  const membrane = useGeometry(() => shellGeometry(radius, .085, radius * .65, props.cutaway), [radius, props.cutaway]);
  const lumen = useGeometry(() => shellGeometry(radius * .92, .037, radius * .58, true), [radius]);
  const bodyId = props.isolate && props.selected === 'granum' ? 'granum' : 'thylakoid';
  if (props.hidden.includes('granum')) return null;
  return <group position={position}>
    <Pick id={bodyId} props={props}><mesh geometry={membrane}><Surface color={C.teal} selected={props.selected === 'thylakoid' || props.selected === 'granum'} /></mesh>{props.cutaway && <Tube points={ellipse(radius, .085, .004, 36)} radius={.023} color="#a7d3bc" selected={props.selected === 'thylakoid' || props.selected === 'granum'} />}</Pick>
    {showLumen && <Pick id="lumen" props={props}><mesh geometry={lumen}><Surface color={C.amber} opacity={.7} selected={props.selected === 'lumen'} /></mesh><mesh position={[0, 0, .008]} scale={[radius * .92, .037, 1]}><circleGeometry args={[1, 32]} /><Surface color={C.amber} selected={props.selected === 'lumen'} /></mesh></Pick>}
  </group>;
}
const GRANA: { position: Point; radius: number; levels: number }[] = [
  { position: [-1.85, -.05, -.06], radius: .56, levels: 5 }, { position: [-.59, .13, -.04], radius: .63, levels: 6 },
  { position: [.86, -.14, -.08], radius: .61, levels: 5 }, { position: [2.0, .05, -.12], radius: .46, levels: 4 },
];
function ChloroplastCutaway(props: SceneProps) {
  const dna = useMemo(() => Array.from({ length: 65 }, (_, i): Point => { const a = i / 64 * Math.PI * 2; return [-1.04 + .38 * Math.cos(a), -.94 + .17 * Math.sin(a), .25 + .045 * Math.sin(a * 4)]; }), []);
  return <group rotation={[.11, -.09, -.04]}>
    <Envelope id="outer-membrane" props={props} radii={[3.08, 1.61, 1.03]} color="#6c998b" opacity={props.cutaway ? .83 : .97} />
    <Envelope id="inner-membrane" props={props} radii={[2.95, 1.47, .91]} color={C.teal} opacity={.72} />
    <Pick id="stroma" props={props}><Bead position={[0, 0, -.51]} radius={1} scale={[2.78, 1.3, .35]} color="#9aaf92" opacity={.32} selected={props.selected === 'stroma'} /></Pick>
    {GRANA.map(({ position, radius, levels }, stack) => <group key={stack} position={position}>
      {Array.from({ length: levels }, (_, i) => <ThylakoidDisc key={i} position={[Math.sin(i * 1.7) * .02, (i - (levels - 1) / 2) * .205, 0]} radius={radius * (1 - .025 * Math.abs(i - levels / 2))} props={props} showLumen={props.cutaway} />)}
      <Pick id="granum" props={props}><Tube points={[[radius + .08, -(levels - 1) * .103, .1], [radius + .14, 0, .13], [radius + .08, (levels - 1) * .103, .1]]} radius={.025} color={C.cream} selected={props.selected === 'granum'} /></Pick>
    </group>)}
    <Pick id="lamella" props={props}>{[[-1.3, -.18, -.13, -.28, -.12, -.13], [.02, .33, -.15, .44, .33, -.15], [1.36, -.31, -.12, 1.63, -.15, -.12]].map((v, i) => <group key={i}><Tube points={[[v[0], v[1], v[2]], [(v[0] + v[3]) / 2, v[1] + .05, v[2] - .06], [v[3], v[4], v[5]]]} radius={.075} color={C.teal} selected={props.selected === 'lamella'} /><Tube points={[[v[0], v[1] + .024, v[2] + .045], [v[3], v[4] + .024, v[5] + .045]]} radius={.013} color={C.amber} opacity={props.cutaway ? .8 : 0} /></group>)}</Pick>
    <Pick id="pigments" props={props}>{GRANA.slice(0, 3).flatMap(({ position, radius }, g) => Array.from({ length: 7 }, (_, i) => { const a = Math.PI + i / 6 * Math.PI; return <Bead key={`${g}-${i}`} position={[position[0] + radius * .8 * Math.cos(a), position[1] + .42, position[2] + radius * .5 * Math.sin(a)]} radius={.042} color={i % 2 ? C.amber : '#4c8a78'} selected={props.selected === 'pigments'} />; }))}</Pick>
    <Pick id="dna" props={props}><Tube points={dna} radius={.027} color={C.violet} selected={props.selected === 'dna'} /></Pick>
    <Pick id="ribosomes" props={props}>{Array.from({ length: 12 }, (_, i) => <group key={i} position={[-2.24 + (i * .57 % 4.6), -.86 + (i % 3) * .8, .2]}><Bead position={[0, 0, 0]} radius={.054} color={C.rose} selected={props.selected === 'ribosomes'} /><Bead position={[.033, .025, .015]} radius={.038} color={C.cream} /></group>)}</Pick>
    <Label id="outer-membrane" position={[-2.39, 1.02, .13]} props={props} offset={[-15, -22]} /><Label id="inner-membrane" position={[2.43, -.82, .16]} props={props} offset={[15, 24]} /><Label id="stroma" position={[1.45, .92, .14]} props={props} offset={[15, -25]} />
    <Label id="thylakoid" position={[-1.84, -.46, .3]} props={props} offset={[-30, 12]} /><Label id="granum" position={[-.59, .76, .35]} props={props} offset={[0, -25]} /><Label id="lamella" position={[.16, .36, .3]} props={props} offset={[0, -24]} />{props.cutaway && <Label id="lumen" position={[.86, -.14, .14]} props={props} offset={[0, 22]} />}<Label id="pigments" position={[-1.9, .38, .1]} props={props} offset={[-35, -22]} /><Label id="dna" position={[-1.04, -.99, .4]} props={props} offset={[0, 22]} /><Label id="ribosomes" position={[1.75, -.83, .35]} props={props} offset={[20, 20]} />
    {props.step >= 3 && <Note position={[.6, -1.78, .35]}>Stroma outside thylakoids · lumen enclosed inside</Note>}
  </group>;
}

function MembraneBand({ props }: { props: SceneProps }) {
  return <Pick id="membrane" props={props}><Box position={[0, 0, -.21]} scale={[6.55, .41, .58]} color="#4d8079" opacity={props.cutaway ? .58 : .94} selected={props.selected === 'membrane'} />{Array.from({ length: 35 }, (_, i) => [-1, 1].map(side => <group key={`${i}-${side}`}><Bead position={[-3.2 + i * .188, side * .23, .12]} radius={.066} color={C.teal} selected={props.selected === 'membrane'} /><Tube points={[[-3.2 + i * .188, side * .18, .12], [-3.18 + i * .188, side * .04, .1]]} radius={.013} color="#a2bba0" segments={5} /></group>))}</Pick>;
}
function Photosystem({ x, id, active, props }: { x: number; id: string; active: boolean; props: SceneProps }) {
  return <Pick id={id} props={props}><group position={[x, 0, .22]}><Box position={[0, 0, 0]} scale={[.54, .8, .5]} color={active ? (id === 'psii' ? C.coral : C.violet) : '#627378'} selected={props.selected === id} />{[-.18, 0, .18].map((v, i) => <Bead key={i} position={[v, .42 + (i === 1 ? .08 : 0), 0]} radius={.17} color={active ? (i % 2 ? C.amber : C.teal) : '#6b7b7c'} scale={[.8, 1, .8]} selected={props.selected === id} />)}<Bead position={[0, .15, .29]} radius={.12} color={active ? C.cream : '#80908d'} />{active && props.step >= 1 && <><Tube points={[[-.36, 1.42, .08], [-.48, 1.22, .08], [-.23, 1.06, .08], [-.33, .83, .08]]} color={C.amber} radius={.028} segments={8} /><Arrow from={[-.33, .82, .08]} to={[-.12, .48, .08]} color={C.amber} /></>}</group></Pick>;
}
function LightSynthase({ props }: { props: SceneProps }) {
  const rotor = useRef<THREE.Group>(null);
  useEffect(() => { if (rotor.current) rotor.current.rotation.y = 0; }, [props.step, props.variant]);
  useFrame((_, delta) => { if (props.playing && !props.reducedMotion && props.step >= 4 && rotor.current) rotor.current.rotation.y += delta * .6; });
  return <Pick id="atp-synthase" props={props}><group position={[2.59, 0, .25]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.21, .084, 12, 32]} /><Surface color={C.amber} selected={props.selected === 'atp-synthase'} /></mesh><Box position={[0, .39, 0]} scale={[.075, .58, .075]} color={C.cream} /><group ref={rotor} position={[0, .78, 0]}>{[0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2; return <Bead key={i} position={[Math.cos(a) * .14, 0, Math.sin(a) * .14]} radius={.16} color={i % 2 ? C.amber : C.cream} selected={props.selected === 'atp-synthase'} />; })}</group>{props.step >= 4 && <Arrow from={[0, -.88, .4]} to={[0, .5, .4]} color={C.rose} />}</group></Pick>;
}
function LightReactions(props: SceneProps) {
  const outputs = lightOutputs(props.variant), cyclic = !outputs.waterSplit, step = props.step;
  const noncyclicRoute: Point[] = [[-2.35, .25, .62], [-1.45, .56, .62], [-.69, .26, .62], [.58, .3, .62], [1.07, .84, .62], [1.73, 1.14, .62]];
  const cyclicRoute: Point[] = [[.58, .38, .64], [.74, 1.13, .63], [-.45, 1.35, .6], [-1.24, .77, .58], [-.72, .24, .62], [.58, .3, .64]];
  const route = cyclic ? cyclicRoute : noncyclicRoute;
  return <group>
    <Pick id="stroma" props={props}><Box position={[0, 1.15, -.45]} scale={[6.65, 1.65, .13]} color={C.teal} opacity={.08} selected={props.selected === 'stroma'} /></Pick>
    <Pick id="lumen" props={props}><Box position={[0, -1.02, -.45]} scale={[6.65, 1.5, .13]} color={C.amber} opacity={.08} selected={props.selected === 'lumen'} /></Pick>
    <MembraneBand props={props} />{!cyclic && <Photosystem x={-2.35} id="psii" active props={props} />}<Photosystem x={.58} id="psi" active props={props} />
    <Pick id="etc" props={props}><Box position={[-.75, -.02, .26]} scale={[.48, .82, .46]} color={C.rose} selected={props.selected === 'etc'} /><Bead position={[-1.43, .44, .27]} radius={.11} color={C.amber} /><Bead position={[-.02, .41, .27]} radius={.1} color={C.blue} />{step >= 2 && <Arrow from={[-.75, .92, .72]} to={[-.75, -.91, .72]} color={C.rose} />}</Pick>
    <Pick id="electrons" props={props}>{step >= 1 && <><Tube points={route} radius={.024} color={C.amber} opacity={.8} /><Flow points={route} color={C.amber} props={props} count={cyclic ? 5 : 6} active={step >= 2} />{cyclic ? <Arrow from={[.31, 1.3, .66]} to={[-.3, 1.32, .66]} color={C.amber} /> : <><Arrow from={[-1.95, .42, .67]} to={[-1.59, .54, .67]} color={C.amber} /><Arrow from={[.99, .78, .67]} to={[1.43, 1.05, .67]} color={C.amber} /></>}</>}</Pick>
    <Pick id="protons" props={props}>{Array.from({ length: step >= 2 ? 17 : 5 }, (_, i) => <Bead key={i} position={[-2.88 + (i * .73 % 5.95), -.68 - (i % 3) * .29, .1]} radius={.051} color={C.rose} selected={props.selected === 'protons'} />)}{Array.from({ length: 4 }, (_, i) => <Bead key={`s${i}`} position={[-1.7 + i * .88, .83 + i % 2 * .24, .1]} radius={.051} color={C.rose} />)}{step >= 2 && <Flow points={[[-.75, .92, .75], [-.75, .05, .75], [-.75, -.9, .75]]} props={props} color={C.rose} count={3} />}{step >= 4 && <Flow points={[[2.59, -.95, .72], [2.59, 0, .72], [2.59, .52, .72]]} props={props} color={C.rose} count={3} />}</Pick>
    <LightSynthase props={props} />
    {!cyclic && <Pick id="water" props={props}><group position={[-2.72, -1.05, .33]}><Bead position={[0, 0, 0]} radius={.12} color={C.blue} selected={props.selected === 'water'} /><Bead position={[-.14, .08, 0]} radius={.06} color={C.cream} /><Bead position={[.14, .08, 0]} radius={.06} color={C.cream} />{step >= 1 && <Arrow from={[.16, .16, .2]} to={[.36, .66, .2]} color={C.amber} />}</group></Pick>}
    {!cyclic && step >= 1 && <Pick id="oxygen" props={props}><Bead position={[-1.95, -1.45, .4]} radius={.105} color={C.coral} selected={props.selected === 'oxygen'} /><Bead position={[-1.78, -1.45, .4]} radius={.105} color={C.coral} /><Arrow from={[-2.39, -1.09, .5]} to={[-2.05, -1.37, .5]} color={C.coral} /><Note position={[-1.78, -1.81, .5]} color={C.coral}>O₂ from water</Note></Pick>}
    {!cyclic && <Pick id="nadp" props={props}><group position={[1.68, 1.28, .35]}><Bead position={[-.12, 0, 0]} radius={.15} color={C.violet} selected={props.selected === 'nadp'} /><Bead position={[.12, 0, 0]} radius={.13} color={C.teal} />{step >= 3 && <Bead position={[0, .2, .04]} radius={.064} color={C.amber} />}</group><Note position={[1.7, 1.68, .48]} color={C.violet}>{step >= 3 ? 'NADPH' : 'NADP⁺'}</Note></Pick>}
    {step >= 4 && <Pick id="atp" props={props}><ATPToken position={[2.61, 1.25, .46]} props={props} /><Note position={[2.65, 1.69, .46]} color={C.amber}>ATP</Note></Pick>}
    <Note position={[0, -2.1, .45]}>{cyclic ? 'Cyclic: PSI → chain → PSI · ATP only' : 'Non-cyclic: water → PSII → chain → PSI → NADP⁺'}</Note>
    <Label id="stroma" position={[-2.95, 1.75, .1]} props={props} offset={[0, -16]} /><Label id="lumen" position={[.1, -1.6, .1]} props={props} offset={[0, 22]} /><Label id="membrane" position={[-3.03, .1, .2]} props={props} offset={[-12, 20]} />{!cyclic && <Label id="psii" position={[-2.35, .33, .55]} props={props} offset={[-18, -29]} />}<Label id="psi" position={[.58, .34, .55]} props={props} offset={[15, -28]} /><Label id="etc" position={[-.75, -.04, .55]} props={props} offset={[-8, 27]} /><Label id="atp-synthase" position={[2.59, .66, .6]} props={props} offset={[27, -8]} />{step >= 1 && <Label id="electrons" position={cyclic ? [-.1, 1.31, .7] : [-1.48, .53, .7]} props={props} offset={[0, -24]} />}<Label id="protons" position={[.6, -.93, .35]} props={props} offset={[15, 20]} />{!cyclic && <><Label id="water" position={[-2.72, -1.05, .5]} props={props} offset={[-15, 24]} />{step >= 1 && <Label id="oxygen" position={[-1.85, -1.45, .5]} props={props} offset={[21, 10]} />}<Label id="nadp" position={[1.7, 1.29, .5]} props={props} offset={[0, -29]} /></>}{step >= 4 && <Label id="atp" position={[2.65, 1.27, .55]} props={props} offset={[15, -25]} />}
  </group>;
}

// Counts are explicit: this is a carbon ledger in stroma, not physical orbital motion.
function CalvinCycle(props: SceneProps) {
  const step = props.step, state = calvinState(step), sel = (id: string) => props.selected === id;
  const stromaGeometry = useGeometry(() => shellGeometry(3.31, 1.81, .6, true), []);
  const rubpPositions: Point[] = [[-1.95, .71, .25], [-1.95, .29, .25], [-1.95, -.13, .25]];
  const productPositions: Point[] = Array.from({ length: 6 }, (_, i) => [.53 + (i % 2) * .93, .88 - Math.floor(i / 2) * .43, .25]);
  return <group>
    {props.cutaway && !props.isolate && <mesh geometry={stromaGeometry} position={[0, .05, -.35]}><Surface color="#749684" opacity={.15} /></mesh>}
    {!props.isolate && <Note position={[0, 1.99, .3]} color={C.teal}>Calvin cycle · chloroplast stroma · per 3 CO₂</Note>}
    {state.co2 > 0 && <Pick id="co2" props={props}>{Array.from({ length: state.co2 }, (_, i) => <group key={i} position={[-2.57 + i * .47, 1.47, .25]}><Bead position={[0, 0, 0]} radius={.083} color={C.coral} selected={sel('co2')} /><Bead position={[-.12, 0, 0]} radius={.063} color={C.cream} /><Bead position={[.12, 0, 0]} radius={.063} color={C.cream} /></group>)}<Note position={[-2.11, 1.1, .45]} color={C.coral}>3 CO₂ = 3C</Note></Pick>}
    {state.rubp > 0 && <Pick id="rubp" props={props}>{rubpPositions.slice(0, state.rubp).map((p, i) => <CarbonGroup key={i} position={p} carbons={5} color={C.teal} selected={sel('rubp')} />)}<Note position={[-1.95, -.53, .45]} color={C.teal}>3 RuBP × 5C = 15C</Note></Pick>}
    {step <= 1 && <Pick id="rubisco" props={props}><Bead position={[-.59, .36, .17]} radius={.32} color={C.rose} scale={[.74, 1, .7]} selected={sel('rubisco')} /><Bead position={[-.52, .43, .43]} radius={.12} color={C.cream} /><Arrow from={[-1.32, .33, .55]} to={[-.82, .33, .55]} color={C.teal} /><Arrow from={[-.3, .33, .55]} to={[.13, .33, .55]} color={C.amber} /></Pick>}
    {state.gp > 0 && <Pick id="gp" props={props}>{productPositions.slice(0,state.gp).map((p,i)=><CarbonGroup key={i} position={p} carbons={3} color={C.coral} selected={sel('gp')}/>)}<Note position={[1.03,-.53,.45]} color={C.coral}>6 GP × 3C = 18C</Note></Pick>}
    {(state.tp > 0 || state.netTp > 0) && <Pick id="tp" props={props}>{productPositions.slice(0, state.tp).map((p, i) => <CarbonGroup key={i} position={p} carbons={3} color={C.violet} selected={sel('tp')} />)}{state.netTp > 0 && <CarbonGroup position={[2.65, -.49, .25]} carbons={3} color={C.amber} selected={sel('tp')} />}<Note position={state.netTp > 0 ? [2.65, -.9, .45] : [1.03, -.53, .45]} color={state.netTp > 0 ? C.amber : C.violet}>{state.netTp > 0 ? '1 TP net · 3C' : '6 TP × 3C = 18C'}</Note>{state.netTp > 0 && <Arrow from={[1.83, -.03, .5]} to={[2.46, -.42, .5]} color={C.amber} />}{state.regeneratingTp > 0 && <Note position={[.94, -.57, .45]} color={C.violet}>5 TP remain · 15C</Note>}</Pick>}
    {step >= 2 && <Pick id="atp" props={props}>{Array.from({ length: step === 4 ? 3 : 6 }, (_, i) => <ATPToken key={i} position={[-1.83 + i % 3 * .53, -1.23 - Math.floor(i / 3) * .29, .3]} props={props} />)}<Note position={[-1.34, -1.83, .4]} color={C.amber}>{step === 4 ? 'Regeneration: +3 ATP' : 'Reduction: 6 ATP'}</Note></Pick>}
    {step >= 2 && step < 4 && <Pick id="nadph" props={props}>{Array.from({ length: 6 }, (_, i) => <group key={i} position={[.62 + i % 3 * .46, -1.23 - Math.floor(i / 3) * .29, .3]}><Bead position={[-.09, 0, 0]} radius={.11} color={C.violet} selected={sel('nadph')} /><Bead position={[.09, 0, 0]} radius={.09} color={C.teal} /><Bead position={[0, .14, 0]} radius={.052} color={C.amber} /></group>)}<Note position={[1.1, -1.83, .4]} color={C.violet}>Reduction: 6 NADPH</Note></Pick>}
    {step >= 3 && <Pick id="regeneration" props={props}><Tube points={[[1.38, .99, .5], [.65, 1.41, .5], [-.47, 1.35, .5], [-1.22, .9, .5]]} radius={.031} color={C.teal} selected={sel('regeneration')} /><Arrow from={[-.79, 1.12, .52]} to={[-1.2, .91, .52]} color={C.teal} /><Note position={[.23, 1.63, .6]} color={C.teal}>{step === 4 ? '5 TP (15C) → 3 RuBP (15C)' : '5 TP reserved for regeneration'}</Note></Pick>}
    <Note position={[0, -2.11, .4]}>3C enters = 3C net export · 15C regenerated · 9 ATP + 6 NADPH</Note>
    {state.rubp > 0 && <Label id="rubp" position={[-1.95, -.07, .4]} props={props} offset={[-15, 25]} />}{state.co2 > 0 && <Label id="co2" position={[-2.1, 1.48, .45]} props={props} offset={[-20, -28]} />}{step <= 1 && <Label id="rubisco" position={[-.59, .35, .5]} props={props} offset={[0, 27]} />}{state.gp > 0 && <Label id="gp" position={[2.55, .23, .45]} props={props} offset={[0, 0]} />}{step >= 2 && <><Label id="tp" position={step >= 3 ? [2.65, -.49, .43] : [2.55, .23, .45]} props={props} offset={step >= 3 ? [0, 32] : [0, 0]} /><Label id="atp" position={[-1.35, -1.32, .45]} props={props} offset={[0, -25]} />{step < 4 && <Label id="nadph" position={[1.1, -1.32, .45]} props={props} offset={[0, -25]} />}</>}{step >= 3 && <Label id="regeneration" position={[.13, 1.34, .65]} props={props} offset={[0, -25]} />}
  </group>;
}

function HomologBody({ x, id, color, duplicated, props }: { x: number; id: string; color: string; duplicated: boolean; props: SceneProps }) {
  if (props.hidden.includes(id) || duplicated && props.hidden.includes('sisters')) return null;
  const sisters = duplicated ? [-1, 1] : [0], idSelected = props.selected === id;
  return <group position={[x, 0, 0]}>
    <Pick id={id} props={props}>{sisters.map(side => <group key={side}>
      <Tube points={[[side * .32, 1.4, .05], [side * .28, .73, .1], [side * .06, .05, .17], [-side * .21, -.69, .07], [-side * .3, -1.47, 0]]} radius={.14} color={color} selected={idSelected} segments={45} />
      <Bead position={[side * .32, 1.4, .05]} radius={.14} color={color} /><Bead position={[-side * .3, -1.47, 0]} radius={.14} color={color} />
      {Array.from({ length: 10 }, (_, i) => <Tube key={i} points={[[side * .29 - .09, 1.3 - i * .27, .13], [side * .2 + .1, 1.24 - i * .27, .15]]} radius={.013} color="#f0e6d6" opacity={.22} segments={6} />)}
    </group>)}</Pick>
    <Pick id="centromere" props={props}><Bead position={[0, .04, .2]} radius={.18} scale={[duplicated ? 1.35 : .8, .62, .8]} color={C.cream} selected={props.selected === 'centromere'} /></Pick>
  </group>;
}
function HomologsAndAlleles(props: SceneProps) {
  const state = alleleState(props.variant), duplicate = state.chromatids === 4, homo = state.genotype === 'AA';
  const alleleOnPaternal = state.paternalAlleles[0], sisterOffsets = duplicate ? [-.28, .28] : [0];
  return <group>
    <HomologBody x={-1.45} id="maternal" color={C.coral} duplicated={duplicate} props={props} /><HomologBody x={1.45} id="paternal" color={C.teal} duplicated={duplicate} props={props} />
    {props.step >= 1 && <Pick id="locus" props={props}>{[-1.45, 1.45].flatMap(x => sisterOffsets.map(side => <mesh key={`${x}-${side}`} position={[x + side, .77, .14]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.178, .034, 10, 24]} /><Surface color={C.amber} selected={props.selected === 'locus'} /></mesh>))}<Tube points={[[-1.15, .77, .42], [0, .77, .42], [1.15, .77, .42]]} radius={.017} color={C.amber} opacity={.6} /><Note position={[0, 1.1, .5]} color={C.amber}>Same gene locus</Note></Pick>}
    {props.step >= 2 && <><Pick id="allele-a" props={props}>{sisterOffsets.map(side => <group key={side}><Bead position={[-1.45 + side, .77, .34]} radius={.108} color={C.violet} selected={props.selected === 'allele-a'} /><Note position={[-1.45 + side, .77, .55]} color={C.cream}>A</Note></group>)}</Pick><Pick id="allele-b" props={props}>{sisterOffsets.map(side => <group key={side}><Bead position={[1.45 + side, .77, .34]} radius={.108} color={homo ? C.violet : C.amber} selected={props.selected === 'allele-b'} /><Note position={[1.45 + side, .77, .55]} color={C.cream}>{alleleOnPaternal}</Note></group>)}</Pick></>}
    {duplicate && <Pick id="sisters" props={props}>{[-1.45, 1.45].map(x => <group key={x}><Tube points={[[x - .42, -1.67, .16], [x, -1.8, .16], [x + .42, -1.67, .16]]} radius={.025} color={C.violet} selected={props.selected === 'sisters'} />{props.isolate && sisterOffsets.map(side => <Tube key={side} points={[[x + side, 1.4, .05], [x + side * .8, .73, .1], [x + side * .15, .05, .17], [x - side * .7, -.69, .07], [x - side, -1.47, 0]]} radius={.14} color={x < 0 ? C.coral : C.teal} selected segments={40} />)}</group>)}</Pick>}
    <Note position={[0, 1.87, .45]}>{homo ? 'Homozygous AA' : 'Heterozygous Aa'}{duplicate ? ' · DNA copied' : ''}</Note>
    <Note position={[0, -2.12, .45]}>{props.step >= 3 ? <>{state.chromosomes} chromosomes · {state.chromatids} DNA molecules · {duplicate ? 'identical sister alleles' : 'one homologous pair'}</> : 'Homologues have corresponding loci · sister chromatids are copies'}</Note>
    <Label id="maternal" position={[-1.45, -1.34, .35]} props={props} offset={[-22, 26]} /><Label id="paternal" position={[1.45, -1.34, .35]} props={props} offset={[22, 26]} /><Label id="centromere" position={[-1.45, .04, .37]} props={props} offset={[-35, 15]} />{props.step >= 1 && <Label id="locus" position={[0, .77, .5]} props={props} offset={[0, 26]} />}{props.step >= 2 && <><Label id="allele-a" position={[-1.45, .77, .6]} props={props} offset={[-39, -26]} /><Label id="allele-b" position={[1.45, .77, .6]} props={props} offset={[39, -26]} /></>}{duplicate && <Label id="sisters" position={[1.45, -1.79, .4]} props={props} offset={[0, 25]} />}
  </group>;
}

function DNA({ start, end, y, props, id = 'dna', color = C.blue }: { start: number; end: number; y: number; props: SceneProps; id?: string; color?: string }) {
  const turns = Math.max(2, (end - start) / .65), samples = Math.ceil((end - start) * 20);
  const strands = [-1, 1].map(sign => Array.from({ length: samples + 1 }, (_, i): Point => { const a = i / samples * Math.PI * 2 * turns; return [start + i / samples * (end - start), y + Math.cos(a) * .11 * sign, Math.sin(a) * .11 * sign]; }));
  return <Pick id={id} props={props}>{strands.map((points, i) => <Tube key={i} points={points} radius={.025} color={i ? color : C.cream} selected={props.selected === id} segments={samples} />)}{Array.from({ length: Math.ceil((end - start) * 9) }, (_, i) => { const t = i / Math.ceil((end - start) * 9), a = t * Math.PI * 2 * turns, x = start + t * (end - start); return <Tube key={i} points={[[x, y + Math.cos(a) * .11, Math.sin(a) * .11], [x, y - Math.cos(a) * .11, -Math.sin(a) * .11]]} radius={.013} color={i % 2 ? C.teal : C.coral} segments={3} />; })}</Pick>;
}
function Repressor({ induced, bound, props }: { induced: boolean; bound: boolean; props: SceneProps }) {
  const position: Point = bound ? [-.86, .49, .24] : [-1.56, 1.53, .12];
  return <Pick id="repressor" props={props}><group position={position} rotation={[0, 0, induced ? -.26 : 0]}><Bead position={[-.19, .02, 0]} radius={.27} scale={[1, .83, .85]} color={C.violet} selected={props.selected === 'repressor'} /><Bead position={[.19, .02, 0]} radius={.27} scale={[1, .83, .85]} color={C.violet} selected={props.selected === 'repressor'} /><Box position={[-.19, induced ? -.05 : -.22, .04]} scale={[.15, .29, .19]} color={C.violet} selected={props.selected === 'repressor'} /><Box position={[.19, induced ? .08 : -.22, .04]} scale={[.15, .29, .19]} color={C.violet} selected={props.selected === 'repressor'} /></group></Pick>;
}
function LacOperon(props: SceneProps) {
  const state = lacState(props.variant), lactose = state.allolactose, step = props.step;
  const induced = state.allolactose && step >= 1, bound = state.operatorOccupied && step >= 1;
  const transcribing = lactose && step >= 3;
  const polymeraseX = transcribing ? Math.min(2.15, .38 + (step - 3) * 1.6) : -1.63;
  const mrna: Point[] = [[polymeraseX, .23, .48], [polymeraseX - .1, -.15, .54], [.55, -.58, .4], [1.23, -.7, .42], [1.75, -.91, .42], [2.3, -.88, .4]];
  return <group>
    <DNA start={-3.17} end={3.18} y={.08} props={props} />
    <DNA start={-3.0} end={-1.8} y={-1.46} props={props} id="regulatory-gene" color={C.violet} />
    <Pick id="regulatory-gene" props={props}><Box position={[-2.39, -1.46, -.05]} scale={[.84, .29, .1]} color={C.violet} opacity={.45} selected={props.selected === 'regulatory-gene'} /><Note position={[-2.39, -1.82, .3]} color={C.violet}>lacI · own promoter</Note><Arrow from={[-2.38, -1.14, .24]} to={[-2.38, -.63, .24]} color={C.violet} /></Pick>
    <Pick id="promoter" props={props}><Box position={[-1.73, .08, -.1]} scale={[.73, .35, .13]} color={C.blue} opacity={.82} selected={props.selected === 'promoter'} /><Note position={[-1.73, -.31, .4]} color={C.blue}>P</Note></Pick>
    <Pick id="operator" props={props}><Box position={[-.86, .08, -.08]} scale={[.58, .35, .13]} color={bound ? C.violet : C.amber} opacity={.8} selected={props.selected === 'operator'} /><Note position={[-.86, -.31, .4]} color={C.amber}>O {step >= 2 ? bound ? '· occupied' : '· accessible' : ''}</Note></Pick>
    <Pick id="structural-genes" props={props}>{[{ x: .15, w: 1.18, text: 'lacZ', color: C.coral }, { x: 1.42, w: 1.18, text: 'lacY', color: C.teal }, { x: 2.52, w: .84, text: 'lacA', color: C.amber }].map(g => <group key={g.text}><Box position={[g.x, .08, -.09]} scale={[g.w, .35, .12]} color={g.color} opacity={.73} selected={props.selected === 'structural-genes'} /><Note position={[g.x, -.31, .35]} color={g.color}>{g.text}</Note></group>)}</Pick>
    <Repressor induced={induced} bound={bound} props={props} />
    <Pick id="inducer" props={props}>{lactose && <group position={induced ? [-1.56, 1.62, .4] : [-2.7, 1.34, .32]}><Bead position={[-.085, 0, 0]} radius={.11} color={C.amber} selected={props.selected === 'inducer'} /><Bead position={[.085, 0, 0]} radius={.11} color={C.cream} />{!induced && <Arrow from={[.26, -.03, .1]} to={[.77, .06, .1]} color={C.amber} />}</group>}</Pick>
    <Pick id="rna-polymerase" props={props}><group position={[polymeraseX, .52, .22]}><Bead position={[0, 0, 0]} radius={.32} scale={[1.2, 1, .9]} color={C.coral} selected={props.selected === 'rna-polymerase'} /><Bead position={[.21, -.04, .14]} radius={.18} color={C.rose} /><Tube points={[[-.16, -.17, .2], [0, -.24, .25], [.16, -.17, .2]]} radius={.04} color={C.dark} />{step >= 2 && <Arrow from={[.47, .2, .26]} to={[.9, .2, .26]} color={transcribing ? C.teal : C.rose} />}</group></Pick>
    <Pick id="mrna" props={props}>{step >= 3 && <><Tube points={transcribing ? mrna : [[.56, -.8, .4], [.83, -.84, .4], [1.06, -.78, .4]]} radius={transcribing ? .035 : .018} color={C.teal} opacity={transcribing ? 1 : .38} selected={props.selected === 'mrna'} />{transcribing && Array.from({ length: 12 }, (_, i) => <Bead key={i} position={[.66 + i * .12, -.68 - i * .022, .43]} radius={.043} color={i % 3 ? C.teal : C.amber} />)}<Note position={[1.21, -1.24, .53]} color={C.teal}>{lactose ? 'One polycistronic lacZYA mRNA' : 'Very low basal transcription'}</Note></>}</Pick>
    <Pick id="enzymes" props={props}>{step >= 4 && [0, 1, 2].map(i => <group key={i} position={[.55 + i * .84, -1.73, .25]}><Bead position={[-.1, .02, 0]} radius={lactose ? .16 : .09} color={[C.coral, C.teal, C.amber][i]} opacity={lactose ? 1 : .42} selected={props.selected === 'enzymes'} /><Bead position={[.1, -.03, .04]} radius={lactose ? .14 : .075} color={[C.coral, C.teal, C.amber][i]} opacity={lactose ? 1 : .42} /></group>)}</Pick>
    <Note position={[.5, 2.13, .4]}>Glucose low (fixed) · {lactose ? 'lactose present' : 'lactose absent'}</Note>
    {step >= 1 && <Note position={lactose ? [-1.49, 1.96, .45] : [-.85, 1.19, .45]} color={C.violet}>{lactose ? 'Allolactose changes repressor shape' : 'Active repressor binds operator'}</Note>}
    <Note position={[.45, -2.18, .4]}>{step >= 4 ? lactose ? 'Enzymes increase · bacterial cytoplasm · CAP/cAMP omitted' : 'Very low basal expression · repression is not absolute' : 'Promoter recruits polymerase · operator controls access'}</Note>
    <Label id="dna" position={[3.12, .08, .2]} props={props} offset={[16, 21]} /><Label id="regulatory-gene" position={[-2.4, -1.46, .3]} props={props} offset={[-15, -25]} /><Label id="promoter" position={[-1.73, .08, .35]} props={props} offset={[-11, -25]} /><Label id="operator" position={[-.86, .08, .35]} props={props} offset={[0, -24]} /><Label id="structural-genes" position={[1.36, .08, .35]} props={props} offset={[0, -29]} /><Label id="repressor" position={bound ? [-.86, .57, .5] : [-1.56, 1.53, .45]} props={props} offset={bound ? [30, -22] : [33, 15]} />{lactose && <Label id="inducer" position={induced ? [-1.56, 1.65, .55] : [-2.7, 1.34, .5]} props={props} offset={induced ? [-37, -18] : [-15, -22]} />}<Label id="rna-polymerase" position={[polymeraseX, .54, .56]} props={props} offset={transcribing ? [16, -28] : [-36, -27]} />{step >= 3 && <Label id="mrna" position={[1.4, -.85, .52]} props={props} offset={[20, 16]} />}{step >= 4 && <Label id="enzymes" position={[lactose ? 1.4 : .55, -1.73, .5]} props={props} offset={[0, 24]} />}
  </group>;
}

function AdvancedSpecimen(props: SceneProps) {
  if (props.moduleId === 'BIO-032') return <RespirationOverview {...props} />;
  if (props.moduleId === 'BIO-034') return <ChloroplastCutaway {...props} />;
  if (props.moduleId === 'BIO-035') return <LightReactions {...props} />;
  if (props.moduleId === 'BIO-036') return <CalvinCycle {...props} />;
  if (props.moduleId === 'BIO-043') return <HomologsAndAlleles {...props} />;
  if (props.moduleId === 'BIO-046') return <LacOperon {...props} />;
  return null;
}
export default function AdvancedWave2Scenes(props: SceneProps) {
  return <NotesVisible.Provider value={props.labels && !props.isolate}><AdvancedSpecimen {...props} /></NotesVisible.Provider>;
}
