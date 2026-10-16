type Point = [number, number, number];

export function cristaPoint(x: number, u: number, v: number): Point {
  // The roots lie on exactly the same ellipsoid as mitochondrionShell(.9).
  // Both sides of each invagination rejoin that inner membrane; the rounded
  // closed tip projects into the matrix rather than floating as a separate fin.
  const section = Math.sqrt(Math.max(.001, 1 - (x / 2.736) ** 2));
  const ry = 1.017 * section, rz = .819 * section;
  const centerY = .19 * (1 - (x / 3.04) ** 2);
  const yUnit = (u * 2 - 1) * .96;
  const rootZ = -rz * Math.sqrt(1 - yUnit ** 2);
  return [x + .13 * section * Math.sin(v * Math.PI * 2) * Math.sin(u * Math.PI), centerY + yUnit * ry, rootZ + .94 * rz * Math.sin(v * Math.PI) * Math.sin(u * Math.PI)];
}

export type ChromosomeDatum = { pair: 0 | 1; parent: 0 | 1; sister?: 0 | 1; position: Point; replicated: boolean; length: number; recombined?: boolean; tilt?: number };

export function meiosisChromosomes(step: number, orientation: string): ChromosomeDatum[] {
  const b = orientation === 'orientation-b', result: ChromosomeDatum[] = [];
  const add = (pair: 0 | 1, parent: 0 | 1, position: Point, replicated: boolean, length: number, sister?: 0 | 1, tilt = 0) => result.push({ pair, parent, position, replicated, length, sister, recombined: step >= 2 && pair === 0, tilt });
  if (step <= 1) {
    add(0, 0, [-.66, .47, .18], step > 0, 1.2, 0, -.14); add(0, 1, [.66, .47, .18], step > 0, 1.2, 0, .13);
    add(1, 0, [-.63, -.73, .18], step > 0, .82, 0, .13); add(1, 1, [.68, -.73, .18], step > 0, .82, 0, -.16);
  } else if (step === 2) {
    add(0, 0, [-.66, .37, .18], true, 1.42, 0, -.1); add(0, 1, [-.16, .37, .18], true, 1.42, 0, .1);
    add(1, 0, [.55, -.4, .18], true, .95, 0, -.1); add(1, 1, [1.04, -.4, .18], true, .95, 0, .1);
  } else if (step === 3 || step === 4) {
    const distance = step === 3 ? .32 : 1.33;
    add(0, 0, [-distance, .63, .18], true, 1.15); add(0, 1, [distance, .63, .18], true, 1.15);
    add(1, b ? 1 : 0, [-distance, -.7, .18], true, .82); add(1, b ? 0 : 1, [distance, -.7, .18], true, .82);
  } else if (step <= 6) {
    [-1, 1].forEach(side => { const parent = (side < 0 ? 0 : 1) as 0 | 1; add(0, parent, [side * 1.72, .46, .18], true, 1.05); add(1, (b ? 1 - parent : parent) as 0 | 1, [side * 1.72, -.56, .18], true, .72); });
  } else if (step === 7) {
    [-1, 1].forEach(side => { const parent = (side < 0 ? 0 : 1) as 0 | 1; [0, 1].forEach(sister => { const offset = sister ? .49 : -.49; add(0, parent, [side * 1.72 + offset, .45, .18], false, 1.02, sister as 0 | 1, sister ? -.09 : .09); add(1, (b ? 1 - parent : parent) as 0 | 1, [side * 1.72 + offset, -.56, .18], false, .7, sister as 0 | 1, sister ? -.08 : .08); }); });
  } else {
    [-1, 1].forEach(side => { const parent = (side < 0 ? 0 : 1) as 0 | 1; [0, 1].forEach(sister => { const y = sister ? -1.05 : 1.05; add(0, parent, [side * 1.65 - .22, y + .02, .18], false, 1.06, sister as 0 | 1, -.11); add(1, (b ? 1 - parent : parent) as 0 | 1, [side * 1.65 + .27, y - .05, .18], false, .74, sister as 0 | 1, .1); }); });
  }
  return result;
}
