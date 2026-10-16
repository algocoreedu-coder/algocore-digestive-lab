import { useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './types';
import { Arrow, Label, PALETTE as P, Surface, Tube, visible, type Point } from './shared';

// All geometry below is an editable schematic, not molecular-coordinate data.
const stop = (props: SceneProps, id: string) => (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); props.onSelect(id); };
const can = (props: SceneProps, id: string, parent?: string) => !props.hidden.includes(id) && (!parent || !props.hidden.includes(parent)) && (!props.isolate || props.selected === id || props.selected === parent);
const selected = (props: SceneProps, id: string) => props.selected === id;

function Caption({ position, children, tone = P.cream }: { position: Point; children: React.ReactNode; tone?: string }) {
  return <Html center position={position} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}><div style={{ color: tone, whiteSpace: 'nowrap', font: '600 10px Montserrat, sans-serif', letterSpacing: '.025em', padding: '5px 8px', borderRadius: 6, background: '#15272edb', border: '1px solid #ffffff1c' }}>{children}</div></Html>;
}

type Instance = { position: Point; scale: Point; quaternion?: THREE.Quaternion };
function Instances({ items, color, shape = 'sphere', chosen = false, onClick }: { items: Instance[]; color: string; shape?: 'sphere' | 'cylinder'; chosen?: boolean; onClick: (event: ThreeEvent<MouseEvent>) => void }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new THREE.Object3D();
    items.forEach((item, i) => {
      object.position.set(...item.position); object.scale.set(...item.scale); object.quaternion.copy(item.quaternion ?? new THREE.Quaternion());
      object.updateMatrix(); ref.current?.setMatrixAt(i, object.matrix);
    });
    if (ref.current) { ref.current.instanceMatrix.needsUpdate = true; ref.current.computeBoundingSphere(); }
  }, [items]);
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]} onClick={onClick}>
    {shape === 'sphere' ? <sphereGeometry args={[1, 14, 10]} /> : <cylinderGeometry args={[1, 1, 1, 7]} />}
    <Surface color={color} selected={chosen} roughness={shape === 'sphere' ? .36 : .52} />
  </instancedMesh>;
}

function segment(a: Point, b: Point, radius: number): Instance {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
  return { position: start.add(end).multiplyScalar(.5).toArray() as Point, scale: [radius, delta.length(), radius], quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()) };
}

/** Heads face the two aqueous compartments; paired tails meet at the centre. */
function LipidPatch({ props, transport = false, holes = [] }: { props: SceneProps; transport?: boolean; holes?: number[] }) {
  const [heads, tails] = useMemo(() => {
    const h: Instance[] = [], t: Instance[] = [];
    for (let col = 0; col < 19; col++) for (let row = 0; row < (props.cutaway ? 4 : 7); row++) {
      const x = -3.04 + col * .338, z = -.92 + row * .306;
      if (holes.some(hole => Math.abs(x - hole) < .45 && Math.abs(z - .08) < .56)) continue;
      const bend = .035 * Math.sin(col * .71 + row * .9);
      for (const side of [-1, 1]) {
        const y = side * (.48 + .035 * Math.sin(x * .75 + z));
        h.push({ position: [x, y, z], scale: [.139, .126, .139] });
        for (const tail of [-1, 1]) {
          const start: Point = [x + tail * .053, y - side * .12, z];
          const kink: Point = [x + tail * .07 + bend, side * .19, z + .027];
          const end: Point = [x + tail * .075 - bend, side * .025, z + .055];
          t.push(segment(start, kink, .029), segment(kink, end, .027));
        }
      }
    }
    return [h, t];
  }, [props.cutaway, holes.join(',')]);
  const parent = transport ? 'membrane' : 'bilayer';
  return <group>
    {can(props, transport ? parent : 'heads', parent) && <Instances items={heads} color={P.coral} chosen={selected(props, parent) || selected(props, 'heads')} onClick={stop(props, transport ? parent : 'heads')} />}
    {can(props, transport ? parent : 'tails', parent) && <Instances items={tails} color={P.rose} shape="cylinder" chosen={selected(props, parent) || selected(props, 'tails')} onClick={stop(props, transport ? parent : 'tails')} />}
  </group>;
}

