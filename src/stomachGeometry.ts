import * as THREE from 'three';

const CENTRE = new THREE.Vector2(1.42, 1.5);
interface SacTemplate { points: THREE.Vector2[]; faces: number[][]; height: number[]; rimCount: number }
let template: SacTemplate | undefined;

/** Original anatomical silhouette with a smooth inflated body, not a bent tube. */
function sacTemplate(): SacTemplate {
  if (template) return template;
  const shape = new THREE.Shape();
  shape.moveTo(.31, 2.24);
  shape.bezierCurveTo(.45, 2.65, 1.22, 2.72, 1.66, 2.4);
  shape.bezierCurveTo(2.03, 2.07, 2.04, 1.41, 1.65, .96);
  shape.bezierCurveTo(1.33, .61, .65, .63, .13, .91);
  shape.bezierCurveTo(-.07, 1.0, -.05, 1.19, .15, 1.25);
  shape.bezierCurveTo(.31, 1.29, .4, 1.33, .45, 1.49);
  shape.bezierCurveTo(.52, 1.74, .48, 1.92, .39, 2.06);
  shape.bezierCurveTo(.32, 2.09, .26, 2.15, .31, 2.24);
  shape.closePath();
  const rim = shape.getSpacedPoints(192).slice(0, -1);
  const around = rim.length, rings = 32;
  const points = [...rim], faces: number[][] = [];
  const face = (a: number, b: number, c: number) => {
    const cross = points[b].clone().sub(points[a]).cross(points[c].clone().sub(points[a]));
    faces.push(cross > 0 ? [a, b, c] : [a, c, b]);
  };
  let previous = rim.map((_, i) => i);
  for (let ring = 1; ring < rings; ring++) {
    const radial = 1 - ring / rings;
    const current = rim.map((edge) => {
      points.push(CENTRE.clone().lerp(edge, radial));
      return points.length - 1;
    });
    for (let i = 0; i < around; i++) {
      const j = (i + 1) % around;
      face(previous[i], previous[j], current[i]);
      face(previous[j], current[j], current[i]);
    }
    previous = current;
  }
  const pole = points.push(CENTRE.clone()) - 1;
  for (let i = 0; i < around; i++) face(previous[i], previous[(i + 1) % around], pole);

  // A smooth membrane field avoids a false V-shaped fold through the body.
  // Cotangent finite elements with zero rim values spread inflation smoothly;
  // sqrt(field) gives a rounded equator, as on an ellipsoid.
  const count = points.length - around;
  const weights = Array.from({ length: count }, () => new Map<number, number>());
  const diagonal = new Float64Array(count), load = new Float64Array(count);
  const edge = (a: number, b: number, weight: number) => {
    for (const [i, j] of [[a, b], [b, a]]) if (i >= around) {
      const row = i - around;
      diagonal[row] += weight;
      if (j >= around) weights[row].set(j - around, (weights[row].get(j - around) ?? 0) - weight);
    }
  };
  for (const [a, b, c] of faces) {
    const pa = points[a], pb = points[b], pc = points[c];
    const area2 = Math.abs(pb.clone().sub(pa).cross(pc.clone().sub(pa)));
    for (const i of [a, b, c]) if (i >= around) load[i - around] += area2 / 6;
    edge(b, c, pb.clone().sub(pa).dot(pc.clone().sub(pa)) / area2 / 2);
    edge(a, c, pa.clone().sub(pb).dot(pc.clone().sub(pb)) / area2 / 2);
    edge(a, b, pa.clone().sub(pc).dot(pb.clone().sub(pc)) / area2 / 2);
  }
  const rows = weights.map((row) => [...row.entries()]);
  const multiply = (values: Float64Array, result: Float64Array) => {
    for (let i = 0; i < count; i++) {
      let value = diagonal[i] * values[i];
      for (const [j, weight] of rows[i]) value += weight * values[j];
      result[i] = value;
    }
  };
  const dot = (a: Float64Array, b: Float64Array) => a.reduce((sum, value, i) => sum + value * b[i], 0);
  const solution = new Float64Array(count), residual = load.slice();
  const direction = Float64Array.from(residual, (v, i) => v / diagonal[i]);
  const preconditioned = direction.slice(), product = new Float64Array(count);
  let error = dot(residual, preconditioned);
  const initialError = error;
  for (let iteration = 0; iteration < 1800 && error > initialError * 1e-18; iteration++) {
    multiply(direction, product);
    const alpha = error / dot(direction, product);
    for (let i = 0; i < count; i++) {
      solution[i] += alpha * direction[i];
      residual[i] -= alpha * product[i];
      preconditioned[i] = residual[i] / diagonal[i];
    }
    const nextError = dot(residual, preconditioned), beta = nextError / error;
    for (let i = 0; i < count; i++) direction[i] = preconditioned[i] + beta * direction[i];
    error = nextError;
  }
  const maximum = Math.max(...solution);
  const height = points.map((_, i) => i < around ? 0 : Math.sqrt(Math.max(0, solution[i - around]) / maximum));
  template = { points, faces, height, rimCount: around };
  return template;
}

export function stomachGeometry(cutaway = false, lining = false) {
  const { points, faces, height, rimCount } = sacTemplate();
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  const depth = lining ? .57 : .67, planarScale = lining ? .94 : 1;
  const add = (i: number, sign: number) => {
    positions.push(CENTRE.x + (points[i].x - CENTRE.x) * planarScale,
      CENTRE.y + (points[i].y - CENTRE.y) * planarScale, sign * depth * height[i]);
    uv.push(points[i].x / 2, points[i].y / 3);
    return positions.length / 3 - 1;
  };
  // Shared equator vertices keep front and back normals continuous.
  const rim = points.slice(0, rimCount).map((_, i) => add(i, 0));
  for (const sign of (cutaway ? [-1] : [1, -1])) {
    const vertex = [...rim, ...points.slice(rimCount).map((_, i) => add(i + rimCount, sign))];
    for (const [a, b, c] of faces) indices.push(...(sign > 0
      ? [vertex[a], vertex[b], vertex[c]] : [vertex[a], vertex[c], vertex[b]]));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
