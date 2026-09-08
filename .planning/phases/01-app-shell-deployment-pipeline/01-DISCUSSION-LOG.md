# Phase 1: App Shell & Deployment Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 01-app-shell-deployment-pipeline
**Areas discussed:** Routing mode & refresh survival, CI/CD & quality gates, Project structure & code quality tooling, Dependency installation scope

---

## Routing mode & refresh survival

| Option | Description | Selected |
|--------|-------------|----------|
| Declarative SPA mode | createBrowserRouter, pure client-side routing | ✓ |
| Framework mode (SSR-capable) | File-based routing, needs Vercel's React Router server runtime | |
| You decide | Let Claude pick based on Phase 8 SSR needs | |

**User's choice:** Declarative SPA mode
**Notes:** Simpler, matches the static/canvas-game nature of the app.

| Option | Description | Selected |
|--------|-------------|----------|
| vercel.json rewrite | Committed catch-all rewrite to index.html | ✓ |
| Vercel dashboard SPA toggle | Non-code-committed dashboard setting | |

**User's choice:** vercel.json rewrite

| Option | Description | Selected |
|--------|-------------|----------|
| No exceptions | All unmatched paths go through React Router's 404 | ✓ |
| Carve out /api/* prefix now | Reserve for future OG-image serverless function | |

**User's choice:** No exceptions

| Option | Description | Selected |
|--------|-------------|----------|
| Nested layout route | AppShell as parent route wrapping child routes | ✓ |
| Manual per-page wrapping | Each page imports AppShell itself | |

**User's choice:** Nested layout route

---

## CI/CD & quality gates

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions gate + Vercel deploy | CI runs lint/typecheck/build, Vercel deploys | ✓ |
| Vercel-only (no separate CI) | Rely on Vercel's own build step only | |

**User's choice:** GitHub Actions gate + Vercel deploy

| Option | Description | Selected |
|--------|-------------|----------|
| No test step yet | Lint + typecheck + build only | ✓ |
| Scaffold Vitest now with placeholder test | Add test runner + trivial test in Phase 1 | |

**User's choice:** No test step yet

| Option | Description | Selected |
|--------|-------------|----------|
| Independent, CI blocks merge only | Branch protection prevents bad merges; Vercel deploys main independently | ✓ |
| Vercel deployment explicitly waits on CI | Extra Vercel config to gate deploy on CI status | |

**User's choice:** Independent, CI blocks merge only

| Option | Description | Selected |
|--------|-------------|----------|
| Include as a phase task | Executor enables branch protection via gh CLI | ✓ |
| I'll enable it myself | User configures branch protection manually later | |

**User's choice:** Include as a phase task

---

## Project structure & code quality tooling

| Option | Description | Selected |
|--------|-------------|----------|
| src/pages + src/components | Route components in pages/, shared in components/, shadcn in components/ui/ | ✓ |
| Feature-folder structure (src/features/*) | Group by feature domain | |

**User's choice:** src/pages + src/components

| Option | Description | Selected |
|--------|-------------|----------|
| Strict mode (Vite default) | Keep react-ts template's strict TS config | ✓ |
| Relaxed (turn off strict) | Disable strict mode for velocity | |

**User's choice:** Strict mode

| Option | Description | Selected |
|--------|-------------|----------|
| ESLint + Prettier now | Extend Vite's config + add Prettier | ✓ |
| ESLint only, no Prettier | Skip enforced formatting | |

**User's choice:** ESLint + Prettier now

| Option | Description | Selected |
|--------|-------------|----------|
| New app at root, legacy moved to legacy/ | Vite scaffolds at root, legacy files relocated | ✓ |
| New app in web/ subfolder, legacy stays at root | Legacy untouched, Vercel root dir set to web/ | |

**User's choice:** New app at root, legacy moved to legacy/

---

## Dependency installation scope

| Option | Description | Selected |
|--------|-------------|----------|
| Install only what Phase 1 needs | Defer zustand/mediapipe/supabase-js to their actual phases | ✓ |
| Install everything from UI-SPEC's list now | Front-load all future dependencies | |

**User's choice:** Install only what Phase 1 needs
**Notes:** This deviates from UI-SPEC.md's Implementation Notes section, which listed all deps upfront. CONTEXT.md flags this explicitly so downstream agents don't follow the outdated instruction.

| Option | Description | Selected |
|--------|-------------|----------|
| npm | Matches UI-SPEC's documented commands, Vercel zero-config default | ✓ |
| pnpm | Faster installs, requires config changes | |

**User's choice:** npm

| Option | Description | Selected |
|--------|-------------|----------|
| @fontsource packages | Self-hosted, version-pinned fonts | ✓ |
| Google Fonts <link> tag | External network dependency, zero install | |

**User's choice:** @fontsource packages

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, pin via .nvmrc + engines | Node 22 LTS pinned across all environments | ✓ |
| No pin, use each environment's default | Risk of version drift | |

**User's choice:** Yes, pin via .nvmrc + engines

---

## Claude's Discretion

None — every question was answered with a specific choice.

## Deferred Ideas

None — discussion stayed within phase scope.