function Protein({ props, id, x, open = true, phase = 0 }: { props: SceneProps; id: string; x: number; open?: boolean; phase?: number }) {
  if (!visible(id, props)) return null;
  const color = id === 'carrier' ? P.violet : P.teal;
  return <group position={[x, 0, .06]} onClick={stop(props, id)}>
    {Array.from({ length: open ? 6 : 4 }, (_, i) => {
      const angle = i / (open ? 6 : 4) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(angle) * (open ? .31 : .19), Math.sin(angle * 2) * .06, Math.sin(angle) * .31]} rotation={[.05 * Math.cos(angle), 0, .08 * Math.sin(angle) + (phase === 2 ? .12 : 0)]} scale={[open ? .21 : .29, .77 + Math.cos(angle) * .04, .22]}><sphereGeometry args={[1, 22, 16]} /><Surface color={color} selected={selected(props, id)} /></mesh>;
    })}
    {open && <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .7, 0]}><torusGeometry args={[.255, .06, 9, 24]} /><Surface color={P.cream} selected={selected(props, id)} /></mesh>}
  </group>;
}

function Carbohydrate({ props, id, x, protein = false }: { props: SceneProps; id: string; x: number; protein?: boolean }) {
  if (!visible(id, props)) return null;
  const points: Point[] = [[x, .5, .1], [x + .02, .83, .12], [x - .1, 1.07, .1], [x + .05, 1.34, .08], [x -.05, 1.6, .1]];
  return <group onClick={stop(props, id)}>
    {protein && <mesh position={[x, .45, .1]} scale={[.31, .48, .32]}><sphereGeometry args={[1, 22, 16]} /><Surface color={P.blue} selected={selected(props, id)} /></mesh>}
    {!protein && <><mesh position={[x, .48, .1]} scale={[.14, .125, .14]}><sphereGeometry args={[1, 18, 12]} /><Surface color={P.coral} selected={selected(props, id)} /></mesh>{[-1, 1].map(side => <Tube key={side} points={[[x + side * .05, .37, .1], [x + side * .075, .18, .12], [x + side * .06, .025, .16]]} radius={.03} color={P.rose} selected={selected(props, id)} />)}</>}
    <Tube points={points} radius={.035} color={P.cream} />
    <Tube points={[[x -.1, 1.07, .1], [x -.39, 1.18, .13], [x -.52, 1.43, .12]]} radius={.03} color={P.cream} />
    {[...points.slice(1), [x -.39, 1.18, .13], [x -.52, 1.43, .12]].map((p, i) => <mesh key={i} position={p as Point} rotation={[.1, .3, i * .3]}><icosahedronGeometry args={[i % 2 ? .115 : .1, 0]} /><Surface color={i % 2 ? P.amber : P.cream} selected={selected(props, id)} /></mesh>)}
  </group>;
}

