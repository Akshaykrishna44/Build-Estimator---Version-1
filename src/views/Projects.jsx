import { useState } from "react";
import { Head, Panel, Field, Tbl, Del, Note, TypeSelect, typeId } from "../ui.jsx";
import { today } from "../lib.js";
export default function Projects({ S, up, setE }) {
  const [q, setQ] = useState(""), [d, setD] = useState(""), [st, setSt] = useState(""), [f, setF] = useState({}), [err, setErr] = useState("");
  const b = (k) => ({ value: f[k] || "", onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const rows = S.projects.filter((p) => (p.name + (p.client || "")).toLowerCase().includes(q.toLowerCase()) && (!st || (p.status || "").toLowerCase().includes(st.toLowerCase())) && (!d || (p.district || "").toLowerCase().includes(d.toLowerCase())));
  const save = () => {
    if (!(f.name || "").trim()) return setErr("Enter a project name.");
    const id = Date.now();
    up("projects", (l) => [{ ...f, id, status: "Draft", date: today() }, ...l]);
    up("est", (e) => ({ ...e, projectId: id, name: f.name, district: f.district || "", area: f.area || "", year: f.year || "" }));
    setE((x) => ({ ...x, type: typeId(f.type) || x.type })); setF({}); setErr("");
  };
  return (
    <div className="vwrap">
      <Head t="Projects" s="Start a project and keep its estimates, measurements, and documents together.">
        <button className="btn p" onClick={() => { const e = document.getElementById("np_name"); e.scrollIntoView({ behavior: "smooth" }); e.focus(); }}>Create project</button></Head>
      <Panel t="Your projects">
        <div className="g3"><Field l="Search projects" value={q} onChange={(e) => setQ(e.target.value)} /><Field l="District" value={d} onChange={(e) => setD(e.target.value)} /><Field l="Status" value={st} onChange={(e) => setSt(e.target.value)} /></div>
        <Tbl h={["PROJECT", "DISTRICT", "ESTIMATE STATUS", "LAST UPDATED", ""]} empty={!rows.length && ["No projects yet", "Create a project below to begin your estimate."]}>
          {rows.map((p) => <tr key={p.id}><td>{p.name}<small>{[p.type, p.area && "Area " + p.area + " m²"].filter(Boolean).join(" · ")}</small></td><td>{p.district}</td><td><span className="tg">{p.status}</span></td><td>{p.date}</td>
            <td><Del label="Delete project" onClick={() => up("projects", (l) => l.filter((x) => x.id !== p.id))} /></td></tr>)}
        </Tbl>
      </Panel>
      <div className="sp2">
        <Panel t="New project"><p className="mut sm">Project details stay blank until you enter them. A saved project is added to the Estimate builder automatically.</p>
          <div className="g2"><Field l="Project name" id="np_name" {...b("name")} /><Field l="Client / owner" {...b("client")} /><Field l="District" {...b("district")} />
            <TypeSelect l="Project type" {...b("type")} /><Field l="Site address" {...b("addr")} /><Field l="Area (m²)" type="number" min="0" step="0.01" {...b("area")} />
            <Field l="Estimate title" {...b("title")} /><Field l="PWD schedule year" {...b("year")} /></div>
          {err && <p className="am sm">{err}</p>}
          <div className="acts"><button className="btn p" onClick={save}>Save project</button><button className="btn" onClick={() => { setF({}); setErr(""); }}>Clear form</button></div></Panel>
        <Panel t="Keep the project traceable">
          {[["Project information", "Record the site, district, and owner before preparing quantities."], ["Measurement basis", "Keep dimensions and deductions linked to each work item."], ["Rate basis", "Record the schedule edition, item code, and any non-schedule analysis."], ["Review and export", "Review additions and taxes before sharing a draft estimate."]]
            .map(([a, c]) => <p key={a}><b>{a}</b><br /><span className="mut">{c}</span></p>)}</Panel>
      </div><Note />
    </div>);
}
