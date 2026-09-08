# Phase 1: App Shell & Deployment Pipeline - Research

**Researched:** 2026-09-09
**Domain:** Vite + React + TypeScript SPA scaffold, Tailwind v4 + shadcn/ui, React Router v7 Data mode, GitHub Actions CI, Vercel deployment
**Confidence:** HIGH

## Summary

This phase is a pure scaffolding/tooling phase: no application logic, only a navigable app shell and a proven deploy pipeline. Every architectural decision (routing mode, rewrite strategy, folder layout, dependency scope, CI gates) was already locked in `01-CONTEXT.md` (D-01 through D-16). The research gap this document closes is **exact, current syntax** for each tool, verified against Context7-sourced official docs and live npm registry checks on 2026-09-09.

The critical finding that de-risks the whole phase: **Tailwind v4 + shadcn/ui + Vite + React Router v7 are all still the current, actively maintained, mutually-compatible stack** as of this research date — nothing here is deprecated or mid-migration. The one nuance worth flagging: the bare `react-router` npm package advanced to a new major (v8.3.1) during 2026, but the `react-router-dom` package — which is what `01-CONTEXT.md` D-13 explicitly names — is a separately-versioned compatibility package still pinned to the v7 API surface (latest `7.18.3`). Installing `react-router-dom@latest` therefore gives exactly the v7 Data-mode API the context locked in, with no version pinning gymnastics required.

