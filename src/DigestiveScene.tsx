import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ORGANS, type OrganId } from './content';
import { COLON_RADII, digestiveTube, LARGE_INTESTINE, makeCurve, OESOPHAGUS, SMALL_INTESTINE, SMALL_RADII, STOMACH, stomachGeometry, torsoGeometry, type Point3 } from './digestiveGeometry';
import { OrganMaterial, SurfaceProvider } from './digestiveMaterials';

export interface DigestiveSceneProps {
  selectedId: OrganId;
  mode: 'explore' | 'journey';
  step: number;
  playing: boolean;
  reducedMotion: boolean;
  labels: boolean;
  context: boolean;
  isolate: boolean;
  hiddenIds: OrganId[];
  cameraCommand: { type: 'reset' | 'left' | 'right' | 'up' | 'down' | 'zoom-in' | 'zoom-out' | 'front'; seq: number };
  onSelect: (id: OrganId) => void;
  onReady: () => void;
  onError: (message: string) => void;
}

const STEP_ORGANS: OrganId[] = ['mouth', 'oesophagus', 'stomach', 'small-intestine', 'large-intestine', 'anus'];
const EXPOSED_SMALL_FOLD = SMALL_INTESTINE.find(([x, y, z]) => x > 1.05 && y < -.4 && y > -1.1 && z > .65) ?? SMALL_INTESTINE[9];
const LABEL_ANCHORS: Record<OrganId, Point3> = {
  mouth: [.48, 5.02, .38], oesophagus: [-.12, 3.45, .12], stomach: [1.93, 1.66, .35],
  'small-intestine': [EXPOSED_SMALL_FOLD[0] + .13, EXPOSED_SMALL_FOLD[1], EXPOSED_SMALL_FOLD[2] + .05],
  'large-intestine': [-2.24, -1.88, .12], anus: [.05, -4.18, .15],
};
const LABEL_OFFSETS: Record<OrganId, [number, number]> = {
  mouth: [46, -15], oesophagus: [-57, 0], stomach: [57, -6],
  'small-intestine': [60, 4], 'large-intestine': [-51, 12], anus: [53, 17],
};
const ignoreRaycast = () => {};
const isVisible = (id: OrganId, props: DigestiveSceneProps) => !props.hiddenIds.includes(id) && (!props.isolate || props.selectedId === id);

