import { num } from "../engine/calc.js";
import { BREAKDOWN, ACCESSORIES } from "../data/specs.js";
const f1 = (v) => (v < 10 ? v.toFixed(1) : num(v));
const KEY = ["wire", "pipe", "cem", "steel", "brk", "sand", "agg", "tile", "paint", "sw", "pnl", "fix"];
export default function FieldMaterials({ r }) {
  const keyOf = {}; for (const k in r.MM) keyOf[r.MM[k][0]] = k;
  return (
    <>
      <section className="vp"><h2>Key quantities</h2><div className="kpis">
        {KEY.filter((k) => r.tot[k] > 0).map((k) => <div className="kpi" key={k}><b>{f1(r.tot[k])} {r.MM[k][1]}</b><span>{r.MM[k][0]}</span></div>)}</div></section>
      {Object.keys(r.phases).map((n) => {
        const x = r.phases[n], agg = {};
        x.rows.forEach(([name, unit, q]) => { agg[name] = agg[name] || { unit, q: 0 }; agg[name].q += q; });
        const names = Object.keys(agg);
        return (
          <section className="vp" key={n}><h2>{n}</h2>
            {names.length ? <div className="sc"><table><thead><tr><th>Material required</th><th>Type / grade</th><th>Quantity</th><th>Unit</th></tr></thead><tbody>
              {names.flatMap((name) => { const k = keyOf[name], a = agg[name]; return [
                <tr key={name}><td><b>{name}</b></td><td>{r.MM[k][5]}</td><td className="amt">{f1(a.q)}</td><td>{a.unit}</td></tr>,
                ...(BREAKDOWN[k] || []).map(([l, s]) => <tr className="sub" key={name + l}><td>{l}</td><td /><td>{f1(a.q * s)}</td><td>{a.unit}</td></tr>),
                ...(ACCESSORIES[k] || []).map(([l, per, u]) => <tr className="sub" key={name + l}><td>{l}</td><td>quantity only</td><td>{f1(a.q * per)}</td><td>{u}</td></tr>)]; })}
            </tbody></table></div> : <p className="mut sm">No bulk materials in this field. The work is covered by man-hours ({num(x.h)} h) and professional fees.</p>}
          </section>);
      })}
      <p className="mut sm">Splits by size or type and accessories are illustrative typical values taken from the totals above; confirm against drawings, load schedules and the bill of quantities.</p>
    </>);
}
