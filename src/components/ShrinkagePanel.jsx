import NumberField from "./NumberField.jsx";
import { CUSTOM } from "../config.js";

// Clay body dropdown (studio's list, plus an optional custom entry). Custom shows a free shrinkage field.
export default function ShrinkagePanel({ clays, allowCustom, clay, isCustom, onClayChange, customPct, onCustomChange }) {
  return (
    <section className="panel" aria-label="Clay">
      {clays.length > 0 && (
        <div className="field">
          <label htmlFor="clay">Clay body</label>
          <select id="clay" value={isCustom ? CUSTOM : clay.id} onChange={(e) => onClayChange(e.target.value)}>
            {clays.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.shrinkage}%)</option>
            ))}
            {allowCustom && <option value={CUSTOM}>Custom shrinkage…</option>}
          </select>
        </div>
      )}
      {isCustom ? (
        <>
          <NumberField id="pct" label="Total shrinkage" suffix="%" value={customPct} onChange={onCustomChange}
            min="0" max="99" step="0.1" />
          <p className="note">Wet to fired. Check your clay's data sheet or measure a test tile.</p>
        </>
      ) : (
        <>
          <p className="readout">{clay.shrinkage}% shrinkage</p>
          <p className="note">{clay.note ? clay.note + ". " : ""}Wet to fired.</p>
        </>
      )}
    </section>
  );
}
