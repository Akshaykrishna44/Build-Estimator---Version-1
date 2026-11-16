import { Head, Panel, Pick, Field, Note, ctxBind } from "../ui.jsx";
import { inr, estTotals, lineAmt } from "../lib.js";
const OPTS = ["Project information", "Measurement sheet", "Bill of quantities", "Rate source references", "Tax and addition breakdown", "Supporting document list"];
export default function Reports({ S, up }) {
  const c = ctxBind(S, up), est = S.est, T = estTotals(est), on = est.calc;
  const rows = est.items.filter((i) => (i.desc || "").trim() && lineAmt(i) > 0);
  const out = (v) => (on ? inr(v) : "–");
  const download = () => {
    const q = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
    const csv = [["Item", "Quantity", "Unit", "Rate", "Amount"], ...rows.map((i) => [i.desc, i.qty, i.unit, i.rate, lineAmt(i)]), [], ["Subtotal", T.sub], ["Taxes and additions", T.gst + T.other], ["Estimated total", T.total]].map((r) => r.map(q).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "estimate-draft.csv"; a.click();
  };
  return (
    <div className="vwrap">
      <Head t="Reports" s="Review your estimate and choose what to include in the draft report."><button className="btn p" onClick={() => window.print()}>Generate report</button></Head>
      <Panel t="Report settings"><div className="g3"><Pick l="Project" o={S.projects.map((p) => p.name)} {...c("rproj")} /><Field l="Estimate" {...c("rest")} /><Pick l="Export format" o={["PDF (print dialog)", "CSV"]} {...c("rfmt")} /></div>
        <p className="mut sm">Reports remain blank until a project has measured quantities and calculated work items.</p></Panel>
      <div className="sp2">
        <Panel t="Estimate abstract"><div className="g2"><label>Project name<b className="ro">{on ? est.name : ""}</b></label><label>District<b className="ro">{on ? est.district : ""}</b></label></div>
          <div className="sc"><table><thead><tr><th>WORK ITEM</th><th>QUANTITY</th><th>AMOUNT (₹)</th></tr></thead><tbody>
            {on && rows.map((i, k) => <tr key={k}><td>{i.desc}</td><td>{i.qty} {i.unit}</td><td className="amt">{inr(lineAmt(i))}</td></tr>)}
            {(!on || !rows.length) && <tr><td colSpan="3" className="em"><b>Your report preview will appear here</b><br />Calculate an estimate to populate the abstract.</td></tr>}</tbody></table></div>
          <div className="kv"><span>Subtotal (₹)</span><b>{out(T.sub)}</b></div><div className="kv"><span>Taxes and additions (₹)</span><b>{out(T.gst + T.other)}</b></div>
          <div className="kv tot"><span>Estimated total (₹)</span><b>{out(T.total)}</b></div><p className="mut sm">Draft only · Subject to technical review and applicable approvals.</p></Panel>
        <Panel t="Include in report">{OPTS.map((o, i) => <label key={o} className="ck"><input type="checkbox" checked={!!S.chk["o" + i]} onChange={(e) => up("chk", (k) => ({ ...k, ["o" + i]: e.target.checked }))} />{o}</label>)}
          <h2 style={{ marginTop: 20, fontSize: 14 }}>Before exporting</h2><p className="mut sm">Confirm the project scope, schedule edition, measurement basis, and tax applicability. Government approval is not implied by this report.</p>
          <div className="acts"><button className="btn w" onClick={download}>Download draft</button><button className="btn w" onClick={() => window.print()}>Print preview</button></div></Panel>
      </div><Note />
    </div>);
}
