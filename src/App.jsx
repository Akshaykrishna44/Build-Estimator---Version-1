import { useEffect, useState } from "react";
import { useLocal, EST0 } from "./lib.js";
import { DEFAULTS as EST_DEFAULTS } from "./views/Estimator.jsx";
import EstimatorScreen from "./views/EstimatorScreen.jsx";
import Projects from "./views/Projects.jsx";
import Measurements from "./views/Measurements.jsx";
import Rates from "./views/Rates.jsx";
import Documents from "./views/Documents.jsx";
import Reports from "./views/Reports.jsx";
import Agent from "./chat/Agent.jsx";
const NAV = [["projects", "Projects", Projects], ["estimate", "Estimator", EstimatorScreen], ["measurements", "Measurements", Measurements], ["rates", "PWD rate references", Rates], ["documents", "Documents", Documents], ["reports", "Reports", Reports]];
const DEF = { projects: [], est: EST0, docs: [], refs: [], meas: [{}, {}, {}, {}], chk: {}, ctx: {} };
const route = () => (NAV.some((x) => x[0] === location.hash.slice(1)) ? location.hash.slice(1) : "estimate");
export default function App() {
  const [S, setS] = useLocal("bw3", DEF), [E, setE] = useLocal("bw-est3", EST_DEFAULTS), [v, setV] = useState(route), [tab, setTab] = useState("menu");
  const up = (k, f) => setS((s) => ({ ...s, [k]: f(s[k]) }));
  useEffect(() => { const h = () => { setV(route()); window.scrollTo(0, 0); }; window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h); }, []);
  const [, name, View] = NAV.find((x) => x[0] === v);
  return (
    <div className="app">
      <aside className={"side" + (tab === "agent" ? " wide" : "")}>
        <div className="bh"><b>Build Estimator</b><small>Construction estimating workflow</small></div>
        <div className="seg" role="tablist" aria-label="Sidebar view"><button role="tab" aria-selected={tab === "menu"} className={tab === "menu" ? "on" : ""} onClick={() => setTab("menu")}>Menu</button><button role="tab" aria-selected={tab === "agent"} className={tab === "agent" ? "on" : ""} onClick={() => setTab("agent")}>Queries</button></div>
        <div className="pane menupane" hidden={tab !== "menu"}>
          <div className="lbl">WORKSPACE</div>
          {NAV.map(([k, l]) => <a key={k} href={"#" + k} className={"nav" + (k === v ? " on" : "")}>{l}</a>)}
          <div className="acct"><b>Draft estimates only</b><small>Verify the applicable schedule and project requirements.</small></div>
        </div>
        <div className="pane agentpane" hidden={tab !== "agent"}><div className="lbl qh">ENTER YOUR QUERIES</div><Agent S={S} setS={setS} E={E} setE={setE} /></div>
      </aside>
      <div className="main">
        <header className="top"><span>Workspace › <b>{name}</b></span><span className="g" /><button className="btn" onClick={() => window.print()}>↓ Export PDF</button></header>
        <main><View S={S} up={up} E={E} setE={setE} /></main>
      </div>
    </div>);
}
