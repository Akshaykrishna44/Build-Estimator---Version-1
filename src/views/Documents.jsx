import { useState } from "react";
import { Head, Panel, Field, Pick, Tbl, Del, Note, ctxBind } from "../ui.jsx";
import { today } from "../lib.js";
export const DOC_CATS = ["Drawings", "Rate schedules", "Calculations", "Site records", "Approvals"];
export default function Documents({ S, up }) {
  const [q, setQ] = useState(""), [cat, setCat] = useState(""), c = ctxBind(S, up);
  const add = (e) => { const fs = [...e.target.files]; up("docs", (l) => [...fs.map((f, i) => ({ id: Date.now() + i, name: f.name, cat: S.ctx.dcat || "Unassigned", proj: S.ctx.dproj || "Unassigned", date: today() })), ...l]); e.target.value = ""; };
  const rows = S.docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) && (!cat || d.cat === cat));
  return (
    <div className="vwrap">
      <Head t="Documents" s="Keep drawings, schedules, and supporting records attached to the right project."><label className="btn p fl">Upload document<input type="file" multiple hidden onChange={add} /></label></Head>
      <div className="sp2">
        <Panel t="Add supporting documents"><label className="drop">Drop documents here<span className="mut sm">Drawings, rate schedules, calculations, and site records</span><span className="btn">Choose documents</span><input type="file" multiple hidden onChange={add} /></label>
          <p className="mut sm">Only file names and details are recorded in this browser; files are not uploaded.</p></Panel>
        <Panel t="Document details"><div className="g1"><Pick l="Project" o={S.projects.map((p) => p.name)} {...c("dproj")} /><Pick l="Document category" o={DOC_CATS} {...c("dcat")} /></div></Panel>
      </div>
      <Panel t="Project documents"><div className="g2"><Field l="Search documents" value={q} onChange={(e) => setQ(e.target.value)} /><Pick l="Category" o={DOC_CATS} value={cat} onChange={(e) => setCat(e.target.value)} /></div>
        <Tbl h={["DOCUMENT", "CATEGORY", "PROJECT", "ADDED", ""]} empty={!rows.length && ["No documents attached", "Upload a document and assign it to a project."]}>
          {rows.map((d) => <tr key={d.id}><td>{d.name}</td><td>{d.cat}</td><td>{d.proj}</td><td>{d.date}</td><td><Del label="Delete document" onClick={() => up("docs", (l) => l.filter((x) => x.id !== d.id))} /></td></tr>)}</Tbl></Panel>
      <Panel t="Keep a clear audit trail"><div className="g3">{[["Drawings", "Use the revision that matches your measured quantities."], ["Rate schedules", "Keep the source edition and amendments together."], ["Approvals", "Attach supporting records; upload alone is not approval."]]
        .map(([a, t]) => <p key={a}><b>{a}</b><br /><span className="mut">{t}</span></p>)}</div></Panel><Note />
    </div>);
}