function MembraneScene(props: SceneProps) {
  return <group rotation={[.11, -.08, 0]} position={[0, -.3, 0]}>
    <LipidPatch props={props} holes={[-.85, 1.12, -2.35]} />
    <Protein props={props} id="channel" x={-.85} />
    <Protein props={props} id="carrier" x={1.12} open={false} />
    {visible('cholesterol', props) && [-1.6, .1, 1.94].map((x, i) => <group key={i} position={[x, -.03, .64]} rotation={[0, .12, .12]} onClick={stop(props, 'cholesterol')}>
      {[0, 1, 2, 3].map(j => <mesh key={j} position={[j % 2 * .055, -.22 + j * .13, 0]}><torusGeometry args={[.085, .024, 7, 6]} /><Surface color={P.amber} selected={selected(props, 'cholesterol')} /></mesh>)}
    </group>)}
    <Carbohydrate props={props} id="glycoprotein" x={-2.35} protein />
    <Carbohydrate props={props} id="glycolipid" x={2.55} />
    {props.labels && <><Caption position={[.2, 2.5, 0]}>EXTRACELLULAR SIDE</Caption><Caption position={[0, -2.15, .4]}>CYTOPLASMIC SIDE</Caption></>}
    <Label id="heads" position={[-2.7, .53, props.cutaway ? 0 : .88]} props={props} offset={[-8, -12]} />
    <Label id="tails" position={[-2.4, -.02, props.cutaway ? 0 : .9]} props={props} offset={[-18, 6]} />
    <Label id="channel" position={[-.8, .8, .1]} props={props} offset={[0, -10]} />
    <Label id="carrier" position={[1.17, -.75, .1]} props={props} offset={[16, 20]} />
    <Label id="cholesterol" position={[.1, 0, .77]} props={props} offset={[0, 8]} />
    <Label id="glycoprotein" position={[-2.5, 1.58, .1]} props={props} offset={[-6, -12]} />
    <Label id="glycolipid" position={[2.5, 1.7, .1]} props={props} offset={[0, -5]} />
  </group>;
}

function Particle({ position, color, water = false }: { position: Point; color: string; water?: boolean }) {
  return <group position={position}>
    <mesh><sphereGeometry args={[water ? .087 : .115, 14, 10]} /><Surface color={color} /></mesh>
    {water && [-1, 1].map(s => <mesh key={s} position={[s * .075, .05, .035]}><sphereGeometry args={[.047, 10, 8]} /><Surface color={P.cream} /></mesh>)}
  </group>;
}

function Vesicle({ props, position, open = false }: { props: SceneProps; position: Point; open?: boolean }) {
  if (!visible('vesicle', props)) return null;
  return <group position={position} onClick={stop(props, 'vesicle')}>
    <mesh rotation={[0, 0, open ? Math.PI / 2 : 0]}><sphereGeometry args={[.56, 30, 20, 0, Math.PI * 2, open ? .55 : 0, open ? Math.PI * .75 : Math.PI]} /><Surface color={P.coral} opacity={.3} selected={selected(props, 'vesicle')} /></mesh>
    {Array.from({ length: open ? 24 : 32 }, (_, i) => {
      const angle = (open ? -.5 : 0) + i / (open ? 23 : 32) * (open ? Math.PI * 1.4 : Math.PI * 2);
      return <mesh key={i} position={[Math.cos(angle) * .54, Math.sin(angle) * .54, .18]}><sphereGeometry args={[.064, 10, 8]} /><Surface color={P.coral} selected={selected(props, 'vesicle')} /></mesh>;
    })}
  </group>;
}