function useGeometry(factory: () => THREE.BufferGeometry, dependencies: unknown[]) {
  const geometry = useMemo(factory, dependencies);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function OrganTube({ id, points, radius, segments = 120, openAngle = 0, haustra = 0, selected, onSelect }: {
  id: OrganId; points: Point3[]; radius: number | number[]; segments?: number; openAngle?: number; haustra?: number;
  selected: boolean; onSelect: (id: OrganId) => void;
}) {
  const geometry = useGeometry(() => digestiveTube(points, radius, segments, 20, openAngle, haustra), [points, radius, segments, openAngle, haustra]);
  return <mesh geometry={geometry} castShadow receiveShadow onClick={(event) => { event.stopPropagation(); onSelect(id); }}>
    <OrganMaterial id={id} selected={selected} />
  </mesh>;
}

function Mouth({ selected, onSelect }: { selected: boolean; onSelect: (id: OrganId) => void }) {
  const cavity = useGeometry(() => {
    const next = new THREE.SphereGeometry(1, 40, 28, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    next.rotateX(Math.PI / 2); return next;
  }, []);
  const tooth = useGeometry(() => new RoundedBoxGeometry(1, 1, 1, 3, .19), []);
  const lipPaths = useMemo(() => [
    [[-.58, 0, .08], [-.4, .19, .18], [-.17, .24, .23], [0, .2, .25], [.17, .24, .23], [.4, .19, .18], [.58, 0, .08]],
    [[-.58, 0, .08], [-.34, -.24, .18], [0, -.29, .24], [.34, -.24, .18], [.58, 0, .08]],
  ] as Point3[][], []);
  const gums = useMemo(() => [-1, 1].map((sign) => Array.from({ length: 17 }, (_, i): Point3 => {
    const a = -1.35 + i / 16 * 2.7;
    return [Math.sin(a) * .46, sign * (.15 + Math.abs(a) * .015), .19 - (1 - Math.cos(a)) * .42];
  })), []);
  return <group position={[0, 4.98, .03]} onClick={(event) => { event.stopPropagation(); onSelect('mouth'); }}>
    <mesh geometry={cavity} scale={[.62, .37, .47]}>
      <meshPhysicalMaterial color="#713941" roughness={.54} clearcoat={.05} side={THREE.DoubleSide} />
    </mesh>
    {lipPaths.map((points, i) => <OralTissuePath key={i} points={points} radius={i ? .07 : .06} selected={selected} />)}
    {gums.map((points, i) => <OralTissuePath key={`gum-${i}`} points={points} radius={.065} selected={false} />)}
    <mesh position={[0, -.115, -.015]} rotation={[.1, 0, 0]} scale={[.34, .105, .3]}>
      <sphereGeometry args={[1, 32, 22]} /><meshPhysicalMaterial color="#b66877" roughness={.52} clearcoat={.09} />
    </mesh>
    {Array.from({ length: 11 }, (_, i) => {
      const a = (i - 5) * .24, back = Math.abs(i - 5) > 2;
      return <group key={i}>
        {[-1, 1].map((sign) => <mesh key={sign} geometry={tooth}
          position={[Math.sin(a) * .43, sign * .12, .235 - (1 - Math.cos(a)) * .42]}
          scale={[back ? .11 : .088, back ? .11 : .13, back ? .12 : .075]} rotation={[sign * .08, -a, 0]}>
          <meshPhysicalMaterial color={sign > 0 ? '#f6efdf' : '#eadfcb'} roughness={.35} clearcoat={.1} />
        </mesh>)}
      </group>;
    })}
  </group>;
}

function OralTissuePath({ points, radius, selected }: { points: Point3[]; radius: number; selected: boolean }) {
  const geometry = useGeometry(() => new THREE.TubeGeometry(makeCurve(points), 44, radius, 12), [points, radius]);
  return <mesh geometry={geometry}><OrganMaterial id="mouth" selected={selected} /></mesh>;
}

function StomachFold({ points }: { points: Point3[] }) {
  const geometry = useGeometry(() => new THREE.TubeGeometry(makeCurve(points), 28, .035, 8), [points]);
  return <mesh geometry={geometry}><meshStandardMaterial color="#dc9c90" roughness={.55} /></mesh>;
}

function Stomach({ selected, cutaway, onSelect }: { selected: boolean; cutaway: boolean; onSelect: (id: OrganId) => void }) {
  const geometry = useGeometry(() => stomachGeometry(cutaway), [cutaway]);
  const lining = useGeometry(() => stomachGeometry(cutaway, true), [cutaway]);
  const folds = useMemo(() => {
    const paths = [
    [[.83, 2.31, -.14], [1.13, 2.12, -.17], [1.29, 1.77, -.23], [1.26, 1.4, -.23], [.91, 1.11, -.18]],
    [[1.11, 2.39, -.14], [1.4, 2.12, -.19], [1.5, 1.77, -.25], [1.43, 1.34, -.21], [1.05, 1.04, -.16]],
    [[1.36, 2.32, -.11], [1.63, 2.03, -.17], [1.67, 1.68, -.21], [1.53, 1.22, -.15], [1.16, .97, -.1]],
    ] as Point3[][];
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const innerWall = new THREE.Mesh(lining, material);
    innerWall.updateMatrixWorld();
    const raycaster = new THREE.Raycaster();
    const attached = paths.map((points) => points.map(([x, y, fallbackZ]): Point3 => {
      raycaster.set(new THREE.Vector3(x, y, 1), new THREE.Vector3(0, 0, -1));
      const hit = raycaster.intersectObject(innerWall)[0];
      return [x, y, hit ? hit.point.z + .023 : fallbackZ];
    }));
    material.dispose(); return attached;
  }, [lining]);
  return <group onClick={(event) => { event.stopPropagation(); onSelect('stomach'); }}>
    <mesh geometry={geometry} castShadow receiveShadow><OrganMaterial id="stomach" selected={selected} /></mesh>
    {cutaway && <>
      <mesh geometry={lining}><OrganMaterial id="stomach" selected={selected} interior /></mesh>
      {folds.map((points, i) => <StomachFold key={i} points={points} />)}
    </>}
  </group>;
}

function Anus({ selected, onSelect }: { selected: boolean; onSelect: (id: OrganId) => void }) {
  const outlet: Point3[] = useMemo(() => [[0, -4.04, .01], [0, -4.22, .025]], []);
  return <group onClick={(event) => { event.stopPropagation(); onSelect('anus'); }}>
    <OrganTube id="anus" points={outlet} radius={.17} segments={10} selected={selected} onSelect={onSelect} />
    <mesh position={[0, -4.24, .045]} rotation={[.87, 0, 0]}>
      <torusGeometry args={[.17, .055, 12, 32]} /><OrganMaterial id="anus" selected={selected} />
    </mesh>
    <mesh position={[0, -4.24, .035]} rotation={[.87, 0, 0]}>
      <circleGeometry args={[.14, 32]} /><meshStandardMaterial color="#34202e" roughness={.65} side={THREE.DoubleSide} />
    </mesh>
  </group>;
}

function BodyContext() {
  const geometry = useGeometry(torsoGeometry, []);
  return <group raycast={ignoreRaycast}>
    <mesh geometry={geometry} position={[0, 0, -1.36]} raycast={ignoreRaycast}>
      <meshStandardMaterial color="#91a6a5" opacity={.065} transparent roughness={.8} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 5.02, -.64]} scale={[.86, 1.05, .45]} raycast={ignoreRaycast}>
      <sphereGeometry args={[1, 36, 24]} /><meshStandardMaterial color="#7c9da3" opacity={.055} transparent depthWrite={false} roughness={.86} />
    </mesh>
    <mesh position={[0, 3.98, -.55]} raycast={ignoreRaycast}>
      <cylinderGeometry args={[.43, .58, .98, 24]} /><meshStandardMaterial color="#7c9da3" opacity={.06} transparent depthWrite={false} roughness={.85} />
    </mesh>
  </group>;
}

