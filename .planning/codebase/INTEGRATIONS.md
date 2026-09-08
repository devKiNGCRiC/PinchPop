# External Integrations

**Analysis Date:** 2026-09-08

## APIs & External Services

**Computer Vision / ML:**
- MediaPipe Tasks Vision (`@mediapipe/tasks-vision@0.10.14`) - real-time hand landmark detection, used to drive all gesture interactions (framing, pinch-to-capture, puzzle drag, fist-to-complete)
  - SDK/Client: loaded directly as an ES module from CDN — `import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14"` (`app.js:1-4`)
  - WASM assets: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm` (`app.js:436`)
  - Model file: `hand_landmarker.task` fetched from Google Cloud Storage — `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task` (`app.js:449`, retried at `app.js:470`)
  - Auth: none (public CDN/GCS assets, no API key required)

No other third-party API integrations (no payment provider, no email service, no analytics, no error-tracking SDK) are present in the current codebase.

## Data Storage

**Databases:**
- None. No database client, ORM, or connection string exists in the current implementation.

**File Storage:**
- Local filesystem only, via the browser's native download mechanism. Captured photo strips and gameplay recordings are generated client-side and offered as downloads:
  - Photo strip PNG: `canvas.toBlob(...)` → `URL.createObjectURL(blob)` → `<a download>` triggered with filename `puzzlecam_strip_${Date.now()}.png` (`app.js:295-300`)
  - Gameplay video WebM: `MediaRecorder` → `URL.createObjectURL(recorder.blob)` → `<a download>` triggered with filename `puzzlecam_solve_${Date.now()}.webm` (`app.js:205-208`)
- No persistence between sessions — nothing is written to `localStorage`/`sessionStorage`/`IndexedDB`; all captured photos/puzzle state exist only in memory for the current page load.

**Caching:**
- None (no service worker, no cache API usage detected).

## Authentication & Identity

**Auth Provider:**
- None. There is no login/session/user-account system in the current codebase. `README.md` (`README.md:321-338`, `598-607`) describes a **planned** future Supabase Auth integration for user profiles and guest mode, but no Supabase client, keys, or auth UI exist yet.

## Monitoring & Observability

**Error Tracking:**
- None. Errors are surfaced only via `console.warn`/`console.error` calls in `app.js` (e.g., `app.js:193` for MediaRecorder failures) and an in-page `#errorBanner` element (`index.html:39`). No external error-tracking service (e.g., Sentry) is wired in.

**Logs:**
- Browser console only, prefixed with `[PuzzleCam]` in some warnings (e.g., `app.js:193`). No remote log shipping.

## CI/CD & Deployment

**Hosting:**
- No hosting/deployment configuration present in the repo (no `vercel.json`, `netlify.toml`, GitHub Pages workflow, or Dockerfile). The app is currently a plain static site (`index.html` + `app.js` + `css/styles.css`) that can be hosted anywhere static files are served.
- Git remote: `https://github.com/devKiNGCRiC/PinchPop.git` (origin).
- `README.md` (`README.md:214-228`) documents a planned GitHub → Vercel → (Supabase-backed) deployment pipeline; none of this is implemented yet.

**CI Pipeline:**
- None detected (no `.github/workflows/` directory present).

## Environment Configuration

**Required env vars:**
- None. The application requires no environment variables or API keys to run in its current form.

**Secrets location:**
- Not applicable — no secrets are used by the current codebase. No `.env` files were found in the repository.

## Webhooks & Callbacks

**Incoming:**
- None (no server component exists to receive webhooks).

**Outgoing:**
- None (no outbound webhook calls; the only outbound network activity is the browser fetching the MediaPipe CDN script, WASM runtime, and model file described above).

## Browser Platform APIs in Use

These are native browser APIs (not third-party integrations) that the app depends on directly:
- `navigator.mediaDevices.getUserMedia` — webcam access (`app.js:404-407`)
- `window.AudioContext` / `window.webkitAudioContext` — procedural sound effects (`app.js:69`)
- `MediaRecorder` — gameplay video recording, with `video/webm;codecs=vp9` preferred via `MediaRecorder.isTypeSupported` (`app.js:180-190`)
- `Canvas` 2D API (`getContext("2d", { willReadFrequently: true })`) — puzzle rendering, photo compositing, strip generation (`app.js:43`, `app.js:295`)

## Planned Integrations (Not Yet Implemented)

Per `README.md` (`README.md:598-607`), the following integrations are on the roadmap but have no code, config, or dependencies in the repo yet:
- Supabase Auth (user accounts, guest mode)
- Supabase PostgreSQL (user profiles, game sessions, scores, achievements, gallery metadata) with Row Level Security for private data
- Supabase Storage (cloud photo storage, replacing/augmenting local download)
- Vercel (production deployment target)

Treat these as future work only — do not assume any Supabase client, keys, or backend endpoints currently exist.

---

*Integration audit: 2026-09-08*
