import { useRef } from "react";
import { Head } from "../ui.jsx";
import legacy from "../legacy/estimator.html?raw";
// The earlier Build Estimator project, embedded as its own screen (own data; not linked to Projects or the BOQ).
export default function Detailed({ tabs }) {
  const ref = useRef(null);
  const onLoad = () => {
    const f = ref.current, d = f?.contentDocument;
    if (!d) return;
    const fit = () => { f.style.height = Math.max(d.documentElement.scrollHeight, 700) + "px"; };
    fit(); new ResizeObserver(fit).observe(d.body);
  };
  return (
    <div className="vwrap">
      <Head t="Estimator" s="Detailed estimate: land cost, timber, CPWD or TN PWD rates, editable grades, trades and work items, and a CSV report." />
      {tabs}
      <iframe ref={ref} className="legacy" title="Detailed estimator" srcDoc={legacy} onLoad={onLoad} />
    </div>);
}
