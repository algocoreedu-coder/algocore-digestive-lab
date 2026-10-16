import { cristaPoint, meiosisChromosomes, type ChromosomeDatum } from './biologyModel';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Arrow, Label, PALETTE as C, Surface, Tube, visible, type Point } from './shared';
import type { SceneProps } from './types';

// All geometry is original, editable schematic anatomy; no molecular coordinates,
// biological measurements or externally licensed model assets are implied.
function useGeometry(factory: () => THREE.BufferGeometry, deps: unknown[]) {
  const geometry = useMemo(factory, deps);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}
function Pick({ id, props, children }: { id: string; props: SceneProps; children: ReactNode }) {
  if (!visible(id, props)) return null;
  return <group onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); props.onSelect(id); }}>{children}</group>;
}
function Bead({ position, radius = .08, color, scale = [1, 1, 1], selected = false, opacity = 1 }: { position: Point; radius?: number; color: string; scale?: Point; selected?: boolean; opacity?: number }) {
  return <mesh position={position} scale={scale}><sphereGeometry args={[radius, 24, 16]} /><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
function Box({ position, scale, color, selected = false, opacity = 1 }: { position: Point; scale: Point; color: string; selected?: boolean; opacity?: number }) {
  const geometry = useGeometry(() => new RoundedBoxGeometry(1, 1, 1, 3, .14), []);
  return <mesh geometry={geometry} position={position} scale={scale}><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
function Flow({ points, color, props, count = 5, radius = .06, active = true, speed = .13 }: { points: Point[]; color: string; props: SceneProps; count?: number; radius?: number; active?: boolean; speed?: number }) {
  const group = useRef<THREE.Group>(null), phase = useRef(0);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  useEffect(() => { phase.current = 0; }, [props.step, props.variant]);
  useFrame((_, delta) => {
    if (props.playing && !props.reducedMotion && active) phase.current += Math.min(delta, .05) * speed;
    group.current?.children.forEach((child, i) => child.position.copy(curve.getPointAt(((i + .35) / count + phase.current) % 1)));
  });
  if (!active) return null;
  return <group ref={group}>{Array.from({ length: count }, (_, i) => <Bead key={i} position={curve.getPointAt((i + .35) / count).toArray() as Point} color={color} radius={radius} />)}</group>;
}

// A curved prolate envelope, opened toward the camera in cutaway mode.
function mitochondrionShell(scale: number, cutaway: boolean) {
  const vertices: number[] = [], indices: number[] = [], uv: number[] = [];
  const rows = 64, cols = cutaway ? 36 : 64;
  for (let i = 0; i <= rows; i++) {
    const t = i / rows * Math.PI, x = Math.cos(t) * 3.04 * scale, r = Math.sin(t);
    for (let j = 0; j <= cols; j++) {
      const phi = cutaway ? Math.PI + j / cols * Math.PI : j / cols * Math.PI * 2;
      vertices.push(x, Math.cos(phi) * r * 1.13 * scale + .19 * (1 - (x / 3.04) ** 2), Math.sin(phi) * r * .91 * scale);
      uv.push(i / rows, j / cols);
      if (i < rows && j < cols) { const a = i * (cols + 1) + j, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
    }
  }
  const result = new THREE.BufferGeometry(); result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); result.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); result.setIndex(indices); result.computeVertexNormals(); return result;
}
function mitoRim(scale: number): Point[] {
  return Array.from({ length: 81 }, (_, i) => { const a = i / 80 * Math.PI * 2, x = Math.cos(a) * 3.04 * scale; return [x, Math.sin(a) * 1.13 * scale + .19 * (1 - (x / 3.04) ** 2), .006]; });
}

function cristaGeometry(x: number) {
  const vertices: number[] = [], indices: number[] = [], rows = 28, cols = 10;
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) {
    vertices.push(...cristaPoint(x, i / rows, j / cols));
    if (i < rows && j < cols) { const a = i * (cols + 1) + j, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  const result = new THREE.BufferGeometry(); result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); result.setIndex(indices); result.computeVertexNormals(); return result;
}
function Crista({ x, selected }: { x: number; selected: boolean }) {
  const geometry = useGeometry(() => cristaGeometry(x), [x]);
  const rim = useMemo(() => Array.from({ length: 30 }, (_, i): Point => cristaPoint(x, i / 29, .5)), [x]);
  return <><mesh geometry={geometry}><Surface color={C.teal} selected={selected} /></mesh><Tube points={rim} radius={.035} color="#b2d9c4" selected={selected} /></>;
}
function Mitochondrion(props: SceneProps) {
  const outer = useGeometry(() => mitochondrionShell(1, props.cutaway), [props.cutaway]);
  const inner = useGeometry(() => mitochondrionShell(.9, props.cutaway), [props.cutaway]);
  const matrix = useGeometry(() => mitochondrionShell(.865, true), []);
  const dna = useMemo(() => Array.from({ length: 70 }, (_, i): Point => { const a = i / 69 * Math.PI * 2; return [-1.4 + .5 * Math.cos(a), -.23 + .26 * Math.sin(a), -.12 + .06 * Math.sin(a * 5)]; }), []);
  return <group rotation={[.09, -.12, -.06]}>
    <Pick id="outer" props={props}><mesh geometry={outer}><Surface color={C.coral} selected={props.selected === 'outer'} opacity={props.cutaway ? 1 : .88} /></mesh>{props.cutaway && <Tube points={mitoRim(1)} radius={.075} color={C.coral} selected={props.selected === 'outer'} />}</Pick>
    <Pick id="ims" props={props}>{props.cutaway && <Tube points={mitoRim(.952)} radius={.036} color={C.amber} selected={props.selected === 'ims'} />}</Pick>
    <Pick id="inner" props={props}><mesh geometry={inner}><Surface color={C.teal} selected={props.selected === 'inner'} opacity={props.cutaway ? 1 : .65} /></mesh>{props.cutaway && <Tube points={mitoRim(.9)} radius={.055} color={C.teal} selected={props.selected === 'inner'} />}</Pick>
    <Pick id="matrix" props={props}><mesh geometry={matrix}><Surface color="#a6b7a3" opacity={.8} selected={props.selected === 'matrix'} /></mesh></Pick>
    <Pick id="cristae" props={props}>{[-2.23, -1.66, -1.1, -.52, .08, .7, 1.32, 1.93, 2.4].map(x => <Crista key={x} x={x} selected={props.selected === 'cristae'} />)}</Pick>
    <Pick id="dna" props={props}><Tube points={dna} radius={.035} color={C.violet} selected={props.selected === 'dna'} />{Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return <Bead key={i} position={[-1.4 + .5 * Math.cos(a), -.23 + .26 * Math.sin(a), -.1]} radius={.045} color={C.violet} />; })}</Pick>
    <Pick id="ribosomes" props={props}>{Array.from({ length: 16 }, (_, i) => { const x = -2.2 + (i * .79 % 4.3), y = -.52 + (i * .47 % 1.17); return <group key={i}><Bead position={[x, y, -.05]} radius={.065} color={C.amber} selected={props.selected === 'ribosomes'} /><Bead position={[x + .04, y + .045, -.02]} radius={.043} color={C.cream} /></group>; })}</Pick>
    <Label id="outer" position={[-2.55, .9, .15]} props={props} offset={[-15, -22]} /><Label id="inner" position={[2.4, -.62, .1]} props={props} offset={[24, 18]} />
    <Label id="cristae" position={[.55, .52, .08]} props={props} offset={[0, -35]} /><Label id="matrix" position={[1.6, -.23, .15]} props={props} offset={[0, 17]} /><Label id="ims" position={[-.7, -1, .15]} props={props} offset={[-10, 32]} />
    <Label id="dna" position={[-1.45, -.25, .17]} props={props} offset={[-12, 24]} /><Label id="ribosomes" position={[.2, -.6, .15]} props={props} offset={[5, 25]} />
  </group>;
}

