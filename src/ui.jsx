import { TYPE_GROUPS } from "./data/options.js";
export const Head = ({ t, s, children }) => <div className="vh"><div><h1>{t}</h1><p className="mut">{s}</p></div>{children}</div>;
export const Panel = ({ t, children, cls = "" }) => <section className={"vp " + cls}><h2>{t}</h2>{children}</section>;
export const Field = ({ l, ...p }) => <label>{l}<input {...p} /></label>;
export const Pick = ({ l, o, ...p }) => <label>{l}<select {...p}><option value="">Select</option>{o.map((x) => <option key={x}>{x}</option>)}</select></label>;
export const Tbl = ({ h, children, empty }) => (
  <div className="sc"><table><thead><tr>{h.map((x, i) => <th key={i}>{x || <span className="sr">Actions</span>}</th>)}</tr></thead>
    <tbody>{children}{empty && <tr><td colSpan={h.length} className="em"><b>{empty[0]}</b><br />{empty[1]}</td></tr>}</tbody></table></div>
);
export const Del = ({ onClick, label }) => <button className="x" onClick={onClick} aria-label={label}>×</button>;
export const Note = () => <p className="mut sm">PWD context · Verify the applicable schedule, taxes, and project requirements before official use.</p>;
export const ctxBind = (S, up) => (k) => ({ value: S.ctx[k] || "", onChange: (e) => up("ctx", (c) => ({ ...c, [k]: e.target.value })) });
export const typeLabel = (id) => TYPE_GROUPS.flatMap(([, o]) => o).find((x) => x[0] === id)?.[1] || "";
export const TypeSelect = ({ l, byId, ...p }) => (
  <label>{l}<select {...p}><option value="">Select</option>{TYPE_GROUPS.map(([g, o]) => <optgroup key={g} label={g}>{o.map(([v, x]) => <option key={v} value={byId ? v : x}>{x}</option>)}</optgroup>)}</select></label>
);
export const typeId = (label) => TYPE_GROUPS.flatMap(([, o]) => o).find((x) => x[1] === label)?.[0] || "";
