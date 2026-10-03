import { useRef, useState } from "react";
import { Download, ImagePlus, Share2 } from "lucide-react";

import { CaptionStylePicker } from "@/components/CaptionStylePicker";
import { Chakra } from "@/components/Chakra";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { FilterPicker } from "@/components/FilterPicker";
import { FramePicker } from "@/components/FramePicker";
import { PopButton } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { Seo } from "@/components/Seo";
import { StickerPicker } from "@/components/StickerPicker";
import {
  loadImageFile,
  preparePlainPhoto,
  toSavedPhoto,
  UPLOAD_MAX_BYTES,
} from "@/lib/camera/effects";
import {
  CAPTION_FONTS,
  captionFontFor,
  DEFAULT_CAPTION_BACKGROUND,
  DEFAULT_CAPTION_BG_COLOR,
  DEFAULT_CAPTION_FONT_ID,
  DEFAULT_CAPTION_SIZE,
} from "@/lib/captionFonts";
import type { CaptionBackground } from "@/lib/captionFonts";
import { downloadBlob, renderQuickPolaroidBlob, shareOrDownload } from "@/lib/export";
import { DEFAULT_FILTER_ID, filterCssFor, FILTER_PRESETS } from "@/lib/filters";
import { DEFAULT_FRAME_ID, frameFor } from "@/lib/frames";
import { formatDate } from "@/lib/stats";
import { iconAspectFor } from "@/lib/stickerIcons";
import { createBanner, createSticker } from "@/lib/stickers";
import type { PlacedSticker } from "@/lib/stickers";

interface LoadedPhoto {
  dataUrl: string;
  aspect: number;
}

type Busy = "preparing" | "download" | "share" | null;

/** Turns any uploaded photo into a polaroid — no puzzle, no camera, no account. For people who
 * just want the instant-print look, like the game's photobooth effect without the gesture game
 * attached to it. */
