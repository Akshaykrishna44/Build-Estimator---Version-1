import { test, expect } from "@playwright/test";

const fillItem = async (page, i, d, q, u, r) => {
  await page.locator('input[placeholder="Item description"]').nth(i).fill(d); await page.locator('input[placeholder="Qty"]').nth(i).fill(q);
  await page.locator('input[placeholder="Unit"]').nth(i).fill(u); await page.locator('input[placeholder="Rate"]').nth(i).fill(r);
};
const createProject = async (page) => {
  await page.goto("/#projects");
  const panel = page.locator("section.vp:has(#np_name)"), f = panel.locator("input");
  await f.nth(0).fill("Coimbatore Plant"); await f.nth(2).fill("Coimbatore"); await f.nth(4).fill("4500");
  await panel.locator("select").selectOption({ label: "Warehouse and logistics" });
  await panel.getByRole("button", { name: "Save project" }).click();
};
const materialsInputs = async (page, over = {}) => {
  const v = { "Land area (m²)": "5000", "Built-up coverage per floor (% of land)": "60", Floors: "2", "Schedule (working days)": "240", "Hours per day": "8", ...over };
  for (const [l, x] of Object.entries(v)) await page.locator(`label:has-text("${l}") input`).first().fill(x);
  await page.locator('label:has-text("Location") select').first().selectOption({ index: 1 });
};

test.describe("blank start and navigation", () => {
  test("nothing is pre-filled and totals are pending", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Estimator", exact: true })).toBeVisible();
    for (const l of ["Project name", "District", "Area (m²)"]) await expect(page.locator(`label:has-text("${l}") input`).first()).toHaveValue("");
    await expect(page.locator(".kv.tot b").first()).toHaveText("–");
    await expect(page.getByText("Results appear here after you enter")).toBeVisible();
  });
  test("every screen opens from the sidebar", async ({ page }) => {
    await page.goto("/");
    for (const [name, heading] of [["Projects", "Projects"], ["Measurements", "Measurements"], ["PWD rate references", "PWD rate references"], ["Documents", "Documents"], ["Reports", "Reports"], ["Estimator", "Estimator"]]) {
      await page.locator(".side").getByRole("link", { name, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    }
  });
  test("project type dropdown lists all 14 types in two groups", async ({ page }) => {
    await page.goto("/");
    const sel = page.locator('label:has-text("Project type") select').first();
    await expect(sel.locator("option:not([value=''])")).toHaveCount(14); await expect(sel.locator("optgroup")).toHaveCount(2);
  });
});

test.describe("estimate builder", () => {
  test("calculates subtotal, GST and total only after pressing Calculate", async ({ page }) => {
    await page.goto("/");
    await fillItem(page, 0, "RCC M25 concrete", "40", "m3", "8500");
    await page.locator('label:has-text("GST (%)") input').first().fill("18");
    await expect(page.locator(".kv.tot b").first()).toHaveText("–");
    await page.getByRole("button", { name: "Calculate estimate" }).click();
    await expect(page.locator(".kv.tot b").first()).toHaveText("₹4,01,200.00");
  });
  test("asks for a complete work item before calculating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Calculate estimate" }).click();
    await expect(page.getByText("Enter at least one work item")).toBeVisible();
    await expect(page.locator(".kv.tot b").first()).toHaveText("–");
  });
  test("other additions are percentages of the subtotal", async ({ page }) => {
    await page.goto("/");
    await fillItem(page, 0, "Slab", "10", "m3", "1000");
    for (const [l, v] of [["GST (%)", "10"], ["Labour cess (%)", "1"], ["Location addition (%)", "2"]]) await page.locator(`label:has-text("${l}") input`).first().fill(v);
    await page.getByRole("button", { name: "Calculate estimate" }).click();
    await expect(page.locator(".kv.tot b").first()).toHaveText("₹11,300.00");
  });
});

