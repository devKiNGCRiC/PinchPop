import { useRef, useState } from "react";
import { Download, ImagePlus, Share2 } from "lucide-react";

import { Chakra } from "@/components/Chakra";
import { FilterPicker } from "@/components/FilterPicker";
import { PopButton } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { Seo } from "@/components/Seo";
import {
  capturePhotoFromImage,
  loadImageFile,
  toSavedPhoto,
  UPLOAD_MAX_BYTES,
} from "@/lib/camera/effects";
import { downloadBlob, renderQuickPolaroidBlob, shareOrDownload } from "@/lib/export";
import { DEFAULT_FILTER_ID, filterCssFor } from "@/lib/filters";
import { formatDate } from "@/lib/stats";

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
  const [caption, setCaption] = useState("");
  const [showDate, setShowDate] = useState(false);
  // Computed once — "today" for the life of this page view, not re-read on every render.
  const [today] = useState(() => formatDate(Date.now()));
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      const captured = capturePhotoFromImage(image);
      setPhoto(toSavedPhoto(captured.color));
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
          caption: caption.trim() || "your moment",
          timestamp: showDate ? today : undefined,
        },
        filterCssFor(filterId),
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
        Upload any photo, pick a filter, write a caption — no puzzle, no camera, no account.
      </p>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="mx-auto w-full max-w-100">
          {photo ? (
            <Polaroid
              artId="camera"
              photo={photo.dataUrl}
              aspect={photo.aspect}
              caption={caption.trim() || "your moment"}
              tilt={-2}
              tape
              filter={filterCssFor(filterId)}
            >
              {showDate ? (
                <span className="mt-1 text-sm font-semibold text-ink-soft">{today}</span>
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

              <div className="mt-6">
                <FilterPicker value={filterId} onChange={setFilterId} />
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
              Pick a photo on the left to start — your pick of 11 filters and a caption turn it into
              an instant print you can download or share.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
