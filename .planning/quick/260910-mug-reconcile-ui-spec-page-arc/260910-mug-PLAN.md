---
quick_id: 260910-mug
type: quick
files_modified:
  - .planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md
---

# Quick Task 260910-mug: Reconcile 01-UI-SPEC.md's Landing Page Treatment with DESIGN.md's page arc

## Objective

`DESIGN.md` §4 already treats a "How PinchPop Works" 3-step flow as an existing, legitimate
numbered sequence ("numbered step markers unless the content is an actual sequence (the 'How
PinchPop Works' 3-step flow legitimately is one — don't add numbering anywhere else)"), and §1
item 4, §6, and §17 establish that a screen's full composition — not just its hero — is what
must read as complete and dominant-hero-first at every width. But
`.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` (currently Revision 3)'s
"Landing Page Treatment" section is a 5-item list that stops at the tilted card-stack motif and
never enumerates a how-it-works section, a supporting/proof-content decision, or a closing CTA
band as part of the Home route's contract. `DESIGN.md` is authoritative and presupposes the
how-it-works section exists; this task makes that implicit presupposition explicit in the spec
document that actually drives implementation, following the same hand-reconciliation pattern
Revision 3 already established in this same file (frontmatter revision bump, a dated
"Revision N — Reconciliation Note" section citing specific `DESIGN.md` section numbers, then the
actual section edits).

This is a **documentation-only** task. It modifies exactly one file:
`.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md`. `DESIGN.md` is not edited —
it is the authoritative source `01-UI-SPEC.md` is being reconciled against, never the reverse.
No application code, `index.html`, or `package.json` is touched. Every other section of
`01-UI-SPEC.md` (color tokens, typography, spacing, nav, footer, route inventory, copywriting
contract, component inventory, registry safety) is left byte-for-byte unchanged except where
explicitly listed below.

## Task 1: Bump to Revision 4 and add the Revision 4 Reconciliation Note

**File:** `.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md`

**Action:**

1. In the frontmatter, update `revised: 2026-09-09` → `revised: 2026-09-10` and
   `revision: 3` → `revision: 4`. Leave every other frontmatter key unchanged
   (`phase`, `slug`, `status`, `shadcn_initialized`, `preset`, `created`, `reviewed_at`).
2. Update the H1 line (`# Phase 1 — UI Design Contract (REVISED — Revision 3, reconciled with
   DESIGN.md)`) to say `Revision 4` instead of `Revision 3`.