function DigestiveModel(props: DigestiveSceneProps) {
  const { selectedId, onSelect } = props;
  return <>
    {props.context && !props.isolate && <BodyContext />}
    {isVisible('mouth', props) && <Mouth selected={selectedId === 'mouth'} onSelect={onSelect} />}
    {isVisible('oesophagus', props) && <OrganTube id="oesophagus" points={OESOPHAGUS} radius={.18} segments={100}
      openAngle={props.mode === 'journey' && props.step === 1 ? 1.45 : 0} selected={selectedId === 'oesophagus'} onSelect={onSelect} />}
    {isVisible('stomach', props) && <Stomach selected={selectedId === 'stomach'} cutaway={props.mode === 'journey' && props.step === 2} onSelect={onSelect} />}
    {isVisible('small-intestine', props) && <OrganTube id="small-intestine" points={SMALL_INTESTINE} radius={SMALL_RADII} segments={720}
      selected={selectedId === 'small-intestine'} onSelect={onSelect} />}
    {isVisible('large-intestine', props) && <OrganTube id="large-intestine" points={LARGE_INTESTINE} radius={COLON_RADII} segments={390} haustra={27}
      selected={selectedId === 'large-intestine'} onSelect={onSelect} />}
    {isVisible('anus', props) && <Anus selected={selectedId === 'anus'} onSelect={onSelect} />}
  </>;
}

function Arrow({ start, direction, length = .7, color, opacity = 1 }: {
  start: Point3; direction: Point3; length?: number; color: string; opacity?: number;
}) {
  const rotation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...direction).normalize()), [direction]);
  return <group position={start} quaternion={rotation} raycast={ignoreRaycast}>
    <mesh position={[0, length * .43, 0]} raycast={ignoreRaycast}>
      <cylinderGeometry args={[.022, .022, length * .78, 8]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
    <mesh position={[0, length * .89, 0]} raycast={ignoreRaycast}>
      <coneGeometry args={[.08, .19, 12]} /><meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  </group>;
}

