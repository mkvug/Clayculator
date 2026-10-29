import { useRef, useState } from "react";
import { buildSnippet, embedScriptUrl, parseSnippet } from "./snippet.js";

export default function ExportPanel({ config, onLoad }) {
  const areaRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [loadText, setLoadText] = useState("");
  const [loadMsg, setLoadMsg] = useState("");

  const snippet = buildSnippet(config, embedScriptUrl());
  const local = window.location.protocol === "file:";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      areaRef.current.select(); // clipboard blocked: select it so Ctrl/Cmd+C works
    }
  };

  const load = () => {
    try {
      onLoad(parseSnippet(loadText));
      setLoadMsg("Loaded.");
      setLoadText("");
    } catch (err) {
      setLoadMsg(err.message || "Could not read that text.");
    }
  };

  return (
    <section className="card" aria-label="Export">
      <h2>Add it to your website</h2>
      <p className="hint">
        Copy the code, paste it into an <strong>HTML</strong>, <strong>embed</strong> or <strong>code</strong> block on your
        website where you want the calculator, and publish.
      </p>
      {local && (
        <p className="warn">
          This page is open from a file on your computer, so the script address below won't work on a live site.
          Host this app first (see the README), then copy the code from the hosted page.
        </p>
      )}
      <textarea ref={areaRef} className="code" readOnly value={snippet} rows={12} aria-label="Embed code"
        onFocus={(e) => e.target.select()} />
      <div className="row">
        <button type="button" className="btn primary" onClick={copy}>{copied ? "Copied" : "Copy code"}</button>
        <span className="hint" aria-live="polite">Settings are stored inside this code. Save it somewhere safe to edit later.</span>
      </div>

      <details>
        <summary>Edit an existing embed</summary>
        <div className="field">
          <label htmlFor="load">Paste code you saved earlier</label>
          <textarea id="load" className="code" rows={5} value={loadText} onChange={(e) => setLoadText(e.target.value)} />
        </div>
        <div className="row">
          <button type="button" className="btn" onClick={load} disabled={!loadText.trim()}>Load settings</button>
          <span className="hint" aria-live="polite">{loadMsg}</span>
        </div>
      </details>
    </section>
  );
}
