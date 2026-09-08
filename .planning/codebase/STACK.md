# Technology Stack

**Analysis Date:** 2026-09-08

## Languages

**Primary:**
- JavaScript (ES2020+ modules, no transpilation) - `app.js` (1283 lines), the entire application logic
- HTML5 - `index.html`, `guide.html`
- CSS3 - `css/styles.css` (495 lines)

**Secondary:**
- None. No TypeScript, no server-side language. This is a pure client-side, static, single-page vanilla-JS application (no build step, no bundler).

## Runtime

**Environment:**
- Browser only. No Node.js runtime is required to run the app — `index.html` is opened/served directly and loads `app.js` as a native ES module (`<script type="module" src="./app.js">` in `index.html:81`).
- No server-side runtime exists in this repo (no Express/Next/Flask/etc.).

**Package Manager:**
- None present. There is no `package.json`, `package-lock.json`, `yarn.lock`, or `node_modules/` in the repo. All third-party code is loaded at runtime from a CDN (see Key Dependencies below), not installed locally.
- Lockfile: missing (not applicable — no package manager in use).

## Frameworks

**Core:**
- None. No UI framework (no React/Vue/Svelte). The UI is hand-written DOM manipulation directly against `index.html` elements from `app.js`.

**Testing:**
- None detected. No test runner config, no `*.test.js`/`*.spec.js` files, no `jest.config.*`/`vitest.config.*`.

**Build/Dev:**
- None. No `vite.config.*`, `webpack.config.*`, `tsconfig.json`, `.eslintrc*`, or `.prettierrc*` found. Files are served/opened as-is.

## Key Dependencies

**Critical (loaded via CDN, not installed):**
- `@mediapipe/tasks-vision@0.10.14` — imported directly from `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14` in `app.js:1-4` (`FilesetResolver`, `HandLandmarker`). Provides real-time hand landmark detection used to drive all gesture-based interactions (framing, pinch-to-capture, puzzle-piece dragging).
- MediaPipe WASM runtime — fetched from `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm` (`app.js:436`).
- HandLandmarker model asset — downloaded at runtime from `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` (`app.js:449`, `app.js:470`; the second reference is a retry path).

**Infrastructure:**
- None (no database client, no auth SDK, no analytics SDK currently wired in).

## Configuration

**Environment:**
- No environment variable system (no `.env`, no build-time config injection). All constants (thresholds, timeouts, grid size) are hard-coded at the top of `app.js` (e.g., `PINCH_THRESHOLD`, `FRAME_PADDING`, `COUNTDOWN_SECONDS`, `GRID` in `app.js:19-30`).
- No secrets are used or required by the current implementation.

**Build:**
- No build config files present. The app runs directly from source; opening `index.html` in a browser (or serving the static directory) is sufficient.

## Platform Requirements

**Development:**
- Any static file server or direct file-open in a modern browser. No install step (`npm install` not applicable).
- A webcam is required for local testing of the core gesture/camera features.

**Production:**
- Static hosting only (current state is a plain static site, no server logic). `README.md` (`README.md:214-228`) documents a **planned** deployment path of GitHub → Vercel, but no Vercel config (`vercel.json`) or CI/CD workflow exists yet in the repo.
- Browser support per `README.md:534-544`: Chrome/Edge recommended, Firefox supported, Safari limited, mobile experimental/limited. Camera (and optionally microphone) permission is required at runtime via `navigator.mediaDevices.getUserMedia` (`app.js:404-407`).

## Planned (Not Yet Implemented) Stack

`README.md` (`README.md:187-213`, `514-531`) documents a forward-looking architecture that is **not present in the current codebase** — no corresponding files, dependencies, or config exist yet for any of the following:
- Frontend: React, TypeScript, Vite, Zustand
- Backend/data: Supabase (Auth, PostgreSQL, Storage)
- Deployment: Vercel

This should be treated as a roadmap, not current stack. Do not assume these are installed or usable until corresponding `package.json`/config files appear in the repo.

---

*Stack analysis: 2026-09-08*
