import { defineConfig } from "@playwright/test";
// PW_CHROMIUM lets you point at an existing Chromium; leave it unset to use `npx playwright install chromium`.
export default defineConfig({
  testDir: "e2e", timeout: 30000, fullyParallel: true, reporter: "list",
  use: { baseURL: "http://localhost:4173", launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined } },
  webServer: { command: "npm run build && npx vite preview --port 4173", url: "http://localhost:4173", reuseExistingServer: true, timeout: 120000 },
});
