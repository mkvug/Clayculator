import { useRef } from "react";
import { VW, VH, AX, EDGE } from "../lib/constants.js";
import { clamp, sample, linePath } from "../lib/geometry.js";

// SVG pad for drawing the right half of the profile. Click to add, drag to move, Delete to remove.
export default function ProfilePad({ pts, setPts, pushHist, smooth, sel, setSel }) {
  const ref = useRef(null);
  const drag = useRef(null);

  const toPad = (e) => {
    const svg = ref.current, pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    let x = clamp(q.x, AX, VW - EDGE);
    const y = clamp(q.y, EDGE, VH - EDGE);
    if (x - AX < 8) x = AX; // snap to the axis
    return [x, y];
  };

  const onDown = (e) => {
    const idx = e.target.dataset ? e.target.dataset.idx : undefined;
    ref.current.setPointerCapture(e.pointerId);
    ref.current.focus({ preventScroll: true });
    pushHist();
    if (idx !== undefined) {
      drag.current = +idx;
      setSel(+idx);
    } else {
      const p = toPad(e);
      setPts((a) => [...a, p]);
      drag.current = pts.length;
      setSel(pts.length);
    }
  };

  const onMove = (e) => {
    if (drag.current === null) return;
    const p = toPad(e), i = drag.current;
    setPts((a) => a.map((q, j) => (j === i ? p : q)));
  };

  const onUp = () => { drag.current = null; };

  const onKey = (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && sel !== null) {
      e.preventDefault();
      pushHist();
      setPts((a) => a.filter((_, j) => j !== sel));
      setSel(null);
    }
  };

  const curve = sample(pts, smooth);
  const mirrored = curve.map(([x, y]) => [2 * AX - x, y]);

  return (
    <svg ref={ref} className="pad" viewBox={`0 0 ${VW} ${VH}`} tabIndex={0}
      aria-label="Drawing pad. Click to add profile points on the right of the center line, drag to move, Delete to remove the selected point."
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}>
      <line x1={AX} x2={AX} y1="0" y2={VH} stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4" />
      <text x={AX + 6} y="14">axis</text>
      {curve.length > 1 && (
        <path d={linePath(mirrored)} fill="none" stroke="var(--muted)" strokeWidth="1.5" opacity="0.5" />
      )}
      {curve.length > 1 && <path d={linePath(curve)} fill="none" stroke="var(--fg)" strokeWidth="2" />}
      {pts.map((p, i) => (
        <g key={i}>
          <circle data-idx={i} cx={p[0]} cy={p[1]} r="16" fill="transparent" style={{ cursor: "grab" }} />
          <circle cx={p[0]} cy={p[1]} r={i === sel ? 6 : 4.5} pointerEvents="none"
            fill={i === sel ? "var(--accent)" : "var(--bg)"} stroke="var(--fg)" strokeWidth="1.5" />
        </g>
      ))}
      {pts.length < 2 && <text x={VW / 2 + 12} y={VH / 2}>Click right of the axis, base first</text>}
    </svg>
  );
}