const ELECTRON_ROUTE: Point[] = [[-3.15, -.9, .35], [-2.25, -.35, .35], [-2.15, .22, .35], [-.65, .25, .35], [.85, .15, .35], [1.25, -.75, .35]];
function LipidStrip({ props }: { props: SceneProps }) {
  return <Pick id="inner" props={props}>
    <Box position={[0, 0, -.24]} scale={[6.65, .47, .65]} color="#527f7c" opacity={props.cutaway ? .52 : .88} selected={props.selected === 'inner'} />
    {Array.from({ length: 41 }, (_, i) => [-1, 1].map(sign => <group key={`${i}-${sign}`}>
      <Bead position={[-3.25 + i * .163, sign * .265, .12]} radius={.077} color={C.teal} selected={props.selected === 'inner'} />
      <Tube points={[[-3.25 + i * .163, sign * .21, .12], [-3.28 + i * .163, sign * .08, .1], [-3.24 + i * .163, sign * .01, .1]]} radius={.016} color="#aec8ac" segments={8} />
    </group>))}
  </Pick>;
}
function Pump({ x, props, index }: { x: number; props: SceneProps; index: number }) {
  return <group position={[x, 0, .25]}>
    <Box position={[0, .02, 0]} scale={[.48, .91, .48]} color={index % 2 ? C.violet : C.coral} selected={props.selected === 'etc'} />
    <Bead position={[-.15, .4, .02]} radius={.22} scale={[1, .85, 1]} color={index % 2 ? C.violet : C.coral} /><Bead position={[.16, -.4, .02]} radius={.2} color={index % 2 ? C.violet : C.coral} />
    <Tube points={[[.02, -.46, .1], [-.04, 0, .16], [.04, .48, .1]]} radius={.055} color="#314f55" />
    {props.step >= 1 && <Arrow from={[-.04, -.9, .2]} to={[-.04, .94, .2]} color={C.rose} />}
    {props.step >= 1 && visible('protons', props) && <Flow points={[[0, -.82, .25], [.03, 0, .25], [0, .87, .25]]} props={props} color={C.rose} count={2} radius={.07} active={props.step === 1 || props.step === 2} />}
  </group>;
}
function ATPase({ props }: { props: SceneProps }) {
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (props.playing && !props.reducedMotion && props.step >= 3 && rotor.current) rotor.current.rotation.y += delta * .6; });
  return <group position={[2.48, .02, .25]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.24, .1, 14, 32]} /><Surface color={C.amber} selected={props.selected === 'synthase'} /></mesh>
    <mesh position={[0, -.55, 0]}><cylinderGeometry args={[.066, .066, .9, 18]} /><Surface color={C.cream} /></mesh>
    <group ref={rotor} position={[0, -.95, 0]}>{Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return <Bead key={i} position={[Math.cos(a) * .2, 0, Math.sin(a) * .2]} radius={.18} scale={[1, 1.2, 1]} color={i % 2 ? C.amber : C.cream} selected={props.selected === 'synthase'} />; })}</group>
    <Tube points={[[-.28, .27, 0], [-.4, -.5, 0], [-.3, -.87, 0]]} radius={.045} color={C.amber} />
    {props.step >= 3 && <><Arrow from={[.05, 1.03, .32]} to={[.05, -.48, .32]} color={C.rose} />{visible('protons', props) && <Flow points={[[.05, 1.1, .35], [.05, .05, .35], [.05, -.55, .35]]} color={C.rose} props={props} count={3} active radius={.075} />}</>}
  </group>;
}
function ElectronTransport(props: SceneProps) {
  const protonPositions = useMemo(() => Array.from({ length: 15 }, (_, i): Point => [-2.8 + (i * .91 % 5.7), .82 + (i % 3) * .26, -.04 + (i % 2) * .35]), []);
  return <group rotation={[.05, 0, 0]}>
    <Pick id="ims" props={props}><Box position={[0, 1.12, -.47]} scale={[6.7, 1.25, .13]} color={C.violet} opacity={.07} selected={props.selected === 'ims'} /></Pick>
    <Pick id="matrix" props={props}><Box position={[0, -1.08, -.47]} scale={[6.7, 1.2, .13]} color={C.teal} opacity={.09} selected={props.selected === 'matrix'} /></Pick>
    <LipidStrip props={props} />
    <Pick id="etc" props={props}>{[-2.15, -.65, .85].map((x, i) => <Pump key={x} x={x} index={i} props={props} />)}<Tube points={ELECTRON_ROUTE} radius={.023} color={C.amber} opacity={.7} /><Flow points={ELECTRON_ROUTE} color={C.amber} props={props} count={5} active={props.step >= 1} radius={.055} /></Pick>
    <Pick id="donor" props={props}><group position={[-3.05, -1.03, .3]}><Bead position={[-.08, 0, 0]} radius={.21} color={C.violet} selected={props.selected === 'donor'} /><Bead position={[.18, 0, 0]} radius={.13} color={C.amber} /><Arrow from={[.1, .18, 0]} to={[.58, .56, 0]} color={C.amber} /></group></Pick>
    <Pick id="protons" props={props}>{protonPositions.slice(0, props.step >= 2 ? 15 : 5).map((p, i) => <Bead key={i} position={p} radius={.065} color={C.rose} selected={props.selected === 'protons'} />)}{[[-2.6, -1.2, .12], [-.8, -1.12, .16], [1.1, -1.25, .12]].map((p, i) => <Bead key={`low${i}`} position={p as Point} radius={.065} color={C.rose} />)}</Pick>
    <Pick id="synthase" props={props}><ATPase props={props} /></Pick>
    <Pick id="atp" props={props}>{props.step >= 3 && <group position={[2.48, -1.72, .35]}>{[0, 1, 2].map(i => <Bead key={i} position={[-.38 + i * .2, 0, 0]} radius={.1} color={C.amber} selected={props.selected === 'atp'} />)}<Bead position={[.37, 0, 0]} radius={.16} color={C.teal} /><Arrow from={[0, .35, 0]} to={[0, .13, 0]} color={C.amber} /></group>}</Pick>
    <Pick id="oxygen" props={props}><group position={[1.18, -1.2, .4]}><Bead position={[-.1, 0, 0]} radius={.135} color={C.coral} selected={props.selected === 'oxygen'} /><Bead position={[.1, 0, 0]} radius={.135} color={C.coral} />{props.step >= 4 && <><Arrow from={[.03, -.21, 0]} to={[.03, -.58, 0]} color={C.blue} /><Bead position={[.03, -.8, 0]} radius={.12} color={C.blue} /><Bead position={[-.12, -.74, .03]} radius={.066} color={C.cream} /><Bead position={[.18, -.74, .03]} radius={.066} color={C.cream} /></>}</group></Pick>
    <Label id="ims" position={[-.2, 1.8, .15]} props={props} /><Label id="matrix" position={[-.2, -1.92, .15]} props={props} /><Label id="inner" position={[-2.78, .2, .28]} props={props} offset={[-12, -25]} /><Label id="etc" position={[-.65, .5, .45]} props={props} offset={[0, -20]} />
    <Label id="donor" position={[-2.9, -1.1, .45]} props={props} offset={[0, 24]} /><Label id="protons" position={[1.1, 1.1, .2]} props={props} offset={[0, -15]} /><Label id="synthase" position={[2.48, -.75, .55]} props={props} offset={[30, 0]} />{props.step >= 3 && <Label id="atp" position={[2.4, -1.85, .4]} props={props} offset={[15, 20]} />}<Label id="oxygen" position={[1.1, -1.2, .45]} props={props} offset={[-10, 23]} />
  </group>;
}