/** One isolated deterministic step. Motion advances only while explicitly playing. */
function FoodJourney(props: DigestiveSceneProps) {
  const phase = useRef(.45), marker = useRef<THREE.Group>(null), wave = useRef<THREE.Mesh>(null);
  const particles = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const curves = useMemo(() => ({ oesophagus: makeCurve(OESOPHAGUS), stomach: makeCurve(STOMACH), small: makeCurve(SMALL_INTESTINE), large: makeCurve(LARGE_INTESTINE) }), []);
  const active = props.mode === 'journey' && isVisible(STEP_ORGANS[props.step], props);
  useEffect(() => { phase.current = .45; invalidate(); }, [props.step, props.mode, props.reducedMotion]);
  useFrame((_, delta) => {
    const running = active && props.playing && !props.reducedMotion;
    if (running) { phase.current = (phase.current + Math.min(delta, .06) / 7.5) % 1; invalidate(); }
    const t = phase.current;
    if (marker.current) {
      if (props.step === 0) {
        marker.current.position.set(0, 4.97, .31);
        const shrink = 1.2 - t * .55;
        marker.current.scale.set(shrink, shrink * (.8 + Math.cos(t * Math.PI * 10) * .07), shrink);
      } else if (props.step === 1) {
        marker.current.position.copy(curves.oesophagus.getPointAt(.08 + t * .8));
        marker.current.scale.setScalar(.85);
        if (wave.current) {
          wave.current.position.copy(curves.oesophagus.getPointAt(Math.max(.01, t * .8 - .04)));
          wave.current.scale.setScalar(.83 + Math.sin(t * Math.PI * 5) * .08);
        }
      } else if (props.step === 2) {
        marker.current.position.copy(curves.stomach.getPointAt(.2 + t * .65));
        marker.current.position.x += Math.cos(t * Math.PI * 4) * .065;
        marker.current.position.y += Math.sin(t * Math.PI * 4) * .075;
        marker.current.position.z = .04;
        marker.current.scale.setScalar(.9 - t * .42);
      } else if (props.step === 3) {
        marker.current.position.copy(curves.small.getPointAt(.13 + t * .74)); marker.current.position.z += .24;
        marker.current.scale.setScalar(.42);
      } else if (props.step === 4) {
        marker.current.position.copy(curves.large.getPointAt(.08 + t * .79)); marker.current.position.z += .34;
        marker.current.scale.setScalar(.67);
      } else {
        marker.current.position.set(0, -3.93 - t * .95, .24); marker.current.scale.setScalar(.74);
      }
    }
    if (particles.current) particles.current.rotation.z = props.step === 2 ? -t * Math.PI * 2 : 0;
  });
  if (!active) return null;
  return <group raycast={ignoreRaycast}>
    <group ref={marker}>
      <group ref={particles}>
        {(props.step === 2 || props.step === 3 ? [0, 1, 2, 3, 4] : [0, 1, 2]).map((i) => <mesh key={i}
          position={[Math.cos(i * 2.4) * .095, Math.sin(i * 2.4) * .085, i * .018]} raycast={ignoreRaycast}>
          <sphereGeometry args={[props.step === 2 || props.step === 3 ? .075 : .103, 16, 12]} />
          <meshStandardMaterial color={props.step >= 4 ? '#9b6542' : '#f1d68f'} emissive="#bf7c2b" emissiveIntensity={.13} roughness={.58} />
        </mesh>)}
      </group>
    </group>
    {props.step === 1 && <mesh ref={wave} rotation={[Math.PI / 2, 0, 0]} raycast={ignoreRaycast}>
      <torusGeometry args={[.185, .04, 10, 24]} /><meshStandardMaterial color="#f7d8ac" emissive="#f0c28a" emissiveIntensity={.15} roughness={.5} />
    </mesh>}
    {props.step === 1 && <Arrow start={[.48, 3.88, .13]} direction={[0, -1, 0]} length={1.12} color="#f2d69a" />}
    {props.step === 5 && <Arrow start={[.43, -4.05, .13]} direction={[0, -1, 0]} length={.83} color="#e8c599" />}
  </group>;
}