test.describe("projects", () => {
  test("a saved project fills the Estimate builder and appears in the picker", async ({ page }) => {
    await createProject(page);
    await expect(page.getByText("Coimbatore Plant").first()).toBeVisible();
    await page.locator(".side").getByRole("link", { name: "Estimator", exact: true }).click();
    await expect(page.locator('label:has-text("Project name") input').first()).toHaveValue("Coimbatore Plant");
    await expect(page.locator('label:has-text("District") input').first()).toHaveValue("Coimbatore");
    await expect(page.locator('label:has-text("Area (m²)") input').first()).toHaveValue("4500");
    await expect(page.locator('label:has-text("Project type") select').first().locator("option:checked")).toHaveText("Warehouse and logistics");
    await expect(page.locator('label:has-text("Saved project") option')).toHaveText(["Select a saved project", "Coimbatore Plant"]);
  });
  test("a project can be searched and deleted", async ({ page }) => {
    await createProject(page);
    await page.locator('label:has-text("Search projects") input').fill("zzz"); await expect(page.getByText("No projects yet")).toBeVisible();
    await page.locator('label:has-text("Search projects") input').fill("coimb"); await expect(page.getByText("Coimbatore Plant").first()).toBeVisible();
    await page.getByRole("button", { name: "Delete project" }).click(); await expect(page.getByText("No projects yet")).toBeVisible();
  });
  test("data survives a reload", async ({ page }) => {
    await createProject(page); await page.reload();
    await expect(page.getByText("Coimbatore Plant").first()).toBeVisible();
  });
});

test.describe("materials, man-hours and workers", () => {
  test("incomplete inputs show a message and no results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Calculate materials and workers" }).click();
    await expect(page.getByText("Choose the project type above")).toBeVisible();
    await expect(page.locator(".kpis")).toHaveCount(0);
  });
  test("complete inputs show results, tabs and the per-field materials", async ({ page }) => {
    await page.goto("/");
    await page.locator('label:has-text("Project type") select').first().selectOption("wh");
    await materialsInputs(page);
    await page.getByRole("button", { name: "Calculate materials and workers" }).click();
    await expect(page.locator(".kpi.main")).toContainText("₹");
    await page.locator(".tabs button", { hasText: "Materials by field" }).click();
    await expect(page.getByRole("heading", { name: "Key quantities" })).toBeVisible();
    const el = page.locator('section.vp:has(h2:text-is("Electrical"))');
    await expect(el).toContainText("Electrical wire"); await expect(el).toContainText("1.5 mm² copper wire, lighting circuits");
    await expect(page.locator('section.vp:has(h2:text-is("Plumbing"))')).toContainText("PVC soil and waste pipe");
    for (const t of ["Workers", "Water", "Materials and prices"]) { await page.locator(".tabs button", { hasText: t }).click(); await expect(page.locator(".tabs").last().locator("button.on")).toHaveText(t); }
  });
  test("doubling the land area doubles the estimate", async ({ page }) => {
    await page.goto("/");
    await page.locator('label:has-text("Project type") select').first().selectOption("wh");
    const total = async () => +(await page.locator(".kpi.main b").innerText()).replace(/[₹,]/g, "");
    await materialsInputs(page); await page.getByRole("button", { name: "Calculate materials and workers" }).click(); const a = await total();
    await page.locator('label:has-text("Land area (m²)") input').first().fill("10000"); const b = await total();
    expect(b / a).toBeCloseTo(2, 5);
  });
});

