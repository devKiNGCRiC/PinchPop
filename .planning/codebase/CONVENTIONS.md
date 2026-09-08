# Coding Conventions

**Analysis Date:** 2026-09-08

## Project Shape

This is a single-page, no-build, vanilla-JS browser app. There is no `package.json`, no bundler, no transpiler, and no framework. The entire application logic lives in one ES module file: `app.js` (1284 lines), loaded via `<script type="module" src="./app.js"></script>` in `index.html`. Styling lives in one file: `css/styles.css`. There is no `src/` directory — all conventions below are derived directly from `app.js`, `index.html`, and `css/styles.css` at the repo root.

Because there is no build step, code written for this project must run directly in evergreen browsers with zero transformation (no JSX, no TypeScript types, no experimental syntax beyond stable ES2020+ features already in use: optional chaining, nullish-adjacent patterns, `async`/`await`, private-ish closures via module scope, `class` fields are NOT used — plain object literals serve as "state" instead).

## Naming Patterns

**Files:**
- Lowercase, no separators for top-level files: `app.js`, `index.html`, `guide.html`, `README.md`.
- CSS lives at `css/styles.css` (lowercase directory, lowercase file).
- No `.test.js`, `.spec.js`, `.module.css`, or other suffix conventions exist yet — if added, follow the flat, lowercase style already established (e.g. `app.test.js` alongside `app.js`, not nested in a `__tests__/` folder, to match the codebase's flat-file preference).

**Functions:**
- `camelCase`, verb-first, intention-revealing: `startCountdown`, `finishCountdownAndCapture`, `drawBoardAndPieces`, `applyPhotoboothEffect`, `resetPuzzleOnly`, `resetEverything` (`app.js:541,619,851,594,362,317`).
- Boolean-returning predicates use `is`/`has` prefixes: `isPinching`, `isFist`, `isStripFull`, `isNearOwnCell`, `isPointInBoard` (`app.js:494,498,248,703,949`).
- Sound-effect functions are grouped under a `sound` prefix: `soundCountdownBeep`, `soundSnap`, `soundShatter`, `soundComplete`, `soundSaved` (`app.js:112-145`).
- Draw/render functions use a `draw` prefix: `drawBoardAndPieces`, `drawVideoFrame`, `drawLiveFrameOverlay`, `drawHandSkeleton`, `drawHandSkeletonsOverBoard`, `drawCountdownOverlay` (`app.js:851,907,926,954,980,549`).
- Show/hide UI toggle functions use `show`/`hide`/`update` prefixes: `showStripModal`, `showStripComplete`, `hideStripComplete`, `updateStripDownloadAvailability`, `updateProgressBadge` (`app.js:308,252,258,262,899`).

**Variables:**
- `camelCase` throughout: `galleryEntries`, `handsLandmarks`, `lastSeenFrame`, `fistHoldCounter`.
- Short pixel-coordinate temporaries use terse names consistently: `dx`, `dy`, `cx`, `cy`, `sx`, `sy`, `w`, `h` — always paired, never mixed with longer names in the same scope.
- DOM element references are named exactly after their `id` attribute, `camelCase`-ified: `galleryStrip` ← `#galleryStrip`, `downloadStripBtn` ← `#downloadStripBtn`, `stripModalDownload` ← `#stripModalDownload` (`app.js:41-66` mirrors `index.html` ids).

**Constants:**
- `SCREAMING_SNAKE_CASE` for true constants/tuning knobs, declared at module top or immediately above the code that uses them: `PINCH_THRESHOLD`, `FRAME_PADDING`, `FREEZE_HOLD_MS`, `COUNTDOWN_SECONDS`, `GRID`, `LOAD_TIMEOUT_MS`, `STRIP_MAX_PHOTOS`, `SHATTER_COLS`, `DISPLACE_ANIM_MS` (`app.js:19-30, 226-236, 267, 763`).
- Landmark indices are grouped in a single `LM` object rather than scattered constants: `const LM = { WRIST: 0, THUMB_TIP: 4, ... }` (`app.js:6-17`). Follow this pattern when adding a related group of index/id constants — prefer a namespaced object over a flat list of prefixed constants.
- Tuning constants are colocated with the feature they affect (e.g. `SHATTER_COLS`/`SHATTER_ROWS`/`SHATTER_DURATION_MS` declared right before the `shatter` state object at `app.js:226-228`) rather than centralized in one config block. New features should follow this local-colocation pattern, not introduce a separate `config.js`.

**Types:**
- No TypeScript, no JSDoc type annotations, no runtime schema validation (no Zod/Yup/PropTypes). Shapes are implicit via object literal construction, e.g. a "piece" object: `{ row, col, canvas, w, h, x, y, placed: false, dragging: false }` (`app.js:671`). When adding new object shapes, follow this pattern: construct the full literal in one place with all fields explicit (including boolean flags defaulted), rather than building objects incrementally with optional/missing keys.

## Code Style

**Formatting:**
- No Prettier/ESLint config present in the repo. Style is hand-maintained but consistent:
  - Double quotes for strings throughout (`"video/webm"`, `"tracking"`).
  - Semicolons used consistently at statement ends.
  - 2-space indentation.
  - Single-line `if` statements without braces are used liberally for short guard clauses: `if (!box) return false;`, `function resumeAudio() { if (audioCtx.state === "suspended") audioCtx.resume(); }` (`app.js:71, 949-952`).
  - Multi-statement single-line blocks are acceptable for tight, related operations: `if (n !== lastCountdownN) { lastCountdownN = n; soundCountdownBeep(n); }` (`app.js:566-569`).

**Linting:**
- No linter configured (no `.eslintrc*`, no `eslint.config.*`, no `biome.json` found). New code should still avoid unused variables and follow the existing patterns manually since there's no automated enforcement.

**Section dividers:**
- Large logical sections within `app.js` are marked with box-drawing comment banners:
  ```js
  // ── Audio engine ──────────────────────────────────────────────────────────────
  // ── Video recorder ────────────────────────────────────────────────────────────
  // ── App state ─────────────────────────────────────────────────────────────────
  ```
  (`app.js:68, 167, 215`). When adding a new major subsystem (e.g. a new gesture type or export format), add a matching banner comment above it rather than leaving it unmarked.

## Import Organization

- Single external import block at the very top of `app.js`, sourced directly from a CDN URL (no local `node_modules`, no package manager):
  ```js
  import {
    FilesetResolver,
    HandLandmarker,
  } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  ```
  (`app.js:1-4`). If adding another external library, follow this same pattern: pin an exact version in the jsdelivr/CDN URL, destructure only the named exports actually used.
- No path aliases exist (no bundler to support them). All references are either imported ES module bindings or `document.getElementById(...)` lookups cached once near the top of the file (`app.js:41-66`).

## Error Handling

**Patterns:**
- Network/model loading uses a `withTimeout(promise, ms, timeoutMessage)` wrapper that races a promise against a timeout and rejects with a descriptive `Error` (`app.js:423-429`). Use this helper for any new async operation that could hang (e.g. fetching a new external resource).
- Graceful degradation over hard failure: `initHandLandmarker` tries GPU delegate first, falls back to CPU delegate on failure, logging a warning via `console.warn("[PuzzleCam] ...", err)` before retrying (`app.js:431-486`). This tagged-warning pattern (`console.warn("[PuzzleCam] <message>:", err)`) is the established convention for non-fatal, logged failures — reuse the `[PuzzleCam]` tag prefix for any new warning logs.
- User-facing errors during boot are surfaced through dedicated UI functions rather than thrown/left unhandled: `showError(message)` sets `errorBanner.textContent` and displays it; `showLoaderError(message)` updates the loader text, turns it red, and reveals a retry button (`app.js:1203-1220`).
- `boot()` wraps the entire startup sequence in `try/catch`, differentiates errors by `err.name` (`"NotAllowedError"`, `"NotFoundError"`) to show tailored messages, and falls back to `err.message` or a generic string otherwise (`app.js:1222-1248`).
- A watchdog `setTimeout` guards against silent hangs during boot, firing a "taking too long" message if the try/catch hasn't resolved within `(LOAD_TIMEOUT_MS * 2) + 5000` ms, using a `settled` boolean flag to avoid firing after success (`app.js:1224-1247`). Reuse this settled-flag-plus-watchdog pattern for other long-running async flows that need a "stuck" fallback.
- Recoverable/optional operations use silent early-return guards rather than throwing: `if (!recorder.blob) return;`, `if (galleryEntries.length === 0) return null;` (`app.js:204, 272`).
- `MediaRecorder` setup is wrapped in `try/catch` with a `console.warn` fallback since recording is a non-critical enhancement — the app continues to function without video export if it fails (`app.js:178-194`).

## Logging

**Framework:** Native `console` only (`console.warn`, no `console.log`/`console.error` calls found in current code).

**Patterns:**
- All logs seen are `console.warn` tagged with `[PuzzleCam]`, used only for non-fatal, recoverable situations (GPU→CPU fallback, MediaRecorder unsupported) (`app.js:193, 463`).
- No logging library, no structured/JSON logging, no log levels beyond `warn`.

## Comments

**When to Comment:**
- Sparse, purposeful comments — not comment-per-line. Comments explain *why*, not *what*, e.g. `// color version — saved to strip at the end` / `// B&W version — used for puzzle pieces while solving` (`app.js:640, 649`) clarify intent behind two near-identical code blocks that would otherwise look redundant.
- Section-banner comments (see Code Style above) substitute for a table of contents in the absence of multiple files.
- No JSDoc/TSDoc usage anywhere in the codebase. Do not introduce JSDoc annotations unless establishing a new project-wide convention deliberately.

## Function Design

**Size:** Functions are generally short (5-40 lines) and single-purpose. A few orchestration functions are intentionally longer because they represent one cohesive state-machine branch (e.g. `processResults`, `app.js:1086-1191`, and `finishCountdownAndCapture`, `app.js:619-699`) — these read top-to-bottom as a sequential pipeline (mirror frame → crop → flash → color pass → B&W pass → build pieces → shuffle → assign state) and are annotated with inline blank-line grouping rather than being split into many tiny helpers. Follow this precedent: prefer splitting out a helper only when the sub-step is reused elsewhere (e.g. `dist2D`, `toPixel`, `mirrorLandmarkX` are reused across many call sites and are extracted; one-off sequential steps within a single flow are not).

**Parameters:**
- Simple functions take positional parameters (`dist2D(a, b)`, `toPixel(landmarkNorm)`).
- Functions with many optional/tunable inputs take a single destructured options object with defaults: `function playTone({ freq = 440, type = "sine", gain = 0.18, attack = 0.005, decay = 0.12, duration = 0.15 } = {})` (`app.js:73`). Use this pattern for any new function accepting more than ~3 optional parameters.

**Return Values:**
- Guard clauses return early with `null`/`false`/`undefined`/void rather than throwing, for expected "nothing to do" states: `if (galleryEntries.length === 0) return null;` (`app.js:272`), `function isStripFull() { return galleryEntries.length >= STRIP_MAX_PHOTOS; }` (`app.js:248-250`).
- Boolean predicate functions return a plain `true`/`false`, never truthy/falsy objects.

## Module Design (State, not Classes)

**State containers:**
- No `class` declarations anywhere in `app.js`. Application state is modeled as plain mutable object literals declared with `const` (the object is const-bound but its properties are freely mutated): `const puzzle = { boardBox: null, pieces: [], solved: false, tileW: 0, tileH: 0 }`, `const drag = { activeHand: null, piece: null, offsetX: 0, offsetY: 0 }`, `const shatter = { active: false, startedAt: 0, fragments: [], pendingCanvas: null }`, `const recorder = { instance: null, chunks: [], blob: null }` (`app.js:168-172, 218-224, 229-234, 701`). When adding a new stateful subsystem, follow this exact pattern: one `const` object literal per subsystem, mutated in place by dedicated functions, rather than introducing a class or a global state-management library.
- A single top-level `let appState = "tracking";` string acts as the primary finite-state-machine variable, with allowed values `"tracking"`, `"countdown"`, `"puzzle"`, `"shattering"` (`app.js:216`, checked throughout `processResults`). New app-level states must be added as a new string literal checked in the same `if (appState === "...")` branching style inside `processResults` — do not introduce a separate state library.

**Exports:**
- No exports at all — `app.js` is the sole module, self-contained, executed for its side effects (it calls `boot()` at the bottom, `app.js:1283`). There is no public API surface to document.

**Event wiring:**
- DOM event listeners are attached at the bottom of the file after all function declarations, each guarded with an existence check on the element before attaching: `if (downloadVideoBtn) { downloadVideoBtn.addEventListener("click", downloadVideo); }` (`app.js:1256-1281`). Follow this guarded-attachment pattern for any new optional UI element (elements that may not exist in every markup variant, e.g. `guide.html` vs `index.html`).

---

*Convention analysis: 2026-09-08*
