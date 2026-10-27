import { outlinePath } from "../lib/geometry.js";

// Fired outline (solid) inside the thrown outline (dashed), drawn to one scale.
export default function Preview({ prof, m }) {
  const W = 360, H = 240, pad = 16;
  const maxR = Math.max(...prof.map((p) => p[0]));
  const maxH = Math.max(...prof.map((p) => p[1]));
  const k = Math.min((W - pad * 2) / (2 * maxR * m), (H - pad * 2 - 14) / (maxH * m));
  const base = H - 24, cx = W / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Thrown outline around fired outline, drawn to scale">
      <line x1="0" x2={W} y1={base} y2={base} stroke="var(--line)" />
      <path d={outlinePath(prof, k * m, cx, base)} fill="none" stroke="var(--thrown)" strokeWidth="1.5"
        strokeDasharray="5 4" />
      <path d={outlinePath(prof, k, cx, base)} fill="var(--accent)" fillOpacity="0.14" stroke="var(--accent)"
        strokeWidth="1.5" />
      <text x={pad} y={H - 6}>- - thrown</text>
      <text x={W - pad} y={H - 6} textAnchor="end">▬ fired</text>
    </svg>
  );
}
