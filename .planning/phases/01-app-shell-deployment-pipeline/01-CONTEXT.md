# Phase 1: App Shell & Deployment Pipeline - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase scaffolds the React + TypeScript + Vite application, sets up the deployment pipeline (GitHub → CI → Vercel), and delivers a live, navigable app shell with placeholder pages for every planned route. It does NOT build any real feature logic — no gesture tracking, no auth, no data. Covers requirements SHELL-01, SHELL-02, SHELL-03, SHELL-04, DEPLOY-01, DEPLOY-02.

</domain>

<decisions>
## Implementation Decisions

### Routing mode & refresh survival
- **D-01:** React Router v7 in **Declarative/Data mode** (`createBrowserRouter`), not Framework/SSR mode — this is a pure client-side SPA.
- **D-02:** DEPLOY-02 (routes survive direct nav/refresh) is solved via a **`vercel.json` catch-all rewrite** (`"source": "/(.*)"`, `"destination": "/index.html"`), committed to the repo — not the Vercel dashboard toggle.
- **D-03:** No exceptions carved out of the catch-all rewrite (no `/api/*` reservation) — all unmatched paths flow through React Router's own `*` route, which renders the UI-SPEC 404 page.
- **D-04:** `<AppShell>` (nav + Outlet + footer) is implemented as a **nested layout route** — one parent route wrapping child routes (`/`, `/game`, `/results`, `/gallery`, `/profile`, `/share/:slug`), not manually wrapped per page.

### CI/CD & quality gates
- **D-05:** Add a **GitHub Actions workflow** that runs lint + typecheck + build on every PR/push, in addition to Vercel's own git-integration auto-deploy. Vercel still performs the actual deploy.
- **D-06:** CI runs **lint + typecheck + build only** in this phase — no test step, since no test runner exists yet. Add a test step to the workflow once Vitest is actually introduced in a later phase.
- **D-07:** Vercel deploy and GitHub Actions CI run **independently** — CI is a merge-blocking check on `main` via branch protection; Vercel deploys `main` after merge (already validated by then). Vercel is not explicitly configured to wait on the CI check.
- **D-08:** **Enabling GitHub branch protection** on `main` (requiring the CI status check before merge) is an explicit Phase 1 task — the executor does this via `gh` CLI (e.g. `gh api`/`gh repo edit`) as part of the deliverable, not left for the user to configure manually afterward.

### Project structure & code quality tooling
- **D-09:** Folder layout: `src/pages/` for route-level components (Home, Game, Results, Gallery, Profile, Share, NotFound), `src/components/` for shared custom components (AppShell, NavBar, MobileNavSheet, PlaceholderCard), `src/components/ui/` for shadcn-generated primitives (shadcn's own default convention). No feature-folder structure in this phase.
- **D-10:** TypeScript stays in **strict mode** — keep Vite's `react-ts` template default (`"strict": true`, `noUnusedLocals`, `noUnusedParameters`) rather than relaxing it.
- **D-11:** Set up **ESLint + Prettier now**, extending Vite's scaffolded `eslint.config.js` with React hooks/refresh rules, plus Prettier for formatting. This is what the CI lint step (D-05) actually runs.
- **D-12:** The new Vite/React app is scaffolded **at the repo root** (`package.json`, `src/`, `vite.config.ts` at root — matches Vercel's zero-config detection). The legacy prototype (`index.html`, `app.js`, `css/styles.css`, `guide.html`) is **moved into a `legacy/` folder** — kept in the repo as a Phase 2 porting reference, not deleted, and not left colliding with Vite's own generated `index.html` at root.

### Dependency installation scope
- **D-13:** **Deviates from UI-SPEC.md's Implementation Notes** — install only what Phase 1 actually needs: `react-router-dom`, `tailwindcss` + `@tailwindcss/vite`, shadcn's dependencies (radix primitives, `lucide-react`, `class-variance-authority`, etc.), and `@fontsource` packages for IBM Plex Mono/Inter. Do **not** install `zustand`, `@mediapipe/tasks-vision`, or `@supabase/supabase-js` in this phase — those land with the phases that actually use them (Phase 2 for zustand/mediapipe, Phase 3/4 for supabase-js). Downstream planner/executor should follow this decision over UI-SPEC's literal install-everything-now sequence.
- **D-14:** Package manager: **npm**, matching UI-SPEC's documented commands and Vercel's zero-config default.
- **D-15:** Fonts (IBM Plex Mono + Inter) load via **`@fontsource` packages** (self-hosted, version-pinned, no external Google Fonts network dependency), resolving the "or" UI-SPEC left open.
- **D-16:** **Pin Node.js version** via `.nvmrc` + `package.json` `engines` field (Node 22 LTS) so local dev, GitHub Actions CI, and Vercel's build environment all use the same version.

### Claude's Discretion
None — every gray area presented was answered with a concrete choice.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI / Design contract
- `.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` — locked visual design (colors, typography, spacing), route/placeholder-page inventory, copywriting contract, component inventory, shadcn init sequence. **Note:** its Implementation Notes' dependency-install list is superseded by D-13 above (defer zustand/mediapipe/supabase-js to later phases).

### Project & requirements
- `.planning/PROJECT.md` — core value, constraints (attribution, Supabase-only backend, web-only, browser support, camera requirement)
- `.planning/REQUIREMENTS.md` — SHELL-01..04, DEPLOY-01/02 full requirement text
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies (none — first phase)

### Existing codebase (for legacy/ migration reference, Phase 2 will use these directly)
- `.planning/codebase/STACK.md` — confirms greenfield: no `package.json`, no build tooling currently exists
- `.planning/codebase/CONVENTIONS.md` — naming/structure conventions from the legacy app (informs new-app conventions where applicable)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None directly reusable as React code — the legacy app (`app.js`, 1283 lines) is vanilla JS DOM manipulation with no components to port as-is. Its `css/styles.css` color/token language (dark "darkroom" ink + light "photo-paper" panels, amber signal accent) is already carried forward as the Tailwind theme in UI-SPEC.md.

### Established Patterns
- Legacy app has zero build tooling, zero tests, zero linting — this phase is a genuine greenfield scaffold, not a retrofit. No existing patterns constrain the new app's architecture.

### Integration Points
- None yet — this phase produces the shell only. Phase 2 will port the gesture/puzzle engine into `/game`; Phase 3+ wire up Supabase.

</code_context>

<specifics>
## Specific Ideas

No specific visual/behavioral references beyond what UI-SPEC.md already locks. This discussion focused entirely on technical/process implementation decisions (routing, CI/CD, tooling, dependencies) that UI-SPEC.md doesn't cover.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (zustand/mediapipe/supabase-js installation was explicitly deferred to their respective future phases per D-13, not deferred as a new idea — it's a scope-correctness decision, already captured above.)

</deferred>

---

*Phase: 01-app-shell-deployment-pipeline*
*Context gathered: 2026-09-09*
