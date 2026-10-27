import { useEffect, useMemo, useState } from "react";
import ClayList from "./ClayList.jsx";
import ExportPanel from "./ExportPanel.jsx";
import PreviewHost from "./PreviewHost.jsx";
import { DEFAULT_CONFIG, normalizeConfig } from "../config.js";

const KEY = "clayculator-draft";

function loadDraft() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* storage unavailable: start from the defaults */ }
  return DEFAULT_CONFIG;
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
          Choose the clay bodies your studio offers, check the preview, then copy the code onto your website for your students.
        </p>
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
