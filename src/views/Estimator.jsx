import { useMemo, useState } from "react";
import FieldMaterials from "./FieldMaterials.jsx";
import { calculate, isValid, fmt, num, TR, ITEMS, CAT } from "../engine/calc.js";
import { TYPE_GROUPS, LOCS } from "../data/options.js";
const COL = ["#111827", "#6b7280", "#9ca3af", "#d1d5db"];
export const DEFAULTS = { type: "", land: "", cov: "", floors: "", days: "", hpd: "", loc: "", oh: "", ct: "", gst: "", wages: {}, sel: {}, adj: {}, calc: false };
const TABS = [["est", "Estimate"], ["field", "Materials by field"], ["mat", "Materials and prices"], ["work", "Workers"], ["water", "Water"]];
const f1 = (v) => (v < 10 ? v.toFixed(1) : num(v));

export default function Estimator({ E: p, setE: setP }) {
  const [msg, setMsg] = useState("");
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const nb = (k) => ({ type: "number", value: p[k], onChange: (e) => set(k, e.target.value) });
  const ok = isValid(p);
  const r = useMemo(() => (ok && p.calc ? calculate(p) : null), [p, ok]);
  const go = () => { if (!ok) { set("calc", false); return setMsg("Choose the project type above, then enter land area, coverage, floors, working days, hours per day and location first."); } setMsg(""); set("calc", true); };
  return (
    <>
      <section className="vp"><h2>Materials, man-hours and workers</h2><p className="mut sm">Optional: enter the project parameters, then calculate materials, labour, workers and water.</p>
        <div className="g3">
          <label>Land area (m²)<input {...nb("land")} min="10" /></label>
          <label>Built-up coverage per floor (% of land)<input {...nb("cov")} min="1" max="100" /></label>
          <label>Floors<input {...nb("floors")} min="1" max="20" /></label>
          <label>Schedule (working days)<input {...nb("days")} min="1" /></label>
          <label>Hours per day<input {...nb("hpd")} min="1" max="16" /></label>
          <label>Location<select value={p.loc} onChange={(e) => set("loc", e.target.value)}><option value="">Select</option>{LOCS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>Overhead (%)<input {...nb("oh")} min="0" /></label>
          <label>Contingency (%)<input {...nb("ct")} min="0" /></label>
          <label>GST on total (%)<input {...nb("gst")} min="0" /></label>
        </div>
        <details><summary>Edit labour wages (₹ per hour)</summary><div className="g3">{Object.keys(TR).map((k) => <label key={k}>{TR[k][0]}<input type="number" value={p.wages[k] ?? TR[k][1]} onChange={(e) => set("wages", { ...p.wages, [k]: +e.target.value || 0 })} /></label>)}</div></details>
        <details><summary>Fine-tune work-item intensity (multiplier on the project type)</summary><p className="mut sm">1 keeps the project type default, 0 removes the item, 2 doubles it.</p>
          <div className="g3">{ITEMS.map((it) => <label key={it.id}>{it.ph}: {it.n}<input type="number" step="0.1" min="0" value={p.adj[it.id] ?? 1} onChange={(e) => set("adj", { ...p.adj, [it.id]: e.target.value === "" ? 1 : +e.target.value })} /></label>)}</div></details>
      <div className="acts"><button className="btn p" onClick={go}>Calculate materials and workers</button></div>{msg && <p className="am sm">{msg}</p>}</section>
      {r ? <Results p={p} setP={setP} r={r} /> : <p className="mut sm">Results appear here after you enter the project parameters and calculate.</p>}
    </>
  );
}

function Results({ p, setP, r }) {
  const [tab, setTab] = useState("est");
  const setSel = (k, v) => setP((x) => ({ ...x, sel: { ...x.sel, [k]: v } }));
  const phs = Object.keys(r.phases), LM = +p.loc.split(",")[1];
  const parts = [["Materials", r.mc], ["Labour", r.lc], ["Equipment", r.ec], ["Overhead, contingency and GST", r.ohv + r.ctv + r.gv]];
  const kp = [[fmt(r.total), "Total estimate", 1], [num(r.wtot / 1000) + " kL", `Water needed (${num(r.wtot / 10000)} tanker loads of 10 kL)`], [fmt(r.mc), "Materials"], [fmt(r.lc), "Labour"], [fmt(r.ec), "Equipment"],
    [num(r.BS) + " m²", `Built-up area (land ${num(r.LS)} m²)`], [num(r.hrs), "Man-hours"], [r.peak, "Workers across all trades"], [r.BS ? fmt(r.total / r.BS) : "-", "Cost per m² built-up"]];
  const mx = Math.max(...r.tr.map((t) => t[2]), 1);
  return (
    <>
      <nav className="tabs" aria-label="Result views">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</nav>
      {tab === "est" && <>
        <div className="kpis">{kp.map(([v, l, m]) => <div key={l} className={"kpi" + (m ? " main" : "")}><b>{v}</b><span>{l}</span></div>)}</div>
        <section className="vp"><h2>Cost split</h2><div className="split">{parts.map(([, v], i) => <i key={i} style={{ width: (r.total ? v / r.total * 100 : 0) + "%", background: COL[i] }} />)}</div>
          <div className="legend">{parts.map(([nm, v], i) => <span key={nm}><s style={{ background: COL[i] }} />{nm}: {r.total ? Math.round(v / r.total * 100) : 0}%</span>)}</div></section>
        <section className="vp"><h2>Phase summary</h2><div className="sc"><table><thead><tr><th>Phase</th><th>Materials</th><th>Man-hours</th><th>Labour</th><th>Equipment</th></tr></thead><tbody>
          {phs.map((n) => { const x = r.phases[n]; return <tr key={n}><td>{n}</td><td>{fmt(x.m)}</td><td>{num(x.h)}</td><td>{fmt(x.l)}</td><td>{fmt(x.e)}</td></tr>; })}
          <tr><td><b>Overhead ({(r.OH * 100).toFixed(0)}%) and contingency ({(r.CT * 100).toFixed(0)}%)</b></td><td /><td /><td /><td>{fmt(r.ohv + r.ctv)}</td></tr>
          <tr><td><b>GST ({(r.GS * 100).toFixed(0)}%)</b></td><td /><td /><td /><td>{fmt(r.gv)}</td></tr></tbody></table></div></section></>}
      {tab === "field" && <FieldMaterials r={r} />}
      {tab === "mat" && <>
        <section className="vp"><h2>Material specifications and prices</h2><p className="mut sm">Pick a grade or type for each material. The rate fills in and can be edited (₹ per unit).</p>
          <div className="g3">{Object.keys(CAT).map((k) => <div key={k} className="cc"><label>{r.MM[k][0]} (per {r.MM[k][1]})<select value={r.MM[k][6]} onChange={(e) => setSel(k, { i: +e.target.value })}>{CAT[k].map((o, i) => <option key={i} value={i}>{o[0]}: {o[1]}</option>)}</select></label>
            <label>Rate (₹)<input type="number" value={r.MM[k][2]} onChange={(e) => setSel(k, { i: r.MM[k][6], rate: +e.target.value || 0 })} /></label></div>)}</div></section>
        <section className="vp"><h2>Material totals</h2><div className="sc"><table><thead><tr><th>Material</th><th>Selected grade</th><th>Total quantity</th><th>Unit</th><th>Rate</th><th>Cost</th></tr></thead><tbody>
          {Object.keys(r.tot).map((k) => <tr key={k}><td>{r.MM[k][0]}</td><td>{r.MM[k][5]}</td><td>{f1(r.tot[k])}</td><td>{r.MM[k][1]}</td><td>{fmt(r.MM[k][2] * LM)}</td><td>{fmt(r.tot[k] * r.MM[k][2] * LM)}</td></tr>)}</tbody></table></div></section>
        <section className="vp"><h2>Materials list, base to finished</h2><div className="sc"><table><thead><tr><th>Material</th><th>Used in</th><th>Quantity</th><th>Unit</th><th>Rate</th><th>Cost</th></tr></thead><tbody>
          {phs.filter((n) => r.phases[n].rows.length).map((n) => [<tr key={n} className="ph"><td colSpan="6">{n}</td></tr>, ...r.phases[n].rows.map((x, i) => <tr key={n + i}><td>{x[0]}</td><td>{x[5]}</td><td>{f1(x[2])}</td><td>{x[1]}</td><td>{fmt(x[3])}</td><td>{fmt(x[4])}</td></tr>)])}</tbody></table></div></section></>}
      {tab === "work" && <section className="vp"><h2>Workers required by trade</h2><div className="sc"><table><thead><tr><th>Trade</th><th>Man-hours</th><th>Workers</th><th style={{ width: "30%" }}><span className="sr">Workers chart</span></th><th>Labour cost</th></tr></thead><tbody>
        {r.tr.map(([k, t, w, c]) => <tr key={k}><td>{TR[k][0]}</td><td>{num(t)}</td><td><b>{w}</b></td><td><div className="bar" style={{ width: w / mx * 100 + "%" }} /></td><td>{fmt(c)}</td></tr>)}</tbody></table></div>
        <p className="mut sm">Workers = man-hours ÷ (working days × hours per day), rounded up. This assumes each trade works across the full schedule; real projects stagger trades by phase.</p></section>}
      {tab === "water" && <section className="vp"><h2>Water required for construction</h2><div className="sc"><table><thead><tr><th>Source</th><th>Water (kL)</th><th>Share</th></tr></thead><tbody>
        {phs.filter((n) => r.phases[n].w > 0).map((n) => <tr key={n}><td>{n}</td><td>{num(r.phases[n].w / 1000)}</td><td>{Math.round(r.phases[n].w / r.wtot * 100)}%</td></tr>)}
        <tr><td>Site labour (drinking and sanitation, 45 L per worker per day)</td><td>{num(r.lw / 1000)}</td><td>{r.wtot ? Math.round(r.lw / r.wtot * 100) : 0}%</td></tr>
        <tr><td><b>Total</b></td><td><b>{num(r.wtot / 1000)}</b></td><td /></tr></tbody></table></div></section>}
      <p className="mut sm">Rates marked TN PWD SOR are basic rates from the Government of Tamil Nadu Schedule of Rates 2025-26 (excluding GST). All other rates and work norms are illustrative placeholders.</p>
    </>
  );
}
