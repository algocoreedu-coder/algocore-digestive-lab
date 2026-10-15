import * as THREE from 'three';

export type Point3 = [number, number, number];

// A front view: patient-left is screen-right. Coordinates are schematic units.
export const OESOPHAGUS: Point3[] = [
  [0, 4.85, -.12], [.02, 4.3, -.21], [-.04, 3.6, -.25], [-.07, 2.94, -.21], [.04, 2.49, -.13], [.4, 2.23, 0],
];
export const STOMACH: Point3[] = [
  [.4, 2.23, 0], [.82, 2.28, .02], [1.35, 2.0, .03], [1.47, 1.53, .03],
  [1.24, 1.03, .04], [.69, .96, .06], [.12, 1.08, .08],
];
// One continuous, non-repeating route through a compact three-dimensional fold bed.
// The lattice only establishes clearance; smooth warping and variable spacing remove
// uniform rows. These points are a teaching schematic, not patient coordinates.
const FOLD_ROUTE: Point3[] = [
  [4, 0, 1], [4, 0, 2], [4, 1, 2], [3, 1, 2], [3, 0, 2], [3, 0, 1],
  [3, 1, 1], [4, 1, 1], [4, 1, 0], [3, 1, 0],
  [2, 1, 0], [2, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0],
  [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 0, 2], [1, 0, 2], [1, 0, 1],
  [1, 1, 1], [1, 1, 2], [2, 1, 2], [2, 1, 1], [1, 2, 2], [0, 2, 2], [0, 3, 2], [1, 3, 2],
  [1, 4, 2], [2, 4, 2], [2, 4, 1], [1, 4, 1], [1, 3, 1], [0, 3, 1],
  [0, 3, 0], [0, 2, 0], [0, 2, 1], [1, 2, 1], [1, 2, 0], [1, 3, 0],
  [2, 3, 0], [2, 2, 0], [2, 2, 1], [2, 3, 1], [2, 3, 2], [2, 2, 2],
  [3, 2, 2], [4, 2, 2], [4, 2, 1], [3, 2, 1], [3, 3, 1], [4, 3, 1],
  [4, 3, 2], [4, 4, 2], [3, 4, 2], [3, 4, 1],
  [3, 4, 0], [2, 4, 0], [1, 4, 0], [0, 4, 0], [0, 4, 1],
];
const foldNodes: Point3[] = FOLD_ROUTE.map(([column, row, layer], i) => {
  const x = [-1.31, -.65, .02, .66, 1.31][column];
  const y = [-.25, -.77, -1.3, -1.84, -2.36][row];
  const z = [-.48, .18, .88][layer];
  const angle = (layer - 1) * .16 + Math.sin(row * .9) * .09;
  const rotatedX = x * Math.cos(angle) - (y + 1.3) * Math.sin(angle);
  const rotatedY = x * Math.sin(angle) + (y + 1.3) * Math.cos(angle) - 1.3;
  return [rotatedX + .11 * Math.sin(y * 2.5 + z * 1.8) + .025 * Math.sin(i * 2.9),
    rotatedY + .08 * Math.sin(x * 2.1 - z * 2.4),
    z + .07 * Math.sin(x * 1.7 + y * 2.3)];
});
// Approximation curves replace corner-interpolating splines. Each turn consumes
// the entire bend, producing oblique oval folds instead of rounded rectangles.
let foldPoints = foldNodes;
for (let iteration = 0; iteration < 3; iteration++) {
  const softened: Point3[] = [foldPoints[0]];
  for (let i = 0; i < foldPoints.length - 1; i++) {
    const a = foldPoints[i], b = foldPoints[i + 1];
    softened.push(a.map((value, k) => value * .64 + b[k] * .36) as Point3,
      a.map((value, k) => value * .36 + b[k] * .64) as Point3);
  }
  softened.push(foldPoints[foldPoints.length - 1]); foldPoints = softened;
}
const foldSpline = new THREE.CatmullRomCurve3(foldPoints.map((point) => new THREE.Vector3(...point)), false, 'centripetal');
foldSpline.arcLengthDivisions = foldPoints.length * 8;
foldPoints = foldSpline.getSpacedPoints(Math.ceil(foldSpline.getLength() / .14)).map((point) => point.toArray() as Point3);
export const SMALL_INTESTINE: Point3[] = [
  [.12, 1.08, .08], [-.24, 1.04, -.45], [-.55, .77, -.95], [-.47, .41, -1], [-.02, .1, -.93],
  [.46, -.18, -.65], [1.1, -.11, -.14], ...foldPoints,
  [-1.26, -2.33, .31], [-1.43, -2.52, .47], [-1.73, -2.53, .25], [-1.97, -2.43, -.06],
];
export const LARGE_INTESTINE: Point3[] = [
  [-1.97, -2.43, -.06], [-2.12, -1.95, -.17], [-2.15, -1.02, -.24], [-2.08, -.12, -.27],
  [-1.88, .49, -.24], [-1.18, .65, -.28], [-.39, .47, -.29], [.44, .42, -.31], [1.35, .68, -.29],
  [1.99, .43, -.24], [2.12, -.29, -.2], [2.1, -1.24, -.17], [1.98, -2.22, -.11],
  [1.65, -2.87, -.02], [1.11, -3.08, .16], [.61, -2.97, .25], [.23, -3.17, .14],
  [.1, -3.62, -.04], [0, -4.04, .01],
];
export const STOMACH_RADII = [.16, .36, .59, .58, .46, .28, .145];
export const SMALL_RADII = [.145, .161, .149, .166, .15, .158, .143, .151, .135];
export const COLON_RADII = [.31, .305, .29, .3, .292, .286, .271, .245, .17];

