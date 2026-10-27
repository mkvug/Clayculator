import ProfilePad from "./ProfilePad.jsx";
import Segmented from "./Segmented.jsx";
import { SHAPES } from "../lib/constants.js";

const LINE_STYLES = [
  { value: true, label: "Smooth" },
  { value: false, label: "Straight" },
];

export default function ProfilePanel({ profile, smooth, onSmoothChange }) {
  const { pts, setPts, sel, setSel, pushHist, load, undo, removeSelected, canUndo } = profile;
  return (
    <section className="panel" aria-label="Profile">
      <div className="head">
        <span className="label">Half profile</span>
        <div className="chips" role="group" aria-label="Starting shapes">
          {Object.keys(SHAPES).map((name) => (
            <button key={name} className="chip" onClick={() => load(SHAPES[name])}>{name}</button>
          ))}
        </div>
      </div>
      <ProfilePad pts={pts} setPts={setPts} pushHist={pushHist} smooth={smooth} sel={sel} setSel={setSel} />
      <div className="head">
        <div className="chips">
          <button className="chip" onClick={undo} disabled={!canUndo}>Undo</button>
          <button className="chip" onClick={removeSelected} disabled={sel === null}>Remove point</button>
          <button className="chip" onClick={() => load([])} disabled={!pts.length}>Clear</button>
        </div>
        <Segmented label="Line style" options={LINE_STYLES} value={smooth} onChange={onSmoothChange} />
      </div>
      <p className="note">
        Click to add points from the base up, on the right of the dashed axis. Drag points to adjust. The left half
        mirrors automatically.
      </p>
    </section>
  );
}