function TransportScene(props: SceneProps) {
  const kind = props.variant || 'simple', direction = props.gradient === 'reverse' ? -1 : 1;
  const active = kind === 'active', osmotic = kind === 'osmosis', bulk = kind === 'endocytosis' || kind === 'exocytosis';
  const allowed = props.energy || !(active || bulk), phase = allowed ? props.step : bulk ? 0 : Math.min(1, props.step);
  const source = active ? -direction : direction, destination = -source;
  const pathY = [source * 1.68, source * .82, destination * .15, destination * 1.55][phase];
  const protein = kind === 'facilitated' || osmotic ? 'channel' : active ? 'carrier' : '';
  const endo = kind === 'endocytosis', vesicleY = endo ? [1.25, .32, -.84, -1.36][phase] : [-1.4, -.75, .12, 1.35][phase];
  const background = Array.from({ length: 14 }, (_, i): Point => [-2.75 + (i % 7) * .42, direction * (1.03 + Math.floor(i / 7) * .43), -.36 + Math.sin(i * 1.3) * .35]);
  return <group rotation={[.06, -.04, 0]}>
    <LipidPatch props={props} transport holes={protein || bulk && phase > 0 && phase < 3 ? [0] : []} />
    {protein && <Protein props={props} id={protein} x={0} open={protein === 'channel'} phase={phase} />}
    {can(props, osmotic ? 'water' : 'solute') && !bulk && <group onClick={stop(props, osmotic ? 'water' : 'solute')}>
      {background.map((p, i) => <Particle key={i} position={p} color={osmotic ? P.blue : P.amber} water={osmotic} />)}
      {Array.from({ length: 4 }, (_, i) => <Particle key={`low${i}`} position={[1.7 + (i % 2) * .42, -direction * (1.12 + Math.floor(i / 2) * .35), -.2]} color={osmotic ? P.blue : P.amber} water={osmotic} />)}
      <Particle position={[0, pathY, .16]} color={osmotic ? P.blue : P.cream} water={osmotic} />
      {phase === 3 && <Particle position={[.33, pathY + .12 * destination, .18]} color={osmotic ? P.blue : P.cream} water={osmotic} />}
    </group>}
    {osmotic && visible('solute', props) && <group onClick={stop(props, 'solute')}>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-2.5 + (i % 5) * .48, -direction * (1.02 + Math.floor(i / 5) * .5), .06]} rotation={[i * .8, .1, i * .6]}><icosahedronGeometry args={[.14, 0]} /><Surface color={P.amber} /></mesh>)}
      {props.labels && <Caption position={[1.8, -direction * 2.04, .1]} tone={P.amber}>Solute stays on its side</Caption>}
    </group>}
    {bulk && <>
      {(endo ? phase > 0 : phase < 3) && <Vesicle props={props} position={[0, vesicleY, .1]} open={endo ? phase === 1 : phase === 2} />}
      {visible('solute', props) && <group onClick={stop(props, 'solute')}>{[-1, 0, 1].map((n, i) => <Particle key={i} position={[n * .19, vesicleY + (i % 2 ? .13 : -.07), .28]} color={P.amber} />)}</group>}
      {(endo ? phase === 1 : phase === 2) && visible('membrane', props) && <Tube points={[[-.72, .48, .1], [-.51, .28 * (endo ? -1 : 1), .1], [0, endo ? -.3 : .64, .1], [.51, .28 * (endo ? -1 : 1), .1], [.72, .48, .1]]} radius={.075} color={P.coral} />}
    </>}
    {(active || bulk) && visible('atp', props) && <group position={[2.25, -.85, .3]} onClick={stop(props, 'atp')}>
      {[0, 1, 2].map(i => <mesh key={i} position={[i * .18 -.18, 0, 0]}><sphereGeometry args={[.12, 12, 9]} /><Surface color={props.energy ? P.amber : '#6b6a66'} /></mesh>)}
      {props.labels && <Caption position={[0, -.33, .08]} tone={props.energy ? P.amber : P.cream}>{props.energy ? 'ATP available' : 'No ATP: transport blocked'}</Caption>}
    </group>}
    {!bulk && allowed && <Arrow from={[.76, source * 1.2, .4]} to={[.76, destination * 1.2, .4]} color={active ? P.violet : P.teal} />}
    {bulk && allowed && <Arrow from={[1, endo ? 1.2 : -1.2, .2]} to={[1, endo ? -1.2 : 1.2, .2]} color={P.teal} />}
    {props.labels && <>
      <Caption position={[-1.35, 2.04, 0]}>{bulk ? 'EXTRACELLULAR FLUID' : osmotic ? direction > 0 ? 'HIGHER WATER POTENTIAL' : 'LOWER WATER POTENTIAL' : direction > 0 ? 'HIGHER SOLUTE CONCENTRATION' : 'LOWER SOLUTE CONCENTRATION'}</Caption>
      <Caption position={[-1.35, -2.04, 0]}>{bulk ? 'CYTOPLASM' : osmotic ? direction > 0 ? 'LOWER WATER POTENTIAL' : 'HIGHER WATER POTENTIAL' : direction > 0 ? 'LOWER SOLUTE CONCENTRATION' : 'HIGHER SOLUTE CONCENTRATION'}</Caption>
      {!allowed && <Caption position={[.1, -.04, 1.1]} tone={P.amber}>Energy required — no transfer</Caption>}
    </>}
    <Label id="membrane" position={[-2.7, .2, .8]} props={props} offset={[0, 12]} />
    {protein && <Label id={protein} position={[0, .65, .3]} props={props} offset={[0, -7]} />}
    {!bulk && <Label id={osmotic ? 'water' : 'solute'} position={[0, pathY, .16]} props={props} offset={[24, 0]} />}
    {bulk && (endo ? phase > 0 : phase < 3) && <Label id="vesicle" position={[0, vesicleY, .2]} props={props} offset={[-42, 0]} />}
  </group>;
}

