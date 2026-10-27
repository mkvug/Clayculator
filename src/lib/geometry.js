import { AX } from "./constants.js";

export const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Catmull-Rom curve through the control points, or the points as-is for straight segments.
export function sample(pts, smooth) {
  if (pts.length < 2 || !smooth) return pts.map((p) => [...p]);
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    for (let s = 0; s < 14; s++) {
      const t = s / 14, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([Math.max(AX, f(p0[0], p1[0], p2[0], p3[0])), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([...pts[pts.length - 1]]);
  return out;
}

// Widest radius of a profile [[r, h], ...] at height h (the widest crossing, so overhangs work).
export function radiusAt(prof, h) {
  let best = null;
  for (let i = 0; i < prof.length - 1; i++) {
    const [r1, h1] = prof[i], [r2, h2] = prof[i + 1];
    const lo = Math.min(h1, h2), hi = Math.max(h1, h2);
    if (h < lo || h > hi || hi === lo) continue;
    const r = r1 + ((h - h1) / (h2 - h1)) * (r2 - r1);
    if (best === null || r > best) best = r;
  }
  return best;
}

// Smallest friendly row spacing that keeps the measurement table to about ten rows.
export const niceStep = (H) =>
  [0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 50].find((s) => H / s <= 10) || 50;

const toPath = (points) => "M" + points.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");

// Open path through pad points, as drawn.
export const linePath = toPath;

// Closed, mirrored outline of a [[r, h], ...] profile, anchored at the base centre.
export function outlinePath(prof, k, cx, base) {
  const right = prof.map(([r, h]) => [cx + r * k, base - h * k]);
  const left = prof.map(([r, h]) => [cx - r * k, base - h * k]).reverse();
  return toPath([...right, ...left]) + "Z";
}
