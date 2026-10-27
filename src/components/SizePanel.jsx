import NumberField from "./NumberField.jsx";
import Segmented from "./Segmented.jsx";
import { UNITS } from "../lib/constants.js";
import { round } from "../lib/geometry.js";

const UNIT_OPTIONS = UNITS.map((u) => ({ value: u, label: u }));
const SIZE_BY = [
  { value: "h", label: "Height" },
  { value: "w", label: "Widest diameter" },
];

export default function SizePanel({ unit, onUnitChange, sizeBy, onSizeByChange, size, onSizeChange, result }) {
  const digits = unit === "in" ? 2 : 1;
  return (
    <section className="panel" aria-label="Final size">
      <div className="head">
        <span className="label">Final size after firing</span>
        <Segmented label="Units" options={UNIT_OPTIONS} value={unit} onChange={onUnitChange} />
      </div>
      <Segmented label="Size by" options={SIZE_BY} value={sizeBy} onChange={onSizeByChange} />
      <NumberField id="size" label={sizeBy === "h" ? "Final height" : "Final widest diameter"} suffix={unit}
        value={size} onChange={onSizeChange} min="0" step="0.1" />
      {result && (
        <p className="note">
          Drawn shape: {round(result.Hf, digits)} {unit} tall × {round(result.Wf, digits)} {unit} wide when fired.
        </p>
      )}
    </section>
  );
}
