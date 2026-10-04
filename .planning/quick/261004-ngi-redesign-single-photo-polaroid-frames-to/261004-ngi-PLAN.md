# Quick task 261004-ngi: Single-photo frame redesign (phase 1 of 3)

Phases agreed with the user: (1) single-photo frames, (2) photo strips, (3) multi-photo frames.
This plan covers phase 1 only.

## Subject and audience
A photo post for a phone feed or story. The person has one photo and wants it to look designed in
ten seconds. Primary job: make the photo look like a deliberate scrapbook/journal page, not a
filtered snapshot. Audience: teens and young adults making social posts.

## Design direction: "a real object, not a template"
Each frame is a physical-object composition built from one memorable material, not a color preset:
- Film roll: ink-black film band with sprocket holes and a frame counter.
- Notebook: ruled paper with a margin line, photo held by two washi tapes, slightly tilted.
- Cassette: coral label band where the caption is the title, reel holes at the base.
- Sticky note: yellow note with a curled corner and a pushpin.

Rejected defaults: pastel gradient fills with stripes (what the user already called basic), clip-art
stickers as the decoration, all-caps labels, a generic card with a drop shadow.

## Tokens
- Ink #111426, Ivory #fff6e6, Marigold #ffc61a, Coral #ff6b5b, Chakra #1c34a6, Leaf #138808
- Notebook ruling #cfe0f5, margin #f29b9b, paper #fdf8ec
- Sticky #ffe27a, curl #f2c94c
- Type: existing caption fonts (handwritten default); Bricolage Grotesque for small labels, sentence case.

## Architecture
- A `design` field on FramePreset selects a whole-card drawer in export.ts.
- One layout function per design returns the canvas size and the photo rectangle, so the preview and
  export share geometry.
- The maker page previews by rendering the same canvas. Sticker drag stays a DOM overlay positioned on
  the photo rectangle (fractions of the canvas).
- Non-design frames keep their current drawing path.

## Review against the brief
- Does any design read like a generic default? The film strip and the cassette both use a
  dark or colored band, which is a known pattern. They are kept because the band carries real content
  (sprocket holes, frame counter, reel holes, caption-as-title) and each band is specific to its object.
- Not a stripe, gradient, or emoji. Decoration is the object's own parts (holes, tape, pin, curl).

## Tasks
1. Add `design` to FramePreset and four new presets at the top of the picker.
2. Refactor renderQuickPolaroidBlob into a canvas builder with per-design layouts and drawers.
3. Preview component renders the same canvas; sticker overlay on the photo rectangle.
4. Verify each design visually in headless Chrome and check pixel output; lint, tests, build.