function kidneyGeometry(scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(.13, 1.92); shape.bezierCurveTo(-.66, 2.33, -1.6, 1.85, -1.77, .62); shape.bezierCurveTo(-1.98, -.62, -1.39, -1.91, -.45, -2.05); shape.bezierCurveTo(.31, -2.16, .83, -1.33, .45, -.8); shape.bezierCurveTo(.21, -.44, -.3, -.46, -.2, .02); shape.bezierCurveTo(-.16, .43, .69, .61, .65, 1.13); shape.bezierCurveTo(.65, 1.49, .42, 1.78, .13, 1.92);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .44, bevelEnabled: true, bevelSize: .11, bevelThickness: .1, bevelSegments: 4, curveSegments: 40, steps: 1 }); geometry.scale(scale, scale, scale); geometry.computeVertexNormals(); return geometry;
}
function Pyramid({ position, angle, size = 1, selected }: { position: Point; angle: number; size?: number; selected: boolean }) {
  const geometry = useGeometry(() => { const s = new THREE.Shape(); s.moveTo(-.3, .42); s.bezierCurveTo(-.45, .29, -.19, -.17, 0, -.48); s.bezierCurveTo(.2, -.2, .43, .29, .3, .42); s.quadraticCurveTo(0, .53, -.3, .42); return new THREE.ExtrudeGeometry(s, { depth: .14, bevelEnabled: true, bevelSize: .06, bevelThickness: .05, bevelSegments: 3, curveSegments: 16 }); }, []);
  return <group position={position} rotation={[0, 0, angle]} scale={size}><mesh geometry={geometry}><Surface color={C.rose} selected={selected} /></mesh>{[-.16, -.08, 0, .08, .16].map((x, i) => <Tube key={i} points={[[x, .37, .24], [x * .55, -.02, .24], [x * .12, -.37, .24]]} radius={.011} color="#e3b3bb" segments={12} />)}</group>;
}
const PCT: Point[] = [[.96, 1.42, .23], [1.2, 1.24, .29], [1.42, 1.67, .35], [1.77, 1.61, .2], [1.55, 1.23, .3], [1.97, 1.15, .42], [1.95, 1.74, .33], [2.23, 1.53, .18], [2.1, .95, .34], [1.6, .72, .26]];
const LOOP: Point[] = [[1.6, .72, .26], [1.46, .28, .22], [1.43, -.65, .18], [1.46, -1.55, .21], [1.63, -1.88, .25], [1.86, -1.55, .27], [1.88, -.58, .25], [1.9, .51, .29]];
const DCT: Point[] = [[1.9, .51, .29], [2.22, .63, .28], [2.36, 1.08, .37], [2.56, 1.18, .32], [2.76, .89, .25], [2.6, .67, .32], [2.8, .49, .36], [3.05, .72, .29]];
const COLLECT: Point[] = [[3.07, 1.65, .22], [3.07, .65, .24], [3.05, -.55, .22], [3.03, -1.65, .2], [2.86, -2.14, .18]];
const GLOMERULUS: Point[] = Array.from({ length: 100 }, (_, i) => { const a = i / 99 * Math.PI * 8, t = i / 99; return [.62 + Math.sin(a) * .28 * Math.sin(Math.PI * t + .2), 1.59 + Math.cos(a) * .25, .19 + Math.sin(a * .51) * .19]; });
function BowmanCup({ props }: { props: SceneProps }) {
  const geometry = useGeometry(() => { const g = new THREE.SphereGeometry(.49, 36, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.rotateX(Math.PI / 2); return g; }, []);
  return <Pick id="bowman" props={props}><mesh geometry={geometry} position={[.62, 1.59, .12]} scale={[1, 1, .85]}><Surface color={C.teal} selected={props.selected === 'bowman'} opacity={.65} /></mesh><Tube points={Array.from({ length: 49 }, (_, i): Point => [.62 + Math.cos(i / 48 * Math.PI * 2) * .49, 1.59 + Math.sin(i / 48 * Math.PI * 2) * .49, .13])} radius={.035} color={C.teal} /></Pick>;
}
function KidneyAndNephron(props: SceneProps) {
  const kidney = useGeometry(() => kidneyGeometry(), []), inner = useGeometry(() => kidneyGeometry(.87), []);
  const afferent: Point[] = [[.13, 2.24, .22], [.31, 1.97, .23], [.57, 1.91, .24], GLOMERULUS[0]];
  const efferent: Point[] = [GLOMERULUS[GLOMERULUS.length - 1], [.86, 1.77, .2], [1.08, 1.94, .1], [1.26, 1.59, .02]];
  const capillary: Point[] = [[1.26, 1.59, .02], [1.09, 1.05, .04], [2.02, .92, -.03], [1.3, .61, -.05], [1.22, -.8, -.03], [1.32, -1.88, -.03], [2.02, -1.95, -.02], [2.12, -.73, -.04], [2.06, .25, -.06], [2.55, .41, -.03], [2.7, 1.21, -.03]];
  return <group scale={.93}>
    <group position={[-1.45, .1, -.3]}>
      <Pick id="capsule" props={props}><mesh geometry={kidney}><Surface color={C.coral} selected={props.selected === 'capsule'} opacity={props.cutaway ? 1 : .95} /></mesh></Pick>
      {props.cutaway && <>
        <Pick id="cortex" props={props}><mesh geometry={inner} position={[-.08, 0, .22]}><Surface color="#cc9c86" selected={props.selected === 'cortex'} /></mesh></Pick>
        <Pick id="medulla" props={props}>{[
          { p: [-.7, 1.23, .8] as Point, a: .5, s: .85 }, { p: [-1.2, .69, .8] as Point, a: 1.08, s: .85 }, { p: [-1.3, -.13, .8] as Point, a: 1.58, s: .9 }, { p: [-1.02, -.94, .8] as Point, a: 2.0, s: .84 }, { p: [-.36, -1.34, .8] as Point, a: 2.65, s: .78 },
        ].map((p, i) => <Pyramid key={i} position={p.p} angle={p.a} size={p.s} selected={props.selected === 'medulla'} />)}</Pick>
        <Pick id="pelvis" props={props}><Bead position={[-.21, -.14, 1.08]} radius={.3} scale={[.7, 1.2, .55]} color={C.cream} selected={props.selected === 'pelvis'} />{[[[-.46, .85, 1.03], [-.22, .33, 1.08], [-.21, -.14, 1.08]], [[-.72, .43, 1.06], [-.4, .24, 1.07], [-.21, -.14, 1.08]], [[-.82, -.14, 1.07], [-.5, -.14, 1.07], [-.21, -.14, 1.08]], [[-.56, -.73, 1.07], [-.35, -.42, 1.07], [-.21, -.14, 1.08]], [[-.15, -1.01, 1.06], [-.15, -.58, 1.08], [-.21, -.14, 1.08]]].map((points, i) => <Tube key={i} points={points as Point[]} radius={.085} color={C.cream} selected={props.selected === 'pelvis'} />)}</Pick>
      </>}
      <Pick id="ureter" props={props}><Tube points={[[-.15, -.12, 1.06], [.12, -.5, 1.04], [.22, -1.35, .9], [.35, -2.36, .7]]} radius={.115} color={C.amber} selected={props.selected === 'ureter'} /></Pick>
      <Pick id="artery" props={props}><Tube points={[[.87, .25, .91], [.28, .23, 1], [-.19, .4, 1.12], [-.55, .58, 1.13]]} radius={.105} color={C.coral} selected={props.selected === 'artery'} /></Pick>
      <Pick id="vein" props={props}><Tube points={[[.88, -.03, 1.03], [.3, -.02, 1.14], [-.19, .12, 1.2], [-.64, .01, 1.16]]} radius={.135} color={C.blue} selected={props.selected === 'vein'} /></Pick>
    </group>
    <Pick id="artery" props={props}><Tube points={afferent} radius={.035} color={C.coral} selected={props.selected === 'artery'} /><Tube points={efferent} radius={.035} color={C.coral} selected={props.selected === 'artery'} /><Tube points={capillary} radius={.022} color={C.coral} opacity={.65} /></Pick>
    <Pick id="vein" props={props}><Tube points={[[2.7, 1.21, -.03], [2.91, 1.62, -.05], [3.27, 1.99, -.05]]} radius={.045} color={C.blue} selected={props.selected === 'vein'} /></Pick>
    <BowmanCup props={props} />
    <Pick id="glomerulus" props={props}><Tube points={GLOMERULUS} radius={.047} color={C.coral} selected={props.selected === 'glomerulus'} segments={130} /><Flow points={GLOMERULUS} color={C.rose} props={props} count={5} radius={.035} active={props.step >= 1} /></Pick>
    <Pick id="pct" props={props}><Tube points={PCT} radius={.112} color={C.amber} selected={props.selected === 'pct'} segments={140} />{props.step === 2 && <><Arrow from={[1.72, 1.29, .5]} to={[1.21, .93, .5]} color={C.blue} /><Flow points={[[1.78, 1.3, .5], [1.45, 1.12, .52], [1.12, .95, .5]]} color={C.blue} props={props} count={3} /></>}</Pick>
    <Pick id="loop" props={props}><Tube points={LOOP} radius={.074} color={C.teal} selected={props.selected === 'loop'} segments={140} />{props.step === 3 && <><Arrow from={[1.45, -.76, .42]} to={[1.06, -.77, .42]} color={C.blue} /><Arrow from={[1.88, -.88, .42]} to={[2.3, -.88, .42]} color={C.amber} /></>}</Pick>
    <Pick id="dct" props={props}><Tube points={DCT} radius={.095} color={C.violet} selected={props.selected === 'dct'} segments={100} /></Pick>
    <Pick id="collecting" props={props}><Tube points={COLLECT} radius={.12} color={C.rose} selected={props.selected === 'collecting'} segments={100} /></Pick>
    {props.step >= 1 && <Pick id={props.step === 1 ? 'bowman' : props.step === 2 ? 'pct' : props.step === 3 ? 'loop' : 'collecting'} props={props}><Flow points={props.step === 1 ? [[.64, 1.6, .5], [.91, 1.4, .5], PCT[0]] : props.step === 2 ? PCT : props.step === 3 ? LOOP : COLLECT} color={C.cream} props={props} count={props.step === 1 ? 3 : 8} radius={.039} /><Arrow from={props.step <= 2 ? [1.98, 1.7, .57] : props.step === 3 ? [1.44, -.3, .45] : [3.07, -.5, .43]} to={props.step <= 2 ? [2.05, 1.16, .57] : props.step === 3 ? [1.44, -.95, .45] : [3.07, -1.15, .43]} color={C.cream} /></Pick>}
    {props.step === 3 && <Pick id="dct" props={props}><Flow points={DCT} color={C.cream} props={props} count={4} radius={.039} /></Pick>}
    <Label id="capsule" position={[-2.85, .45, .65]} props={props} offset={[-28, 0]} />{props.cutaway && <><Label id="cortex" position={[-2.5, 1.73, .8]} props={props} offset={[-10, -20]} /><Label id="medulla" position={[-2.6, -.45, .85]} props={props} offset={[-10, 10]} /><Label id="pelvis" position={[-1.65, -.13, 1]} props={props} offset={[15, 35]} /></>}<Label id="ureter" position={[-1.1, -1.95, .8]} props={props} offset={[-10, 20]} />
    <Label id="artery" position={[-.59, .36, .9]} props={props} offset={[0, -20]} /><Label id="vein" position={[-.59, -.07, 1]} props={props} offset={[5, 20]} /><Label id="glomerulus" position={[.6, 1.7, .55]} props={props} offset={[-20, -32]} /><Label id="bowman" position={[.54, 1.26, .45]} props={props} offset={[-35, 15]} /><Label id="pct" position={[1.8, 1.65, .5]} props={props} offset={[20, -28]} /><Label id="loop" position={[1.65, -1.78, .5]} props={props} offset={[-22, 22]} /><Label id="dct" position={[2.5, 1.1, .5]} props={props} offset={[27, -15]} /><Label id="collecting" position={[3.06, -.57, .5]} props={props} offset={[14, 10]} />
  </group>;
}

const ADH_BLOOD: Point[] = [[-2.15, .55, .3], [-2.36, .08, .3], [-2.4, -1.6, .2], [-1.5, -2.04, .17], [.8, -2.04, .15], [2.64, -1.83, .12], [2.72, -.6, .12], [2.72, 1.8, .12]];
function Aquaporin({ y, inserted, props }: { y: number; inserted: boolean; props: SceneProps }) {
  const x = inserted ? .8 : 1.13;
  return <group position={[x, y, inserted ? .39 : .5]} rotation={inserted ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
    {Array.from({ length: 4 }, (_, i) => { const a = i / 4 * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * .09, 0, Math.sin(a) * .09]}><cylinderGeometry args={[.041, .041, .24, 12]} /><Surface color={C.teal} selected={props.selected === 'aquaporin'} /></mesh>; })}
    {!inserted && <Bead position={[0, 0, -.04]} radius={.2} scale={[1, 1, .45]} color={C.cream} opacity={.2} />}
  </group>;
}
function ADH(props: SceneProps) {
  const high = props.variant !== 'low', inserted = high && props.step >= 3;
  const brainOutline = useMemo(() => Array.from({ length: 65 }, (_, i): Point => { const a = i / 64 * Math.PI * 2; return [-2.18 + Math.cos(a) * (.83 + .06 * Math.cos(a * 7)), 1.43 + Math.sin(a) * (.54 + .045 * Math.cos(a * 8)), -.09]; }), []);
  return <group>
    <group><Bead position={[-2.18, 1.43, -.12]} radius={1} scale={[.84, .56, .37]} color={C.rose} opacity={.21} /><Tube points={brainOutline} radius={.052} color={C.rose} opacity={.55} />{[-.35, -.1, .17, .4].map((a, i) => <Tube key={i} points={[[-2.75 + i * .25, 1.7, .12], [-2.78 + i * .26, 1.47 + a * .15, .22], [-2.62 + i * .26, 1.22, .13]]} radius={.025} color={C.coral} opacity={.7} />)}</group>
    <Pick id="hypothalamus" props={props}><Bead position={[-2.2, 1.24, .37]} radius={.16} scale={[1.2, .7, 1]} color={C.amber} selected={props.selected === 'hypothalamus'} /><Tube points={[[-2.2, 1.17, .37], [-2.17, .9, .37], [-2.13, .74, .37]]} radius={.055} color={C.amber} /></Pick>
    <Pick id="pituitary" props={props}><Bead position={[-2.13, .68, .38]} radius={.19} scale={[1, .72, 1]} color={C.violet} selected={props.selected === 'pituitary'} /></Pick>
    <Pick id="adh" props={props}><Tube points={ADH_BLOOD} radius={.13} color={C.coral} opacity={.24} /><Tube points={ADH_BLOOD} radius={.027} color={C.rose} opacity={.5} /><Flow points={ADH_BLOOD} props={props} color={C.violet} count={high ? 11 : 3} radius={.075} active={props.step >= 2} />{props.step >= 2 && <Arrow from={[2.55, .77, .35]} to={[1.57, .77, .35]} color={C.violet} />}</Pick>
    <Pick id="collecting" props={props}>
      <Box position={[.3, 0, -.3]} scale={[1.7, 3.72, .1]} color={C.rose} opacity={.09} />
      {[-1, 1].map(side => [-1.35, -.45, .45, 1.35].map((y, i) => <group key={`${side}-${i}`}><Box position={[.3 + side * .77, y, -.03]} scale={[.55, .84, .64]} color={side > 0 ? '#b88b9d' : C.rose} opacity={props.cutaway ? .83 : 1} selected={props.selected === 'collecting'} /><Bead position={[.3 + side * .82, y, .28]} radius={.115} color={C.violet} scale={[1, 1.3, .5]} /></group>))}
      <Tube points={[[-.2, 1.8, .35], [-.2, 0, .35], [-.2, -1.8, .35]]} radius={.03} color={C.cream} opacity={.6} /><Tube points={[[.8, 1.8, .35], [.8, 0, .35], [.8, -1.8, .35]]} radius={.03} color={C.cream} opacity={.6} />
      <Arrow from={[.3, 1.65, .4]} to={[.3, 1.05, .4]} color={C.amber} /><Arrow from={[.3, -.95, .4]} to={[.3, -1.55, .4]} color={C.amber} />
    </Pick>
    <Pick id="receptor" props={props}>{[-1.1, .05, 1.15].map((y, i) => <group key={i} position={[1.42, y, .33]}><Box position={[0, 0, 0]} scale={[.12, .23, .17]} color={C.violet} selected={props.selected === 'receptor'} /><Tube points={[[.03, -.1, 0], [.15, -.14, .03], [.24, 0, .03], [.15, .14, .03], [.03, .1, 0]]} radius={.033} color={C.violet} />{high && props.step >= 2 && <Bead position={[.2, 0, .03]} radius={.065} color={C.cream} />}</group>)}</Pick>
    <Pick id="aquaporin" props={props}>{[-1.33, -.44, .45, 1.34].map((y, i) => <Aquaporin key={i} y={y} inserted={inserted || (!high && props.step >= 3 && i === 2)} props={props} />)}</Pick>
    <Pick id="interstitium" props={props}><Box position={[2.05, 0, -.26]} scale={[1, 3.6, .12]} color={C.teal} opacity={.1} selected={props.selected === 'interstitium'} />{Array.from({ length: 12 }, (_, i) => <Bead key={i} position={[1.65 + i % 3 * .22, -1.5 + Math.floor(i / 3) * .9, -.02]} radius={.031} color={C.amber} opacity={.8} />)}</Pick>
    <Pick id="water" props={props}>
      {Array.from({ length: high && props.step >= 4 ? 8 : 15 }, (_, i) => <Bead key={i} position={[.04 + (i % 3) * .25, 1.5 - Math.floor(i / 3) * .67, .18]} radius={.055} color={C.blue} selected={props.selected === 'water'} />)}
      {props.step >= 4 && <>{(high ? [-1.33, -.44, .45, 1.34] : [.45]).map((y, i) => <group key={i}><Arrow from={[.37, y, .55]} to={[2.55, y, .55]} color={C.blue} /><Flow points={[[.35, y, .55], [.75, y, .55], [1.3, y, .55], [2.1, y, .55], [2.7, y, .35]]} props={props} color={C.blue} count={high ? 4 : 2} radius={.053} /></group>)}<Flow points={[[.3, .6, .2], [.3, -.4, .2], [.3, -1.8, .2]]} props={props} color={C.blue} count={high ? 3 : 8} radius={.048} /></>}
    </Pick>
    <Label id="hypothalamus" position={[-2.2, 1.26, .55]} props={props} offset={[-12, -28]} /><Label id="pituitary" position={[-2.13, .68, .6]} props={props} offset={[-20, 24]} /><Label id="adh" position={[-1.7, -1.99, .3]} props={props} offset={[-10, 18]} />
    <Label id="collecting" position={[.3, 1.95, .4]} props={props} offset={[-10, -22]} /><Label id="receptor" position={[1.56, 1.15, .58]} props={props} offset={[33, -15]} /><Label id="aquaporin" position={[inserted ? .8 : 1.13, -.44, .63]} props={props} offset={[-25, 12]} /><Label id="interstitium" position={[2.03, -1.62, .4]} props={props} offset={[20, 30]} /><Label id="water" position={props.step >= 4 ? [2.3, .45, .6] : [.3, .5, .6]} props={props} offset={props.step >= 4 ? [17, 24] : [-24, -12]} />
  </group>;
}


