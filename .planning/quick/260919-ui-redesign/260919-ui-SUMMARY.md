---
status: complete
---

# Quick task 260919-ui: Code audit fixes and "sticker booth" UI/UX redesign

Executed inline (no subagents, no commits). The user explicitly lifted the DESIGN.md / 01-UI-SPEC.md
visual constraints for this pass, so `DESIGN.md` no longer describes the shipped UI.

## Fixed
- `npm run lint` failed on every file (worktree copies confused typescript-eslint); `eslint.config.js` and `.prettierignore` fixed.
- Forced `class="dark"`, Vite template favicon, missing meta description, tiny/invisible mobile drawer close button.
- Added skip link, scroll restoration, per-route titles, route error page.

## Rebuilt (Gen-Z "sticker booth" identity)
- Tokens: ultraviolet/lilac base, lemon/bubblegum/mint/tangerine stickers, 3px ink outlines, hard offset shadows. Fonts: Unbounded 800 (display), Bricolage Grotesque (body), Caveat (polaroid captions).
- Working product loop with no backend: playable 3x3 swap puzzle (drag, tap, keyboard, touch) on Home and Play; solves auto-save to localStorage; Results shows the polaroid and score; Gallery is a wall with sort/delete/clear; Profile derives stats and badges; Share reads a local memory.
- Camera mode is shown honestly as "coming soon"; nothing fabricates users, counts or photos.

## Verified
lint, typecheck, format:check, build all exit 0. Real-browser test (headless Chrome via CDP): mouse drag, tap-tap swap, touch drag (page does not scroll), full solve, memory saved, Results/Gallery/Profile render, no horizontal overflow at 375px.

## Not done
- Webcam/MediaPipe gesture game still lives only in `legacy/` (roadmap Phase 2).
- Accounts, Supabase storage and public share links (memories are per-browser localStorage).

## Follow-up pass: India / travel / photography identity
- Palette re-based on India's colours, each with one job: saffron (primary action), Ashoka chakra blue (structure), leaf green (success/saved), marigold (highlight), gold (score), coral (secondary), sindoor red (danger only), ivory/white surfaces, ink outlines.
- Puzzle art replaced with four illustrated destinations (Taj Mahal, Hawa Mahal, Kerala backwaters, Ladakh prayer flags). Each solve pins a postmarked polaroid to the Album and stamps the Passport (gallery = Album, profile = Passport).
- Custom scrollbar (saffron sticker thumb; Firefox gets a colour-only fallback), rebuilt multi-column footer with a tricolour stripe, destination deep links (`/game?art=<id>`), album filter by destination, hover hints on stats.
- Verified: lint, typecheck, format:check, build exit 0; mouse/touch drag solve in headless Chrome; no horizontal overflow at 375px.
