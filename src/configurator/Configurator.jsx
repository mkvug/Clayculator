import { useEffect, useMemo, useState } from "react";
import ClayList from "./ClayList.jsx";
import ExportPanel from "./ExportPanel.jsx";
import PreviewHost from "./PreviewHost.jsx";
import { DEFAULT_CONFIG, normalizeConfig } from "../config.js";
import { MM_PER } from "../lib/constants.js";
import { round } from "../lib/geometry.js";
import { VOLUME_UNITS } from "../lib/volume.js";

const KEY = "clayculator-draft";

function loadDraft() {
  try {
    const saved = localStorage.getItem(KEY);
    // Merge over the defaults so drafts saved before newer settings existed still load.
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch { /* storage unavailable: start from the defaults */ }
  return DEFAULT_CONFIG;
}

// Thickness is stored in millimeters but edited in the studio's starting unit.
function ThicknessField({ id, label, mm, unit, onChange }) {
  const per = MM_PER[unit];
  const show = (v) => String(round(v / per, 2));
  const [text, setText] = useState(show(mm));

  // Re-sync only when the stored value no longer matches what is typed (e.g. the unit changed).
  useEffect(() => {
    if (!(Math.abs(parseFloat(text) * per - mm) < 0.01)) setText(show(mm));
  }, [mm, unit]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" min="0" step="0.05" value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseFloat(e.target.value);
          if (n > 0) onChange(round(n * per, 2));
        }} />
    </div>
  );
}

// Studio setup page: edit clay bodies and options, preview the calculator, copy the embed code.
export default function Configurator() {
  const [raw, setRaw] = useState(loadDraft);
  const set = (patch) => setRaw((r) => ({ ...r, ...patch }));

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch { /* ignore */ }
  }, [raw]);

  const config = useMemo(() => normalizeConfig(raw), [raw]);

  return (
    <div className="cfg">
      <header className="top">
        <h1>Clayculator setup</h1>
        <p className="lede">
          Clay shrinks as it dries and again in the kiln, so a pot thrown at the size you want comes out smaller than
          planned. Clayculator is a calculator for your studio's website that works backward. Your students sketch half
          of the shape they want, choose a clay, and enter the finished size. It tells them the height and width to
          throw at, plus a table of diameters to check as they work.
        </p>
        <p className="lede">
          You don't need to write any code. Add your studio's clays here, then paste one snippet into your website.
        </p>
        <details className="how">
          <summary>How this works</summary>
          <h2>How to set it up</h2>
          <ol className="steps">
            <li><strong>Add your clay bodies.</strong> Enter each clay's name and its total shrinkage, wet to fired. The examples are placeholders, so replace them with yours.</li>
            <li><strong>Adjust the look.</strong> Change the heading, intro text, starting units, theme and button color. The preview updates as you go.</li>
            <li><strong>Copy the code.</strong> Paste it into an HTML or embed block on your website and publish.</li>
            <li><strong>Come back to edit.</strong> Your settings live inside the code you copied. To change them later, paste that code into "Edit an existing embed". Nothing is stored on a server, so keep a copy of the code somewhere safe.</li>
          </ol>
          <h2>Not sure of a clay's shrinkage?</h2>
          <p>
            Check your supplier's data sheet, or make a test tile. Scratch a 10 cm line into a wet slab, fire it with
            your usual schedule, and measure the line afterwards. Shrinkage % = (10 − fired length) ÷ 10 × 100. For
            example, a line that fires to 8.8 cm means 12% shrinkage.
          </p>
        </details>
      </header>

      <div className="layout">
        <div className="col">
          <section className="card" aria-label="Clay bodies">
            <h2>Your clay bodies</h2>
            <p className="hint">
              Use the total shrinkage from your clay supplier or your own test tiles (wet to fired). The names and numbers below are examples.
            </p>
            <ClayList clays={raw.clays} defaultClay={raw.defaultClay}
              onChange={(clays) => set({ clays })} onDefaultChange={(defaultClay) => set({ defaultClay })} />
            <label className="check">
              <input type="checkbox" checked={raw.allowCustom !== false}
                onChange={(e) => set({ allowCustom: e.target.checked })} /> Let students enter their own shrinkage
            </label>
          </section>

          <section className="card" aria-label="Volume tools">
            <h2>Volume tools (advanced)</h2>
            <p className="hint">
              Optional. Beginners can use the standard calculator. Turn these on for advanced students and production
              potters who aim for a volume, such as a 12 fl oz coffee mug.
            </p>
            <label className="check">
              <input type="checkbox" checked={config.showVolume}
                onChange={(e) => set({ showVolume: e.target.checked })} /> Show how much the piece holds
            </label>
            <label className="check">
              <input type="checkbox" checked={config.volumeSizing}
                onChange={(e) => set({ volumeSizing: e.target.checked })} /> Let students size by a target volume
            </label>
            {(config.showVolume || config.volumeSizing) && (
              <>
                <div className="field">
                  <label htmlFor="volunit">Volume units</label>
                  <select id="volunit" value={config.volumeUnit} onChange={(e) => set({ volumeUnit: e.target.value })}>
                    {VOLUME_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
                <div className="grid">
                  <ThicknessField id="wall" label={`Default wall thickness (${config.unit})`} mm={config.wallMm}
                    unit={config.unit} onChange={(wallMm) => set({ wallMm })} />
                  <ThicknessField id="floor" label={`Default floor thickness (${config.unit})`} mm={config.floorMm}
                    unit={config.unit} onChange={(floorMm) => set({ floorMm })} />
                </div>
                <p className="hint">
                  Finished thickness after firing. A typical mug has walls near 1/4 in (6 mm) and a floor near 3/8 in
                  (9 mm). Students can change both. Volume is estimated from the drawn shape, so treat it as a close guide.
                  With volume sizing on, students can also tick "Also match a volume" to hold a height or width and
                  stretch the shape to reach a volume.
                </p>
              </>
            )}
          </section>

          <section className="card" aria-label="Appearance">
            <h2>Text and appearance</h2>
            <div className="field">
              <label htmlFor="heading">Heading (leave empty to hide)</label>
              <input id="heading" type="text" value={raw.heading} onChange={(e) => set({ heading: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="intro">Introduction (leave empty to hide)</label>
              <textarea id="intro" rows={3} value={raw.intro} onChange={(e) => set({ intro: e.target.value })} />
            </div>
            <div className="grid">
              <div className="field">
                <label htmlFor="unit">Starting units</label>
                <select id="unit" value={raw.unit} onChange={(e) => set({ unit: e.target.value })}>
                  <option value="in">Inches</option>
                  <option value="cm">Centimeters</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="theme">Theme</label>
                <select id="theme" value={raw.theme} onChange={(e) => set({ theme: e.target.value })}>
                  <option value="auto">Match the visitor's device</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="accent">Button and outline color</label>
              <div className="row">
                <input id="accent" type="color" value={config.accent || "#111111"}
                  onChange={(e) => set({ accent: e.target.value })} />
                <button type="button" className="btn" onClick={() => set({ accent: "" })} disabled={!config.accent}>
                  Use default
                </button>
                <span className="hint">Pick a color that is readable on your chosen theme.</span>
              </div>
            </div>
          </section>
        </div>

        <div className="col preview-col">
          <section className="card" aria-label="Preview">
            <h2>Preview</h2>
            <PreviewHost config={config} />
          </section>
        </div>
      </div>

      <ExportPanel config={config} onLoad={setRaw} />
    </div>
  );
}