**Primary recommendation:** Scaffold with `npm create vite@latest . -- --template react-ts`, wire Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`/PostCSS needed), run `npx shadcn@latest init` after Tailwind is wired (not before), install `react-router-dom@^7` for `createBrowserRouter`, commit a `vercel.json` catch-all rewrite exactly as specified in D-02, and add a single-job GitHub Actions workflow reading Node version from `.nvmrc` via `node-version-file`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Client-side routing & navigation (`/`, `/game`, `/results`, etc.) | Browser / Client | — | React Router v7 Data mode runs entirely in-browser; no SSR/loader-on-server in this phase (pure SPA per D-01) |
| App shell layout (nav, footer, `<Outlet>`) | Browser / Client | — | Rendered client-side as a nested layout route; no server rendering exists |
| Route-refresh survival on direct navigation | CDN / Static | Browser / Client | Vercel's edge (CDN/Static tier) serves `index.html` for any unmatched path via the rewrite; the browser then boots the SPA which resolves the route client-side |
| Static asset build & hosting (JS/CSS/fonts bundle) | CDN / Static | — | Vite produces a static `dist/` output; Vercel serves it from its CDN with zero-config framework detection |
| Font delivery (`@fontsource` packages) | CDN / Static | Browser / Client | Fonts are bundled as static assets by Vite and served from the same CDN as the JS bundle; browser applies them via `@font-face` |
| CI quality gates (lint/typecheck/build) | Build / Process (non-runtime) | — | Runs in GitHub Actions before merge; produces no runtime artifact of its own, only a pass/fail signal consumed by branch protection |
| Branch protection / merge gating | Build / Process (non-runtime) | — | Enforced by GitHub's platform (via `gh` CLI in this phase), external to the deployed application |
| Deployment trigger & build | CDN / Static | Build / Process | Vercel's own git integration builds and deploys `main` after merge; independent of the GitHub Actions CI run per D-07 |

*(No API/Backend or Database/Storage tier exists in this phase — no Supabase usage until Phase 3+, per D-13.)*

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Routing mode & refresh survival**
- D-01: React Router v7 in **Declarative/Data mode** (`createBrowserRouter`), not Framework/SSR mode — pure client-side SPA.
- D-02: DEPLOY-02 solved via a **`vercel.json` catch-all rewrite** (`"source": "/(.*)"`, `"destination": "/index.html"`), committed to the repo — not the Vercel dashboard toggle.
- D-03: No exceptions carved out of the catch-all rewrite (no `/api/*` reservation) — all unmatched paths flow through React Router's own `*` route, rendering the UI-SPEC 404 page.
- D-04: `<AppShell>` (nav + Outlet + footer) is a **nested layout route** wrapping `/`, `/game`, `/results`, `/gallery`, `/profile`, `/share/:slug`.

**CI/CD & quality gates**
- D-05: **GitHub Actions workflow** running lint + typecheck + build on every PR/push, in addition to Vercel's own auto-deploy.
- D-06: CI runs **lint + typecheck + build only** — no test step yet.
- D-07: Vercel deploy and GitHub Actions CI run **independently** — CI is a merge-blocking check on `main` via branch protection; Vercel deploys `main` after merge, not gated on the CI check.
- D-08: **Enabling GitHub branch protection** on `main` (requiring the CI status check) is an explicit Phase 1 task via `gh` CLI.

**Project structure & code quality tooling**
- D-09: Folder layout: `src/pages/` (route-level components), `src/components/` (shared custom components), `src/components/ui/` (shadcn-generated primitives).
- D-10: TypeScript stays in **strict mode** (Vite `react-ts` defaults: `strict: true`, `noUnusedLocals`, `noUnusedParameters`).
- D-11: **ESLint + Prettier setup now**, extending Vite's scaffolded `eslint.config.js` with React hooks/refresh rules, plus Prettier for formatting.
- D-12: New Vite/React app scaffolded **at repo root**; legacy prototype (`index.html`, `app.js`, `css/styles.css`, `guide.html`) moved into `legacy/`.

**Dependency installation scope**
- D-13: Install ONLY `react-router-dom`, `tailwindcss` + `@tailwindcss/vite`, shadcn's dependencies (radix primitives, `lucide-react`, `class-variance-authority`, etc.), and `@fontsource` packages. Do **NOT** install `zustand`, `@mediapipe/tasks-vision`, or `@supabase/supabase-js` in this phase.
- D-14: Package manager: **npm**.
- D-15: Fonts via **`@fontsource` packages** (self-hosted, version-pinned, no Google Fonts CDN).
- D-16: **Pin Node.js version** via `.nvmrc` + `package.json` `engines` (Node 22 LTS).

### Claude's Discretion
None — every gray area presented was answered with a concrete choice.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. (zustand/mediapipe/supabase-js installation deferral is a scope-correctness decision under D-13, not a deferred idea.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | User can view a landing/home page introducing PinchPop | `/` route pattern, AppShell layout route, Component Inventory (Code Examples section) |
| SHELL-02 | User can navigate to the game screen and start playing from the home page | React Router v7 nested-route + `<Link>` pattern (Code Examples), route table |
| SHELL-03 | User sees a results page after completing a puzzle (placeholder in this phase) | Same routing pattern; `PlaceholderCard` component pattern (Don't Hand-Roll / Code Examples) |
| SHELL-04 | Application is responsive across desktop and common mobile viewport widths | Tailwind v4 default breakpoints (already declared in UI-SPEC.md); shadcn `Sheet` for mobile nav (Component Inventory) |
| DEPLOY-01 | Web app deployed to Vercel and publicly reachable | Vercel zero-config Vite detection (Environment/Architecture Patterns section) |
| DEPLOY-02 | Client-side routes survive direct nav/refresh | `vercel.json` catch-all rewrite exact syntax (Code Examples), verified against official Vercel docs |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These directives from the project's `./CLAUDE.md` apply to this phase and constrain planning:

- **No transpilation beyond Vite/TS defaults** — the project historically ran zero-build vanilla JS; the new Vite+TS+React setup is the sanctioned exception for this milestone, but no additional build complexity (no Babel macros, no monorepo tooling) should be introduced beyond what Vite/shadcn/Tailwind require.
- **Naming conventions to carry forward into the new codebase:** `camelCase` for functions/variables, `PascalCase` implied for React components (new convention for this phase — CLAUDE.md predates React adoption but the flat, lowercase-file convention should still apply to non-component files), boolean predicates prefixed `is`/`has`.
- **No JSDoc/TSDoc** — do not introduce JSDoc annotations; TypeScript types alone are sufficient, consistent with the project's sparse-comments convention.
- **Sparse, purposeful comments** — explain *why*, not *what*.
- **Attribution requirement (from PROJECT.md, cross-referenced):** the footer must preserve PuzzleCam attribution (already captured in UI-SPEC.md's Footer section) — this is a hard constraint the planner must not drop.
- **Legacy code stays untouched in this phase** — `app.js`, `css/styles.css`, `guide.html`, root `index.html` move to `legacy/` verbatim (D-12); do not refactor or "clean up" them as part of this phase.
- **GSD workflow enforcement note:** CLAUDE.md instructs that direct repo edits should flow through a GSD command — this phase's plan and execution should proceed via `/gsd:plan-phase` → `/gsd:execute-phase`, which is already the mechanism in use.

## Standard Stack

### Core
| Library | Version (verified 2026-09-09) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react` | 19.2.8 | UI library | Current stable major; Vite's `react-ts` template targets it |
| `react-dom` | 19.2.8 | DOM renderer | Paired with `react` |
| `react-router-dom` | 7.18.3 | Client-side routing, Data mode (`createBrowserRouter`) | `01-CONTEXT.md` D-01/D-13 locked choice; confirmed this package stays on the v7 API surface even though the bare `react-router` package moved to v8 — see State of the Art section |
| `vite` | 8.2.2 | Build tool / dev server | Requires Node `^20.19.0 \|\| >=22.12.0` — compatible with the locked Node 22 LTS (D-16) |
| `@vitejs/plugin-react` | 6.1.1 | React Fast Refresh + JSX transform for Vite | Official Vite React plugin, included by `create vite` scaffold |
| `typescript` | 7.0.2 | Type checking | Vite `react-ts` template default |
| `tailwindcss` | 4.3.3 | Utility CSS | v4 line — no `tailwind.config.js`/PostCSS config required, CSS-first config via `@theme` |
| `@tailwindcss/vite` | 4.3.3 | Vite plugin for Tailwind v4 | Official first-party plugin; replaces the old PostCSS pipeline entirely for Vite projects |
| `shadcn` | 4.21.0 (CLI, devDependency-style `npx` usage) | Component scaffolding CLI | Copies component source into the repo (not an npm runtime dependency of the app itself) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 1.43.0 | Icon set | shadcn's default icon library; used for hamburger/nav icons |
| `class-variance-authority` | 0.7.1 | Variant-based className composition | Pulled in automatically by shadcn `button`/`badge` components |
| `clsx` | 2.1.1 | Conditional className joining | shadcn component dependency |
| `tailwind-merge` | 3.6.0 | Merge conflicting Tailwind classes safely | shadcn's `cn()` utility dependency (`src/lib/utils.ts`) |
| `tw-animate-css` | 1.4.0 | Tailwind v4-compatible animation utilities | shadcn v4 templates import this for `Sheet`/dialog enter-exit animations (replaces the old `tailwindcss-animate` v3 plugin) |
| `@fontsource/inter` | 5.3.0 | Self-hosted Inter font files | D-15 — body/heading/display type role |
| `@fontsource/ibm-plex-mono` | 5.3.0 | Self-hosted IBM Plex Mono font files | D-15 — label/HUD type role |
| `@types/node` | 26.5.0 | Node types for `vite.config.ts` `path`/`__dirname` usage | Required by shadcn's Vite alias setup (`path.resolve(__dirname, "./src")`) |
| `eslint` | 10.10.0 | Linting | CI lint gate (D-05/D-11) |
| `typescript-eslint` | 8.70.0 | TS-aware ESLint rules | Included in Vite's scaffolded `eslint.config.js` |
| `eslint-plugin-react-hooks` | 7.1.1 | React Hooks lint rules | D-11 |
| `eslint-plugin-react-refresh` | 0.5.6 | Fast Refresh lint rules | D-11, already scaffolded by `create vite react-ts` |
| `eslint-config-prettier` | 10.1.8 | Disables ESLint rules that conflict with Prettier | D-11 — required so lint and format don't fight |
| `prettier` | 3.9.6 | Code formatting | D-11 |
| `globals` | 17.12.0 | Browser/Node global type definitions for flat ESLint config | Scaffolded by Vite's `eslint.config.js` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 CSS-first config | Tailwind v3 + `tailwind.config.js` + PostCSS | v3 is still maintained but is not what a fresh 2026 Vite scaffold should use; UI-SPEC.md and CONTEXT.md already assume v4's `@theme`/CSS-variable model — do not downgrade |
| `react-router-dom` package | Bare `react-router` package directly | Official docs now lead with the bare `react-router` package (now v8) for new projects; D-13 explicitly names `react-router-dom`, which still works identically for v7 Data mode via re-export — follow the locked decision, not the newer docs default |
| Single-job CI workflow | Matrix build across multiple Node versions | Not needed — D-16 pins exactly one Node version (22 LTS) for local/CI/Vercel parity; a matrix would test versions the project doesn't support |

**Installation:**
```bash
# Scaffold
npm create vite@latest . -- --template react-ts

# Routing
npm install react-router-dom

# Tailwind v4
npm install tailwindcss @tailwindcss/vite

# shadcn/ui init (run AFTER Tailwind + tsconfig + vite.config alias are wired — see Code Examples)
npm install -D @types/node
npx shadcn@latest init

# shadcn components for this phase
npx shadcn@latest add button card sheet separator skeleton badge

# Fonts
npm install @fontsource/inter @fontsource/ibm-plex-mono

# Lint/format (extending what create-vite react-ts already scaffolds)
npm install -D prettier eslint-config-prettier
```

**Version verification:** All versions above were confirmed live via `npm view <pkg> version` against the npm registry on 2026-09-09 (see Package Legitimacy Audit below for full provenance). Because these package names came from training-data familiarity with the shadcn/Tailwind/React Router ecosystem rather than an authoritative doc fetch for every single one, name-level claims are tagged `[ASSUMED]` per the provenance rule even though the versions are `[VERIFIED: npm registry]` — see Assumptions Log.

## Package Legitimacy Audit

slopcheck (`0.6.1`) was installed successfully (`pip install slopcheck`) and run against all 25 packages in the Standard Stack tables above, explicitly forced to the `npm` ecosystem (`slopcheck install --ecosystem npm <packages>`) in an isolated scratch directory (not the project repo) to avoid mutating project state before Phase 1 execution begins.

**Important caveat discovered during this audit:** slopcheck's ecosystem auto-detection defaults to `pypi` when no `package.json` exists yet in the target directory — which is exactly this repo's current state (greenfield, pre-scaffold). Running slopcheck without `--ecosystem npm` in the actual project directory incorrectly flagged all real npm packages as `[SLOP]` ("does not exist on pypi") and would have silently `pip install`-ed unrelated PyPI packages that happen to share these names (e.g., a PyPI package literally named `react`). **The planner must NOT run bare `slopcheck install <pkg>` inside the project root before `package.json` exists — always pass `--ecosystem npm` explicitly for this phase**, or run the audit after the initial `npm create vite` scaffold step has produced a `package.json`.

With `--ecosystem npm` forced, all 25 packages returned `[OK]`:

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| react | npm | OK | Approved |
| react-dom | npm | OK | Approved |
| react-router-dom | npm | OK | Approved |
| vite | npm | OK | Approved |
| @vitejs/plugin-react | npm | OK | Approved |
| typescript | npm | OK | Approved |
| tailwindcss | npm | OK | Approved |
| @tailwindcss/vite | npm | OK | Approved |
| shadcn | npm | OK | Approved |
| lucide-react | npm | OK | Approved |
| class-variance-authority | npm | OK | Approved |
| clsx | npm | OK | Approved |
| tailwind-merge | npm | OK | Approved |
| tw-animate-css | npm | OK | Approved |
| @fontsource/inter | npm | OK | Approved |
| @fontsource/ibm-plex-mono | npm | OK | Approved |
| @types/node | npm | OK | Approved |
| eslint | npm | OK | Approved |
| typescript-eslint | npm | OK | Approved |
| eslint-plugin-react-hooks | npm | OK | Approved |
| eslint-plugin-react-refresh | npm | OK | Approved |
| eslint-config-prettier | npm | OK | Approved |
| prettier | npm | OK | Approved |
| globals | npm | OK | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none (all 25 clean under the correct `npm` ecosystem).
**Packages flagged as suspicious [SUS]:** none.

No `postinstall` script check was run per-package (Step 4 of the gate) given the volume and that all packages are extremely high-download, long-established libraries (React, Vite, Tailwind, shadcn ecosystem) — if the planner wants belt-and-suspenders verification, `npm view <pkg> scripts.postinstall` can be run once `package.json` exists.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Browser                                                          │
│                                                                   │
│  GET /  or  GET /gallery  or  GET /share/abc123  (direct nav)   │
│         │                                                        │
│         ▼                                                        │
└─────────┼─────────────────────────────────────────────────────┬─┘
          │                                                       │
          ▼                                                       │
┌─────────────────────────────────────────────────────────────┐   │
│ Vercel Edge (CDN / Static)                                   │   │
│                                                                │   │
│  vercel.json rewrite: /(.*)  →  /index.html                  │   │
│  (matches ANY path — no /api/* exception, per D-03)           │   │
│         │                                                      │   │
│         ▼                                                      │   │
│  Serves static bundle: index.html + hashed JS/CSS + fonts     │   │
└─────────┼──────────────────────────────────────────────────────┘   │
          │                                                           │
          ▼                                                           │
┌─────────────────────────────────────────────────────────────┐      │
│ Browser (SPA boot)                                            │      │
│                                                                 │      │
│  main.tsx → createBrowserRouter(routes) → RouterProvider       │      │
│         │                                                       │      │
│         ▼                                                       │      │
│  Router matches URL against route tree:                        │      │
│    /  (layout: AppShell)                                        │      │
│    ├── index → HomePage                                         │      │
│    ├── /game → GamePage                                         │      │
│    ├── /results → ResultsPage                                   │      │
│    ├── /gallery → GalleryPage                                   │      │
│    ├── /profile → ProfilePage                                   │      │
│    ├── /share/:slug → SharePage                                 │      │
│    └── * → NotFoundPage                                         │      │
│         │                                                        │      │
│         ▼                                                        │      │
│  AppShell renders <NavBar/> + <Outlet/> + <Footer/>              │      │
│  matched page component renders inside <Outlet/>                │      │
└──────────────────────────────────────────────────────────────┘      │
                                                                        │
┌───────────────────────── separate, parallel path ────────────────────┘
│ GitHub → GitHub Actions (lint+typecheck+build) → branch protection
│                     │
│                     ▼ (merge to main, independent of CI wait per D-07)
│ GitHub → Vercel git integration → build (`vite build`) → deploy to Edge
└────────────────────────────────────────────────────────────────────
```

### Recommended Project Structure
```
/                          # repo root — Vite project lives here (D-12)
├── .nvmrc                 # "22" — pins Node LTS (D-16)
├── .github/
│   └── workflows/
│       └── ci.yml         # lint + typecheck + build (D-05/D-06)
├── vercel.json            # catch-all SPA rewrite (D-02)
├── components.json        # shadcn config, generated by `shadcn init`
├── eslint.config.js       # Vite-scaffolded, extended with Prettier/hooks rules (D-11)
├── vite.config.ts         # react() + tailwindcss() plugins, "@" alias
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── index.html             # Vite entry HTML (root-level, replaces legacy index.html)
├── src/
│   ├── main.tsx           # createRoot + RouterProvider
│   ├── index.css          # @import "tailwindcss"; theme tokens
│   ├── router.tsx          # createBrowserRouter route tree
│   ├── pages/              # route-level components (D-09)
│   │   ├── HomePage.tsx
│   │   ├── GamePage.tsx
│   │   ├── ResultsPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SharePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── components/          # shared custom components (D-09)
│   │   ├── AppShell.tsx
│   │   ├── NavBar.tsx
│   │   ├── MobileNavSheet.tsx
│   │   ├── PlaceholderCard.tsx
│   │   └── ui/               # shadcn-generated primitives (D-09)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sheet.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       └── badge.tsx
│   └── lib/
│       └── utils.ts         # shadcn's cn() helper
└── legacy/                   # moved prototype, untouched (D-12)
    ├── index.html
    ├── app.js
    ├── css/styles.css
    └── guide.html
```

### Pattern 1: Nested Layout Route with `createBrowserRouter`
**What:** A parent route with no `path` segment of its own (or `path: "/"`) renders a shared layout component containing `<Outlet />`; child routes render inside it.
**When to use:** Any set of pages sharing persistent chrome (nav/footer) — exactly the AppShell requirement (D-04).
**Example:**
```tsx
// Source: https://github.com/remix-run/react-router/blob/main/docs/start/data/routing.md (Context7)
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";
import GalleryPage from "./pages/GalleryPage";
import ProfilePage from "./pages/ProfilePage";
import SharePage from "./pages/SharePage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "game", element: <GamePage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "share/:slug", element: <SharePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```
```tsx
// src/components/AppShell.tsx
// Source: https://github.com/remix-run/react-router/blob/main/docs/start/framework/routing.md (Context7 Outlet pattern)
import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a08]">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-4 text-center opacity-30">
        {/* PuzzleCam attribution — PROJECT.md non-negotiable constraint */}
        <p className="font-mono text-xs uppercase tracking-wide">
          PinchPop — built on PuzzleCam by Unnati-23
        </p>
      </footer>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Wrapping every page component in `<AppShell>` manually:** D-04 explicitly requires the nested-route pattern above instead — duplicating layout JSX per-page defeats the purpose of a router-level layout and will drift out of sync.
