import { TYPE_GROUPS, LOCS } from "../data/options.js";
import { today } from "../lib.js";
const TYPE_IDS = TYPE_GROUPS.flatMap(([, o]) => o.map((x) => x[0])), LOC_IDS = LOCS.map((x) => x[0]);
export const SCREENS = ["projects", "estimate", "measurements", "rates", "documents", "reports"];
const num = (v, lo, hi) => { const n = +v; return v !== "" && v != null && Number.isFinite(n) ? Math.min(Math.max(n, lo), hi) : undefined; };
const str = (v, n) => String(v ?? "").slice(0, n);
const RANGE = { land: [100, 1e7], cov: [1, 100], floors: [1, 20], days: [1, 5000], hpd: [1, 16], oh: [0, 100], ct: [0, 100], gst: [0, 100] };
function clean(a) {
  if (!a || typeof a !== "object") return null;
  switch (a.type) {
    case "navigate": return SCREENS.includes(a.to) ? { type: "navigate", to: a.to } : null;
    case "setEstimate": {
      const v = a.values || {}, o = {};
      for (const k in RANGE) { const n = num(v[k], ...RANGE[k]); if (n !== undefined) o[k] = n; }
      if (TYPE_IDS.includes(v.type)) o.type = v.type;
      if (LOC_IDS.includes(v.loc)) o.loc = v.loc;
      return Object.keys(o).length ? { type: "setEstimate", values: o } : null;
    }
    case "addBoq": { const q = num(a.qty, 0, 1e9); return a.desc && q !== undefined ? { type: "addBoq", desc: str(a.desc, 120), qty: q, unit: str(a.unit, 12), rate: num(a.rate, 0, 1e9) || 0 } : null; }
    case "addProject": return a.name ? { type: "addProject", name: str(a.name, 120), district: str(a.district, 60), area: str(a.area, 20) } : null;
    case "addMeasurement": return a.desc ? { type: "addMeasurement", desc: str(a.desc, 120), unit: str(a.unit, 12), c: num(a.count, 0, 1e9), l: num(a.length, 0, 1e9), b: num(a.breadth, 0, 1e9), d: num(a.depth, 0, 1e9) } : null;
    case "addRate": return a.desc ? { type: "addRate", code: str(a.code, 30), desc: str(a.desc, 120), unit: str(a.unit, 12), rate: num(a.rate, 0, 1e9) ?? 0, src: str(a.source, 60) } : null;
    case "setTax": { const o = {}; for (const k of ["gst", "cont", "cess", "loc"]) { const n = num(a[k], 0, 100); if (n !== undefined) o[k] = String(n); } return Object.keys(o).length ? { type: "setTax", values: o } : null; }
    default: return null;
  }
}
export function parseActions(text) {
  const m = text.match(/```actions\s*([\s\S]*?)```/); let list = [];
  if (m) { try { list = JSON.parse(m[1]); } catch { /* malformed block is ignored */ } }
  return { shown: text.replace(/```actions[\s\S]*?```/, "").trim(), actions: (Array.isArray(list) ? list : []).map(clean).filter(Boolean).slice(0, 12) };
}
export function reduce({ S, E }, a) {
  switch (a.type) {
    case "setEstimate": return { S, E: { ...E, ...a.values, calc: true } };
    case "setTax": return { S: { ...S, est: { ...S.est, tax: { ...S.est.tax, ...a.values } } }, E };
    case "addBoq": { const row = { desc: a.desc, qty: a.qty, unit: a.unit, rate: a.rate || "" }, i = S.est.items.findIndex((r) => !r.desc && !r.qty); return { S: { ...S, est: { ...S.est, items: i >= 0 ? S.est.items.map((r, j) => (j === i ? row : r)) : [...S.est.items, row] } }, E }; }
    case "addProject": { const id = Date.now() + Math.random(); return { S: { ...S, projects: [{ id, name: a.name, district: a.district, area: a.area, type: "", status: "Draft", date: today() }, ...S.projects], est: { ...S.est, projectId: id, name: a.name, district: a.district, area: a.area } }, E }; }
    case "addRate": return { S: { ...S, refs: [...S.refs, { code: a.code, desc: a.desc, unit: a.unit, rate: a.rate, src: a.src || "Agent", status: "Unverified" }] }, E };
    case "addMeasurement": { const row = { desc: a.desc, unit: a.unit, c: a.c, l: a.l, b: a.b, d: a.d }, i = S.meas.findIndex((r) => !r.desc && !r.c && !r.l && !r.b && !r.d);
      return { S: { ...S, meas: i >= 0 ? S.meas.map((r, j) => (j === i ? row : r)) : [...S.meas, row] }, E }; }
    default: return { S, E };
  }
}
export const describe = (a) => ({
  navigate: () => "Opened " + a.to,
  setEstimate: () => "Set estimate: " + Object.entries(a.values || {}).map(([k, v]) => `${k} ${v}`).join(", "),
  setTax: () => "Set tax: " + Object.entries(a.values || {}).map(([k, v]) => `${k} ${v}%`).join(", "),
  addBoq: () => `Added to BOQ: ${a.desc}, ${a.qty} ${a.unit}${a.rate ? " @ ₹" + a.rate : ""}`,
  addProject: () => `Created project: ${a.name}${a.district ? ", " + a.district : ""}`,
  addRate: () => `Added rate: ${a.desc} ₹${a.rate}/${a.unit}`,
  addMeasurement: () => `Added measurement: ${a.desc}`,
}[a.type]?.() ?? a.type);
export const SYSTEM = `You are the Build Estimator agent, working inside a construction estimation app (cost, materials, man-hours, workers per trade, water; Tamil Nadu PWD rate context). You act like a capable colleague: answer questions, plan, and do the work in the app for the user.
Use the PROJECT DATA json (the live state of the app). The app starts blank: the user enters project details and work items, then presses Calculate; results show "not calculated yet" until then. Be concise and practical, state assumptions, and say what is missing instead of guessing. Rates and norms in the app are indicative: remind the user to verify with local quotes and a qualified engineer when giving cost advice.
To DO something, end your reply with ONE fenced block named actions holding a JSON array. Actions are applied immediately and the user can undo them; you then receive the updated PROJECT DATA and can continue, so work step by step and finish with a short summary and no actions block. Only act when the user asked or clearly agreed. Available actions:
{"type":"setEstimate","values":{...}}  keys: land (m²), cov (% per floor), floors, days, hpd, oh, ct, gst (percent), type (one of: ${TYPE_IDS.join(", ")}), loc (one of: ${LOC_IDS.join(" | ")})
{"type":"setTax","gst":18,"cont":5,"cess":1,"loc":0}  (report additions, percent)
{"type":"addBoq","desc":"RCC M25 slab","qty":40,"unit":"m3","rate":8500}
{"type":"addMeasurement","desc":"Footing F1","count":12,"length":1.5,"breadth":1.5,"depth":0.45,"unit":"m3"}
{"type":"addProject","name":"Plant A","district":"Coimbatore","area":"4500"}
{"type":"addRate","code":"NS-1","desc":"Item","unit":"m3","rate":5200,"source":"Local quote"}
{"type":"navigate","to":"projects|estimate|measurements|rates|documents|reports"}`;