/** One continuous tube is one chromatid, with an obvious constricted centromere. */
function Chromatid({ position = [0, 0, 0], scale = 1, side = -1, color = P.coral, chosen = false, single = false }: { position?: Point; scale?: number; side?: number; color?: string; chosen?: boolean; single?: boolean }) {
  const points: Point[] = single ? [[-.08, 1.43, .02], [.06, 1.02, .1], [-.05, .47, .03], [0, 0, 0], [.06, -.55, .04], [-.09, -1.06, .1], [.02, -1.48, .02]] : [[side * .49, 1.4, -.02], [side * .44, .96, .04], [side * .2, .36, .04], [side * .105, 0, 0], [side * .28, -.48, .02], [side * .47, -.98, .08], [side * .5, -1.48, .01]];
  return <group position={position} scale={scale}>
    <Tube points={points} radius={.145} color={color} selected={chosen} segments={60} />
    {[points[0], points[points.length - 1]].map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[.145, 16, 12]} /><Surface color={color} selected={chosen} /></mesh>)}
  </group>;
}

function Centromere({ position = [0, 0, .04], scale = 1, chosen = false }: { position?: Point; scale?: number; chosen?: boolean }) {
  return <mesh position={position} scale={[.22 * scale, .14 * scale, .19 * scale]}><sphereGeometry args={[1, 20, 14]} /><Surface color={P.amber} selected={chosen} /></mesh>;
}

function Helix({ props, position = [1.45, .05, 0] }: { props: SceneProps; position?: Point }) {
  const helix = useMemo(() => [-1, 1].map(sign => Array.from({ length: 73 }, (_, i): Point => {
    const t = i / 72, angle = t * Math.PI * 6 + (sign < 0 ? Math.PI : 0);
    return [Math.cos(angle) * .29, -1.5 + t * 3, Math.sin(angle) * .29];
  })), []);
  return <group position={position} onClick={stop(props, 'dna')}>
    {visible('dna', props) && <>
      {helix.map((points, i) => <Tube key={i} points={points} radius={.035} color={i ? P.coral : P.teal} selected={selected(props, 'dna')} />)}
      {Array.from({ length: 25 }, (_, i) => {
        const a = i / 24 * Math.PI * 6;
        return <Tube key={i} points={[[Math.cos(a) * .27, -1.5 + i / 24 * 3, Math.sin(a) * .27], [-Math.cos(a) * .27, -1.5 + i / 24 * 3, -Math.sin(a) * .27]]} radius={.018} color={i % 2 ? P.amber : P.violet} segments={2} />;
      })}
    </>}
  </group>;
}

function Nucleosomes({ props }: { props: SceneProps }) {
  const dna = useMemo(() => Array.from({ length: 140 }, (_, i): Point => {
    const t = i / 139 * 3, bead = Math.min(2, Math.floor(t)), local = t - bead, angle = local * Math.PI * 3.5;
    return [2.48 + Math.cos(angle) * .31, -.95 + bead * .9 + local * .3, Math.sin(angle) * .26];
  }), []);
  return <group>
    {visible('histones', props) && [0, 1, 2].map(i => <group key={i} position={[2.48, -.81 + i * .9, 0]} onClick={stop(props, 'histones')}>
      {Array.from({ length: 8 }, (_, j) => <mesh key={j} position={[Math.cos(j % 4 / 4 * Math.PI * 2) * .13, j < 4 ? -.075 : .075, Math.sin(j % 4 / 4 * Math.PI * 2) * .13]} scale={[1, .85, 1]}><sphereGeometry args={[.12, 14, 10]} /><Surface color={P.amber} selected={selected(props, 'histones')} /></mesh>)}
    </group>)}
    {visible('dna', props) && <group onClick={stop(props, 'dna')}><Tube points={dna} radius={.035} color={P.teal} selected={selected(props, 'dna')} segments={180} /></group>}
  </group>;
}

