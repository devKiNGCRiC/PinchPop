---
status: complete
---

# Quick task 261004-ngi: Single-photo frame redesign (phase 1 of 3)

## Built
- Four whole-card designs, each made of one physical object, replacing the color-preset look:
  - **Film Roll**: ink film band with sprocket holes, frame counter "12A", photo in an ivory-edged window.
  - **Notebook**: ruled paper with a margin line, photo held by two washi tapes (marigold and coral).
  - **Cassette**: coral label band where the caption is the title, reel holes at the base.
  - **Sticky Note**: yellow note with a curled corner, white photo border, and a coral pushpin.
- `FramePreset.design` selects a drawer in `src/lib/export.ts`; the classic frames are unchanged.
- The maker page previews by rendering the same canvas that the download produces
  (`PrintPreview.tsx`). Stickers stay an editable overlay positioned on the photo rectangle, and are
  baked into the export.

## Verified
- Screenshots of each design's live preview, with a real photo.
- All four designs export through the real download path (non-empty PNG blobs).
- Lint, all 25 Vitest tests, and the production build pass.

## Bugs found and fixed along the way
- The maker's file input cleared its value synchronously before the image finished loading. Now the
  reset waits for the load, so the same file can be picked again without invalidating the upload.
- The preview revoked its previous object URL before React swapped the image, which could show a
  broken image. The revoke now runs after the new image is committed.

## Not done yet
- Phases 2 (photo strips) and 3 (multi-photo frames) are not started.
- The classic and older frames still use the original drawing path. Their look is unchanged apart
  from now being previewed through the same canvas as the download.
- Not committed: per the user's standing rule, changes are left uncommitted until they ask.
