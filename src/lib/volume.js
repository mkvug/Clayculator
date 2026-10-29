// Capacity of a drawn pot. Pure functions; lengths are in whatever unit the profile uses ("in" or "cm").
//
// Model: the student draws the outside surface. The inside is that surface moved inward by the wall
// thickness (and by the floor thickness where the surface faces up), measured with an ellipse so the
// two blend smoothly on curves. Capacity is the volume of revolution of the inside, up to the rim.

export const ML_PER_CUBIC = { in: 16.387064, cm: 1 };

export const VOLUME_UNITS = [
  { id: "floz", label: "fl oz", ml: 29.5735295625, digits: 1 },
  { id: "cup", label: "cups", ml: 236.5882365, digits: 2 },
  { id: "ml", label: "mL", ml: 1, digits: 0 },
  { id: "l", label: "L", ml: 1000, digits: 2 },
];

const unitInfo = (id) => VOLUME_UNITS.find((u) => u.id === id) || VOLUME_UNITS[0];

export const unitLabel = (id) => unitInfo(id).label;
export const mlToUnit = (ml, id) => ml / unitInfo(id).ml;
export const unitToMl = (v, id) => v * unitInfo(id).ml;

export function formatVolume(ml, id) {
  const { ml: per, digits } = unitInfo(id);
  return (ml / per).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// Insert points along a [[r, h], ...] polyline so no gap is longer than `step`.
export function resample(prof, step) {
  const out = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [r1, h1] = prof[i], [r2, h2] = prof[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(r2 - r1, h2 - h1) / step));
    for (let k = 0; k < n; k++) out.push([r1 + ((r2 - r1) * k) / n, h1 + ((h2 - h1) * k) / n]);
  }
  out.push(prof[prof.length - 1]);
  return out;
}

const perimeter = (prof) => {
  let len = 0;
  for (let i = 0; i < prof.length - 1; i++) len += Math.hypot(prof[i + 1][0] - prof[i][0], prof[i + 1][1] - prof[i][1]);
  return len;
};

// Volume of the inside, in cubic length units, filled to the height of the last point (the rim).
// `outer` is [[radius, height], ...] from the base centre to the rim.
export function cavityVolume(outer, wall, floor, rows = 240) {
  if (outer.length < 2 || !(wall > 0) || !(floor > 0)) return 0;
  const brim = outer[outer.length - 1][1];
  if (!(brim > 0)) return 0;

  // Fine enough to avoid scalloping, capped so huge scales stay fast.
  const step = Math.max(Math.min(wall, floor) / 4, perimeter(outer) / 1500);
  const pts = resample(outer, step);

  const dh = brim / rows;
  let volume = 0;
  for (let i = 0; i < rows; i++) {
    const h = (i + 0.5) * dh;
    // Each outer point rules out an ellipse (semi-axes wall x floor) around it. Walking out from the
    // axis, the inside ends at the first ruled-out stretch, or is empty if the axis itself is covered.
    let edge = Infinity;
    for (const [qr, qh] of pts) {
      const dy = (h - qh) / floor;
      if (dy >= 1 || dy <= -1) continue;
      const lo = qr - wall * Math.sqrt(1 - dy * dy);
      if (lo <= 0) { edge = 0; break; }
      if (lo < edge) edge = lo;
    }
    if (edge !== Infinity) volume += Math.PI * edge * edge * dh;
  }
  return volume;
}

export const capacityMl = (outer, wall, floor, unit, rows) => cavityVolume(outer, wall, floor, rows) * ML_PER_CUBIC[unit];

// Find the value in (0, inf) at which `at(v)` (a capacity in mL that grows with v) reaches `targetMl`.
// Returns null if it never gets there (the shape can't hold liquid).
function searchScale(at, targetMl) {
  let hi = 0.001;
  let tries = 0;
  while (at(hi) < targetMl) {
    hi *= 2;
    if (++tries > 40) return null;
  }
  let lo = tries === 0 ? 0 : hi / 2;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) >= targetMl) hi = mid;
    else lo = mid;
  }
  return hi;
}

const validInputs = (wall, floor, targetMl) => targetMl > 0 && wall > 0 && floor > 0;

// Scale (units per pad unit) at which a drawn [[r, h], ...] profile holds `targetMl`, with walls and
// floor kept at a fixed real thickness. Same scale on both axes, so the sketch keeps its proportions.
export function solveScale(prof, wall, floor, unit, targetMl) {
  if (!validInputs(wall, floor, targetMl)) return null;
  const at = (s) => capacityMl(prof.map(([r, h]) => [r * s, h * s]), wall, floor, unit, 160);
  return searchScale(at, targetMl);
}

// Hold one dimension and stretch the other until the profile holds `targetMl`.
// fixed = { axis: "h" | "w", scale }: the scale (units per pad unit) already set by the chosen height
// ("h") or widest diameter ("w"). Returns the scale for the other axis (width for "h", height for "w").
export function solveStretch(prof, fixed, wall, floor, unit, targetMl) {
  if (!validInputs(wall, floor, targetMl) || !(fixed.scale > 0)) return null;
  const at = (v) => {
    const sx = fixed.axis === "h" ? v : fixed.scale;
    const sy = fixed.axis === "h" ? fixed.scale : v;
    return capacityMl(prof.map(([r, h]) => [r * sx, h * sy]), wall, floor, unit, 160);
  };
  return searchScale(at, targetMl);
}