function ChromosomeScene(props: SceneProps) {
  const replicated = props.step === 1, separated = props.step >= 2;
  const showChromatid = can(props, 'chromatid', 'sisters');
  return <group>
    <group position={[-1.35, 0, .1]}>
      {showChromatid && <group onClick={stop(props, replicated ? 'sisters' : 'chromatid')}>
        {replicated ? (props.isolate && props.selected === 'chromatid' ? [-1] : [-1, 1]).map(side => <Chromatid key={side} side={side} color={P.coral} chosen={selected(props, 'sisters') || selected(props, 'chromatid')} />) : separated ? [-1, 1].map(side => <Chromatid key={side} position={[side * .68, 0, 0]} single color={side > 0 ? P.coral : P.rose} chosen={selected(props, 'chromatid')} />) : <Chromatid single chosen={selected(props, 'chromatid')} />}
      </group>}
      {visible('centromere', props) && <group onClick={stop(props, 'centromere')}>{separated ? [-1, 1].map(side => <Centromere key={side} position={[side * .68, 0, .09]} chosen={selected(props, 'centromere')} />) : <Centromere chosen={selected(props, 'centromere')} />}</group>}
      {visible('telomeres', props) && <group onClick={stop(props, 'telomeres')}>{(replicated || separated ? [-1, 1] : [0]).flatMap((side, j) => [-1, 1].map(end => <mesh key={`${j}-${end}`} position={[replicated ? side * .5 : separated ? side * .68 : 0, end * 1.43, .075]} scale={[.16, .09, .16]}><sphereGeometry args={[1, 16, 10]} /><Surface color={P.cream} selected={selected(props, 'telomeres')} /></mesh>))}</group>}
      {props.labels && <Caption position={[0, -1.95, .1]}>{replicated ? '1 chromosome · 2 sister chromatids' : separated ? '2 daughter chromosomes' : '1 chromosome · 1 chromatid'}</Caption>}
    </group>
    <Helix props={props} position={[.75, 0, 0]} />
    <Nucleosomes props={props} />
    {visible('dna', props) && showChromatid && <Tube points={[[-.85, .95, .1], [-.42, 1.4, -.2], [.2, 1.52, -.1], [.7, 1.45, 0]]} radius={.015} color={P.cream} opacity={.5} />}
    <Label id={replicated ? 'sisters' : 'chromatid'} position={[-1.6, 1.57, .15]} props={props} offset={[-5, -5]} />
    <Label id="centromere" position={[-1.35, 0, .25]} props={props} offset={[-40, 0]} />
    <Label id="telomeres" position={[-1.35, -1.48, .15]} props={props} offset={[-43, 4]} />
    <Label id="dna" position={[.75, 1.55, .1]} props={props} offset={[0, -8]} />
    <Label id="histones" position={[2.5, 1.2, .1]} props={props} offset={[0, -10]} />
    {props.labels && <Caption position={[2.48, -1.75, .1]}>DNA wrapped around histones</Caption>}
  </group>;
}

function CellEnvelope({ position = [0, 0, 0], scale = [2.85, 2.04, 1.1], props }: { position?: Point; scale?: Point; props: SceneProps }) {
  if (!visible('membrane', props)) return null;
  return <group position={position} onClick={stop(props, 'membrane')}>
    <group scale={scale}><mesh rotation={[Math.PI / 2, 0, 0]}><sphereGeometry args={[1, 48, 30, 0, Math.PI * 2, props.cutaway ? Math.PI / 2 : 0, props.cutaway ? Math.PI / 2 : Math.PI]} /><Surface color={P.coral} opacity={props.cutaway ? .17 : .1} selected={selected(props, 'membrane')} /></mesh></group>
    <mesh scale={[scale[0], scale[1], 1]}><torusGeometry args={[1, .016, 8, 80]} /><Surface color={P.coral} opacity={.7} selected={selected(props, 'membrane')} /></mesh>
  </group>;
}