export const makeCurve = (points: Point3[]) => {
  if (points === SMALL_INTESTINE) {
    const original = points.map((point) => new THREE.Vector3(...point));
    let fair = original.map((point) => point.clone());
    // Only the visibly pressed lower/central bends receive positional fairing.
    // A strict displacement limit preserves the packed silhouette and junctions.
    for (let iteration = 0; iteration < 4; iteration++) {
      fair = fair.map((point, i) => {
        if (i === 0 || i === fair.length - 1) return point;
        const region = (1 - THREE.MathUtils.smoothstep(point.x, .7, 1.1))
          * (1 - THREE.MathUtils.smoothstep(point.y, -1, -.55));
        if (!region) return point;
        const before = fair[i - 1].clone().sub(point), after = fair[i + 1].clone().sub(point);
        const cross = before.clone().cross(after).length();
        const localRadius = cross > 1e-9 ? before.length() * after.length()
          * fair[i - 1].distanceTo(fair[i + 1]) / (2 * cross) : Infinity;
        const weight = region * THREE.MathUtils.clamp((.3 - localRadius) / .2, 0, 1) * .35;
        const next = point.clone().lerp(fair[i - 1].clone().add(fair[i + 1]).multiplyScalar(.5), weight);
        const displacement = next.clone().sub(original[i]);
        if (displacement.length() > .08) next.copy(original[i]).add(displacement.setLength(.08));
        return next;
      });
    }
    // C2 cubic approximation avoids the tiny curvature jumps introduced when an
    // interpolating spline is forced through every closely-spaced control point.
    const controls = [fair[0], fair[0], ...fair, fair[fair.length - 1], fair[fair.length - 1]];
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < controls.length - 3; i++) {
      const [a, b, c, d] = controls.slice(i, i + 4);
      path.add(new THREE.CubicBezierCurve3(
        a.clone().addScaledVector(b, 4).add(c).multiplyScalar(1 / 6),
        b.clone().multiplyScalar(2 / 3).addScaledVector(c, 1 / 3),
        b.clone().multiplyScalar(1 / 3).addScaledVector(c, 2 / 3),
        b.clone().addScaledVector(c, 4).add(d).multiplyScalar(1 / 6),
      ));
    }
    path.arcLengthDivisions = Math.max(1000, points.length * 8); return path;
  }
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, 'centripetal');
  curve.arcLengthDivisions = Math.max(1000, points.length * 8);
  return curve;
};