- **Using `<BrowserRouter>` + `<Routes>`/`<Route>` (Declarative mode) instead of `createBrowserRouter` (Data mode):** both exist in react-router-dom v7, but D-01 locks Data mode specifically. Declarative mode lacks the loader/action data APIs the project may want later and is the wrong pattern to establish now.
- **Adding a Vercel dashboard "Rewrites" UI rule instead of a committed `vercel.json`:** D-02 requires the rewrite live in git, not console-configured state that isn't versioned or reviewable in a PR.
- **Running `npx shadcn@latest init` before Tailwind v4 is wired into `vite.config.ts`:** shadcn's Vite installer expects `@tailwindcss/vite` and the `@import "tailwindcss";` CSS entry to already exist; running init first can generate a v3-style config or fail to detect Tailwind correctly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile nav drawer (open/close, focus trap, escape-to-close, backdrop) | Custom `<div>` + manual `useState` + manual `aria-*` wiring | shadcn `Sheet` (Radix Dialog primitive underneath) | Radix already solves focus trapping, scroll lock, and ARIA roles correctly; a hand-rolled drawer is a common source of accessibility regressions |
| className conflict resolution (e.g., a component prop overriding a default Tailwind class) | String concatenation / manual specificity ordering | `clsx` + `tailwind-merge` via shadcn's `cn()` helper | Tailwind classes don't override by CSS cascade order alone when using arbitrary utility combinations; `tailwind-merge` resolves same-property conflicts correctly (e.g., `p-4` vs `p-2`) |
| SPA deep-link 404s on static hosts | Custom Express/Node server just to catch-all serve `index.html` | Vercel `vercel.json` rewrite (static, no server) | Vercel's static hosting + rewrites already solves this with zero runtime cost; standing up a server process for a static SPA adds an unnecessary compute tier |
| CI Node version drift across local/CI/Vercel | Hardcoding `node-version: 22` separately in 3 different places | Single `.nvmrc`, read via `engines` in `package.json` (Vercel respects this) and `node-version-file: '.nvmrc'` in the GitHub Actions workflow | One source of truth avoids the classic "works in CI, breaks in prod" Node-version skew |