/** A labelled wall detail separates absorption from the anatomical food route. */
function AbsorptionDetail({ water, playing, reducedMotion }: { water: boolean; playing: boolean; reducedMotion: boolean }) {
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const phase = useRef(.45);
  const paint = () => dots.current.forEach((dot, i) => {
    const t = (phase.current + (i % 3) / 3) % 1;
    dot?.setAttribute('cx', String(65 + t * 290));
  });
  useLayoutEffect(() => { phase.current = .45; paint(); }, [water]);
  useEffect(() => {
    if (!playing || reducedMotion) { paint(); return; }
    let frame = 0, previous = 0;
    const tick = (time: number) => {
      if (previous) phase.current = (phase.current + Math.min((time - previous) / 1000, .06) / 3.4) % 1;
      previous = time; paint(); frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, reducedMotion, water]);
  const tint = water ? '#8DE9F5' : '#FFE28A';
  const wall = water ? organColorForDetail('large-intestine') : organColorForDetail('small-intestine');
  return <div className="absorption-detail" style={{ height: 192, boxSizing: 'border-box', padding: '10px 13px 30px',
    background: '#12242d', borderTop: '1px solid #45606b', color: '#edf5f7', position: 'relative' }}>
    <div className="absorption-detail-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      fontSize: 10, lineHeight: 1.5, fontWeight: 600, marginBottom: 4 }}>
      <span>Schematic detail · enlarged intestinal wall</span>
      <span style={{ color: tint, whiteSpace: 'nowrap' }}>{water ? 'Remaining water' : 'Nutrients'}</span>
    </div>
    <svg viewBox="0 0 420 122" role="img" aria-label={`${water ? 'Water moves' : 'Nutrients move'} from inside the intestine, through its wall, into the body. This schematic detail is enlarged.`}
      style={{ display: 'block', width: '100%', height: 118, overflow: 'visible' }}>
      <rect x="6" y="29" width="190" height="85" rx="8" fill="#213842" />
      <rect x="224" y="29" width="190" height="85" rx="8" fill="#1a303a" />
      <rect x="198" y="27" width="24" height="90" rx="5" fill={wall} stroke="#edf5f7" strokeWidth="1.5" />
      <rect x="204" y="28" width="4" height="88" rx="2" fill="#fff2cf" fillOpacity=".5" />
      <text x="93" y="18" textAnchor="middle" fill="#f5f8fa" fontSize="12" fontWeight="600">Inside the intestine</text>
      <text x="210" y="18" textAnchor="middle" fill="#f5f8fa" fontSize="12" fontWeight="600">Wall</text>
      <text x="324" y="18" textAnchor="middle" fill="#f5f8fa" fontSize="13" fontWeight="600">Into the body</text>
      {[54, 93].map((y) => <g key={y}>
        <line x1="61" y1={y} x2="342" y2={y} stroke="#08161d" strokeWidth="11" strokeLinecap="round" />
        <line x1="61" y1={y} x2="342" y2={y} stroke={tint} strokeWidth="5" strokeLinecap="round" />
        <path d={`M338 ${y - 10}L359 ${y}L338 ${y + 10}Z`} fill={tint} stroke="#08161d" strokeWidth="1" />
      </g>)}
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} ref={(element) => { dots.current[i] = element; }}
        cx={65 + ((.45 + (i % 3) / 3) % 1) * 290} cy={i < 3 ? 54 : 93} r="5.5" fill={tint} stroke="#12242d" strokeWidth="2" />)}
    </svg>
  </div>;
}

const organColorForDetail = (id: OrganId) => ORGANS.find((organ) => organ.id === id)!.color;

