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

// Scale the profile to the requested final size and work out the thrown dimensions and table rows.
export function computeThrow(profile, pct, size) {
  const m = throwMultiplier(pct);
  const s = size / profile.ref;                      // pad units -> final units
  const Hf = profile.Hraw * s, Wf = profile.Wraw * s;
  const fired = profile.prof.map(([r, h]) => [r * s, h * s]);
  const Ht = Hf * m;

  const step = niceStep(Ht);
  const heights = [];
  for (let h = step; h < Ht - step * 0.05; h += step) heights.push(h);
  heights.push(Ht);

  const rows = heights.map((hT, i) => {
    const r = radiusAt(fired, Math.min(hT / m, Hf - 1e-9));
    return { height: hT, diameter: r === null ? null : 2 * r * m, rim: i === heights.length - 1 };
  });

  return { m, Hf, Wf, Ht, Wt: Wf * m, rows, prof: profile.prof };
}