function NuclearEnvelope({ position, scale = [1.4, 1.3, .65], props }: { position: Point; scale?: Point; props: SceneProps }) {
  if (!visible('nucleus', props)) return null;
  return <mesh position={position} scale={scale} onClick={stop(props, 'nucleus')}><sphereGeometry args={[1, 36, 24]} /><Surface color={P.violet} opacity={.12} selected={selected(props, 'nucleus')} /></mesh>;
}

function Threads({ props, centre = [0, 0, 0], copies = false, partial = false, small = false }: { props: SceneProps; centre?: Point; copies?: boolean; partial?: boolean; small?: boolean }) {
  if (!visible('chromosomes', props)) return null;
  return <group position={centre} scale={small ? .64 : 1} onClick={stop(props, 'chromosomes')}>
    {[0, 1, 2, 3].flatMap((i) => (copies ? [0, 1] : [0]).map(copy => {
      const points = Array.from({ length: partial && copy ? 16 : 32 }, (_, j): Point => {
        const t = j / 31, angle = t * Math.PI * 4.7 + i * 1.7;
        return [Math.cos(angle) * (.44 + i * .045) + (i % 2 ? .34 : -.34) + copy * .07, -1.02 + t * 2.04, Math.sin(angle) * .23 + (i < 2 ? -.1 : .1) + copy * .045];
      });
      return <Tube key={`${i}-${copy}`} points={points} radius={.026} color={i < 2 ? P.coral : P.teal} opacity={partial && copy ? .55 : 1} selected={selected(props, 'chromosomes')} segments={60} />;
    }))}
  </group>;
}

function Pole({ position, props }: { position: Point; props: SceneProps }) {
  if (!visible('poles', props)) return null;
  return <group position={position} onClick={stop(props, 'poles')}>
    {[-1, 1].map((s, i) => <mesh key={i} rotation={[0, 0, i ? Math.PI / 2 : 0]} position={[s * .06, 0, .08]}><cylinderGeometry args={[.065, .065, .24, 12]} /><Surface color={P.amber} selected={selected(props, 'poles')} /></mesh>)}
    {Array.from({ length: 8 }, (_, i) => { const angle = i / 8 * Math.PI * 2; return <Tube key={i} points={[[0, 0, 0], [Math.cos(angle) * .36, Math.sin(angle) * .36, -.02]]} radius={.01} color={P.amber} opacity={.5} segments={2} />; })}
  </group>;
}

