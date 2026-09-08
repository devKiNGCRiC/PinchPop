---
phase: 01-app-shell-deployment-pipeline
plan: 02
subsystem: ui-foundation
tags: [tailwind-v4, shadcn, vite, typescript-paths, design-tokens, fonts]

# Dependency graph
requires: [01-01-app-scaffold-toolchain]
provides:
  - Tailwind v4 wired into the Vite build via @tailwindcss/vite, no tailwind.config.*, no PostCSS pipeline
  - "@ path alias resolving to src/ in vite.config.ts, tsconfig.json, and tsconfig.app.json"
  - shadcn/ui initialized (Radix base) with six Phase 1 primitives under src/components/ui/ (button, card, sheet, separator, skeleton, badge)
  - src/lib/utils.ts cn() helper (clsx + tailwind-merge), matching D-13's locked dependency scope
  - PinchPop brand tokens (ink/signal/danger/paper family) as named Tailwind theme colors, remapped onto shadcn's semantic CSS variables in :root and .dark
  - Dark mode as the default render mode (class="dark" on <html>)
  - IBM Plex Mono + Inter self-hosted at exactly two weights (400, 600) via @fontsource, imported in src/main.tsx
affects: [01-03, 01-04, 01-05, 01-06, all remaining Phase 1 plans and Phase 2+ UI work]

# Tech tracking
tech-stack:
  added: ["tailwindcss@4", "@tailwindcss/vite@4", "shadcn@4.21.0 (CLI, now also a runtime devDependency-style CSS import)", "radix-ui@1 (unified Radix meta-package)", "cn@0.2 (removed, replaced with hand-authored helper)", "class-variance-authority@0.7", "clsx@2.1", "tailwind-merge@3.6", "lucide-react@1.43", "tw-animate-css@1.4"]
  patterns:
    - "Tailwind v4 CSS-first config: single @import \"tailwindcss\"; entry, brand tokens declared via @theme (raw hex, exact values) layered above shadcn's @theme inline (oklch semantic vars)"
    - "shadcn semantic CSS variables remapped to brand oklch equivalents in both :root and .dark (dark is the only rendered mode this phase, kept in sync defensively)"
    - "src/lib/utils.ts is the canonical cn() for hand-written app code; shadcn-generated src/components/ui/*.tsx import cn from the \"cn\" npm package directly per the current shadcn CLI convention — two valid call sites by design, not a bug"

key-files:
  created: [components.json, src/lib/utils.ts, src/components/ui/button.tsx, src/components/ui/card.tsx, src/components/ui/sheet.tsx, src/components/ui/separator.tsx, src/components/ui/skeleton.tsx, src/components/ui/badge.tsx]
  modified: [vite.config.ts, tsconfig.json, tsconfig.app.json, package.json, package-lock.json, src/index.css, src/App.tsx, src/main.tsx, index.html]
  deleted: [src/App.css]

