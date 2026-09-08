# PinchPop

## What This Is

PinchPop is a gesture-controlled photobooth game: users frame a photo with their hands, pinch to capture it, solve the resulting 3×3 puzzle with gestures, and get back a polaroid-style photo memory. It currently exists as a working single-file vanilla-JavaScript prototype (forked from PuzzleCam) with no build tooling, backend, or accounts. This milestone turns it into a complete, production-ready, deployable Web MVP — an independent standalone product, not just a tech migration.

## Core Value

The gesture-controlled capture → puzzle → polaroid experience must feel exactly as good (or better) after migration as it does in the prototype today — everything else (accounts, gallery, scoring, sharing) is built around that core loop, never at its expense.

## Requirements

### Validated

<!-- Inferred from the existing vanilla-JS prototype (see .planning/codebase/). -->

- ✓ Webcam access and real-time hand tracking via MediaPipe — existing prototype
- ✓ Two-hand gesture-based photo framing — existing prototype
- ✓ Pinch-to-capture with 3-second countdown — existing prototype
- ✓ Photo capture with photobooth filter (full-color + B&W split) — existing prototype
- ✓ 3×3 gesture-controlled puzzle (drag/snap/displace pieces) — existing prototype
- ✓ Puzzle completion detection + closed-fist to save — existing prototype
- ✓ Shatter animation and polaroid presentation — existing prototype
- ✓ Procedural sound effects via Web Audio API — existing prototype
- ✓ Photo strip (up to 3 polaroids) — existing prototype
- ✓ Gameplay recording to WebM via MediaRecorder — existing prototype

### Active

<!-- Current scope. Building toward these. -->

- [ ] Migrate prototype to React + TypeScript + Vite, preserving all Validated behaviors above
- [ ] Polished, responsive UI across the whole app
- [ ] Landing/home page
- [ ] Game experience page (gesture capture + puzzle, ported from prototype)
- [ ] Results page
- [ ] User authentication — Supabase Auth, email/password + Google OAuth
- [ ] Guest mode — play and capture without an account; account required only to save/persist
- [ ] User profile
- [ ] Personal gallery of saved photos
- [ ] Game sessions and score storage (Supabase Postgres)
- [ ] Achievements — fixed set of ~6 (First Snap, Puzzle Master, Speed Demon, Photographer, Perfect Solve, Daily Champion-equivalent)
- [ ] Leaderboard — all-time and daily views
- [ ] Speed Run mode (time, moves, accuracy, score)
- [ ] Shareable photo/memory pages — public link pages (no login to view) AND download/OS share-sheet
- [ ] Cloud photo storage via Supabase Storage
- [ ] Row Level Security protecting private gallery data
- [ ] Production deployment to Vercel

### Out of Scope

- Daily Challenge mode — needs a daily-reset backend job; deferred to a later version so Speed Run alone carries MVP scoring depth
- Mobile application (React Native + Expo) — separate future milestone, will share this same Supabase backend
- Party mode / multiplayer — future idea, not needed for MVP
- AI-based photo categorization or AI photo enhancement — future idea
- Additional puzzle sizes, custom photo frames, seasonal themes — future ideas, not core to MVP identity

## Context

- **Brownfield starting point:** the existing prototype lives at the repo root (`index.html`, `app.js`, `css/styles.css`) as a single ~1283-line ES module with no build step, no backend, and no auth. Forked from PuzzleCam by Unnati-23 — original attribution/license must be preserved.
- **Codebase map exists:** full architecture, stack, and structure analysis already captured in `.planning/codebase/` (ARCHITECTURE.md, STACK.md, STRUCTURE.md, CONVENTIONS.md, INTEGRATIONS.md, TESTING.md, CONCERNS.md) — read these before planning phases that touch the existing gameplay code.
- **Hand tracking dependency:** MediaPipe `@mediapipe/tasks-vision` is loaded from a CDN at runtime, and its model is fetched from Google Cloud Storage — the app is non-functional offline or if either CDN is unreachable.
- **No tests currently exist** in the prototype.

## Constraints

- **Attribution**: Preserve PuzzleCam's original attribution/license — carried over from the existing README, non-negotiable
- **Backend**: Supabase only, for Auth, Postgres, and Storage — explicit user choice, matches README's planned architecture
- **Platform**: Web only for this milestone — the mobile companion app is explicitly excluded and comes later
- **Browser support**: Chrome/Edge primary targets, Firefox supported, Safari limited — per existing README
- **Camera requirement**: Core gameplay requires a working webcam — inherent to the gesture-capture mechanic, not a limitation to work around

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Migrate (React + TypeScript + Vite) rather than rewrite from scratch | Preserve the prototype's already-working, validated gesture/puzzle mechanics while gaining maintainability and a real product layer | — Pending |
| Supabase for Auth + Postgres + Storage | Single backend serves the web MVP now and the mobile companion later; matches README's planned architecture | — Pending |
| Guest mode allowed | Zero-friction trial of the core gesture experience; account only required to persist data | — Pending |
| Daily Challenge deferred, Speed Run kept | Daily Challenge needs daily-reset backend job design; Speed Run alone gives enough MVP scoring depth without that complexity | — Pending |
| Mobile app excluded from this milestone | Web is the primary gameplay platform; mobile is a companion app built later on the same backend | — Pending |
| Deploy to Vercel | Matches README's planned GitHub → Vercel pipeline | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-09 after initialization*