function DivisionScene(props: SceneProps) {
  const step = props.step, interphase = step < 3, late = step >= 6, divided = step === 7;
  const chromosomeY = [-1.05, -.35, .35, 1.05];
  const chromosomes = step === 3 ? [[-.77, -.64], [.52, -.67], [-.65, .65], [.66, .62]] : chromosomeY.map(y => [0, y]);
  return <group>
    {divided ? [-1, 1].map(s => <CellEnvelope key={s} position={[s * 1.55, 0, 0]} scale={[1.35, 1.73, .85]} props={props} />) : <CellEnvelope props={props} />}
    {interphase && <><NuclearEnvelope props={props} position={[0, 0, -.03]} /><Threads props={props} copies={step > 0} partial={step === 1} /></>}
    {late && [-1, 1].map(s => <group key={s}><NuclearEnvelope props={props} position={[s * 1.48, 0, -.04]} scale={[.94, 1.05, .62]} /><Threads props={props} centre={[s * 1.48, 0, .02]} small /></group>)}
    {step === 3 && visible('nucleus', props) && <group onClick={stop(props, 'nucleus')}>
      {[0, 1, 2, 3, 4].map(i => <mesh key={i} rotation={[0, 0, i * 1.23]} scale={[1.42, 1.3, .7]}><torusGeometry args={[1, .015, 8, 14, .45]} /><Surface color={P.violet} opacity={.45} /></mesh>)}
    </group>}
    {step >= 3 && step <= 5 && <>
      {[-1, 1].map(s => <Pole key={s} position={[s * 2.35, 0, -.08]} props={props} />)}
      {visible('chromosomes', props) && <group onClick={stop(props, 'chromosomes')}>
        {step < 5 ? chromosomes.map(([x, y], i) => <group key={i} position={[x, y, .04]} scale={.36}>
          {[-1, 1].map(s => <Chromatid key={s} side={s} color={i < 2 ? P.coral : P.teal} chosen={selected(props, 'chromosomes')} />)}<Centromere />
        </group>) : [-1, 1].flatMap(s => chromosomeY.map((y, i) => {
          const x = s * 1.32;
          return <group key={`${s}-${i}`}><Tube points={[[x - s * .24, y + .2, 0], [x, y, .08], [x - s * .24, y - .2, 0]]} radius={.071} color={i < 2 ? P.coral : P.teal} selected={selected(props, 'chromosomes')} segments={24} /><Centromere position={[x, y, .1]} scale={.4} /></group>;
        }))}
      </group>}
      {visible('spindle', props) && <group onClick={stop(props, 'spindle')}>
        {[-1, 1].flatMap(s => chromosomeY.map((y, i) => {
          const endpoint: Point = step === 5 ? [s * 1.32, y, -.04] : [step === 3 ? chromosomes[i][0] : s * .055, step === 3 ? chromosomes[i][1] : y, -.04];
          return <Tube key={`${s}-${i}`} points={[[s * 2.35, 0, -.08], [s * 1.55, y * .67, -.28], endpoint]} radius={.016} color={P.cream} opacity={.8} selected={selected(props, 'spindle')} segments={32} />;
        }))}
      </group>}
    </>}
    {step === 6 && visible('membrane', props) && <mesh rotation={[0, Math.PI / 2, 0]} scale={[.58, 1.46, 1]} onClick={stop(props, 'membrane')}><torusGeometry args={[1, .035, 10, 70]} /><Surface color={P.coral} /></mesh>}
    {props.labels && <Caption position={[0, -2.38, .1]}>{step === 0 ? 'G1 · 2n = 4 · 2C DNA' : step === 1 ? 'S phase · DNA replication · 2C → 4C' : step < 5 ? '2n = 4 · 4C DNA · 8 chromatids' : step === 5 ? '8 daughter chromosomes in the dividing cell' : step === 6 ? 'Each new nucleus: 2n = 4 · 2C DNA' : 'Each daughter cell: 2n = 4 · 2C DNA'}</Caption>}
    {interphase && <Label id="nucleus" position={[1.1, 1.05, .2]} props={props} offset={[6, -5]} />}
    {step >= 3 && step <= 5 && <><Label id="spindle" position={[-1.45, .82, -.1]} props={props} offset={[-10, -8]} /><Label id="poles" position={[2.35, .05, .2]} props={props} offset={[0, 25]} /></>}
    <Label id="chromosomes" position={interphase ? [-.65, .7, .5] : late ? [-1.45, .5, .4] : [0, 1.25, .25]} props={props} offset={[0, -10]} />
    <Label id="membrane" position={divided ? [-2.75, -.15, .1] : [-2.65, -.55, .1]} props={props} offset={[-4, 10]} />
  </group>;
}

export default function ASScenes(props: SceneProps) {
  if (props.moduleId === 'BIO-010') return <MembraneScene {...props} />;
  if (props.moduleId === 'BIO-011') return <TransportScene {...props} />;
  if (props.moduleId === 'BIO-013') return <ChromosomeScene {...props} />;
  if (props.moduleId === 'BIO-014') return <DivisionScene {...props} />;
  return null;
}