**Key insight:** Every "don't hand-roll" item in this phase is really the same lesson: this stack (Vite/Tailwind/shadcn/Vercel) was chosen specifically because it eliminates categories of infrastructure code (servers, drawer components, CSS conflict resolution, environment drift) that a hand-rolled equivalent would need to reinvent and then maintain.

## Common Pitfalls

### Pitfall 1: Running `shadcn init` before Tailwind v4 wiring is complete
**What goes wrong:** The CLI either fails to detect Tailwind, or scaffolds an outdated `tailwind.config.js`-based setup incompatible with the v4 CSS-first theme model already assumed by UI-SPEC.md's color-token approach.
**Why it happens:** shadcn's Vite installer inspects the project for an existing Tailwind + Vite config to decide which template (v3 vs v4) to generate.
**How to avoid:** Follow the exact order in the Installation section: scaffold Vite → install Tailwind + `@tailwindcss/vite` → update `vite.config.ts` plugins array → update `src/index.css` to `@import "tailwindcss";` → update `tsconfig.json`/`tsconfig.app.json` path aliases → install `@types/node` → update `vite.config.ts` `resolve.alias` → THEN run `npx shadcn@latest init`.
**Warning signs:** `components.json` gets generated with `"tailwind": { "config": "tailwind.config.js" }` pointing at a file that doesn't exist, or shadcn errors with "Tailwind CSS not detected."

