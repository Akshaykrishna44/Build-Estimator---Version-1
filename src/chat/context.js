import { calculate, isValid, TR } from "../engine/calc.js";
import { qty, estTotals, lineAmt } from "../lib.js";
export function buildContext(S, E) {
  const { type, land, cov, floors, days, hpd, loc, oh, ct, gst } = E, r = isValid(E) && E.calc ? calculate(E) : null;
  const T = estTotals(S.est), est = S.est;
  const d = {
    estimateBuilder: { project: { name: est.name, district: est.district, type: E.type, area: est.area, schedule: est.sched, year: est.year },
      workItems: est.items.filter((i) => i.desc || i.qty || i.rate).map((i) => ({ desc: i.desc, qty: i.qty, unit: i.unit, rate: i.rate, amount: lineAmt(i) })),
      tax: est.tax, calculated: est.calc, totals: est.calc ? { subtotal: Math.round(T.sub), gst: Math.round(T.gst), otherProvisions: Math.round(T.other), total: Math.round(T.total) } : "not calculated yet" },
    materialsAndManpower: { inputs: { type, land, cov, floors, days, hpd, loc, oh, ct, gst }, calculated: !!r,
      results: r ? { totalINR: Math.round(r.total), materialsINR: Math.round(r.mc), labourINR: Math.round(r.lc), equipmentINR: Math.round(r.ec), builtUpM2: Math.round(r.BS), manHours: Math.round(r.hrs), peakWorkers: r.peak, waterKL: Math.round(r.wtot / 1000),
        materialQuantities: Object.fromEntries(Object.keys(r.tot).map((k) => [r.MM[k][0] + " (" + r.MM[k][1] + ")", Math.round(r.tot[k])])),
        workersByTrade: r.tr.map(([k, h, w]) => ({ trade: TR[k][0], manHours: Math.round(h), workers: w })),
        topMaterialsByCost: Object.keys(r.tot).map((k) => ({ material: r.MM[k][0], qty: Math.round(r.tot[k]), unit: r.MM[k][1], cost: Math.round(r.tot[k] * r.MM[k][2] * +loc.split(",")[1]) })).sort((a, b) => b.cost - a.cost).slice(0, 8) } : "not calculated yet" },
    projects: S.projects.map((p) => ({ name: p.name, district: p.district, type: p.type, area: p.area, status: p.status })),
    measurements: S.meas.filter((m) => qty(m) > 0).map((m) => ({ item: m.desc, qty: qty(m), unit: m.unit })),
    rateReferences: S.refs.length, documents: S.docs.length,
  };
  return JSON.stringify(d).slice(0, 12000);
}