key-decisions:
  - "shadcn CLI v4.21.0 replaced the old style=new-york/default + base-color=neutral flag pair with a fundamentally different config model: -b (base component library: base/radix/aria) + -p (named aesthetic preset: nova/vega/maia/lyra/mira/luma/sera/rhea, no 'new-york' equivalent exists anymore). Ran `npx shadcn@latest init -t vite -b radix -p vega -y`: base=radix (required — Sheet must be Radix-backed per must_haves), preset=vega (closest available match: baseColor neutral, font inter, iconLibrary lucide — all align with RESEARCH.md's other locked assumptions). components.json now reports style: \"radix-vega\" instead of \"new-york\"; baseColor: neutral and cssVariables: true (the two other Design System requirements) are satisfied exactly."
  - "shadcn init auto-added @fontsource-variable/inter (a variable-weight font) and an @import for it in src/index.css. Removed both — conflicts with D-15's locked 'exactly two weights (400/600), no variable font' requirement; Task 3 wires the approved @fontsource/inter + @fontsource/ibm-plex-mono weight-specific imports instead."
  - "shadcn init generated src/lib/utils.ts as `export { cn } from \"cn\"` (a new dedicated npm package) instead of composing clsx+tailwind-merge locally. Reinstalled clsx+tailwind-merge as direct dependencies and hand-authored the standard `export function cn(...) { return twMerge(clsx(inputs)); }` helper to match D-13's locked dependency scope and Task 2's literal acceptance criteria (`export function cn`, imports from clsx and tailwind-merge). Left the `cn` package installed (uninstalling it breaks the generated src/components/ui/*.tsx files, which import `cn` from the `cn` package directly per current shadcn convention, not from @/lib/utils) — both the project's own cn() and the package now coexist, each serving its own call sites."
  - "tsconfig.app.json needed ignoreDeprecations: \"6.0\" added alongside baseUrl/paths — installed TypeScript is 6.0.3 (not the 7.0.2 RESEARCH.md assumed), which errors (TS5101) on bare compilerOptions.baseUrl without that flag. Kept baseUrl: \".\" exactly as the plan's acceptance criteria requires; the ignoreDeprecations flag is the officially documented way to retain it under TS 6.0."
  - "Brand hex values in the new @theme block are kept as raw hex exactly as PLAN.md specifies (non-negotiable, 'do not re-derive/lighten/approximate'). The semantic variable remapping in :root/.dark converts those same hex values to oklch (computed via the standard sRGB->linear->OKLab->OKLCH pipeline) to stay consistent with shadcn's oklch notation elsewhere in the file, per the plan's explicit instruction to not mix notations."
  - "PLAN.md's own build-output verify command for the signal token guesses the oklch value as '0.86 0.16 90'; the mathematically exact conversion of #f5c518 is oklch(0.842 0.168 90.43), which is what appears in dist/assets/*.css. Verified via the literal hex-in-source check (@theme block, raw hex) instead of relying on the approximate oklch guess."
  - "shadcn is now installed as a production dependency (not devDependency) because src/index.css imports \"shadcn/tailwind.css\" (a real, necessary CSS-only utility file providing Radix data-state animation variants used by Sheet/Dialog-family components) — this is required build-time plumbing this CLI version introduces, not scope creep."

patterns-established:
  - "Any package newly introduced by a CLI's auto-install step (not explicitly named in RESEARCH.md's audit table) gets a slopcheck --ecosystem npm scan before being accepted into the dependency tree, same as 01-01's precedent for @eslint/js."
  - "When an upstream CLI's non-interactive flags/schema have measurably drifted from research assumptions, pick the closest available option matching every other locked constraint (base color, font family, icon library, Radix-backing) rather than treating literal flag-name mismatches as a phase blocker."

requirements-completed: [SHELL-04]

# Metrics
duration: 25min
completed: 2026-09-09
---

# Phase 1 Plan 02: Tailwind v4 + shadcn/ui Foundation Summary

**Tailwind v4 wired into Vite via `@tailwindcss/vite` (CSS-first, no config file), shadcn/ui initialized with a Radix base and the six Phase 1 primitives, and PinchPop's ink/signal/danger/paper brand palette layered onto shadcn's semantic CSS variables as the default dark theme.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3/3 completed
- **Files modified:** 17 (8 created, 8 modified, 1 deleted)

## Accomplishments