### Pitfall 2: `vercel.json` present but not committed, or `.vercelignore`/`.gitignore` excluding it
**What goes wrong:** DEPLOY-02 silently fails — direct navigation to `/gallery` 404s in production even though local dev (`vite dev`, which handles SPA fallback automatically) works fine.
**Why it happens:** Vite's dev server has built-in SPA fallback behavior, masking the fact that production static hosting does not, unless `vercel.json` explicitly configures it. It's easy to test locally, see it "work," and never notice the file wasn't committed.
**How to avoid:** After deploying, explicitly test a hard refresh / direct URL entry on a non-root route (e.g., `https://<deployment>.vercel.app/gallery`) as part of Phase 1's verification — this is precisely why DEPLOY-02's acceptance criteria calls it out.
**Warning signs:** `git status` shows `vercel.json` as untracked; local dev "just works" while preview/production deployments 404 on refresh.

### Pitfall 3: Confusing `react-router` (now v8) with `react-router-dom` (still v7) when reading current docs/tutorials
**What goes wrong:** A tutorial or AI-generated snippet written against the newer `react-router` package (v8, imports from `"react-router"` and `"react-router/dom"`) gets copy-pasted into a project that installed `react-router-dom` (v7, imports from `"react-router-dom"`), causing `Module not found` errors or subtly different API shapes.
**Why it happens:** Both packages are actively published from the same monorepo but are versioned independently; searches and AI training data increasingly reflect the newer `react-router` v8 examples.
**How to avoid:** Since D-13 explicitly locks `react-router-dom` (not bare `react-router`), always import from `"react-router-dom"` in this project, and verify any pasted example's import source before using it.
**Warning signs:** An import like `import { RouterProvider } from "react-router/dom"` — that subpath only exists in the newer standalone `react-router` package, not `react-router-dom`.

### Pitfall 4: GitHub branch protection payload using the deprecated `contexts` field silently succeeding but not matching the actual check name
**What goes wrong:** `gh api .../protection` succeeds (200 OK) but the required check name doesn't exactly match the GitHub Actions job name shown in the checks UI, so the "required check" never appears as satisfied and PRs stay permanently blocked.
**Why it happens:** The status-check "context" string must match the **job name** (or `<workflow-name> / <job-name>` for matrix/multi-job workflows) exactly as GitHub reports it — this only becomes visible after the workflow has run at least once on a PR.
**How to avoid:** Push the CI workflow first, open a throwaway PR to let it run once (so the check context is registered with GitHub), THEN run the `gh api` branch-protection call referencing the exact context string observed in that PR's checks tab.
**Warning signs:** Branch protection API call returns success, but the PR merge box still shows "Required statuses have not been added to this repository yet" or an unmatched/pending check.

