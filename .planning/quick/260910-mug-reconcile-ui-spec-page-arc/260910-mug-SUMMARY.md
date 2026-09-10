---
quick_id: 260910-mug
status: complete
completed: 2026-09-10
---

# Quick Task 260910-mug: Reconcile 01-UI-SPEC.md's Landing Page Treatment with DESIGN.md's page arc

**Status: complete**

## What changed

`.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` was bumped to Revision 4 and
its "Landing Page Treatment" composition list was extended so the Home route's contract
explicitly matches the page arc `DESIGN.md` already presupposes (§4's reference to a "How
PinchPop Works" flow as a genuine, pre-existing numbered sequence) but Revision 3 never
enumerated past the hero.

**Task 1 — Revision bump + Reconciliation Note:**
- Frontmatter `revised` → `2026-09-10`, `revision` → `4`.
- H1 and intro blockquote updated to reference Revision 4.
- New `## Revision 4 — Reconciliation Note` section inserted after the existing (untouched)
  Revision 3 note, citing `DESIGN.md` §1, §4, §6, §10, §17 as the basis and following the same
  why / what-did-not-change / conflict-and-resolution structure Revision 3 established.

**Task 2 — Landing Page Treatment extension:**
- Items 1–5 (hero: paper/halftone/blobs, aperture ring, corner brackets, headline+subhead+CTA,
  tilted card-stack motif) left exactly as written.
- Item 6 added: "How PinchPop Works" — a numbered 3-step process section (frame → pinch to
  capture → solve), built from `paper-raised` info cards and existing Label/Heading/Body type
  roles only. No new color, no new HUD element. Numbering explicitly justified by `DESIGN.md`
  §4's own exception for genuine sequences.
- Item 7 added: supporting/proof content **explicitly scoped out of Phase 1** — stated plainly
  that Phase 1 has zero real captured photos and zero real user data (citing the document's
  existing photography audit note and `DESIGN.md` §10), naming Phase 6 (Gallery) as the point
  this should be revisited. No placeholder photos, fake scores, or fake counts were invented to
  fill this slot.
- Item 8 added: a closing CTA reprise band before the footer — a quiet repeat of the existing
  primary CTA, no new decorative motif or color.
- A summary paragraph added below the list stating the full composition: hero (1–5) → How
  PinchPop Works (6) → supporting/proof content, explicitly deferred (7) → closing CTA reprise
  (8) → footer.
- Checker Sign-Off section given an honest "Revision 4 addendum" noting this was a hand
  reconciliation (not a fresh `gsd-ui-checker` run) and that no dimension checkbox is claimed as
  re-verified for work that wasn't actually re-checked.

## Files modified

- `.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` — 21 insertions, 4 deletions.
  No other file touched. `DESIGN.md` (the authoritative source), `src/**`, `index.html`, and
  `package.json` were read-only or untouched, per the docs-only scope of this task.

## Verification

- `grep -c 'revision: 4' 01-UI-SPEC.md` → ≥1; `grep -c 'Revision 4 — Reconciliation Note'
  01-UI-SPEC.md` → exactly 1. Both passed.
- `grep -c 'How PinchPop Works' 01-UI-SPEC.md` → ≥2 (Reconciliation Note + composition list);
  `grep -v '^#' 01-UI-SPEC.md | grep -c 'Closing CTA reprise'` → ≥1. Both passed.
- `git diff --stat main <task-branch>` confirmed exactly one file changed, no deletions.
- No literal Stitch HTML/CSS/copy from `design-exploration/` was copied into the spec; no
  fabricated photography, scores, or social-proof data were introduced anywhere in the diff.

## Deviations from plan

None in task content. The executor's worktree branch had been created from a stale pre-Revision-3
commit; it fast-forwarded to `main`'s tip before editing (verified as a safe, non-destructive
fast-forward with a clean working tree and zero divergent commits) so the edit landed on the
current Revision 3 text rather than a stale copy. This is scaffolding, not a scope change.

## Orchestrator note

This file was reconstructed by the orchestrator after the executor's worktree was removed before
its uncommitted `SUMMARY.md` was rescued (a process slip — the standard rescue-before-removal
step was skipped). Content here is taken verbatim from the executor's own final structured report,
cross-checked against the actual merged commit (`7b6f2fb`) diff and its passing verify commands.
