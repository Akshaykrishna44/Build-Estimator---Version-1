import { TR, M, ITEMS, TYPES, CAT, DEF } from "../data/estimatorData.js";
export const fmt = (v) => "₹" + Math.round(v).toLocaleString("en-IN");
export const num = (v) => Math.round(v).toLocaleString("en-IN");
export function materials(sel) {
  const o = {};
  for (const k in M) { const i = sel[k]?.i ?? (DEF[k] || 0), c = CAT[k][i]; o[k] = [M[k][0], M[k][1], sel[k]?.rate ?? c[2], M[k][3], c[3] || 1, c[0] + " (" + c[1] + ")", i]; }
  return o;
}
export function calculate(p) {
  const MM = materials(p.sel), W = (k) => p.wages[k] ?? TR[k][1];
  const F = Math.max(+p.floors || 1, 1), LS = Math.max(+p.land || 0, 0), CV = Math.min(Math.max(+p.cov || 0, 0), 100);
  const BS = (LS * CV / 100) * F, A = BS, /* land and built-up area are in m² */ D = Math.max(+p.days || 1, 1), H = Math.max(+p.hpd || 8, 1);
  const GS = (+p.gst || 0) / 100, [LL, L] = p.loc.split(",").map(Number), OH = (+p.oh || 0) / 100, CT = (+p.ct || 0) / 100, mult = TYPES[p.type] || {};
  const phases = {}, trades = {}, tot = {};
  let mc = 0, lc = 0, ec = 0, hrs = 0, wt = 0;
  for (const k in TR) trades[k] = { h: 0, c: 0 };
  ITEMS.forEach((it) => {
    const f = (mult[it.id] === undefined ? 1 : mult[it.id]) * (p.adj[it.id] === undefined ? 1 : p.adj[it.id]);
    const q = (it.plan ? A / F : A) * it.q * f;
    if (q <= 0) return;
    const ph = phases[it.ph] || (phases[it.ph] = { m: 0, h: 0, l: 0, e: 0, w: 0, rows: [] });
    const wl = q * (it.w || 0); ph.w += wl; wt += wl;
    it.m.forEach(([k, per]) => { const x = q * per * MM[k][4] * (1 + MM[k][3]), c = x * MM[k][2] * L; tot[k] = (tot[k] || 0) + x; ph.m += c; mc += c; ph.rows.push([MM[k][0], MM[k][1], x, MM[k][2] * L, c, it.n]); });
    it.l.forEach(([k, hp]) => { const t = q * hp, c = t * W(k) * LL; ph.h += t; ph.l += c; lc += c; hrs += t; trades[k].h += t; trades[k].c += c; });
    it.e.forEach(([, hp, r]) => { const c = q * hp * r * L; ph.e += c; ec += c; });
  });
  const base = mc + lc + ec, ohv = base * OH, ctv = (base + ohv) * CT, gv = (base + ohv + ctv) * GS, total = base + ohv + ctv + gv;
  let peak = 0;
  const tr = Object.keys(trades).filter((k) => trades[k].h > 0).map((k) => { const w = Math.ceil(trades[k].h / (D * H)); peak += w; return [k, trades[k].h, w, trades[k].c]; });
  const lw = peak * D * 45, wtot = wt + lw;
  return { MM, phases, tr, tot, mc, lc, ec, ohv, ctv, gv, total, BS, LS, hrs, peak, lw, wtot, D, OH, CT, GS };
}
export { TR, ITEMS, CAT };
export const isValid = (p) => !!(p.type && +p.land > 0 && +p.cov > 0 && +p.floors > 0 && +p.days > 0 && +p.hpd > 0 && p.loc);
