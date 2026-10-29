import NumberField from "./NumberField.jsx";
import Segmented from "./Segmented.jsx";
import { UNITS } from "../lib/constants.js";
import { round } from "../lib/geometry.js";
import { VOLUME_UNITS, unitLabel } from "../lib/volume.js";

const UNIT_OPTIONS = UNITS.map((u) => ({ value: u, label: u }));

// `volume` is null unless the studio turned on an advanced volume feature:
// { sizing, unit, onUnitChange, wall, floor, onWallChange, onFloorChange }
export default function SizePanel({ unit, onUnitChange, sizeBy, onSizeByChange, size, onSizeChange, result, volume }) {
  const digits = unit === "in" ? 2 : 1;
  const byVolume = sizeBy === "v";

  const sizeOptions = [
    { value: "h", label: "Height" },
    { value: "w", label: "Widest diameter" },
    ...(volume && volume.sizing ? [{ value: "v", label: "Volume" }] : []),
  ];

  const fieldLabel = byVolume ? "Final volume" : sizeBy === "h" ? "Final height" : "Final widest diameter";
  const suffix = byVolume ? unitLabel(volume.unit) : unit;

  return (
    <section className="panel" aria-label="Final size">
      <div className="head">
        <span className="label">Final size after firing</span>
        <Segmented label="Units" options={UNIT_OPTIONS} value={unit} onChange={onUnitChange} />
      </div>
      <Segmented label="Size by" options={sizeOptions} value={sizeBy} onChange={onSizeByChange} />
      <NumberField id="size" label={fieldLabel} suffix={suffix} value={size} onChange={onSizeChange}
        min="0" step="0.1" />
      {byVolume && (
        <div className="field">
          <label htmlFor="volunit">Volume units</label>
          <select id="volunit" value={volume.unit} onChange={(e) => volume.onUnitChange(e.target.value)}>
            {VOLUME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
      )}
      {result && (
        <p className="note">
          Drawn shape: {round(result.Hf, digits)} {unit} tall × {round(result.Wf, digits)} {unit} wide when fired.
        </p>
      )}
      {volume && (
        <details className="adv">
          <summary>Wall and floor thickness</summary>
          <div className="stack">
            <div className="row">
              <NumberField id="wall" label="Wall" suffix={unit} value={volume.wall} onChange={volume.onWallChange}
                min="0" step="0.05" />
              <NumberField id="floor" label="Floor" suffix={unit} value={volume.floor} onChange={volume.onFloorChange}
                min="0" step="0.05" />
            </div>
            <p className="note">
              Finished thickness after firing. It is used to work out how much the piece holds.
            </p>
          </div>
        </details>
      )}
    </section>
  );
}