3. Update the blockquote line immediately below the H1 (currently ending "...Revision 3
   reconciled by hand against the approved root `DESIGN.md`.") to also note Revision 4 extends
   the reconciliation to the landing page's full composition — keep it one sentence, matching
   the existing tone.
4. Insert a new `## Revision 4 — Reconciliation Note` section immediately after the existing
   Revision 3 note block ends (after the `---` that currently precedes `## Design System`) and
   before `## Design System`. Do not edit or remove the existing Revision 3 note — it stays as
   the historical record of that reconciliation pass. Write the new note following the same
   structure Revision 3 used (why this revision exists / what did not change / conflicts found
   and how each was resolved), covering:
   - **Why:** `DESIGN.md` §4 already references the "How PinchPop Works" 3-step flow as a
     genuine, pre-existing numbered sequence, and §1 (principle 4, "toolkit not checklist"), §6,
     and §17 establish that Home's full composition — not a hero-only screen — is the governing
     model. `01-UI-SPEC.md` Revision 3's Landing Page Treatment section never enumerated this
     flow, a supporting/proof-content decision, or a closing CTA reprise, so it under-specifies
     what `DESIGN.md` already presupposes. This revision makes that implicit scope explicit; it
     does not invent new scope beyond what `DESIGN.md` already authorizes.
   - **What did not change:** every token value, typography rule, spacing scale, nav/footer
     structure, route inventory, copy contract, component inventory, and registry-safety
     statement from Revision 3 — this is an additive scoping correction to one section (Landing
     Page Treatment) only.
   - **Conflict found and resolution:** state that Revision 3's Landing Page Treatment
     composition list (5 items, ending at the tilted card-stack motif) is extended to explicitly
     include (a) a "How PinchPop Works" numbered-process section reusing existing `paper-raised`
     info-card styling and the Label/Heading/Body type roles already defined in this document —
     no new colors, no new HUD elements; (b) an explicit, honest scoping decision on
     supporting/proof content (e.g., a recent-captures or gallery-preview strip), deferred out of
     Phase 1 because Phase 1 has zero real captured photos and zero real user data by
     construction (cite this document's own existing "Explicit audit note — photography" under
     Visual Motif, and `DESIGN.md` §10's "must not depend on stock/licensed photography" /
     "must read as complete... before a single user photo has been captured" rules) — do not
     invent placeholder photos, fake scores, or fake social-proof data to fill this slot; (c) a
     closing CTA reprise band immediately before the footer, reusing the exact same primary CTA
     treatment already defined (no new decorative motifs).

**Verify:**
`grep -c 'revision: 4' .planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` returns
at least 1, and `grep -c 'Revision 4 — Reconciliation Note' .planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md` returns exactly 1.

**Done:** Frontmatter and H1 read Revision 4; a new `## Revision 4 — Reconciliation Note` section
exists between the Revision 3 note and `## Design System`, citing specific `DESIGN.md` section
numbers (§1, §4, §6, §10, §17) for its rationale; the existing Revision 3 note is untouched.

## Task 2: Extend the Landing Page Treatment composition list and add the Revision 4 sign-off note

**File:** `.planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md`

**Action:**

1. In the `## Landing Page Treatment` section, keep the existing numbered items 1–5 (hero
   background/halftone/blobs, aperture ring, corner brackets, headline+subhead+CTA, tilted
   card-stack motif) exactly as written — do not reword or renumber them. Append three new
   numbered items after item 5, in this order:
   - **Item 6 — "How PinchPop Works":** a numbered 3-step process section below the hero,
     presenting PinchPop's actual core loop (frame with your hands → pinch to capture → solve
     the puzzle — or the equivalent 3 beats already implied by the product description in
     `.planning/PROJECT.md`/`CLAUDE.md`). Each step is a `paper-raised` info card (reusing the
     existing Cards pattern already defined in this document's Component Styling Approach
     section — flat, no rotation, no tape, since these are UI chrome per the existing Info/stat
     card family) with a `Heading`-role step title, `Body`-role one-line description, and a
     numeral marker — note explicitly that the numeral marker is the one case `DESIGN.md` §4
     itself authorizes for numbered-step content, citing that section. No `viewfinder`,
     `token-gold`, `neon-violet`, or Landing Gradient Wash color is introduced for this section;
     use `ink`/`ink-soft`/`shutter` only, matching what this document already defines.
   - **Item 7 — Supporting/proof content (explicitly scoped out for Phase 1):** state plainly
     that Phase 1 does not include a recent-captures, gallery-preview, or testimonial/proof
     section on Home, and why: Phase 1 has no real captured photos and no real user accounts or
     data (cite this document's own existing photography audit note and `DESIGN.md` §10). Name
     the concrete future point this should be revisited (once real gallery data exists — per
     `.planning/ROADMAP.md`'s Phase 6 Gallery placement referenced in `.planning/STATE.md`'s
     decisions). This item exists in the list specifically so the omission reads as a deliberate,
     documented decision rather than a silent gap — do not fabricate placeholder photos, fake
     scores, or fake counts to fill this slot.
   - **Item 8 — Closing CTA reprise:** a quiet repeat of the same primary CTA ("Start Playing",
     `shutter` fill, `shutter-ink` text, same shutter-click micro-interaction already defined)
     positioned after item 7's decision point and before the page's `AppShell` footer. No new
     decorative motif, no new color, no new copy string beyond the CTA text already locked in
     the Copywriting Contract section.
2. Immediately below the renumbered list (before the existing "This treatment is achievable
   entirely within `HomePage.tsx`..." paragraph, which stays unchanged), add one short paragraph
   noting the full Home composition is now: hero (items 1–5) → How PinchPop Works (item 6) →
   supporting/proof content, explicitly deferred (item 7) → closing CTA reprise (item 8) →
   footer — and that this matches `DESIGN.md`'s presupposed page arc without introducing any
   token, color, or component not already defined elsewhere in this document.
3. In the `## Checker Sign-Off` section at the end of the file, add a short `**Revision 4
   addendum:**` note directly below the existing six dimension checkmarks and the `**Approval:**
   approved` line. State plainly that Revision 4 was a hand reconciliation (same method as
   Revision 3), not a fresh `gsd-ui-checker` run, and that it does not invalidate the prior
   six-dimension pass because no new token, color, or component was introduced — only an
   additive extension of the Landing Page Treatment composition using vocabulary already
   approved in Revision 3. Do not mark any dimension checkbox as re-verified/PASS for work that
   was not actually re-checked.

**Verify:**
`grep -c 'How PinchPop Works' .planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md`
returns at least 2 (once in the Revision 4 note, once in the Landing Page Treatment list); and
`grep -v '^#' .planning/phases/01-app-shell-deployment-pipeline/01-UI-SPEC.md | grep -c 'Closing CTA reprise'`
returns at least 1.

**Done:** The Landing Page Treatment section's composition list runs hero (1–5, unchanged) →
How PinchPop Works (6) → supporting/proof content explicitly deferred with a stated reason (7) →
closing CTA reprise (8) → footer; no new color token, HUD element, or decorative motif was
introduced anywhere in the diff; the Checker Sign-Off section carries an honest Revision 4
addendum rather than a fabricated re-verification.
