---
phase: 01-app-shell-deployment-pipeline
plan: 01
subsystem: infra
tags: [vite, react, typescript, eslint, prettier, node22, npm, tooling]

# Dependency graph
requires: []
provides:
  - Vite + React 19 + TypeScript app scaffolded at repo root, builds via `npm run build`
  - Legacy vanilla-JS prototype preserved verbatim under `legacy/`
  - Node 22 pinned via `.nvmrc` + `package.json` engines (single source of truth)
  - `npm run lint` / `typecheck` / `format` / `format:check` / `build` scripts, all passing
  - ESLint flat config (typescript-eslint + react-hooks + react-refresh + eslint-config-prettier last)
  - Prettier config (`.prettierrc.json`, `.prettierignore`) protecting README.md/CLAUDE.md/.planning
  - D-13 approved dependency set installed: react-router-dom, @fontsource/inter, @fontsource/ibm-plex-mono
affects: [01-02-tailwind-shadcn, 01-app-shell-deployment-pipeline (all remaining plans in this phase)]

# Tech tracking
tech-stack:
  added: [vite@8, react@19, typescript@6 (react-ts template), react-router-dom@7, eslint@10, typescript-eslint@8, eslint-plugin-react-hooks@7, eslint-plugin-react-refresh@0.5, eslint-config-prettier@10, prettier@3, "@fontsource/inter", "@fontsource/ibm-plex-mono"]
  patterns: ["ESLint flat config with eslint-config-prettier appended last", "Node version pinned once via .nvmrc + engines.node, no third hardcoded copy", "legacy/ holds untouched prototype code excluded from lint/format"]

key-files:
  created: [package.json, package-lock.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, eslint.config.js, .prettierrc.json, .prettierignore, .nvmrc, index.html, src/main.tsx, src/App.tsx, src/App.css, src/index.css, public/favicon.svg, public/icons.svg, src/assets/hero.png, src/assets/react.svg, src/assets/vite.svg, legacy/index.html, legacy/app.js, legacy/guide.html, legacy/css/styles.css]
  modified: [.gitignore]

key-decisions:
  - "create-vite@9.2.0's react-ts template now defaults to oxlint instead of ESLint and omits src/vite-env.d.ts (types set via tsconfig.app.json compilerOptions.types instead); manually authored eslint.config.js to satisfy D-11 since ESLint is a locked decision, not oxlint"
  - "Explicitly added compilerOptions.strict: true to tsconfig.app.json since the current template no longer sets it (D-10 requires strict mode)"
  - "@eslint/js added as an unaudited-but-necessary devDependency for the flat ESLint config; verified via slopcheck scan [OK] before install since it wasn't in 01-RESEARCH.md's pre-audited package table"
  - "eslint-plugin-react-hooks@7.1.1's configs['recommended-latest'] still exports legacy eslintrc-style plugins: ['react-hooks'] array; worked around by registering the plugin object manually and spreading only its .rules into the flat config"
  - "Added README.md, CLAUDE.md, and .planning to .prettierignore after npm run format initially reformatted them; reverted those unintended changes via git checkout before committing"

patterns-established:
  - "Any new ESLint/Prettier tooling package not in 01-RESEARCH.md's audit table gets a slopcheck scan before install, logged in the commit message"
  - "npm run format/format:check scope is deliberately narrowed via .prettierignore to exclude project documentation and GSD planning artifacts"

requirements-completed: [SHELL-01, SHELL-04]

# Metrics
duration: 16min
completed: 2026-09-09
---

# Phase 1 Plan 01: App Scaffold & Toolchain Summary

**Vite 8 + React 19 + TypeScript app scaffolded at the repo root with Node 22 pinning, a hand-authored ESLint flat config (typescript-eslint + react-hooks + react-refresh + eslint-config-prettier), and Prettier — legacy vanilla-JS prototype preserved verbatim under `legacy/`.**

## Performance

- **Duration:** 16 min
- **Started:** 2026-09-09T03:09:33+05:30 (base commit)
- **Completed:** 2026-09-09T03:25:04+05:30
- **Tasks:** 3/3 completed
- **Files modified:** 30 (4 renamed into `legacy/`, 19 created by the scaffold, 11 modified/created for tooling)