const CHROMOSOME_COLORS = [[C.coral, C.teal], [C.violet, C.amber]];
function chromosomeVisibility(props: SceneProps) {
  const selected = ['homologs', 'sisters', 'gametes'].includes(props.selected);
  return !props.hidden.includes('homologs') && !props.hidden.includes('sisters') && (!props.isolate || selected);
}
function Chromosome({ datum, props }: { datum: ChromosomeDatum; props: SceneProps }) {
  const { pair, parent, replicated, length, recombined = false, position, tilt = 0 } = datum;
  const body = chromosomeVisibility(props), centromere = visible('centromere', props);
  const color = CHROMOSOME_COLORS[pair][parent], other = CHROMOSOME_COLORS[pair][1 - parent];
  const width = length * .21, radius = .071;
  const sisters = replicated ? [0, 1] : [datum.sister ?? 0];
  return <group position={position} rotation={[0, 0, tilt]} onClick={(event) => { event.stopPropagation(); props.onSelect(replicated ? 'sisters' : 'homologs'); }}>
    {body && sisters.map(sister => {
      const sign = sister === 0 ? -1 : 1, w = replicated ? width * sign : 0;
      const upper: Point[] = [[w, length * .5, 0], [w * .85, length * .29, .025], [0, 0, .055]];
      const lower: Point[] = [[0, 0, .055], [-w * .65, -length * .2, .025], [-w, -length * .5, 0]];
      // Reciprocal exchange occurs between exactly one non-sister chromatid in each homolog.
      const crossed = recombined && sister === (parent === 0 ? 1 : 0);
      return <group key={sister}><Tube points={upper} radius={radius} color={color} selected={props.selected === 'sisters' || props.selected === 'homologs'} segments={20} />
        <Tube points={crossed ? lower.slice(0, 2) : lower} radius={radius} color={color} selected={props.selected === 'sisters' || props.selected === 'homologs'} segments={20} />
        {crossed && <Tube points={[lower[1], [-w * .83, -length * .35, .015], lower[2]]} radius={radius + .001} color={other} selected={props.selected === 'chiasma'} segments={16} />}
        <Bead position={upper[0]} radius={radius} color={color} /><Bead position={lower[2]} radius={radius} color={crossed ? other : color} />
      </group>;
    })}
    {centromere && <Bead position={[0, 0, .07]} radius={.09} scale={[1.2, .7, .8]} color={C.cream} selected={props.selected === 'centromere'} />}
  </group>;
}
function DivisionCell({ position, scale = [1, 1, 1], radius = 1.7, props, product = false }: { position: Point; scale?: Point; radius?: number; props: SceneProps; product?: boolean }) {
  const rim = useMemo(() => Array.from({ length: 61 }, (_, i): Point => [Math.cos(i / 60 * Math.PI * 2) * radius, Math.sin(i / 60 * Math.PI * 2) * radius, -.08]), [radius]);
  const membrane = useGeometry(() => { const geometry = new THREE.SphereGeometry(radius, 40, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); geometry.rotateX(Math.PI / 2); return geometry; }, [radius]);
  if (!props.cutaway) return null;
  if (props.isolate && !['gametes', 'homologs', 'sisters', 'spindle', 'chiasma', 'centromere'].includes(props.selected)) return null;
  if (product && props.hidden.includes('gametes')) return null;
  return <group position={position} scale={scale} onClick={product ? (e) => { e.stopPropagation(); props.onSelect('gametes'); } : undefined}>
    <mesh geometry={membrane}><Surface color={product ? C.teal : '#627b85'} opacity={.13} /></mesh><Tube points={rim} radius={.035} color={product ? C.teal : '#7b9da4'} opacity={.7} selected={product && props.selected === 'gametes'} />
  </group>;
}

