// Editable list of the studio's clay bodies. Values are kept as typed; normalizeConfig cleans them later.
export default function ClayList({ clays, defaultClay, onChange, onDefaultChange }) {
  const update = (i, patch) => onChange(clays.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const remove = (i) => onChange(clays.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= clays.length) return;
    const next = [...clays];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () =>
    onChange([...clays, { id: "clay-" + Math.random().toString(36).slice(2, 8), name: "", shrinkage: "", note: "" }]);

  return (
    <div className="clay-list">
      {clays.length === 0 && <p className="hint">No clay bodies yet. Students will enter a shrinkage percentage themselves.</p>}
      {clays.map((c, i) => {
        const bad = c.name.trim() === "" || !(parseFloat(c.shrinkage) >= 0 && parseFloat(c.shrinkage) < 100);
        return (
          <div className={"clay-row" + (bad ? " bad" : "")} key={c.id}>
            <div className="clay-main">
              <div className="field grow">
                <label htmlFor={`name-${c.id}`}>Name</label>
                <input id={`name-${c.id}`} type="text" value={c.name} placeholder="e.g. B-Mix Cone 5"
                  onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div className="field pct">
                <label htmlFor={`pct-${c.id}`}>Shrinkage %</label>
                <input id={`pct-${c.id}`} type="number" inputMode="decimal" min="0" max="99" step="0.1"
                  value={c.shrinkage} placeholder="12" onChange={(e) => update(i, { shrinkage: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor={`note-${c.id}`}>Note (optional)</label>
              <input id={`note-${c.id}`} type="text" value={c.note || ""} placeholder="e.g. Cone 6, white stoneware"
                onChange={(e) => update(i, { note: e.target.value })} />
            </div>
            <div className="clay-actions">
              <label className="check">
                <input type="radio" name="default-clay" checked={defaultClay === c.id}
                  onChange={() => onDefaultChange(c.id)} /> Selected by default
              </label>
              <span className="spacer" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.name || "clay"} up`}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === clays.length - 1} aria-label={`Move ${c.name || "clay"} down`}>↓</button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${c.name || "clay"}`}>Remove</button>
            </div>
            {bad && <p className="warn">Needs a name and a shrinkage from 0 to 99. Incomplete clays are left out of the calculator.</p>}
          </div>
        );
      })}
      <button type="button" className="btn" onClick={add}>Add clay body</button>
    </div>
  );
}