/** Continuous tube with controllable thickness; openAngle exposes the lumen at +z. */
export function digestiveTube(points: Point3[], radius: number | number[], segments = 140, radial = 18, openAngle = 0, haustra = 0) {
  const curve = makeCurve(points);
  const frames = openAngle === 0 ? curve.computeFrenetFrames(segments, false) : null;
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  const widths = typeof radius === 'number' ? [radius, radius] : radius;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, point = curve.getPointAt(t), tangent = curve.getTangentAt(t);
    let side = new THREE.Vector3(-tangent.y, tangent.x, 0);
    if (side.lengthSq() < .001) side = new THREE.Vector3(1, 0, 0);
    side.normalize();
    const front = new THREE.Vector3().crossVectors(side, tangent).normalize();
    if (front.z < 0) front.negate();
    if (frames) { side.copy(frames.normals[i]); front.copy(frames.binormals[i]); }
    const radiusIndex = t * (widths.length - 1), low = Math.floor(radiusIndex), high = Math.min(widths.length - 1, low + 1);
    let r = THREE.MathUtils.lerp(widths[low], widths[high], radiusIndex - low);
    // Rectum is smooth: haustra fade before the terminal rectal segment.
    const colonFactor = haustra ? 1 - THREE.MathUtils.smoothstep(t, .82, .91) : 0;
    if (haustra) r *= 1 + colonFactor * (.065 * Math.cos(t * Math.PI * haustra * 2) + .018 * Math.cos(t * 41 + .8));
    for (let j = 0; j <= radial; j++) {
      const angle = openAngle / 2 + (Math.PI * 2 - openAngle) * j / radial;
      const organicRadius = r * (1 + .012 * Math.sin(t * 57 + angle * 3) + (haustra ? .027 * colonFactor * Math.cos(angle * 3 + .2) : 0));
      const offset = front.clone().multiplyScalar(Math.cos(angle) * organicRadius * (haustra ? .94 : .91)).addScaledVector(side, Math.sin(angle) * organicRadius);
      positions.push(point.x + offset.x, point.y + offset.y, point.z + offset.z);
      uvs.push(t * 5, j / radial);
      if (i < segments && j < radial) {
        const a = i * (radial + 1) + j, b = a + radial + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export { stomachGeometry } from './stomachGeometry.ts';

export function torsoGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-.5, 4.13); shape.bezierCurveTo(-.63, 3.67, -1.85, 3.68, -2.38, 3.37);
  shape.bezierCurveTo(-2.75, 3.05, -3.02, 2.22, -2.86, 1.74);
  shape.bezierCurveTo(-2.55, .97, -2.34, .11, -2.29, -.75);
  shape.bezierCurveTo(-2.3, -1.8, -2.79, -2.69, -2.55, -3.72);
  shape.bezierCurveTo(-1.85, -4.25, 1.85, -4.25, 2.55, -3.72);
  shape.bezierCurveTo(2.79, -2.69, 2.3, -1.8, 2.29, -.75);
  shape.bezierCurveTo(2.34, .11, 2.55, .97, 2.86, 1.74);
  shape.bezierCurveTo(3.02, 2.22, 2.75, 3.05, 2.38, 3.37);
  shape.bezierCurveTo(1.85, 3.68, .63, 3.67, .5, 4.13); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: .48, bevelEnabled: true, bevelSegments: 5, steps: 2,
    bevelSize: .18, bevelThickness: .3, curveSegments: 36 });
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i);
    position.setZ(i, position.getZ(i) + .28 * Math.exp(-(x * x / 5 + (y - .3) ** 2 / 7)));
  }
  geometry.computeVertexNormals(); return geometry;
}
