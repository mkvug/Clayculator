// Large numeric input with a unit suffix.
export default function NumberField({ id, label, suffix, value, onChange, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input id={id} type="number" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value)} {...rest} />
        <span className="suffix">{suffix}</span>
      </div>
    </div>
  );
}