function CameraRig({ command }: { command: DigestiveSceneProps['cameraCommand'] }) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera, size, invalidate } = useThree();
  const fit = Math.max(1, .72 / (Math.max(size.width, 1) / Math.max(size.height, 1)));
  const previousFit = useRef(fit);
  const reset = () => {
    const target = new THREE.Vector3(0, .47, 0);
    camera.position.copy(new THREE.Vector3(.18, .065, 1).normalize().multiplyScalar(17.3 * fit)).add(target);
    controls.current?.target.copy(target); camera.lookAt(target); controls.current?.update(); invalidate();
  };
  useEffect(reset, []);
  useEffect(() => {
    const ratio = fit / previousFit.current; previousFit.current = fit;
    if (!controls.current || Math.abs(ratio - 1) < 1e-6) return;
    const target = controls.current.target, offset = camera.position.clone().sub(target);
    camera.position.copy(target).add(offset.setLength(THREE.MathUtils.clamp(offset.length() * ratio, 7, 30)));
    controls.current.update(); invalidate();
  }, [fit]);
  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    if (command.type === 'reset') reset();
    else if (command.type === 'front') {
      orbit.target.set(0, .47, 0); camera.position.set(0, .47, 16.6 * fit); orbit.update(); invalidate();
    } else {
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
      if (command.type === 'left') spherical.theta -= Math.PI / 12;
      if (command.type === 'right') spherical.theta += Math.PI / 12;
      if (command.type === 'up') spherical.phi = Math.max(.15, spherical.phi - Math.PI / 12);
      if (command.type === 'down') spherical.phi = Math.min(Math.PI - .15, spherical.phi + Math.PI / 12);
      if (command.type === 'zoom-in') spherical.radius = Math.max(7, spherical.radius * .85);
      if (command.type === 'zoom-out') spherical.radius = Math.min(30, spherical.radius / .85);
      camera.position.copy(orbit.target).add(new THREE.Vector3().setFromSpherical(spherical)); orbit.update(); invalidate();
    }
  }, [command.seq]);
  return <OrbitControls ref={controls} makeDefault enableDamping={false} enablePan={false}
    minDistance={7} maxDistance={30} minPolarAngle={.12} maxPolarAngle={Math.PI - .12} rotateSpeed={.65} />;
}

interface LabelPoint { id: OrganId; x: number; y: number; visible: boolean }
interface LabelProjection { width: number; height: number; points: LabelPoint[] }
function ProjectLabels({ props, onProject }: { props: DigestiveSceneProps; onProject: (next: LabelProjection) => void }) {
  const { camera, size, invalidate } = useThree();
  const ids = props.labels ? ORGANS.filter((organ) => isVisible(organ.id, props)).map((organ) => organ.id) : [];
  useEffect(() => { invalidate(); }, [ids.join('|'), invalidate]);
  useFrame(() => {
    camera.updateMatrixWorld();
    const points = ids.map((id) => {
      const projected = new THREE.Vector3(...LABEL_ANCHORS[id]).project(camera);
      return { id, x: Math.round((projected.x / 2 + .5) * size.width * 10) / 10,
        y: Math.round((-.5 * projected.y + .5) * size.height * 10) / 10,
        visible: projected.z >= -1 && projected.z <= 1 };
    });
    onProject({ width: size.width, height: size.height, points });
  });
  return null;
}

function OrganLabel({ point, width, height, selected, onSelect }: {
  point: LabelPoint; width: number; height: number; selected: boolean; onSelect: (id: OrganId) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null), [dimensions, setDimensions] = useState({ width: 88, height: 30 });
  useLayoutEffect(() => {
    const element = ref.current; if (!element) return;
    const measure = () => setDimensions((previous) => previous.width === element.offsetWidth && previous.height === element.offsetHeight
      ? previous : { width: element.offsetWidth, height: element.offsetHeight });
    measure(); const observer = new ResizeObserver(measure); observer.observe(element); return () => observer.disconnect();
  }, []);
  const organ = ORGANS.find((item) => item.id === point.id)!;
  const [ox, oy] = LABEL_OFFSETS[point.id];
  const x = THREE.MathUtils.clamp(point.x + ox, dimensions.width / 2 + 9, width - dimensions.width / 2 - 9);
  const y = THREE.MathUtils.clamp(point.y + oy, dimensions.height / 2 + 12, height - dimensions.height / 2 - 12);
  return <>
    <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      <line x1={point.x} y1={point.y} x2={x} y2={y} stroke={organ.color} strokeOpacity=".75" strokeWidth="1" />
      <circle cx={point.x} cy={point.y} r="2.5" fill={organ.color} />
    </svg>
    <button ref={ref} className={`mesh-label organ-mesh-label${selected ? ' is-selected' : ''}`} type="button"
      style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', pointerEvents: 'auto', maxWidth: 'calc(100% - 18px)' }}
      onClick={() => onSelect(point.id)} aria-label={`Select ${organ.en}`} aria-pressed={selected}>
      <span className="label-dot organ-label-dot" style={{ background: organ.color }} /><span>{organ.en}</span>
    </button>
  </>;
}

