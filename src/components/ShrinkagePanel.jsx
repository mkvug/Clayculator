import NumberField from "./NumberField.jsx";
import { SHRINKAGE_PRESETS } from "../lib/constants.js";

export default function ShrinkagePanel({ pct, onChange }) {
  const value = parseFloat(pct);
  return (
    <section className="panel" aria-label="Shrinkage">
      <NumberField id="pct" label="Total shrinkage" suffix="%" value={pct} onChange={onChange}
        min="0" max="99" step="0.1" />
      <div className="chips" role="group" aria-label="Typical shrinkage">
        {SHRINKAGE_PRESETS.map((s) => (
          <button key={s.name} className="chip" aria-pressed={value === s.pct}
            onClick={() => onChange(String(s.pct))}>
            {s.name} ~{s.pct}%
          </button>
        ))}
      </div>
      <p className="note">Wet to fired. Check your clay's data sheet or measure a test tile.</p>
    </section>
  );
}