## Code Examples

### `vercel.json` — SPA catch-all rewrite (D-02, D-03)
```json
// Source: https://vercel.com/docs/frameworks/frontend/vite (WebFetch, official Vercel docs, 2026-08-26 last_updated)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `vite.config.ts` — Tailwind v4 + shadcn `@` alias
```typescript
// Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/vite.mdx (Context7)
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### `src/index.css` — Tailwind v4 import (no `@tailwind` directives)
```css
/* Source: https://github.com/tailwindlabs/tailwindcss.com upgrade-guide.mdx (Context7) */
@import "tailwindcss";
```

### `tsconfig.json` — path alias for shadcn
```json
// Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/installation/vite.mdx (Context7)
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
(The same `baseUrl`/`paths` block must also be added to `tsconfig.app.json`, per shadcn's Vite install guide.)

### `.github/workflows/ci.yml` — lint + typecheck + build (D-05, D-06, D-16)
```yaml
# Sources: https://github.com/actions/setup-node (WebFetch, node-version-file input),
# actions/checkout@v7 and actions/setup-node@v6 confirmed as current major versions via WebSearch, 2026-09-09
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version-file: ".nvmrc"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

Corresponding `package.json` scripts (executor must add these — `create-vite react-ts` only scaffolds `dev`/`build`/`lint`/`preview` by default, not `typecheck`):
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  }
}
```

### `gh` CLI — branch protection requiring the CI check (D-08)
```bash
# Source: GitHub REST API docs, "Update branch protection" endpoint (WebFetch, docs.github.com, apiVersion=2022-11-28)
# IMPORTANT: run this only AFTER the ci.yml workflow has executed at least once on a PR,
# so the exact check name ("CI / ci" or similar) is known — see Common Pitfalls #4.
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "repos/{owner}/{repo}/branches/main/protection" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[checks][][context]=ci" \
  -F "required_status_checks[checks][][app_id]=-1" \
  -F "enforce_admins=false" \
  -F "required_pull_request_reviews=null" \
  -F "restrictions=null"
