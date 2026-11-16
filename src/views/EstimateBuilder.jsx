import { useState } from "react";
import { Head, Panel, Field, Note, TypeSelect, typeLabel, typeId } from "../ui.jsx";
import { inr, n, lineAmt, estTotals } from "../lib.js";
import Estimator from "./Estimator.jsx";
const TAX = [["gst", "GST (%)"], ["cont", "Contingency (%)"], ["cess", "Labour cess (%)"], ["loc", "Location addition (%)"]];
export default function EstimateBuilder({ S, up, E, setE, tabs }) {
  const est = S.est, [msg, setMsg] = useState(""), T = estTotals(est), on = est.calc;
  const patch = (x) => up("est", (e) => ({ ...e, ...x }));
  const f = (k) => ({ value: est[k] || "", onChange: (e) => patch({ [k]: e.target.value }) });
  const setItem = (i, k, v) => up("est", (e) => ({ ...e, items: e.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const calc = () => {
    if (!est.items.some((i) => (i.desc || "").trim() && n(i.qty) > 0 && n(i.rate) > 0)) { patch({ calc: false }); return setMsg("Enter at least one work item with a description, quantity and rate."); }
    setMsg(""); patch({ calc: true });
  };
  const save = () => {
    if (!(est.name || "").trim()) return setMsg("Enter a project name to save a draft.");
    up("projects", (l) => [{ id: est.projectId || Date.now(), name: est.name, district: est.district, type: typeLabel(E.type), area: est.area, year: est.year, status: "Draft", date: new Date().toLocaleDateString("en-IN") }, ...l.filter((p) => p.name !== est.name)]);
    setMsg("Draft saved to Projects.");
  };
  const load = (v) => {
    const p = S.projects.find((x) => String(x.id) === v);
    if (!p) return patch({ projectId: "" });
    patch({ projectId: p.id, name: p.name, district: p.district || "", area: p.area || "", year: p.year || "" });
    setE((x) => ({ ...x, type: typeId(p.type) || x.type }));
  };
  const out = (v) => (on ? inr(v) : "–");
  return (
    <div className="vwrap">
      <Head t="Estimator" s="Enter project details and work items to prepare your estimate."><button className="btn" onClick={save}>Save draft</button></Head>
      {tabs}
      <Panel t="Project details"><div className="g3"><label>Saved project<select value={String(est.projectId || "")} onChange={(e) => load(e.target.value)}><option value="">{S.projects.length ? "Select a saved project" : "No saved projects yet"}</option>{S.projects.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</select></label></div><div className="g3" style={{ marginTop: 4 }}><Field l="Project name" {...f("name")} /><Field l="District" {...f("district")} /><TypeSelect l="Project type" byId value={E.type || ""} onChange={(e) => setE((x) => ({ ...x, type: e.target.value }))} />
        <Field l="Area (m²)" type="number" min="0" {...f("area")} /><Field l="PWD rate schedule" {...f("sched")} /><Field l="Schedule year" {...f("year")} /></div></Panel>
      <div className="sp2 wide">
        <Panel t="Work items"><div className="acts r"><button className="btn s" onClick={() => up("est", (e) => ({ ...e, items: [...e.items, {}] }))}>Add item</button></div>
          <p className="mut sm">Add the description, quantity, unit, and rate for each item.</p>
          <div className="sc"><table><thead><tr><th>Description</th><th>Quantity</th><th>Unit</th><th>Rate (₹)</th><th>Amount (₹)</th><th><span className="sr">Actions</span></th></tr></thead><tbody>
            {est.items.map((it, i) => <tr key={i}><td><input className="pl n" aria-label={`Item description, row ${i + 1}`} placeholder="Item description" value={it.desc || ""} onChange={(e) => setItem(i, "desc", e.target.value)} /></td>
              <td><input className="pl q" type="number" min="0" aria-label={`Quantity, row ${i + 1}`} placeholder="Qty" value={it.qty ?? ""} onChange={(e) => setItem(i, "qty", e.target.value)} /></td>
              <td><input className="pl u" aria-label={`Unit, row ${i + 1}`} placeholder="Unit" value={it.unit || ""} onChange={(e) => setItem(i, "unit", e.target.value)} /></td>
              <td><input className="pl q" type="number" min="0" aria-label={`Rate, row ${i + 1}`} placeholder="Rate" value={it.rate ?? ""} onChange={(e) => setItem(i, "rate", e.target.value)} /></td>
              <td className="amt">{on && lineAmt(it) > 0 ? inr(lineAmt(it)) : "–"}</td>
              <td>{est.items.length > 1 && <button className="x" aria-label="Remove item" onClick={() => up("est", (e) => ({ ...e, items: e.items.filter((_, j) => j !== i) }))}>×</button>}</td></tr>)}
          </tbody></table></div><p className="mut sm">Use the applicable PWD schedule and metric units.</p></Panel>
        <Panel t="Estimate summary"><p className="mut sm">{on ? "Calculated from your entries." : "Pending client inputs."}</p>
          <div className="kv"><span>Subtotal (₹)</span><b>{out(T.sub)}</b></div><div className="kv"><span>GST provision (₹)</span><b>{out(T.gst)}</b></div><div className="kv"><span>Other provisions (₹)</span><b>{out(T.other)}</b></div>
          <div className="kv tot"><span>Estimated total (₹)</span><b>{out(T.total)}</b></div>
          {msg && <p className="am sm">{msg}</p>}<div className="acts"><button className="btn p w" onClick={calc}>Calculate estimate</button></div></Panel>
      </div>
      <Panel t="Tax and additions"><div className="g4">{TAX.map(([k, l]) => <Field key={k} l={l} type="number" min="0" value={est.tax[k] || ""} onChange={(e) => up("est", (x) => ({ ...x, tax: { ...x.tax, [k]: e.target.value } }))} />)}</div>
        <p className="mut sm">Leave unassessed provisions blank. Confirm the calculation base and avoid duplicating charges already included in item rates. GST applies to the subtotal; other additions are percentages of the subtotal.</p></Panel>
      <Estimator E={E} setE={setE} />
      <Note /><p className="mut sm">Project values and totals will appear after entry and calculation.</p>
    </div>);
}