export default function PolaroidMakerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID);
  const [frameId, setFrameId] = useState(DEFAULT_FRAME_ID);
  const [caption, setCaption] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [captionFontId, setCaptionFontId] = useState(DEFAULT_CAPTION_FONT_ID);
  const [captionSize, setCaptionSize] = useState(DEFAULT_CAPTION_SIZE);
  // null means "use the frame's own caption color" — only set once the player picks one explicitly.
  const [captionColorOverride, setCaptionColorOverride] = useState<string | null>(null);
  const [captionBackground, setCaptionBackground] = useState<CaptionBackground>(
    DEFAULT_CAPTION_BACKGROUND,
  );
  const [captionBgColor, setCaptionBgColor] = useState(DEFAULT_CAPTION_BG_COLOR);
  // Computed once — "today" for the life of this page view, not re-read on every render.
  const [today] = useState(() => formatDate(Date.now()));
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const trimmedCaption = caption.trim();
  const frame = frameFor(frameId);
  const captionColor = captionColorOverride ?? frame.captionColor;

  function handleFrameChange(id: string) {
    setFrameId(id);
    const preset = frameFor(id);
    // Switching frames always starts fresh with that frame's own stickers (if any) — carrying
    // over a different frame's decorations tends to clash rather than complement the new look.
    setStickers(
      preset.defaultStickers
        ? preset.defaultStickers.map((s) => ({
            ...s,
            id: crypto.randomUUID(),
            aspect: iconAspectFor(s.iconId),
          }))
        : [],
    );
  }

  async function handleFile(file: File) {
    setError("");
    setMessage("");
    if (!file.type.startsWith("image/")) {
      setError("That file isn't a photo. Choose an image instead.");
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      setError("That photo is too large (max 15 MB). Try a smaller one.");
      return;
    }
    setBusy("preparing");
    try {
      const image = await loadImageFile(file);
      setPhoto(toSavedPhoto(preparePlainPhoto(image)));
    } catch {
      setError("Could not read that photo. Please try another.");
    } finally {
      setBusy(null);
    }
  }

  async function run(kind: "download" | "share") {
    if (!photo) return;
    setBusy(kind);
    setMessage("");
    try {
      const blob = await renderQuickPolaroidBlob(
        {
          photo: photo.dataUrl,
          aspect: photo.aspect,
          caption: trimmedCaption,
          timestamp: showDate ? today : undefined,
          stickers,
          captionFontFamily: captionFontFor(captionFontId).family,
          captionSize,
          captionColor,
          captionBackground,
          captionBgColor,
        },
        filterCssFor(filterId),
        frame,
      );
      if (kind === "download") {
        downloadBlob(blob, "pinchpop-polaroid.png");
        setMessage("Image saved to your downloads.");
      } else {
        const outcome = await shareOrDownload(
          blob,
          "pinchpop-polaroid.png",
          "My PinchPop polaroid",
        );
        if (outcome === "downloaded") {
          setMessage("Sharing is not available here, so the image was saved to your downloads.");
        } else if (outcome === "shared") {
          setMessage("Shared.");
        }
      }
    } catch (err) {
      console.warn("[PinchPop] Could not export the polaroid:", err);
      setMessage("Sorry, the image could not be created. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Make a polaroid"
        description="Turn any photo into an instant-print polaroid with filters and a caption — free, no account, no puzzle."
        path="/polaroid"
      />
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
        Make a polaroid
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        Upload any photo, pick a frame and filter, add stickers and a caption — no puzzle, no
        camera, no account.
      </p>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="mx-auto w-full max-w-100">
          {photo ? (
            <Polaroid
              artId="camera"
              photo={photo.dataUrl}
              aspect={photo.aspect}
              caption={trimmedCaption}
              tilt={-2}
              tape
              filter={filterCssFor(filterId)}
              frameId={frameId}
              captionFontId={captionFontId}
              captionSize={captionSize}
              captionColor={captionColorOverride ?? undefined}
              captionBackground={captionBackground}
              captionBgColor={captionBgColor}
              stickers={stickers}
              editableStickers
              onStickersChange={setStickers}
            >
              {showDate ? (
                <span
                  className="mt-1 text-sm font-semibold opacity-75"
                  style={{ color: captionColor }}
                >
                  {today}
                </span>
              ) : null}
            </Polaroid>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy === "preparing"}
              className="pop sticker-lg flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-3xl border-[2.5px] border-dashed border-ink bg-white text-ink-soft"
            >
              {busy === "preparing" ? (
                <Chakra spokes={24} className="size-10 animate-spin text-chakra" />
              ) : (
                <>
                  <ImagePlus className="size-10" aria-hidden="true" />
                  <span className="font-semibold">Choose a photo</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleFile(file);
            }}
          />
          {error ? <p className="mt-3 text-center text-base text-sindoor">{error}</p> : null}
          {stickers.length > 0 ? (
            <p className="mt-3 text-center text-sm text-ink-soft">
              Drag a sticker to move it, tap it for a resize handle and remove button.
            </p>
          ) : null}
        </div>

        <div>
          {photo ? (
            <>
              <PopButton
                tone="white"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy === "preparing"}
              >
                Choose a different photo
              </PopButton>

              <div className="mt-6">
                <p className="text-sm font-semibold text-ink-soft">Caption</p>
                <input
                  maxLength={40}
                  placeholder="your moment"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-2 w-full rounded-full border-2 border-ink bg-white px-4 py-2 font-hand text-xl outline-none focus:ring-4 focus:ring-marigold/50"
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-base font-semibold text-ink-soft">
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="size-5 rounded border-2 border-ink accent-chakra"
                />
                Add today's date
              </label>

              <div className="mt-6 flex flex-col gap-3">
                <CollapsibleSection title="Frame" summary={frame.label} defaultOpen>
                  <FramePicker value={frameId} onChange={handleFrameChange} />
                </CollapsibleSection>

                <CollapsibleSection
                  title="Filter"
                  summary={FILTER_PRESETS.find((f) => f.id === filterId)?.label}
                >
                  <FilterPicker value={filterId} onChange={setFilterId} />
                </CollapsibleSection>

                <CollapsibleSection
                  title="Caption style"
                  summary={CAPTION_FONTS.find((f) => f.id === captionFontId)?.label}
                >
                  <CaptionStylePicker
                    fontId={captionFontId}
                    onFontChange={setCaptionFontId}
                    size={captionSize}
                    onSizeChange={setCaptionSize}
                    color={captionColor}
                    onColorChange={setCaptionColorOverride}
                    background={captionBackground}
                    onBackgroundChange={setCaptionBackground}
                    bgColor={captionBgColor}
                    onBgColorChange={setCaptionBgColor}
                  />
                </CollapsibleSection>

                <CollapsibleSection
                  title="Stickers"
                  summary={stickers.length > 0 ? `${stickers.length} placed` : undefined}
                >
                  <StickerPicker
                    onAdd={(iconId) => setStickers((prev) => [...prev, createSticker(iconId)])}
                    onAddBanner={(text) => setStickers((prev) => [...prev, createBanner(text)])}
                    onClear={stickers.length > 0 ? () => setStickers([]) : undefined}
                  />
                </CollapsibleSection>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <PopButton
                  onClick={() => void run("download")}
                  disabled={busy !== null}
                  tone="marigold"
                >
                  <Download className="size-5" aria-hidden="true" />
                  {busy === "download" ? "Making image…" : "Download image"}
                </PopButton>
                <PopButton onClick={() => void run("share")} disabled={busy !== null} tone="coral">
                  <Share2 className="size-5" aria-hidden="true" />
                  {busy === "share" ? "Opening…" : "Share"}
                </PopButton>
              </div>
              <p aria-live="polite" className="mt-3 min-h-6 text-base text-ink-soft">
                {message}
              </p>
            </>
          ) : (
            <p className="text-lg leading-relaxed text-ink-soft">
              Pick a photo on the left to start — 22 frames, 12 filters, 24 stickers, custom type
              and a caption turn it into an instant print you can download or share.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
