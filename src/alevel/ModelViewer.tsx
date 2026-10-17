import { Component, Suspense, lazy, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import type { CameraAction, SceneProps } from './types';
import { sceneFamily } from './catalog';

const ASScenes = lazy(() => import('./ASScenes'));
const AdvancedScenes = lazy(() => import('./AdvancedScenes'));
const MoleculeScenes = lazy(() => import('./wave2/MoleculeScenes'));
const DNAScenes = lazy(() => import('./wave2/DNAScenes'));
const AdvancedWave2Scenes = lazy(() => import('./wave2/AdvancedWave2Scenes'));
function Specimen(scene: SceneProps) {
  switch(sceneFamily(scene.moduleId)) {
    case 'wave2-molecules': return <MoleculeScenes {...scene}/>;
    case 'wave2-dna': return <DNAScenes {...scene}/>;
    case 'wave2-advanced': return <AdvancedWave2Scenes {...scene}/>;
    case 'priority-as': return <ASScenes {...scene}/>;
    default: return <AdvancedScenes {...scene}/>;
  }
}
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Camera({ command }: { command: { type: CameraAction; seq: number } }) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera, invalidate, size } = useThree();
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const type = command.type;
    const distance = Math.max(5.1, 8.2 / (size.width / size.height)) / (2 * Math.tan(Math.PI / 9));
    if (type === 'reset' || type === 'front') { camera.position.set(0, .2, distance); c.target.set(0, 0, 0); }
    else if (type === 'in' || type === 'out') { const direction = camera.position.clone().sub(c.target); direction.multiplyScalar(type === 'in' ? .85 : 1.17); direction.clampLength(4, 19); camera.position.copy(c.target).add(direction); }
    else {
      const offset = camera.position.clone().sub(c.target);
      if (type === 'left' || type === 'right') offset.applyAxisAngle(camera.up, type === 'left' ? -.22 : .22);
      else { const right = camera.up.clone().cross(offset).normalize(); offset.applyAxisAngle(right, type === 'up' ? -.14 : .14); }
      camera.position.copy(c.target).add(offset);
    }
    c.update(); invalidate();
  }, [command, camera, invalidate, size.width, size.height]);
  return <OrbitControls ref={controls} makeDefault enableDamping={false} enablePan={false} minDistance={4} maxDistance={19} maxPolarAngle={Math.PI * .89} minPolarAngle={.12} />;
}
function Ready({ onReady }: { onReady: () => void }) { useEffect(onReady, [onReady]); return null; }
export default function ModelViewer({ scene, command, onReady, onError }: { scene: SceneProps; command: { type: CameraAction; seq: number }; onReady: () => void; onError: () => void }) {
  return <SceneBoundary onError={onError}><Canvas dpr={[1, 1.65]} camera={{ position: [0, .3, 10.5], fov: 40 }} gl={{ antialias: true, alpha: true }} frameloop={scene.playing && !scene.reducedMotion ? 'always' : 'demand'} onCreated={({ gl }) => { gl.domElement.setAttribute('aria-label', `${scene.spec.title}: interactive 3D model. Use the structure list and camera buttons for keyboard control.`); gl.domElement.addEventListener('webglcontextlost', onError, { once: true }); }}>
    <ambientLight intensity={.65} /><directionalLight position={[3, 5, 7]} intensity={2.8} color="#fff0d9" /><directionalLight position={[-5, 1, 2]} intensity={1.4} color="#c6e3e4" /><directionalLight position={[2, 3, -5]} intensity={2.2} color="#a1bbd2" />
    <Environment resolution={64}><Lightformer intensity={2.4} position={[0, 6, 4]} scale={[8, 3, 1]} /><Lightformer intensity={1.2} position={[-5, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[4, 6, 1]} /><Lightformer intensity={1.4} position={[4, 2, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 5, 1]} /></Environment>
    <Camera command={command} /><Suspense fallback={null}><Specimen {...scene}/><Ready onReady={onReady} /></Suspense>
  </Canvas></SceneBoundary>;
}