function Meiosis(props: SceneProps) {
  const step = props.step, chromosomes = meiosisChromosomes(step, props.variant);
  const spindleActive = step === 3 || step === 4 || step === 6 || step === 7;
  return <group>
    {step < 5 ? <DivisionCell position={[0, 0, -.08]} radius={1.85} scale={step >= 3 ? [1.43, 1, .8] : [1, 1, .9]} props={props} /> : step < 8 ? [-1, 1].map(side => <DivisionCell key={side} position={[side * 1.72, 0, -.08]} radius={1.27} scale={[1.05, 1, .8]} props={props} />) : [-1, 1].flatMap(side => [-1, 1].map(row => <DivisionCell key={`${side}-${row}`} position={[side * 1.65, row * 1.05, -.08]} radius={.86} scale={[1.1, 1, .75]} props={props} product />))}
    <Pick id="spindle" props={props}>{spindleActive && chromosomes.flatMap((c, i) => {
      const cellX = step >= 6 ? (c.position[0] < 0 ? -1.72 : 1.72) : 0;
      const sides = step === 6 ? [-1, 1] : [c.position[0] < cellX ? -1 : 1];
      return sides.map(side => { const poleX = cellX + side * (step >= 6 ? 1.16 : 2.35); return <group key={`${i}-${side}`}><Tube points={[[poleX, 0, -.08], [(poleX + c.position[0]) / 2, c.position[1] * .72 + .12, .02], [c.position[0], c.position[1], .12]]} radius={.012} color={C.amber} opacity={.7} segments={24} /><Tube points={[[poleX, 0, -.08], [(poleX + c.position[0]) / 2, c.position[1] * .72 - .12, -.02], [c.position[0], c.position[1], .1]]} radius={.011} color={C.amber} opacity={.55} segments={24} /><Bead position={[poleX, 0, -.06]} radius={.07} color={C.amber} /></group>; });
    })}</Pick>
    {chromosomes.map((datum, i) => <Chromosome key={i} datum={datum} props={props} />)}
    <Pick id="chiasma" props={props}>{step === 2 && <><Tube points={[[-.52, .25, .27], [-.38, .07, .32], [-.2, -.03, .28]]} radius={.043} color={C.coral} selected={props.selected === 'chiasma'} /><Tube points={[[-.35, .26, .29], [-.39, .08, .34], [-.56, -.06, .27]]} radius={.043} color={C.teal} selected={props.selected === 'chiasma'} /><mesh position={[-.39, .08, .33]}><torusGeometry args={[.13, .017, 8, 32]} /><Surface color={C.cream} selected={props.selected === 'chiasma'} /></mesh></>}</Pick>
    {step < 5 && <Label id="homologs" position={[-.6, .65, .4]} props={props} offset={[-35, -36]} />}{step > 0 && step < 7 && <Label id="sisters" position={step >= 5 ? [1.73, .52, .4] : [.67, .65, .4]} props={props} offset={[35, -31]} />}<Label id="centromere" position={chromosomes[0].position.map((v, i) => i === 2 ? .45 : v) as Point} props={props} offset={[-25, 20]} />
    {step === 2 && <Label id="chiasma" position={[-.39, .07, .5]} props={props} offset={[15, 32]} />}{spindleActive && <Label id="spindle" position={step >= 6 ? [-2.7, -.3, .3] : [-2, -.3, .3]} props={props} offset={[-15, 24]} />}{step >= 8 && <Label id="gametes" position={[0, -1.95, .4]} props={props} offset={[0, 20]} />}
  </group>;
}

export default function AdvancedScenes(props: SceneProps) {
  if (props.moduleId === 'BIO-031') return <Mitochondrion {...props} />;
  if (props.moduleId === 'BIO-033') return <ElectronTransport {...props} />;
  if (props.moduleId === 'BIO-037') return <KidneyAndNephron {...props} />;
  if (props.moduleId === 'BIO-038') return <ADH {...props} />;
  if (props.moduleId === 'BIO-044') return <Meiosis {...props} />;
  return null;
}
