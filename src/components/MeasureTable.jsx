import { round } from "../lib/geometry.js";

// Thrown outside diameter at set heights from the base, for checking against while throwing.
export default function MeasureTable({ rows, unit }) {
  const digits = unit === "in" ? 2 : 1;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr><th>Height from base</th><th>Outside diameter</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={r.rim ? "rim" : ""}>
              <td>{round(r.height, digits)} {unit}{r.rim ? " (rim)" : ""}</td>
              <td>{r.diameter === null ? "–" : `${round(r.diameter, digits)} ${unit}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
