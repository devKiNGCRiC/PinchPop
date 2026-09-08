---
phase: 01-app-shell-deployment-pipeline
plan: 03
subsystem: infra
tags: [vercel, github-actions, ci, deployment, spa-routing]

# Dependency graph
requires:
  - phase: 01-app-shell-deployment-pipeline (plan 01)
    provides: "Vite + React 19 + TypeScript scaffold with lint/typecheck/build scripts, .nvmrc pinning Node 22"
  - phase: 01-app-shell-deployment-pipeline (plan 02)
    provides: "Tailwind v4 + shadcn/ui foundation the build pipeline now compiles"
provides:
  - "Git-tracked vercel.json with an unconditional SPA catch-all rewrite (/(.*)  -> /index.html) so client-side routes survive direct navigation/refresh in production"
  - "Single-job GitHub Actions CI workflow (name: CI, job id: ci) gating push-to-main and PR-to-main on npm ci + lint + typecheck + build"
  - "Local proof that the exact CI command sequence passes against a clean npm ci install"
affects: [01-04, 01-05, 01-06 (branch-protection check-context naming depends on this workflow having run)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vercel.json copied verbatim from official Vercel docs pattern: $schema + single unconditional rewrite, no buildCommand/outputDirectory/installCommand/framework overrides (Vercel zero-config Vite detection)"
    - "CI workflow reads Node version exclusively via actions/setup-node's node-version-file: \".nvmrc\" input — never a second hardcoded node-version literal"
    - "Single-job CI form (no matrix) since exactly one Node version is supported; keeps the reported status-check context simple for a later branch-protection rule"

key-files:
  created: [vercel.json, .github/workflows/ci.yml]
  modified: []

key-decisions:
  - "Task 3 (local CI dry-run) required no file changes — npm ci, lint, typecheck, and build all passed clean on the first attempt against the existing lockfile and source tree, so no commit was made for that task (nothing to stage); its verification output is recorded here instead"

patterns-established:
  - "Any future workflow file must source Node version from .nvmrc via node-version-file, never a hardcoded node-version"
  - "CI and Vercel deploys remain fully independent (D-07) — no vercel CLI/VERCEL_TOKEN reference is permitted in ci.yml"

requirements-completed: [DEPLOY-01, DEPLOY-02]

# Metrics
duration: 8min
completed: 2026-09-09
---

# Phase 1 Plan 03: Deployment Pipeline Configuration Summary

**Committed a verbatim-pattern `vercel.json` SPA catch-all rewrite and a single-job GitHub Actions `CI` workflow (lint + typecheck + build, Node version sourced from `.nvmrc`), then proved the exact CI command sequence passes locally against a clean `npm ci`.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3/3 completed (Task 3 produced no file changes — verification only)
- **Files modified:** 2 created (`vercel.json`, `.github/workflows/ci.yml`)

## Accomplishments

- `vercel.json` rewrites every unmatched path to `/index.html` with no `/api/*` exception (D-02, D-03) and no redundant `buildCommand`/`outputDirectory`/`installCommand`/`framework` overrides (Assumption A3)
- `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` on every push to `main` and every PR targeting `main`, with Node version sourced solely from `.nvmrc` (D-16), no test step (D-06), and no Vercel deploy step (D-07)
- Local dry-run of the exact CI sequence passed clean on the first attempt: `npm ci` (lockfile in sync, 518 packages, 0 vulnerabilities), `npm run lint` (0 errors), `npm run typecheck` (0 errors), `npm run build` (exit 0, `dist/index.html` produced)
- No quality gate was weakened — `package.json`, `eslint.config.js`, and `tsconfig.app.json` are untouched by this plan (`git status --porcelain` on all three is empty)

## Task Commits

Each task was committed atomically:

1. **Task 1: Commit the Vercel SPA catch-all rewrite** - `ee6459f` (feat)
2. **Task 2: Add the GitHub Actions lint + typecheck + build workflow** - `25ec524` (feat)
3. **Task 3: Dry-run the exact CI command sequence locally** - no commit (verification-only task; produced zero file changes — `npm ci` found the lockfile already in sync, `lint`/`typecheck`/`build` all passed against the existing source tree with no fixes required)

_No TDD tasks in this plan — all tasks are `type="auto"` config/verification work._

## Files Created/Modified

- `vercel.json` - `$schema` + single unconditional rewrite `/(.*)`  → `/index.html`; no exceptions, no build overrides
- `.github/workflows/ci.yml` - `name: CI`, single job `ci` on `ubuntu-latest`; `actions/checkout@v7`, `actions/setup-node@v6` (`node-version-file: ".nvmrc"`, `cache: "npm"`), then `npm ci` / `npm run lint` / `npm run typecheck` / `npm run build`

## Decisions Made

- Task 3 is a verification-only task by design (per its own `<done>` criterion: "the four-command CI sequence passes locally"). Since the lockfile was already in sync and lint/typecheck/build all passed without any code change, there was nothing to stage or commit for that task — its result is documented here rather than forced into an empty commit.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' acceptance criteria were met without needing any Rule 1-4 auto-fixes: the scaffold from plans 01-01/01-02 already had working `lint`/`typecheck`/`build` scripts and a lockfile in sync, so the CI pipeline mechanics validated cleanly on the first pass.

## Issues Encountered

None. `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` all exited 0 on the first attempt with no lockfile-sync errors, lint errors, or type errors to fix.

## User Setup Required

None - no external service configuration required. (The GitHub Actions workflow will start reporting real runs the first time this branch reaches `main` or opens a PR against it — no manual GitHub configuration is needed to enable it.)

## Next Phase Readiness

- `vercel.json` and `.github/workflows/ci.yml` are both committed and git-tracked, satisfying DEPLOY-01/DEPLOY-02's pipeline-mechanics half
- The CI workflow has not yet actually run on GitHub (that happens once this branch/PR reaches `main`) — plan 01-06's branch-protection task still needs to observe the real reported check-context string (`ci` vs `CI / ci`) before naming it as a required status check, per 01-RESEARCH.md Open Question 1. Not a blocker for this plan, just deferred by design.
- No blockers for plans 01-04/01-05 (AppShell, routes, pages) or 01-06 (full-app CI re-exercise + branch protection).

---
*Phase: 01-app-shell-deployment-pipeline*
*Completed: 2026-09-09*

## Self-Check: PASSED

All claimed files verified present (vercel.json, .github/workflows/ci.yml, this SUMMARY.md). All claimed commit hashes verified in `git log` (ee6459f, 25ec524, fc078b0).