## Accomplishments
- Legacy prototype (`index.html`, `app.js`, `guide.html`, `css/styles.css`) moved into `legacy/` via `git mv`, preserving rename history and byte-for-byte content (1283-line `app.js` verified intact)
- Vite + React + TypeScript app scaffolded at repo root; `npm run build` produces `dist/`
- Node 22 pinned in exactly one place (`.nvmrc`) and mirrored by `package.json` `engines.node: ">=22.12.0"`
- All four quality gates green: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`
- Installed exactly D-13's approved dependency set (`react-router-dom`, `@fontsource/inter`, `@fontsource/ibm-plex-mono`, `prettier`, `eslint-config-prettier`) — confirmed no `zustand`/`@mediapipe/tasks-vision`/`@supabase/supabase-js`/bare `react-router`

## Task Commits

Each task was committed atomically:

1. **Task 1: Move the legacy prototype into legacy/** - `16dab76` (chore)
2. **Task 2: Scaffold the Vite react-ts project at the repo root and pin Node 22** - `690135a` (feat)
3. **Task 3: Install Phase 1 runtime dependencies and configure ESLint + Prettier** - `0233df7` (feat)

_No TDD tasks in this plan — all tasks are `type="auto"` scaffolding work._

## Files Created/Modified
- `legacy/index.html`, `legacy/app.js`, `legacy/guide.html`, `legacy/css/styles.css` - Verbatim relocation of the prototype (Task 1)
- `package.json` - `pinchpop` app manifest: dev/build/lint/typecheck/preview/format/format:check scripts, `engines.node`, Phase 1 runtime + dev dependencies
- `package-lock.json` - Generated lockfile
- `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - Vite/TS scaffold config; `tsconfig.app.json` has explicit `strict: true` added
- `eslint.config.js` - Hand-authored flat config: `js.configs.recommended`, `tseslint.configs.recommended`, `reactRefresh.configs.vite`, manually-registered `react-hooks` plugin rules, `eslint-config-prettier` last, ignores for `dist`/`node_modules`/`legacy`/`src/components/ui`
- `.prettierrc.json` - `semi: true, singleQuote: false, trailingComma: "all", printWidth: 100, tabWidth: 2`
- `.prettierignore` - Excludes `node_modules`, `dist`, `legacy`, `package-lock.json`, `src/components/ui`, and (deviation) `README.md`, `CLAUDE.md`, `.planning`
- `.nvmrc` - Bare `22`
- `.gitignore` - Appended `graphify-out/`
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`, `public/favicon.svg`, `public/icons.svg`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` - Default Vite react-ts scaffold content, Prettier-formatted

