---
phase: 01
slug: app-shell-deployment-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-09
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None yet — D-06 explicitly excludes a test runner from this phase's CI. Test infrastructure lands with Vitest in a later phase. |
| **Config file** | none — see Wave 0 Requirements |
| **Quick run command** | `npm run lint && npm run typecheck` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint && npm run typecheck`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** All three CI checks green on the PR, plus manual smoke checks (DEPLOY-01 URL reachability, DEPLOY-02 refresh survival)
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-xx-xx | TBD | TBD | SHELL-01 | — | Landing/home page renders with CTA | manual-only | `npm run dev` + manual browser check | ❌ N/A this phase | ⬜ pending |
| 01-xx-xx | TBD | TBD | SHELL-02 | — | Navigation from home → `/game` | manual-only | manual click-through | ❌ N/A this phase | ⬜ pending |
| 01-xx-xx | TBD | TBD | SHELL-03 | — | `/results` placeholder renders | manual-only | manual click-through | ❌ N/A this phase | ⬜ pending |
| 01-xx-xx | TBD | TBD | SHELL-04 | — | Responsive layout at mobile/desktop widths | manual-only | manual DevTools viewport resize check | ❌ N/A this phase | ⬜ pending |
| 01-xx-xx | TBD | TBD | DEPLOY-01 | — | App reachable at public Vercel URL | manual-only (smoke) | `curl -I <deployment-url>` returns 200 | ❌ N/A this phase | ⬜ pending |
| 01-xx-xx | TBD | TBD | DEPLOY-02 | T-01-01 (SPA rewrite scope) | Direct nav/refresh on `/gallery`, `/share/:slug` works | manual-only (smoke) | manual browser hard-refresh on deployed URL | ❌ N/A this phase | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Justification for manual-only:** D-06 is an explicit, locked decision to defer test-runner introduction to a later phase. Automating these checks now would contradict that decision. `npm run lint` + `npm run typecheck` + `npm run build` substitute as the automated correctness signal for this phase — they catch broken imports, type errors, and build failures, the dominant failure mode for a scaffolding phase.

---

## Wave 0 Requirements

- [ ] No test framework exists — intentionally, per D-06. Nothing to scaffold here for this phase.
- [ ] `package.json` needs a `typecheck` script added (not scaffolded by default `create vite react-ts`).
- [ ] `.github/workflows/ci.yml` does not exist yet — created as part of this phase's own deliverable (D-05), not a gap to backfill.

*(A future phase introducing Vitest should populate this section properly — unit tests for gesture/puzzle logic — once GAME-* requirements land in Phase 2.)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Home page renders with intro/CTA | SHELL-01 | No test runner yet (D-06) | `npm run dev`, visit `/`, confirm landing content and CTA visible |
| Home → `/game` navigation | SHELL-02 | No test runner yet (D-06) | Click through nav from home to game placeholder page |
| `/results` placeholder renders | SHELL-03 | No test runner yet (D-06) | Navigate to `/results`, confirm placeholder content renders |
| Responsive layout desktop/mobile | SHELL-04 | No test runner yet (D-06); visual/layout check | Resize browser / DevTools device toolbar at common breakpoints, confirm no layout breakage |
| Public Vercel URL reachable | DEPLOY-01 | Requires live deployment, not a local test | `curl -I <deployment-url>` returns `200 OK` after deploy |
| Direct nav/refresh survives on nested routes | DEPLOY-02 | Requires live deployment + browser hard refresh | On deployed URL, hard-refresh `/gallery` and `/share/:slug` directly — confirm no 404, correct page loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (lint/typecheck/build) or are explicitly Manual-Only above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (typecheck script, CI workflow)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