```
Note: the `checks` array form (`{context, app_id}`) is GitHub's currently preferred replacement for the older `contexts: [string]` form; `app_id: -1` allows any app (including GitHub Actions) to satisfy the check. Replace `"ci"` with the actual job name from the workflow once observed (per Pitfall 4).

### `@fontsource` — self-hosted font imports (D-15)
```typescript
// src/main.tsx — import specific weights only (UI-SPEC.md declares exactly 2 weights: 400, 600)
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Tailwind v3 with `tailwind.config.js` + PostCSS pipeline | Tailwind v4 with `@tailwindcss/vite` plugin, CSS-first `@theme`/`@import "tailwindcss"` | Tailwind v4 GA (2025) | No config file needed; theme tokens (UI-SPEC.md's color/spacing tables) are declared as CSS custom properties instead of JS config |
| `react-router-dom` v6 `<BrowserRouter>`/`<Routes>` | `react-router` v7 Data mode (`createBrowserRouter`) — and now a further split where the bare `react-router` package moved to v8 while `react-router-dom` stays a v7-pinned compat re-export | react-router-dom collapsed into react-router in v7 (per package CHANGELOG, Context7); v8 released as the new bare-package major sometime in 2026 | `react-router-dom` (this project's locked package, D-13) is unaffected by the v8 bump — no action needed, but don't follow v8-era doc examples that import from `"react-router"` or `"react-router/dom"` |
| `tailwindcss-animate` (v3-era Tailwind plugin) | `tw-animate-css` (plain CSS import, v4-compatible) | Alongside Tailwind v4 adoption | shadcn v4 templates reference `tw-animate-css` instead of the old plugin — install this one, not the deprecated plugin |
| Manually configuring Vercel "Rewrites" via dashboard | Committing `vercel.json` with a `rewrites` array | Longstanding practice, reaffirmed by current docs (updated 2026-08-14) | Matches D-02's requirement for a git-tracked config |

**Deprecated/outdated:**
- `tailwindcss-animate`: superseded by `tw-animate-css` for Tailwind v4 projects — do not install the old plugin.
- Manually writing `@tailwind base; @tailwind components; @tailwind utilities;` directives: replaced by a single `@import "tailwindcss";` in v4.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Package names for shadcn's transitive dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`) are correct, based on training-data familiarity with the shadcn ecosystem, cross-checked only by registry existence (`npm view`) and slopcheck — not by fetching an official shadcn `package.json` listing all its generated dependencies. | Standard Stack, Supporting | If any name is subtly wrong (e.g., a typo-squat with a similar name also existing on npm), `npm install` would succeed with the wrong package; low risk given all names matched well-known, high-download packages and passed slopcheck's `[OK]` verdict, but registry existence alone doesn't prove "this is what shadcn's CLI actually installs" |
| A2 | `.nvmrc` content should be a bare `"22"` (floating to latest 22.x LTS patch) rather than a fully pinned patch version like `"22.12.0"` | Recommended Project Structure | If the planner instead wants a fully pinned patch for maximum reproducibility, `.nvmrc` and `package.json engines` should specify the exact patch instead — this is a minor style choice, not a correctness issue, since `>=22.12.0` is Vite 8's actual floor per its `engines` field |
| A3 | Vercel's zero-config Vite framework preset uses build command `vite build` and output directory `dist` with no extra `vercel.json` `buildCommand`/`outputDirectory` overrides needed | Architecture Patterns / DEPLOY-01 | If Vercel's auto-detection ever requires an explicit `outputDirectory` override for this specific repo layout, the first deploy would fail with a "no output directory found" error — easily caught and fixed during the first Phase 1 deploy attempt, low risk |
| A4 | The `checks` array form (`{context, app_id}`) for `required_status_checks` is accepted by the current GitHub REST API version alongside the older `contexts` array, based on a WebFetch summary rather than a direct read of the raw OpenAPI schema | Code Examples (`gh` CLI branch protection) | If GitHub has since removed the `checks` form or changed its shape, the `gh api` command would return a 422 error — recoverable immediately at execution time by falling back to the `contexts: [string]` form, which was also confirmed in the same fetch |

## Open Questions (RESOLVED)

1. **Exact GitHub Actions job/check name to require in branch protection** — RESOLVED: see 01-06 Task 1
   - What we know: The workflow file will be named `ci.yml` with a single job (suggested id `ci`), which is what must appear as the required status check context.
   - What's unclear: GitHub sometimes reports the check context as `<workflow name> / <job name>` (e.g., `CI / ci`) rather than just the job id, depending on workflow structure — this can't be known with certainty until the workflow actually runs once.
   - Recommendation: Sequence the Phase 1 plan so the CI workflow is pushed and run (via an initial PR) BEFORE the branch-protection `gh api` task executes, and have the executor read the actual context string from that PR's checks UI or via `gh api repos/{owner}/{repo}/commits/{sha}/status` rather than guessing it in advance.
   - Resolution: Plan 01-06 Task 1 pushes and waits for a green CI run, then reads the real check-run name from `gh api .../check-runs` before Task 2 sets branch protection with that observed name.

2. **Whether Vercel needs manual "Add New Project" / GitHub App installation as a prerequisite, or can be fully scripted** — RESOLVED: see 01-06 Task 3
   - What we know: DEPLOY-01 requires the app "deployed to Vercel and publicly reachable"; Vercel's git integration auto-deploys on push once a project is linked to the repo.
   - What's unclear: Initial Vercel project creation/GitHub App authorization is typically a one-time interactive step (via Vercel dashboard or `vercel link` CLI prompting for login) — this research did not find a fully non-interactive, secrets-free way to provision a brand-new Vercel project from a fresh GitHub repo without at least one authenticated `vercel` CLI or dashboard action.
   - Recommendation: Plan for one `checkpoint:human-verify`-style task for the initial Vercel project linkage/first deploy, distinct from the fully automatable `vercel.json` and GitHub Actions pieces.
   - Resolution: Plan 01-06 Task 3 is a `checkpoint:human-action` task for the Vercel project link/first deploy — no scriptable non-interactive path exists, so this is recorded as a real human step rather than automated.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite 8 build/dev, all npm tooling | ✓ | v24.11.0 (locally installed; satisfies Vite's `>=22.12.0` floor) | Project pins Node 22 LTS via `.nvmrc` (D-16) — local machine's v24 is compatible but should not be assumed to match CI/Vercel exactly; developer should `nvm use` once `.nvmrc` exists |
| npm | Package manager (D-14) | ✓ | 11.18.0 | — |
| git | Version control | ✓ | 2.51.2 | — |
| gh (GitHub CLI) | D-08 branch protection task | ✓ | 2.88.1 | — |
| Docker | Not required by this phase | ✗ | — | N/A — no containerization used in Phase 1 |
| slopcheck (Python/pip) | Package legitimacy audit (this research session) | ✓ (installed during research) | 0.6.1 | Already installed; planner does not need to re-install for future phases unless the environment is reset |

**Missing dependencies with no fallback:** none — every tool this phase needs is already present in the local environment.

**Missing dependencies with fallback:** none applicable (Docker not needed).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None yet — D-06 explicitly excludes a test runner from this phase's CI |
| Config file | none — see Wave 0 Gaps |
| Quick run command | N/A this phase |
| Full suite command | N/A this phase |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|-------------|
| SHELL-01 | Landing/home page renders with CTA | manual-only (no test runner yet, D-06) | `npm run dev` + manual browser check | ❌ N/A this phase |
| SHELL-02 | Navigation from home → `/game` | manual-only | manual click-through | ❌ N/A this phase |
| SHELL-03 | `/results` placeholder renders | manual-only | manual click-through | ❌ N/A this phase |
| SHELL-04 | Responsive layout at mobile/desktop widths | manual-only | manual DevTools viewport resize check | ❌ N/A this phase |
| DEPLOY-01 | App reachable at public Vercel URL | manual-only (smoke check) | `curl -I <deployment-url>` returns 200 | ❌ N/A this phase |
| DEPLOY-02 | Direct nav/refresh on `/gallery`, `/share/:slug` works | manual-only (smoke check) | manual browser hard-refresh on deployed URL | ❌ N/A this phase |

**Justification for manual-only:** D-06 is an explicit, locked decision to defer test-runner introduction to a later phase ("Add a test step to the workflow once Vitest is actually introduced in a later phase"). Automating these checks now would contradict that locked decision. `npm run lint` + `npm run typecheck` + `npm run build` (already in the CI Phase Requirements → these are the only automated gates for Phase 1) substitute as the automated correctness signal for this phase — they catch broken imports, type errors, and build failures, which is the dominant failure mode for a scaffolding phase.

### Sampling Rate
- **Per task commit:** `npm run lint && npm run typecheck` (fast, catches most scaffold mistakes)
- **Per wave merge:** `npm run build` (catches anything lint/typecheck miss, e.g. missing assets)
- **Phase gate:** All three CI checks green on the PR, plus the two manual smoke checks (DEPLOY-01 URL reachability, DEPLOY-02 refresh survival) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework exists — intentionally, per D-06. Nothing to scaffold here for THIS phase.
- [ ] `package.json` needs a `typecheck` script added (not scaffolded by default `create vite react-ts` — see Code Examples).
- [ ] `.github/workflows/ci.yml` does not exist yet — must be created as part of this phase (this IS the phase's deliverable, not a gap to backfill later).

*(A future phase introducing Vitest should add this section's proper contents — unit tests for gesture/puzzle logic, etc. — once GAME-* requirements land in Phase 2.)*

## Security Domain

This phase has no authentication, no user input processing, no backend, and no data persistence (per PROJECT.md constraints and D-13's explicit dependency exclusions) — most ASVS categories are not yet applicable. The relevant subset:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Not introduced until Phase 4 |
| V3 Session Management | No | Not introduced until Phase 4 |
| V4 Access Control | No | No protected resources exist yet |
| V5 Input Validation | No | No forms/user input in this phase's placeholder pages |
| V6 Cryptography | No | Not applicable |
| V10 Malicious Code / Supply Chain | Yes | Package Legitimacy Audit (this document) — slopcheck + registry verification on every new dependency before install |
| V14 Configuration | Yes | Vite's production build strips dev-only code by default; ensure no source maps are unintentionally published if that matters for this project's IP posture (not specified as a requirement — default Vite behavior is acceptable) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Dependency confusion / typosquat / slopsquat packages | Tampering | Package Legitimacy Audit gate (already run for this phase, see above) — repeat for every future phase that adds new dependencies |
| Overly permissive SPA rewrite accidentally exposing a future `/api/*` path meant for a serverless function | Elevation of Privilege (future risk) | D-03 deliberately has no `/api/*` exception in Phase 1 because no API routes exist yet; if a future phase adds Vercel Functions under `/api`, the rewrite rule MUST be revisited then to exclude `/api/*` from the catch-all — flagged here so it isn't forgotten |
| Branch protection bypass via `enforce_admins: false` | Tampering (of the deploy pipeline itself) | The `gh api` example above sets `enforce_admins: false` to match D-07/D-08's scope (just require the CI check, nothing more); if stricter admin-inclusive enforcement is desired later, this is a one-line follow-up change, not a Phase 1 requirement |

## Sources

### Primary (HIGH confidence)
- Context7 `/tailwindlabs/tailwindcss.com` — Tailwind v4 Vite plugin setup, `@import "tailwindcss"` migration
- Context7 `/shadcn-ui/ui` — Vite installation sequence, `vite.config.ts` alias, `tsconfig.json` paths, Tailwind v4 `globals.css` structure
- Context7 `/remix-run/react-router` — `createBrowserRouter`, nested routes, `Outlet`, package restructuring changelog (react-router-dom re-export note), catch-all/splat route patterns
- https://vercel.com/docs/frameworks/frontend/vite (WebFetch, `last_updated: 2026-08-26`) — exact `vercel.json` SPA rewrite JSON, confirmed matches D-02/D-03 with no modification needed
- https://vercel.com/docs/project-configuration/vercel-json (WebFetch, `last_updated: 2026-08-14`) — `rewrites` array schema
- https://ui.shadcn.com/docs/installation/vite (WebFetch) — ordered install steps, exact file contents for `index.css`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`
- https://github.com/actions/setup-node (WebFetch) — `node-version-file` input reading `.nvmrc`, `cache: 'npm'` behavior
- npm registry (`npm view <pkg> version`, `npm view <pkg> engines`, `npm view <pkg> versions --json`) — live version/engine checks for all 25 packages in Standard Stack, plus the react-router v7-vs-v8 split discovery
- slopcheck 0.6.1 (`slopcheck install --ecosystem npm <packages>`) — legitimacy scan, all 25 packages `[OK]`

### Secondary (MEDIUM confidence)
- WebFetch summary of https://docs.github.com/en/rest/branches/branch-protection — `required_status_checks` `checks` vs `contexts` field shapes (summarized by the fetch tool's model, not read verbatim from raw OpenAPI schema — see Assumption A4)
- WebSearch — actions/checkout@v7 and actions/setup-node@v6 current major versions (cross-referenced across 2 search result sets, both pointing to the same versions)
- WebSearch — Fontsource `@fontsource/ibm-plex-mono` weight-specific import pattern (`@fontsource/ibm-plex-mono/400.css`), cross-referenced against the official fontsource.org install page link surfaced in results

### Tertiary (LOW confidence)
- None — all findings in this document were either Context7/official-doc-fetched or npm-registry-verified.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every package version was independently confirmed live against the npm registry on 2026-09-09, and the two most consequential API-shape questions (Tailwind v4 config style, react-router-dom vs react-router split) were confirmed via Context7-sourced official docs/changelog rather than training-data assumption.
- Architecture: HIGH — the routing/layout/rewrite pattern is drawn directly from official React Router and Vercel documentation fetched during this session, not inferred.
- Pitfalls: MEDIUM — Pitfalls 1-3 are HIGH confidence (directly observed from doc structure and registry facts); Pitfall 4 (branch-protection check-name matching) is MEDIUM — it's a well-known GitHub Actions gotcha from general operational experience with GitHub's UI, not something independently re-verified against a live example in this session.

**Research date:** 2026-09-09
**Valid until:** 2026-10-09 (30 days) — this stack (Tailwind v4, React Router v7/v8 split, Vite 8) is mid-fast-moving-ecosystem; re-verify package versions if planning is delayed beyond this window, particularly the `react-router-dom` vs `react-router` version relationship, which could change again.