## Decisions Made
- Kept the default scaffolded `App.tsx`/`App.css` content as-is (placeholder counter demo) since this plan's scope is tooling only — Phase 1's later plans replace it with the real route tree and AppShell
- Chose to fold "recreate ESLint tooling" into Task 2 (since `eslint.config.js` was already in Task 2's file list) rather than deferring entirely to Task 3, so the config exists and lints clean before Task 3 layers Prettier integration on top
- `@types/node`, `tailwindcss`, `@tailwindcss/vite`, `shadcn` deliberately NOT installed in this plan — reserved for plan 01-02 per D-13/context boundary

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-vite@9.2.0 scaffolds oxlint, not ESLint; D-11 requires ESLint**
- **Found during:** Task 2 (Scaffold the Vite react-ts project)
- **Issue:** The plan assumed the scaffold would produce a pre-built `eslint.config.js` (as older `create vite react-ts` templates did) for Task 3 to extend. The installed `create-vite@9.2.0` instead scaffolds `oxlint` (`.oxlintrc.json`, `"lint": "oxlint"`) with no `eslint.config.js` at all. D-11 is a locked decision requiring ESLint + Prettier, not oxlint.
- **Fix:** Did not move `.oxlintrc.json` into the repo root; removed the `oxlint` devDependency; installed `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` as devDependencies; hand-authored `eslint.config.js` reproducing the flat-config shape historically scaffolded by `create-vite react-ts` (`js.configs.recommended` + `tseslint.configs.recommended` + `reactRefresh.configs.vite`, plus a manually-registered `react-hooks` plugin since `eslint-plugin-react-hooks@7.1.1`'s `configs['recommended-latest']` still exports a legacy eslintrc-style `plugins: ["react-hooks"]` array that flat config rejects — worked around by registering `{ 'react-hooks': reactHooks }` directly and spreading only `.rules`).
- **Files modified:** `package.json`, `package-lock.json`, `eslint.config.js`
- **Verification:** `npm run lint` exits 0 with no errors
- **Committed in:** `690135a` (Task 2 commit)

**2. [Rule 2 - Missing Critical] `@eslint/js` not in 01-RESEARCH.md's pre-audited package table**
- **Found during:** Task 2, while authoring `eslint.config.js`
- **Issue:** `js.configs.recommended` requires the `@eslint/js` package, which is not one of the 25 packages slopcheck-audited in 01-RESEARCH.md (it became necessary only because of Deviation 1 above, which the research phase couldn't have anticipated).
- **Fix:** Ran `python -m slopcheck scan` against an isolated scratch directory containing only `@eslint/js` as a dependency (per 01-RESEARCH.md's documented `--ecosystem npm` auto-detection caveat, achieved here by ensuring a `package.json` already existed in the scratch dir). Result: `[OK]`. Installed only after this passed.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** slopcheck `[OK]` verdict; package matches the official `eslint` GitHub org's scoped package
- **Committed in:** `690135a` (Task 2 commit)

**3. [Rule 2 - Missing Critical] tsconfig.app.json no longer sets `strict: true` explicitly**
- **Found during:** Task 2, verifying acceptance criteria
- **Issue:** D-10 locks TypeScript strict mode and the plan's acceptance criteria requires `compilerOptions.strict === true` in `tsconfig.app.json`. The current scaffold's `tsconfig.app.json` sets `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly` but no longer includes an explicit `"strict": true` key.
- **Fix:** Added `"strict": true` explicitly to `tsconfig.app.json`'s `/* Linting */` section.
- **Files modified:** `tsconfig.app.json`
- **Verification:** `node -e "...JSON.parse(...).compilerOptions.strict"` (with block-comment stripping) prints `true`; `npm run typecheck` and `npm run build` both pass
- **Committed in:** `690135a` (Task 2 commit)

**4. [Rule 1 - Bug] `npm run format` reformatted protected project docs**
- **Found during:** Task 3, after running `npm run format` for the first time
- **Issue:** `prettier --write .` ran repo-wide (no `.prettierignore` entry yet excluded them) and reformatted `README.md`, `CLAUDE.md`, and every file under `.planning/` — violating PROJECT.md's non-negotiable attribution-preservation requirement and Task 1's explicit instruction not to touch those paths.
- **Fix:** Reverted the 30 affected files individually with `git checkout -- <path>` (no blanket reset used); added `README.md`, `CLAUDE.md`, and `.planning` to `.prettierignore` so future `npm run format` runs cannot repeat this.
- **Files modified:** `.prettierignore` (added exclusions); `README.md`/`CLAUDE.md`/`.planning/**` reverted to their pre-format state (no net diff)
- **Verification:** `git status --porcelain README.md` empty; `git diff --stat` shows no changes under `.planning/` or to `CLAUDE.md` in the final commit
- **Committed in:** `0233df7` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (1 blocking-tooling-swap, 2 missing-critical, 1 bug)
**Impact on plan:** All four deviations were necessary to satisfy this plan's own locked decisions (D-10 strict mode, D-11 ESLint+Prettier) and to prevent collateral damage to protected project documentation. No scope creep — no application logic, routing, or Tailwind/shadcn work was introduced (that remains for plan 01-02 onward).

## Issues Encountered
- The plan's Task 2 automated verify command for `tsconfig.app.json`'s `strict` flag uses a comment-stripping regex (`replace(/^\s*\/\/.*$/gm,'')`) that only handles line comments; the current scaffold's `tsconfig.app.json` uses a `/* block comment */` style, causing that literal one-liner to throw a `JSON.parse` error. Confirmed independently (with a regex that also strips block comments) that `compilerOptions.strict` is genuinely `true`. This is a tooling-drift issue in the verify script itself, not a defect in the delivered config — future plans/verifiers in this phase should update that one-liner to strip both comment styles.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Repo root hosts a buildable Vite + React + TypeScript app; `npm run lint`, `typecheck`, `format:check`, and `build` all exit 0 — ready for plan 01-02 (Tailwind v4 + shadcn/ui wiring) to build on top without any scaffold rework
- `legacy/` is fully preserved and available as Phase 2's porting reference
- No blockers. One informational note carried forward: the plan's own `tsconfig.app.json` strict-check verify one-liner needs its comment-stripping regex updated for block-comment style tsconfig files (see Issues Encountered) — does not block phase progress since the underlying setting is correct.

---
*Phase: 01-app-shell-deployment-pipeline*
*Completed: 2026-09-09*

## Self-Check: PASSED

All claimed files verified present (package.json, eslint.config.js, .prettierrc.json, .prettierignore, .nvmrc, legacy/app.js, legacy/index.html, legacy/guide.html, legacy/css/styles.css, src/main.tsx, this SUMMARY.md). All claimed commit hashes verified in `git log` (16dab76, 690135a, 0233df7, 3013d0b).
