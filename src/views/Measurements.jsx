import { useState } from "react";
import { Head, Panel, Field, Pick, Tbl, Del, Note, ctxBind } from "../ui.jsx";
import { qty, n } from "../lib.js";
export default function Measurements({ S, up }) {
  const [msg, setMsg] = useState(""), c = ctxBind(S, up);
  const setRow = (i, k, v) => up("meas", (l) => l.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const gross = S.meas.reduce((s, r) => s + qty(r), 0), net = gross - n(S.ctx.ded);
  const add = () => {
    if (net <= 0) return setMsg("Enter dimensions first; net quantity must be above zero.");
    up("est", (e) => { const row = { desc: S.ctx.link || S.meas[0]?.desc || "Measured item", qty: +net.toFixed(3), unit: S.meas[0]?.unit || "", rate: "" }; const i = e.items.findIndex((x) => !x.desc && !x.qty); return { ...e, items: i >= 0 ? e.items.map((x, j) => (j === i ? row : x)) : [...e.items, row] }; });
    setMsg("Added to the work items. Enter the rate in Estimate builder.");
  };
  return (
    <div className="vwrap">
      <Head t="Measurements" s="Build quantities from site dimensions before adding them to the bill of quantities."><button className="btn p" onClick={() => setMsg("Measurements saved in this browser.")}>Save measurements</button></Head>
      <Panel t="Measurement context"><div className="g3"><Pick l="Project" o={S.projects.map((p) => p.name)} {...c("mproj")} /><Field l="Work group" {...c("wg")} /><Field l="Measurement basis" {...c("mb")} /></div></Panel>
      <Panel t="Dimension sheet">
        <div className="acts r"><button className="btn s" onClick={() => up("meas", (l) => [...l, {}])}>+ Add row</button></div>
        <Tbl h={["Description", "Count", "Length (m)", "Breadth (m)", "Depth (m)", "Quantity", "Unit", ""]}>
          {S.meas.map((r, i) => <tr key={i}><td><input className="pl n" aria-label={`Description, row ${i + 1}`} value={r.desc || ""} onChange={(e) => setRow(i, "desc", e.target.value)} /></td>
            {["c", "l", "b", "d"].map((k) => <td key={k}><input className="pl q" aria-label={`${{ c: "Count", l: "Length", b: "Breadth", d: "Depth" }[k]}, row ${i + 1}`} type="number" min="0" step="any" value={r[k] ?? ""} onChange={(e) => setRow(i, k, e.target.value)} /></td>)}
            <td className="amt">{qty(r)}</td><td><input className="pl u" aria-label={`Unit, row ${i + 1}`} value={r.unit || ""} onChange={(e) => setRow(i, "unit", e.target.value)} /></td>
            <td>{S.meas.length > 1 && <Del label="Delete row" onClick={() => up("meas", (l) => l.filter((_, j) => j !== i))} />}</td></tr>)}
        </Tbl><p className="mut sm">Use the measurement rules applicable to each work item; record deductions separately.</p>
      </Panel>
      <div className="sp2">
        <Panel t="Quantity calculation"><div className="g3"><label>Gross quantity<b className="ro">{gross > 0 ? +gross.toFixed(3) : "–"}</b></label><Field l="Deductions" type="number" {...c("ded")} /><label>Net quantity<b className="ro">{gross > 0 ? +net.toFixed(3) : "–"}</b></label></div>
          <Field l="Linked BOQ item" {...c("link")} />{msg && <p className="am sm">{msg}</p>}<div className="acts"><button className="btn p" onClick={add}>Add quantity to BOQ</button></div></Panel>
        <Panel t="Measurement notes"><p className="mut sm">Record the basis, exclusions, and site observations.</p><textarea rows="6" aria-label="Measurement notes" {...c("notes")} /><p className="mut sm">Confirm the applicable measurement standard.</p></Panel>
      </div><Note />
    </div>);
}
