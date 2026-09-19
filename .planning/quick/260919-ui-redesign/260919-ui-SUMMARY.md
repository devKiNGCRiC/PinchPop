---
status: complete
---

# Quick task 260919-ui: Code audit fixes and UI redesign

Executed inline (no subagents, no commits) so the user controls git history.

## Fixed
- `npm run lint` failed on every file: typescript-eslint could not pick a tsconfig root because the `.kilo/worktrees` and `.claude/worktrees` repo copies exist. `eslint.config.js` now sets `tsconfigRootDir` and ignores tooling/reference directories.
- `npm run format:check` failed on reference material (`design-exploration/`, `DESIGN.md`); added to `.prettierignore`.
- `index.html` forced `class="dark"` against the approved light DESIGN.md direction; removed. Added description and theme-color meta.
- `public/favicon.svg` was the Vite template logo; replaced with a PinchPop aperture mark.
- Mobile nav drawer: close button was 32px and invisible on the ink surface; now 44px and readable. Links now show active state and have 44px+ targets.
- Added skip-to-content link, `ScrollRestoration`, per-route document titles, and a route `errorElement`.
- Nav link list was duplicated in two files; extracted to `nav-links.ts`.

## Redesigned (DESIGN.md is authoritative)
- Tokens: paper/ink/shutter palette, three reserved accents, Landing Gradient Wash (Home only); Space Grotesk 700 + Inter + IBM Plex Mono.
- Global 2px shutter focus ring, shutter-click press feedback, `prefers-reduced-motion` handling.
- Home: hero with a photobooth cabinet showing the two-fingertip framing gesture, capture flash, and prints sliding out of the chute; staggered How PinchPop Works steps; closing CTA.
- Play: ink-bezelled viewport with a 3x3 grid motif. Gallery: empty dashed frames. Other stubs and 404 restyled. Locked copy unchanged.

## Verified
`npm run lint`, `typecheck`, `format:check`, `build` all exit 0. Visual check by headless Chrome screenshots at 1440px and 375px.

## Not done
- The working game still lives only in `legacy/`; porting it is Phase 2 in the roadmap.
