import { useState, useEffect } from "react";
export function useLocal(key, init) {
  const [v, setV] = useState(() => { try { return { ...init, ...JSON.parse(localStorage.getItem(key) || "{}") }; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
export const inr = (v, d = 2) => "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
export const n = (v) => +v || 0;
export const qty = (r) => { const v = [r.c, r.l, r.b, r.d]; return v.some((x) => x !== undefined && x !== "") ? +v.reduce((a, x) => a * (n(x) || 1), 1).toFixed(3) : 0; };
export const today = () => new Date().toLocaleDateString("en-IN");
export const EST0 = { name: "", district: "", type: "", area: "", sched: "", year: "", items: [{}, {}, {}], tax: {}, calc: false };
export const lineAmt = (i) => n(i.qty) * n(i.rate);
export function estTotals(e) {
  const sub = e.items.reduce((s, i) => s + lineAmt(i), 0), t = e.tax || {};
  const other = sub * (n(t.cont) + n(t.cess) + n(t.loc)) / 100, gst = sub * n(t.gst) / 100;
  return { sub, gst, other, total: sub + gst + other };
}
