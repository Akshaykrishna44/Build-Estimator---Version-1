import { describe, it, expect } from "vitest";
import { parseActions, reduce, describe as say } from "../src/chat/actions.js";
import { EST0 } from "../src/lib.js";
const S0 = () => ({ projects: [], est: structuredClone(EST0), docs: [], refs: [], meas: [{}, {}, {}, {}], chk: {}, ctx: {} });
const wrap = (arr) => "Ok.\n```actions\n" + JSON.stringify(arr) + "\n```";

describe("parseActions", () => {
  it("splits the reply text from the actions block", () => {
    const r = parseActions(wrap([{ type: "navigate", to: "reports" }]));
    expect(r.shown).toBe("Ok."); expect(r.actions).toEqual([{ type: "navigate", to: "reports" }]);
  });
  it("clamps numbers and drops invalid keys, unknown types and bad screens", () => {
    const r = parseActions(wrap([{ type: "setEstimate", values: { floors: 99, land: "50000", type: "bogus", loc: "nope", cov: -5 } }, { type: "evil" }, { type: "navigate", to: "admin" }]));
    expect(r.actions).toEqual([{ type: "setEstimate", values: { floors: 20, land: 50000, cov: 1 } }]);
  });
  it("ignores malformed JSON and missing blocks", () => {
    expect(parseActions("hello").actions).toEqual([]);
    expect(parseActions("x\n```actions\n{not json\n```").actions).toEqual([]);
  });
  it("requires essential fields", () => {
    expect(parseActions(wrap([{ type: "addBoq", desc: "", qty: 5 }, { type: "addProject" }, { type: "addMeasurement" }])).actions).toEqual([]);
  });
  it("caps the number of actions in one reply", () => expect(parseActions(wrap(Array(30).fill({ type: "navigate", to: "rates" }))).actions.length).toBe(12));
});

describe("reduce", () => {
  it("setEstimate merges values and marks the estimate calculated", () => {
    const { E } = reduce({ S: S0(), E: { land: "" } }, { type: "setEstimate", values: { land: 4000 } });
    expect(E.land).toBe(4000); expect(E.calc).toBe(true);
  });
  it("addBoq fills the first blank row, then appends", () => {
    let st = { S: S0(), E: {} };
    st = reduce(st, { type: "addBoq", desc: "Slab", qty: 10, unit: "m3", rate: 8500 });
    expect(st.S.est.items.length).toBe(3); expect(st.S.est.items[0].desc).toBe("Slab");
    for (let i = 0; i < 3; i++) st = reduce(st, { type: "addBoq", desc: "X" + i, qty: 1, unit: "m", rate: 1 });
    expect(st.S.est.items.length).toBe(4);
  });
  it("addProject creates a project and fills the estimate builder", () => {
    const { S } = reduce({ S: S0(), E: {} }, { type: "addProject", name: "Plant A", district: "Salem", area: "4500" });
    expect(S.projects[0]).toMatchObject({ name: "Plant A", status: "Draft" }); expect(S.est.name).toBe("Plant A"); expect(S.est.projectId).toBe(S.projects[0].id);
  });
  it("setTax merges into the estimate tax", () => expect(reduce({ S: S0(), E: {} }, { type: "setTax", values: { gst: "18" } }).S.est.tax.gst).toBe("18"));
  it("addMeasurement fills the first blank sheet row", () => {
    const { S } = reduce({ S: S0(), E: {} }, { type: "addMeasurement", desc: "F1", unit: "m3", c: 12, l: 1.5, b: 1.5, d: 0.45 });
    expect(S.meas.length).toBe(4); expect(S.meas[0].desc).toBe("F1");
  });
  it("does not mutate the previous state", () => {
    const S = S0(), snap = JSON.stringify(S); reduce({ S, E: {} }, { type: "addBoq", desc: "A", qty: 1, unit: "m", rate: 1 });
    expect(JSON.stringify(S)).toBe(snap);
  });
});

describe("describe", () => {
  it("summarises actions for the activity log", () => {
    expect(say({ type: "navigate", to: "reports" })).toBe("Opened reports");
    expect(say({ type: "addBoq", desc: "Slab", qty: 10, unit: "m3", rate: 8500 })).toContain("Slab");
  });
});