- `vite.config.ts` gained the `tailwindcss()` plugin and the `@` → `./src` resolve alias; `tsconfig.json`/`tsconfig.app.json` gained matching `baseUrl`/`paths`
- `src/index.css` reduced to Tailwind v4's single `@import "tailwindcss";` entry, then re-expanded by `shadcn init` into the standard `:root`/`.dark`/`@theme inline` CSS-variable layer
- shadcn/ui initialized against a Radix base (required for the Sheet primitive) with the closest available preset to the plan's "new-york/neutral" intent, given this CLI version's redesigned preset system (see Deviations)
- All six Phase 1 primitives generated verbatim under `src/components/ui/`: `button`, `card`, `sheet`, `separator`, `skeleton`, `badge`
- `src/lib/utils.ts` hand-authored to compose `clsx` + `tailwind-merge` directly, matching D-13's locked dependency scope
- PinchPop's 7 brand tokens (`ink`, `signal`, `danger`, `paper`, `paper-warm`, `paper-border`, `ink-soft`) declared as named Tailwind theme colors with their exact locked hex values, and shadcn's semantic variables (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--destructive`, `--card`, `--card-foreground`, `--border`, `--muted-foreground`, `--ring`) remapped to oklch equivalents in both `:root` and `.dark`
- Dark mode set as the default via `class="dark"` on `index.html`'s `<html>` element
- `@fontsource/inter` (400, 600) and `@fontsource/ibm-plex-mono` (400) imported in `src/main.tsx` — exactly the two weights D-15/01-UI-SPEC.md declare, no 500/700/variable fonts
- All four quality gates green throughout: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Tailwind v4 and the @ path alias into Vite and TypeScript** - `c56c84b` (feat)
2. **Task 2: Initialize shadcn/ui and generate the six Phase 1 primitives** - `330552f` (feat)
3. **Task 3: Overlay PinchPop brand tokens onto the shadcn theme and bind the self-hosted fonts** - `7b5c358` (feat)

_No TDD tasks in this plan — all tasks are `type="auto"` scaffolding/config work._

## Files Created/Modified

- `vite.config.ts` - Added `tailwindcss()` plugin and `@` → `path.resolve(__dirname, "./src")` alias (Task 1)
- `tsconfig.json`, `tsconfig.app.json` - Added `baseUrl: "."` + `paths: {"@/*": ["./src/*"]}`; `tsconfig.app.json` also gained `ignoreDeprecations: "6.0"` (Task 1, see Deviations)
- `src/index.css` - Tailwind v4 entry → shadcn CSS-variable layer → PinchPop `@theme` brand block + oklch semantic remaps (Tasks 1-3)
- `src/App.tsx` - Removed `import "./App.css"` (Task 1); `src/App.css` deleted (Task 1)
- `components.json` - shadcn v4.21.0 config: `style: "radix-vega"`, `tailwind.baseColor: "neutral"`, `tailwind.cssVariables: true`, `iconLibrary: "lucide"` (Task 2)
- `src/lib/utils.ts` - Hand-authored `cn()` composing `clsx` + `tailwind-merge` (Task 2)
- `src/components/ui/{button,card,sheet,separator,skeleton,badge}.tsx` - Generated verbatim by `shadcn add`, untouched (Task 2)
- `package.json`, `package-lock.json` - Added `tailwindcss`, `@tailwindcss/vite`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `radix-ui`, `shadcn`, `cn`, `tw-animate-css` (Tasks 1-2)
- `index.html` - Added `class="dark"` to `<html>` (Task 3)
- `src/main.tsx` - Added `@fontsource/inter/400.css`, `@fontsource/inter/600.css`, `@fontsource/ibm-plex-mono/400.css` imports (Task 3)

## Decisions Made

- Chose `radix` as the shadcn component-library base (not the CLI's new default recommendation, "Base UI") because the plan's must_haves explicitly require a "Radix-backed Sheet primitive" for the mobile nav drawer (SHELL-04) — confirmed `sheet.tsx` imports `Dialog as SheetPrimitive` from `"radix-ui"`.
- Chose the `vega` preset among the CLI's eight new named presets (nova/vega/maia/lyra/mira/luma/sera/rhea) as the closest match to the plan's original "new-york + neutral" intent: `baseColor: neutral`, `font: inter` (matches D-15's Inter requirement), `iconLibrary: lucide` (matches RESEARCH.md's expected `lucide-react` dependency). No preset maps 1:1 to the old "new-york" style name — that dichotomy no longer exists in this CLI version.
- Kept `shadcn` as a regular `dependency` (not `devDependency`) because `src/index.css` imports `"shadcn/tailwind.css"` — a real, necessary CSS file (Radix `data-open`/`data-closed` animation variants, scroll-fade/shimmer utilities) that Sheet-family components rely on at build time, not an incidental CLI artifact.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript 6.0.3 deprecates bare `compilerOptions.baseUrl`**
- **Found during:** Task 1, first `npm run typecheck` after adding `baseUrl`/`paths`
- **Issue:** RESEARCH.md's Standard Stack table assumed `typescript@7.0.2`; the actually-installed version is `~6.0.2` (resolved to `6.0.3`), which raises `TS5101: Option 'baseUrl' is deprecated` and fails the build unless silenced.
- **Fix:** Added `"ignoreDeprecations": "6.0"` to `tsconfig.app.json`'s `compilerOptions`, immediately above `baseUrl`. This is TypeScript's own documented escape hatch and does not change `baseUrl`'s value or behavior — the plan's acceptance criteria (`compilerOptions.baseUrl === "."`) is satisfied exactly as written.
- **Files modified:** `tsconfig.app.json`
- **Verification:** `npm run typecheck` and `npm run build` both exit 0
- **Committed in:** `c56c84b` (Task 1 commit)

**2. [Rule 4-adjacent, resolved autonomously per auto-mode] shadcn CLI v4.21.0's init flow has no `--style`/`--base-color` flags and no "new-york" style**
- **Found during:** Task 2, running `npx shadcn@latest init --style new-york --base-color neutral --yes` per RESEARCH.md's Installation section
- **Issue:** The CLI rejected `--style`/`--base-color` as unknown options. Inspecting the installed CLI's bundled source confirmed a genuine schema redesign: the old `style: new-york|default` + `tailwind.baseColor: neutral|...` model was replaced with `-b <base>` (component library: base/radix/aria) + `-p <preset>` (8 named aesthetic presets: nova/vega/maia/lyra/mira/luma/sera/rhea — "new-york" has no equivalent). `baseColor: neutral` itself is still a valid value, just selected indirectly via preset.
- **Fix:** Ran `npx shadcn@latest init -t vite -b radix -p vega -y`. `base: radix` satisfies the must_have Radix-backed Sheet requirement directly; `vega` was selected as the closest preset match on every other locked axis (neutral baseColor, Inter font, Lucide icons). `components.json` acceptance criteria for `baseColor: neutral` and `cssVariables: true` are satisfied exactly; `style` is `"radix-vega"` instead of `"new-york"` since that value no longer exists in this CLI version.
- **Files modified:** `components.json` (generated), `src/index.css`, `package.json`, `package-lock.json`
- **Verification:** `npm run typecheck`, `npm run build`, `npm run lint`, `npm run format:check` all exit 0; `sheet.tsx` confirmed Radix-backed by inspection
- **Committed in:** `330552f` (Task 2 commit)

**3. [Rule 1 - Bug] `shadcn init` auto-added a variable-weight font violating D-15's exact two-weight requirement**
- **Found during:** Task 2, reviewing the CLI's output before accepting it (per Task 2's own action step)
- **Issue:** `npx shadcn@latest init` added `@fontsource-variable/inter` to `package.json` and `@import "@fontsource-variable/inter";` to `src/index.css`. A variable font inherently supports the full weight axis (100-900), directly conflicting with D-15/01-UI-SPEC.md's locked "exactly two weights (400, 600), do not introduce 500/700 anywhere in this phase" rule — Task 3 was always going to wire the correct weight-specific `@fontsource/inter` imports instead, making the variable-font addition pure conflicting bloat.
- **Fix:** Removed the `@import "@fontsource-variable/inter";` line from `src/index.css`, changed the shadcn-generated `--font-sans` placeholder value from `'Inter Variable', sans-serif` to plain `Inter, sans-serif` (later fully replaced by Task 3's fallback chain), and ran `npm uninstall @fontsource-variable/inter`.
- **Files modified:** `src/index.css`, `package.json`, `package-lock.json`
- **Verification:** `npm run build` succeeds; `grep -c '@fontsource-variable' src/index.css` and `package.json` both return 0 after the fix
- **Committed in:** `330552f` (Task 2 commit)

**4. [Rule 1 - Bug / Rule 2 - Missing Critical] shadcn init generated `src/lib/utils.ts` as a re-export from a `cn` npm package, not a local clsx+tailwind-merge composition**
- **Found during:** Task 2, verifying acceptance criteria (`grep -c 'export function cn' src/lib/utils.ts` expected `1`)
- **Issue:** The current shadcn CLI ships the classname-merge helper as its own npm package (`cn@0.2.6`) and generates `src/lib/utils.ts` as `export { cn } from "cn"` — no local function definition, and `clsx`/`tailwind-merge` were absent from `package.json` entirely (superseded by the `cn` package's own internal implementation). This fails the plan's literal acceptance criteria and doesn't match D-13's locked dependency scope (`react-router-dom`, Tailwind, shadcn's dependencies including `clsx`/`tailwind-merge` by name, `@fontsource`).
- **Fix:** Installed `clsx@2.1.1` and `tailwind-merge@3.6.0` as direct dependencies (both pre-audited `[OK]` in RESEARCH.md's Package Legitimacy Audit) and rewrote `src/lib/utils.ts` as `export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }`. Left the `cn` package installed rather than removing it, because `src/components/ui/*.tsx` (generated, left untouched per plan instruction) import `cn` directly from the `"cn"` package, not from `@/lib/utils` — removing it would break every generated primitive. Both now coexist: shadcn-generated files use the `cn` package; hand-written app code (NavBar, AppShell, pages, etc. in later plans) uses `@/lib/utils`'s `cn()`.
- **Files modified:** `src/lib/utils.ts`, `package.json`, `package-lock.json`
- **Verification:** `grep -c 'export function cn' src/lib/utils.ts` returns `1`; `npm run build`/`typecheck`/`lint` all exit 0
- **Committed in:** `330552f` (Task 2 commit)

**5. [Rule 3 - Blocking, threat-model-mandated] Unaudited packages introduced by shadcn's new preset-based init flow**
- **Found during:** Task 2, per the plan's `T-01-SC` threat register entry requiring re-audit of any package `shadcn add` pulls in that isn't in RESEARCH.md's pre-audited table
- **Issue:** `shadcn`, `cn`, `radix-ui`, and (before removal) `@fontsource-variable/inter` all appeared in `package.json` without prior slopcheck coverage — RESEARCH.md's audit predates this CLI's redesigned dependency footprint (individual `@radix-ui/react-*` packages assumed, not the unified `radix-ui` meta-package; no `cn` or `shadcn`-as-runtime-dependency).
- **Fix:** Ran `python -m slopcheck install --ecosystem npm shadcn @fontsource-variable/inter cn radix-ui` — all 4 returned `[OK]`. Also re-confirmed `clsx`/`tailwind-merge` (already in RESEARCH.md's table) with the same tool for consistency. No `[SUS]`/`[ASSUMED]` verdicts, so no escalation to a blocking human checkpoint was needed per the threat model's own mitigation plan.
- **Files modified:** none (audit-only; the packages were already staged by the shadcn CLI runs above)
- **Verification:** slopcheck output, all `[OK]`
- **Committed in:** N/A (verification step, not a code change)

**6. [Informational, not a deviation] Built CSS oklch value differs from PLAN.md's approximate verify guess**
- **Found during:** Task 3, running the plan's own build-output verify command
- **Issue:** PLAN.md's automated verify checks `grep -rl 'f5c518\|0.86 0.16 90' dist/assets` — the `0.86 0.16 90` string is the planner's rough estimate of `#f5c518`'s oklch conversion. The mathematically exact conversion (standard sRGB→linear→OKLab→OKLCH pipeline) is `oklch(0.842 0.168 90.43)`, which is what actually appears in `dist/assets/*.css`.
- **Resolution:** Not a bug — verified correctness via the literal raw-hex presence in `src/index.css`'s `@theme` block instead (which the plan's action text mandates: brand `@theme` colors must stay exact, unconverted hex). No fix needed; documented here only so a future verifier doesn't misread the oklch numeric mismatch as an error.

---

**Total deviations:** 5 auto-fixed (1 blocking-toolchain, 1 blocking-CLI-redesign, 2 bugs, 1 threat-model-mandated audit) + 1 informational note
**Impact on plan:** All deviations stem from the installed shadcn CLI (v4.21.0) having a materially different init/config schema than RESEARCH.md assumed, discovered and resolved entirely within this plan's scope. Every one of the plan's must_haves is satisfied on its merits (Radix-backed Sheet, neutral base color, CSS variables enabled, six primitives present, brand tokens applied, dark mode default, exact two font weights) even though the literal `style: "new-york"` and `export { cn } from "cn"` artifacts differ from the plan's original literal expectations. D-13's dependency scope is fully respected — no `zustand`/`@mediapipe/tasks-vision`/`@supabase/supabase-js` introduced.

## Issues Encountered

None beyond the deviations documented above — all were resolved within this plan's execution, no unresolved blockers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `npm run lint`, `typecheck`, `format:check`, and `build` all exit 0 with Tailwind v4 + shadcn/ui + brand tokens fully wired
- `src/components/ui/{button,card,sheet,separator,skeleton,badge}.tsx` ready for plan 01-03+ to build `AppShell`, `NavBar`, `MobileNavSheet` on top of
- `src/lib/utils.ts`'s `cn()` is the canonical helper for all new hand-written app code (NavBar, AppShell, PlaceholderCard, pages) — shadcn-generated files under `src/components/ui/` correctly continue using their own `cn` package import; this split is intentional, not technical debt
- Brand palette (`bg-ink`, `text-signal`, etc. via the new `@theme` colors) and semantic shadcn utilities (`bg-background`, `text-foreground`, `bg-primary`, etc.) are both available and consistent for downstream component work
- No blockers for plan 01-03 (routing) or subsequent plans

---
*Phase: 01-app-shell-deployment-pipeline*
*Completed: 2026-09-09*

## Self-Check: PASSED

All claimed files verified present (vite.config.ts, tsconfig.json, tsconfig.app.json, components.json, src/lib/utils.ts, all six src/components/ui/*.tsx primitives, src/index.css, src/main.tsx, index.html, this SUMMARY.md). All claimed commit hashes verified in `git log` (c56c84b, 330552f, 7b5c358, 1a92d9b).
