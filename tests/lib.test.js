import { describe, it, expect } from "vitest";
import { qty, lineAmt, estTotals, EST0 } from "../src/lib.js";

describe("qty (dimension sheet)", () => {
  it("is 0 for an empty row", () => { expect(qty({})).toBe(0); expect(qty({ c: "", l: "", b: "", d: "" })).toBe(0); });
  it("multiplies count x length x breadth x depth", () => expect(qty({ c: 12, l: 1.5, b: 1.5, d: 0.45 })).toBeCloseTo(12.15, 3));
  it("treats a blank dimension as 1 once another is entered", () => { expect(qty({ l: 4, b: 3 })).toBe(12); expect(qty({ c: 5 })).toBe(5); });
  it("accepts numeric strings from inputs", () => expect(qty({ c: "2", l: "3" })).toBe(6));
});

describe("estimate totals", () => {
  const e = { ...EST0, items: [{ desc: "a", qty: "10", rate: "100" }, { desc: "b", qty: 5, rate: 200 }, {}], tax: { gst: "18", cont: "5", cess: "1", loc: "2" } };
  it("computes line amounts and ignores blanks", () => { expect(lineAmt(e.items[0])).toBe(1000); expect(lineAmt({})).toBe(0); });
  it("GST applies to the subtotal; other additions are percentages of the subtotal", () => {
    const t = estTotals(e);
    expect(t.sub).toBe(2000); expect(t.gst).toBe(360); expect(t.other).toBe(160); expect(t.total).toBe(2520);
  });
  it("is zero when nothing is entered", () => expect(estTotals(EST0).total).toBe(0));
});
