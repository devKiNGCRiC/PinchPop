# Codebase Structure

**Analysis Date:** 2026-09-08

## Directory Layout

```
PinchPop/
├── css/
│   └── styles.css      # All application styling (single stylesheet)
├── index.html           # App shell: video/canvas stage, HUD, gallery sidebar, strip modal
├── app.js               # Entire application logic (ES module, ~1283 lines)
├── guide.html            # Standalone setup/usage guide page (polaroid-styled, not linked from index.html)
├── README.md              # Project overview, gameplay docs, and PLANNED future architecture
└── .planning/
    └── codebase/          # Generated codebase map documents (this file and others)
```

There are no `src/`, `public/`, `test/`, `dist/`, or `node_modules/` directories. This is a zero-build, zero-dependency-manifest static site: no `package.json`, `tsconfig.json`, bundler config, or lockfile exists anywhere in the repo. The only external dependency (`@mediapipe/tasks-vision`) is imported directly from a CDN URL inside `app.js`, not installed locally.

## Directory Purposes

**`css/`:**
- Purpose: Holds the single stylesheet for the entire app.
- Contains: `styles.css` — CSS custom properties (design tokens), layout rules, HUD/gallery/modal component styles, keyframe animations (flash, shatter, loader spinner).
- Key files: `css/styles.css` (495 lines)

**`.planning/codebase/`:**
- Purpose: Machine-generated architecture/structure/convention documentation for use by planning tools.
- Generated: Yes (this document and siblings).
- Committed: Depends on project convention — verify before assuming these are tracked.

## Key File Locations

**Entry Points:**
- `index.html`: The only HTML page that loads the application (`<script type="module" src="./app.js">` at `index.html:81`).
- `app.js`: Sole application module; `boot()` is invoked unconditionally at the bottom of the file (`app.js:1283`).

**Configuration:**
- None present. No `.eslintrc`, `.prettierrc`, `tsconfig.json`, bundler config, or environment files exist. All tunable constants (thresholds, durations, grid size) are declared as top-level `const` values at the top of `app.js:19-30` (e.g., `PINCH_THRESHOLD`, `GRID`, `LOAD_TIMEOUT_MS`).

**Core Logic:**
- `app.js`: Contains everything — audio engine, video recorder, webcam/model bootstrap, gesture math, puzzle engine, shatter animation, gallery/photo-strip builder, main state machine, and render loop. See `ARCHITECTURE.md` for a full breakdown by line range.

**Styling:**
- `css/styles.css`: All visual styling, referenced once from `index.html:7`.

**Documentation:**
- `README.md`: Extensive project documentation including current features, gameplay instructions, and an explicitly-labeled **planned** (not-yet-implemented) architecture (React/TypeScript/Vite/Supabase/Zustand) and directory structure. Do not treat the structure described in `README.md`'s "Planned Project Structure" section as the current codebase layout — it is aspirational.
- `guide.html`: A separate, self-contained HTML page presenting a styled setup guide. Not linked from `index.html`; appears to be a standalone artifact.

**Testing:**
- Not applicable — no test files, test framework, or test configuration exist in this repository.

## Naming Conventions

**Files:**
- Lowercase, no separators for top-level files (`app.js`, `index.html`, `guide.html`, `README.md` is the sole exception, using the GitHub convention of all-caps).
- CSS file lives in a dedicated `css/` directory (`css/styles.css`), lowercase.

**JavaScript identifiers (within `app.js`):**
- Constants (module-level, immutable config values): `SCREAMING_SNAKE_CASE` — e.g., `PINCH_THRESHOLD`, `FRAME_PADDING`, `FIST_HOLD_FRAMES`, `STRIP_MAX_PHOTOS`.
- Functions and variables: `camelCase` — e.g., `startCountdown`, `handleDragForHand`, `galleryEntries`.
- Mutable state containers: `camelCase` plain objects grouped by subsystem — e.g., `puzzle`, `drag`, `shatter`, `countdown`, `freezeGate`, `recorder`.
- DOM element references: `camelCase` variables mirroring their `id` attribute — e.g., `const statusDot = document.getElementById("statusDot")`.

**HTML/CSS:**
- Element IDs: `camelCase` (e.g., `sceneCanvas`, `progressBadge`, `stripModalDownload`).
- CSS classes: `kebab-case`, often BEM-ish with `--` modifiers — e.g., `.gallery-action-btn`, `.gallery-action-btn--danger`, `.status-dot.solved`.
- CSS custom properties (design tokens): `kebab-case` prefixed with `--` — e.g., `--ink`, `--signal-dim`, `--gallery-width`.

## Where to Add New Code

**New Feature (within current vanilla-JS architecture):**
- Add functions to `app.js`, grouped near the relevant existing subsystem (audio engine ~`app.js:68`, recorder ~`app.js:167`, puzzle engine ~`app.js:701`, gallery/strip ~`app.js:236`). Follow the existing pattern of a `SCREAMING_SNAKE_CASE` constant block near the top of the file for any new tunable values.
- Add corresponding DOM elements to `index.html` and styles to `css/styles.css` using the existing `camelCase` ID / `kebab-case` class conventions.

**If migrating toward the README's planned structure (React/TS/Vite):**
- The `README.md` "Planned Project Structure" section (see `README.md:464-508`) specifies target locations: `src/components/`, `src/pages/`, `src/game/` (engine modules like `gestureEngine.ts`, `puzzleEngine.ts`, `audioEngine.ts`), `src/lib/` (Supabase client), `src/store/` (Zustand), `src/types/`. None of these directories exist yet — this is forward-looking guidance only, not a current convention to follow blindly. Confirm with the user before scaffolding this structure, since no build tooling (Vite, TypeScript, package.json) currently exists to support it.

**Utilities:**
- No dedicated utilities module exists; small helpers (`dist2D`, `shuffle`, `gaussianNoise`, `withTimeout`) are defined inline in `app.js` near their first use.

## Special Directories

**`.planning/codebase/`:**
- Purpose: Holds generated architecture/structure/convention/tech documentation (this file and siblings such as potential future `STACK.md`, `CONVENTIONS.md`).
- Generated: Yes.
- Committed: Verify with `git status` before assuming tracked/untracked state.

**`graphify-out/`** (present in repo root per git status, not explored as part of this focus):
- Purpose: Output directory for a separate `/graphify` skill/tool; unrelated to application source.
- Generated: Yes.
- Committed: Currently untracked (per git status at time of analysis).

---

*Structure analysis: 2026-09-08*
