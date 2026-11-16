import { useState } from "react";
import EstimateBuilder from "./EstimateBuilder.jsx";
import Detailed from "./Detailed.jsx";
// One "Estimator" screen: the blank-start estimate builder and the detailed estimator (earlier project) as two views.
const VIEWS = [["builder", "Estimate builder"], ["detailed", "Detailed estimate"]];
export default function EstimatorScreen(props) {
  const [tab, setTab] = useState("builder");
  const tabs = <nav className="tabs" aria-label="Estimator views">{VIEWS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</nav>;
  return tab === "builder" ? <EstimateBuilder {...props} tabs={tabs} /> : <Detailed tabs={tabs} />;
}
