import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { ORGANS, type OrganId } from './content';

const SurfaceContext = createContext<THREE.DataTexture | null>(null);
export const organColor = (id: OrganId) => ORGANS.find((organ) => organ.id === id)!.color;

export function SurfaceProvider({ children }: { children: ReactNode }) {
  const texture = useMemo(() => {
    const size = 128, data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const broad = Math.sin(x * .14 + Math.sin(y * .17) * 1.3) + Math.cos(y * .19 + Math.sin(x * .11));
      const fine = Math.sin(x * 2.37 + y * 1.31) * Math.sin(y * 1.79 - x * .91);
      const value = Math.round(244 + broad * 2.1 + fine * 3.8);
      data[offset] = data[offset + 1] = data[offset + 2] = value; data[offset + 3] = 255;
    }
    const next = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = next.wrapT = THREE.RepeatWrapping;
    next.magFilter = THREE.LinearFilter; next.minFilter = THREE.LinearMipmapLinearFilter;
    next.generateMipmaps = true; next.repeat.set(2, 2);
    next.needsUpdate = true;
    return next;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <SurfaceContext.Provider value={texture}>{children}</SurfaceContext.Provider>;
}

export function OrganMaterial({ id, selected, interior = false, opacity = 1 }: {
  id: OrganId; selected: boolean; interior?: boolean; opacity?: number;
}) {
  const surface = useContext(SurfaceContext);
  const color = organColor(id);
  const tint = interior ? new THREE.Color(color).multiplyScalar(.34) : color;
  return <meshPhysicalMaterial color={tint} metalness={0} roughness={interior ? .57 : id === 'oesophagus' ? .46 : .43}
    clearcoat={interior ? .04 : .13} clearcoatRoughness={.43} envMapIntensity={.29}
    map={surface} bumpMap={surface} bumpScale={id === 'stomach' ? .012 : .006} side={THREE.DoubleSide}
    sheen={.13} sheenRoughness={.78} sheenColor={tint}
    transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= .9}
    emissive={selected ? color : '#000000'} emissiveIntensity={selected ? .09 : 0} />;
}
