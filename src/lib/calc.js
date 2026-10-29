import { AX } from "./constants.js";
import { sample, radiusAt, niceStep } from "./geometry.js";

// Thrown size = fired size / (1 - shrinkage). Shrinkage is measured against the wet size.
export const throwMultiplier = (pct) => 1 / (1 - pct / 100);

// Turn the drawn pad points into a [radius, height] profile in pad units, or null if it has no size yet.
export function buildProfile(pts, smooth, sizeBy) {
  if (pts.length < 2) return null;
  const curve = sample(pts, smooth);
  const ybase = Math.max(...curve.map((c) => c[1]));
  const prof = curve.map(([x, y]) => [x - AX, ybase - y]);
  const Hraw = Math.max(...prof.map((c) => c[1]));
  const Wraw = 2 * Math.max(...prof.map((c) => c[0]));
  const ref = sizeBy === "h" ? Hraw : Wraw;
  if (!(ref > 0.5)) return null;
  return { prof, Hraw, Wraw, ref };
}

// Scale (final units per pad unit) that gives the profile a requested height or widest diameter.
export const scaleForSize = (profile, size) => size / profile.ref;

// Work out the thrown dimensions and table rows for a profile drawn at scales sx (across) and sy (up),
// both in final units per pad unit. Pass one scale to keep the sketch's proportions.
export function computeThrow(profile, pct, sx, sy = sx) {
  const m = throwMultiplier(pct);
  const Hf = profile.Hraw * sy, Wf = profile.Wraw * sx;
  const fired = profile.prof.map(([r, h]) => [r * sx, h * sy]);
  const Ht = Hf * m;

  const step = niceStep(Ht);
  const heights = [];
  for (let h = step; h < Ht - step * 0.05; h += step) heights.push(h);
  heights.push(Ht);

  const rows = heights.map((hT, i) => {
    const r = radiusAt(fired, Math.min(hT / m, Hf - 1e-9));
    return { height: hT, diameter: r === null ? null : 2 * r * m, rim: i === heights.length - 1 };
  });

  return { m, Hf, Wf, Ht, Wt: Wf * m, rows, prof: profile.prof, fired };
}
