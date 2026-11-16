import { describe, it, expect } from "vitest";
import { calculate, isValid, materials } from "../src/engine/calc.js";
import { CAT, DEF, ITEMS } from "../src/data/estimatorData.js";
const base = { type: "manuf", land: 9290.3, cov: 50, floors: 1, days: 300, hpd: 8, loc: "1,1", oh: 8, ct: 10, gst: 18, wages: {}, sel: {}, adj: {} };
const total = (o = {}) => calculate({ ...base, ...o }).total;

describe("isValid", () => {
  it("rejects a blank start", () => expect(isValid({ type: "", land: "", cov: "", floors: "", days: "", hpd: "", loc: "" })).toBe(false));
  it("accepts a complete set of inputs", () => expect(isValid(base)).toBe(true));
  it("rejects zero or missing required values", () => {
    expect(isValid({ ...base, land: 0 })).toBe(false);
    expect(isValid({ ...base, loc: "" })).toBe(false);
    expect(isValid({ ...base, type: "" })).toBe(false);
  });
});

describe("calculate", () => {
  it("returns finite, positive results", () => {
    const r = calculate(base);
    for (const v of [r.total, r.mc, r.lc, r.ec, r.hrs, r.wtot]) expect(Number.isFinite(v) && v > 0).toBe(true);
  });
  it("keeps the m² regression value (9,290.3 m² = old 100,000 sq ft)", () => expect(Math.round(total())).toBe(52247178));
  it("built-up area is land x coverage x floors in m²", () => expect(calculate({ ...base, land: 1000, cov: 50, floors: 2 }).BS).toBe(1000));
  it("total = base + overhead + contingency + GST", () => {
    const r = calculate(base), b = r.mc + r.lc + r.ec, oh = b * 0.08, ct = (b + oh) * 0.1, gst = (b + oh + ct) * 0.18;
    expect(r.total).toBeCloseTo(b + oh + ct + gst, 4);
  });
  it("scales linearly with land area", () => expect(Math.abs(total({ land: base.land * 2 }) / total() - 2)).toBeLessThan(1e-9));
  it("blank overhead, contingency and GST count as zero", () => {
    const r = calculate({ ...base, oh: "", ct: "", gst: "" });
    expect(r.total).toBeCloseTo(r.mc + r.lc + r.ec, 4);
  });
  it("location factors: labour factor moves labour only, material factor moves materials and equipment", () => {
    const a = calculate(base), b = calculate({ ...base, loc: "1,2" }), c = calculate({ ...base, loc: "2,1" });
    expect(b.mc / a.mc).toBeCloseTo(2, 6); expect(b.lc).toBeCloseTo(a.lc, 4);
    expect(c.lc / a.lc).toBeCloseTo(2, 6); expect(c.mc).toBeCloseTo(a.mc, 4);
  });
  it("peak workers equals the sum of workers across trades", () => {
    const r = calculate(base);
    expect(r.peak).toBe(r.tr.reduce((s, t) => s + t[2], 0));
    r.tr.forEach(([, h, w]) => expect(w).toBe(Math.ceil(h / (300 * 8))));
  });
  it("more working days means fewer workers", () => expect(calculate({ ...base, days: 600 }).peak).toBeLessThanOrEqual(calculate(base).peak));
  it("removing a work item with a 0 multiplier lowers the cost", () => expect(ITEMS.some((it) => total({ adj: { [it.id]: 0 } }) < total())).toBe(true));
  it("water total is phase water plus site labour water", () => {
    const r = calculate(base), ph = Object.values(r.phases).reduce((s, p) => s + p.w, 0);
    expect(r.wtot).toBeCloseTo(ph + r.lw, 4);
  });
});

describe("materials", () => {
  it("uses the default grade when nothing is selected", () => {
    const m = materials({}); for (const k in CAT) expect(m[k][2]).toBe(CAT[k][DEF[k] || 0][2]);
  });
  it("applies a selected grade and a custom rate", () => {
    const k = Object.keys(CAT)[0];
    expect(materials({ [k]: { i: 0, rate: 999 } })[k][2]).toBe(999);
    expect(calculate({ ...base, sel: { [k]: { i: 0, rate: 999999 } } }).mc).toBeGreaterThan(calculate(base).mc);
  });
});
