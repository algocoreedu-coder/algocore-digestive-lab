import { useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneProps } from './types';
import { visible } from './visibility';
export { visible } from './visibility';

export type Point = [number, number, number];
export const PALETTE = { coral: '#d58b83', amber: '#d8ad69', teal: '#72b9b0', violet: '#a293c2', rose: '#bd7e9a', cream: '#e9d9b9', blue: '#829fbd', dark: '#243c46' };
export function Surface({ color, selected = false, opacity = 1, roughness = .4 }: { color: string; selected?: boolean; opacity?: number; roughness?: number }) {
  return <meshPhysicalMaterial color={color} roughness={roughness} metalness={0} clearcoat={.17} clearcoatRoughness={.4} sheen={.16} sheenColor={color} sheenRoughness={.7} side={THREE.DoubleSide} transparent={opacity < 1} opacity={opacity} depthWrite={opacity > .8} emissive={selected ? color : '#000000'} emissiveIntensity={selected ? .19 : 0} />;
}
export function Tube({ points, radius = .07, color, selected = false, opacity = 1, segments = 70 }: { points: Point[]; radius?: number; color: string; selected?: boolean; opacity?: number; segments?: number }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, 12, false), [points, radius, segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry}><Surface color={color} selected={selected} opacity={opacity} /></mesh>;
}
export function Label({ id, position, props, offset = [0, 0] }: { id: string; position: Point; props: SceneProps; offset?: [number, number] }) {
  const compact = useThree(state => state.size.width < 500);
  const structure = props.spec.structures.find(s => s.id === id);
  if (!structure || !props.labels || !visible(id, props)) return null;
  if (compact && props.selected !== id && !(props.moduleId === 'BIO-010' && props.selected === 'bilayer' && id === 'heads')) return null;
  return <Html position={position} center zIndexRange={[12, 0]} style={{ pointerEvents: 'auto', transform: `translate(calc(-50% + ${offset[0]}px), calc(-50% + ${offset[1]}px))` }}><button className={`al-model-label ${props.selected === id ? 'selected' : ''}`} style={{ borderColor: structure.color }} onClick={e => { e.stopPropagation(); props.onSelect(id); }}><i style={{ background: structure.color }} />{structure.label}</button></Html>;
}
export function Arrow({ from, to, color = PALETTE.teal }: { from: Point; to: Point; color?: string }) {
  const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to), dir = end.clone().sub(start), length = dir.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return <group position={start.toArray() as Point} quaternion={quaternion}><mesh position={[0, Math.max(.02, length - .18) / 2, 0]}><cylinderGeometry args={[.022, .022, Math.max(.02, length - .18), 8]} /><Surface color={color} /></mesh><mesh position={[0, length - .09, 0]}><coneGeometry args={[.075, .18, 12]} /><Surface color={color} /></mesh></group>;
}
