import { useState } from "react";
import { Head, Panel, Field, Tbl, Del, Note, ctxBind } from "../ui.jsx";
import { inr, n } from "../lib.js";
export default function Rates({ S, up }) {
  const [f, setF] = useState({}), [a, setA] = useState({}), [err, setErr] = useState(""), c = ctxBind(S, up);
  const b = (k) => ({ value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const ab = (k) => ({ value: a[k] || "", onChange: (e) => setA({ ...a, [k]: e.target.value }) });
  const rate = n(a.mat) + n(a.lab) + n(a.pl);
  const addRef = () => { if (!(f.desc || "").trim()) return setErr("Enter a description."); up("refs", (l) => [...l, { ...f, status: "Unverified" }]); setF({}); setErr(""); };
  const saveAn = () => { if (!(a.desc || "").trim()) return; up("refs", (l) => [...l, { code: "NS-" + (l.length + 1), desc: a.desc, unit: a.unit, rate, src: "Non-schedule analysis", status: "Own analysis" }]); setA({}); };
  const importCsv = (e) => e.target.files[0]?.text().then((t) => up("refs", (l) => [...l, ...t.split(/\r?\n/).map((r) => r.split(",").map((s) => s.trim())).filter((r) => r.length >= 4 && !isNaN(+r[3]))
    .map((r) => ({ code: r[0], desc: r[1], unit: r[2], rate: r[3], src: "CSV import", status: "Unverified" }))]));
  return (
    <div className="vwrap">
      <Head t="PWD rate references" s="Keep schedule references separate from your own rate analysis."><label className="btn p fl">Import rates<input type="file" accept=".csv,text/csv" hidden onChange={importCsv} /></label></Head>
      <Panel t="Schedule source"><div className="g4"><Field l="Schedule title" {...c("st")} /><Field l="Schedule year" {...c("sy")} /><Field l="District" {...c("sd")} /><Field l="Source / document reference" {...c("sr")} /></div>
        <p className="mut sm">No schedule is selected or verified. Confirm the edition, amendments, effective date, and local applicability.</p></Panel>
      <Panel t="Rate library">
        <div className="g6"><Field l="Item code" {...b("code")} /><Field l="Description" {...b("desc")} /><Field l="Unit" {...b("unit")} /><Field l="Rate (₹)" type="number" min="0" {...b("rate")} /><Field l="Source" {...b("src")} /><button className="btn s" onClick={addRef}>Add reference</button></div>
        {err && <p className="am sm">{err}</p>}
        <Tbl h={["ITEM CODE", "DESCRIPTION", "UNIT", "RATE (₹)", "SOURCE", "STATUS", ""]} empty={!S.refs.length && ["No rate references added", "Import a schedule or record a reference with its source."]}>
          {S.refs.map((r, i) => <tr key={i}><td>{r.code}</td><td>{r.desc}</td><td>{r.unit}</td><td className="amt">{inr(n(r.rate))}</td><td>{r.src}</td><td><span className="tg">{r.status}</span></td><td><Del label="Delete reference" onClick={() => up("refs", (l) => l.filter((_, j) => j !== i))} /></td></tr>)}
        </Tbl><p className="mut sm">Import accepts a CSV with item code, description, unit, rate.</p>
      </Panel>
      <div className="sp2">
        <Panel t="Non-schedule rate analysis"><div className="g2"><Field l="Item description" {...ab("desc")} /><Field l="Unit" {...ab("unit")} /><Field l="Materials (₹)" type="number" min="0" {...ab("mat")} /><Field l="Labour (₹)" type="number" min="0" {...ab("lab")} />
          <Field l="Plant & tools (₹)" type="number" min="0" {...ab("pl")} /><label>Analysed rate<b className="ro">{inr(rate)}</b></label></div>
          <div className="acts"><button className="btn p" onClick={saveAn}>Save analysis</button><span className="mut sm">Document all inclusions and exclusions.</span></div></Panel>
        <Panel t="Verify before applying">{["Match the item description and unit.", "Check the applicable schedule and amendments.", "Confirm location additions and lead / lift.", "Avoid duplicate overhead or profit provisions."]
          .map((t, i) => <label key={i} className="ck"><input type="checkbox" checked={!!S.chk["v" + i]} onChange={(e) => up("chk", (k) => ({ ...k, ["v" + i]: e.target.checked }))} />{t}</label>)}
          <p className="mut sm">Imported rates are references, not approval.</p></Panel>
      </div><Note />
    </div>);
}