function RuntimeStatus({ onReady, onError }: Pick<DigestiveSceneProps, 'onReady' | 'onError'>) {
  const ready = useRef(false); const { gl } = useThree();
  useFrame(() => { if (!ready.current) { ready.current = true; onReady(); } });
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onError('The WebGL connection was lost. Reload the model or use the 2D diagram.'); };
    gl.domElement.addEventListener('webglcontextlost', lost); return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

export default function DigestiveScene(props: DigestiveSceneProps) {
  const [projection, setProjection] = useState<LabelProjection>({ width: 1, height: 1, points: [] });
  const onProject = useCallback((next: LabelProjection) => {
    setProjection((previous) => previous.width === next.width && previous.height === next.height && previous.points.length === next.points.length
      && previous.points.every((point, i) => point.id === next.points[i].id && point.x === next.points[i].x && point.y === next.points[i].y && point.visible === next.points[i].visible)
      ? previous : next);
  }, []);
  const absorptionVisible = props.mode === 'journey' && (props.step === 3 || props.step === 4) && isVisible(STEP_ORGANS[props.step], props);
  return <div className="digestive-scene-root" style={{ position: 'relative', height: '100%', width: '100%' }}>
    <div className="digestive-scene-viewport" style={{ position: 'relative', height: absorptionVisible ? 'calc(100% - 192px)' : '100%', width: '100%' }}>
    <Canvas className="digestive-canvas" frameloop="demand" dpr={[1, 1.65]} shadows camera={{ position: [3, 1.58, 17], fov: 38, near: .1, far: 70 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }} onCreated={({ gl }) => {
        gl.setClearColor('#111d27', 0); gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.02;
      }}>
      <ambientLight intensity={.37} /><hemisphereLight args={['#c7d6e3', '#252332', .77]} />
      <directionalLight position={[-4, 7, 8]} intensity={3} color="#fff1e4" castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={7} shadow-camera-bottom={-7}
        shadow-bias={-.0003} shadow-normalBias={.035} />
      <directionalLight position={[5, 1, 3]} intensity={.95} color="#c8dcef" />
      <directionalLight position={[1, 4, -5]} intensity={1.8} color="#a6d7d3" />
      <Environment frames={1} resolution={128} environmentIntensity={.5}>
        <Lightformer form="rect" position={[-5, 6, 7]} target={[0, .5, 0]} scale={[5, 7, 1]} intensity={2.6} color="#fff1df" />
        <Lightformer form="rect" position={[5, 1, 2]} target={[0, .5, 0]} scale={[2, 8, 1]} intensity={1.2} color="#c9dcf1" />
        <Lightformer form="rect" position={[0, 4, -6]} target={[0, .5, 0]} scale={[6, 3, 1]} intensity={1.5} color="#c0e1dd" />
      </Environment>
      <SurfaceProvider><DigestiveModel {...props} /></SurfaceProvider>
      <FoodJourney {...props} />
      <CameraRig command={props.cameraCommand} />
      <ProjectLabels props={props} onProject={onProject} />
      <RuntimeStatus onReady={props.onReady} onError={props.onError} />
    </Canvas>
    <div className="digestive-scene-labels" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
      {props.labels && projection.points.filter((point) => point.visible && isVisible(point.id, props)).map((point) => <OrganLabel key={point.id}
        point={point} width={projection.width} height={projection.height} selected={point.id === props.selectedId} onSelect={props.onSelect} />)}
    </div>
    </div>
    {absorptionVisible && <AbsorptionDetail water={props.step === 4} playing={props.playing} reducedMotion={props.reducedMotion} />}
  </div>;
}
