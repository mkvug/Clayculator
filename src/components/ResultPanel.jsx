import Preview from "./Preview.jsx";
import MeasureTable from "./MeasureTable.jsx";
import { round } from "../lib/geometry.js";

function Stat({ value, unit, label }) {
  return (
    <div>
      <div className="num">{value}<span className="unit">{unit}</span></div>
      <span className="label">{label}</span>
    </div>
  );
}

export default function ResultPanel({ result, error, pct, unit }) {
  const digits = unit === "in" ? 2 : 1;
  return (
    <section className="panel" aria-label="Result" aria-live="polite">
      <span className="label">Throw it at</span>
      {result ? (
        <>
          <div className="result">
            <Stat value={round(result.Ht, digits)} unit={unit} label="Height" />
            <Stat value={round(result.Wt, digits)} unit={unit} label="Widest diameter" />
          </div>
          <Preview prof={result.prof} m={result.m} />
          <span className="label">Measure while throwing</span>
          <MeasureTable rows={result.rows} unit={unit} />
          <p className="note">
            Thrown size = final size ÷ (1 − {round(pct, 2)}%), a multiplier of {round(result.m, 3)}. Shrinkage is
            measured against the wet size, so this is larger than adding {round(pct, 2)}% to the final size. Where
            the shape overhangs, the widest diameter at that height is shown.
          </p>
        </>
      ) : (
        <p className="err">{error}</p>
      )}
    </section>
  );
}
