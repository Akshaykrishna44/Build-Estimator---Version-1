# Build Estimator

Blank-start React + Vite app: nothing is pre-filled. Enter project details and work items, then press **Calculate estimate**; totals appear only after calculation. React + Vite app: construction cost, materials (base to finished), man-hours, workers per trade and water needs, plus Projects, Measurements, PWD rate references, Documents and Reports screens.

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (Vitest): engine, totals, chat actions
npm run test:e2e  # browser tests (Playwright): main flows; first run: npx playwright install chromium
npm run build     # static output in dist/
```

## Structure
- `src/engine/calc.js` pure estimating function (no DOM); `src/data/` rates, norms and project-type multipliers.
- `src/views/` one component per screen; `src/styles.css` single neutral light theme.
- State is saved in the browser (localStorage). Push to `main` to deploy via the GitHub Pages workflow (Settings → Pages → Source: GitHub Actions).

Indicative estimates only. Rates marked TN PWD SOR follow the Schedule of Rates 2025-26; all other rates and norms are illustrative.

## Queries (sidebar)
Switch the sidebar to **Queries** and type a question or instruction. The assistant works inside the project: it sees your estimate, projects, measurements and BOQ (while "Include my project data" is ticked), answers questions, and can do the work: set up estimates, add BOQ items, measurements, rate references and projects, set taxes and open screens. Its changes apply immediately and each step has an **Undo** button; it can take several steps in a row.

The browser never holds an API key. Run the small proxy alongside the app:

```bash
cp .env.example .env        # put your own ANTHROPIC_API_KEY in .env (never commit it)
npm run server              # terminal 1: proxy on :8787
npm run dev                 # terminal 2: app, /api is proxied to the server
```
For a hosted build, deploy `server/index.js` (any Node host) and set `VITE_CHAT_URL` to its `/api/chat` URL at build time.