test.describe("measurements, rates, documents and reports", () => {
  test("dimension sheet computes the quantity and sends it to the work items", async ({ page }) => {
    await page.goto("/#measurements");
    await page.locator(".pl.n").first().fill("Footing F1");
    for (const [i, v] of ["12", "1.5", "1.5", "0.45"].entries()) await page.locator(".pl.q").nth(i).fill(v);
    await page.locator(".pl.u").first().fill("m3");
    await expect(page.locator("section.vp:has-text('Dimension sheet') td.amt").first()).toHaveText("12.15");
    await expect(page.locator(".ro").first()).toHaveText("12.15");
    await page.getByRole("button", { name: "Add quantity to BOQ" }).click();
    await page.locator(".side").getByRole("link", { name: "Estimator", exact: true }).click();
    await expect(page.locator('input[placeholder="Item description"]').first()).toHaveValue("Footing F1");
    await expect(page.locator('input[placeholder="Qty"]').first()).toHaveValue("12.15");
  });
  test("net quantity must be above zero to add to the BOQ", async ({ page }) => {
    await page.goto("/#measurements");
    await page.getByRole("button", { name: "Add quantity to BOQ" }).click();
    await expect(page.getByText("net quantity must be above zero")).toBeVisible();
  });
  test("rate library accepts a reference and an own analysis", async ({ page }) => {
    await page.goto("/#rates");
    const g = page.locator(".g6 input");
    for (const [i, v] of ["SOR-101", "RCC M25 concrete", "m3", "8500", "TN PWD SOR"].entries()) await g.nth(i).fill(v);
    await page.getByRole("button", { name: "Add reference" }).click();
    await expect(page.locator("tbody").getByText("SOR-101")).toBeVisible();
    const an = page.locator("section.vp:has-text('Non-schedule rate analysis')");
    for (const [i, v] of ["Epoxy flooring", "m2", "650", "280", "90"].entries()) await an.locator("input").nth(i).fill(v);
    await expect(an.locator(".ro")).toHaveText("₹1,020.00");
    await an.getByRole("button", { name: "Save analysis" }).click();
    await expect(page.getByText("Own analysis")).toBeVisible();
  });
  test("an uploaded document is listed", async ({ page }) => {
    await page.goto("/#documents");
    await page.locator("input[type=file]").last().setInputFiles({ name: "site-plan.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
    await expect(page.locator("tbody").getByText("site-plan.pdf")).toBeVisible();
  });
  test("reports stay blank until an estimate is calculated", async ({ page }) => {
    await page.goto("/#reports");
    await expect(page.getByText("Your report preview will appear here")).toBeVisible(); await expect(page.locator(".kv.tot b")).toHaveText("–");
    await page.locator(".side").getByRole("link", { name: "Estimator", exact: true }).click();
    await fillItem(page, 0, "RCC M25 concrete", "40", "m3", "8500");
    await page.locator('label:has-text("GST (%)") input').first().fill("18");
    await page.getByRole("button", { name: "Calculate estimate" }).click();
    await page.locator(".side").getByRole("link", { name: "Reports" }).click();
    await expect(page.locator("tbody").getByText("RCC M25 concrete")).toBeVisible(); await expect(page.locator(".kv.tot b")).toHaveText("₹4,01,200.00");
  });
});

test.describe("queries sidebar (chat API mocked)", () => {
  test("applies the proposed changes, then Undo restores them", async ({ page }) => {
    let n = 0;
    await page.route("**/api/chat", (r) => r.fulfill({ json: { text: ++n === 1 ? 'Setting up.\n```actions\n[{"type":"setEstimate","values":{"land":4000,"floors":2}}]\n```' : "Done." } }));
    await page.goto("/");
    await page.locator(".seg button", { hasText: "Queries" }).click();
    await expect(page.getByText("ENTER YOUR QUERIES")).toBeVisible(); await expect(page.getByText("Quantities and workers")).toBeVisible();
    await page.locator(".agent textarea").fill("Plan a 2-floor warehouse"); await page.locator(".agent .btn.p").click();
    await expect(page.getByText("Done.")).toBeVisible();
    await expect(page.locator(".act")).toContainText("Set estimate: land 4000, floors 2");
    await expect(page.locator('label:has-text("Land area (m²)") input').first()).toHaveValue("4000");
    await page.locator(".act").getByRole("button", { name: "Undo" }).click();
    await expect(page.locator('label:has-text("Land area (m²)") input').first()).toHaveValue("");
  });
  test("shows an error when the chat service is unavailable", async ({ page }) => {
    await page.route("**/api/chat", (r) => r.fulfill({ status: 500, json: { error: "No API key" } }));
    await page.goto("/"); await page.locator(".seg button", { hasText: "Queries" }).click();
    await page.locator(".agent textarea").fill("hello"); await page.locator(".agent .btn.p").click();
    await expect(page.getByText("No API key")).toBeVisible();
  });
});

test("the Estimator screen has a Detailed estimate view that loads the earlier project", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Detailed estimate" }).click();
  const f = page.frameLocator("iframe.legacy");
  await expect(f.locator("h1").first()).toHaveText("Build Estimator"); expect(await f.locator("input").count()).toBeGreaterThan(50);
});
