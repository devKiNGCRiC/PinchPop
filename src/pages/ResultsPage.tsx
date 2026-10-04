import { useEffect, useMemo, useState } from "react";
import { Check, Copy, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Confetti } from "@/components/Confetti";
import { EmptyState } from "@/components/EmptyState";
import { FilterPicker } from "@/components/FilterPicker";
import { FramePicker } from "@/components/FramePicker";
import { PolaroidActions } from "@/components/PolaroidActions";
import { PopButton, PopLink } from "@/components/PopButton";
import { PrintPreview } from "@/components/PrintPreview";
import { ReplayDownload } from "@/components/ReplayDownload";
import { Seo } from "@/components/Seo";
import { StickerPicker } from "@/components/StickerPicker";
import { ART_LIST, getArt, isCameraId } from "@/lib/art";
import { useProfile, useSession } from "@/lib/auth";
import { memoryPhotoUrl } from "@/lib/export";
import { DEFAULT_FILTER_ID, filterCssFor } from "@/lib/filters";
import { DEFAULT_FRAME_ID, frameFor } from "@/lib/frames";
import { deleteMemory, updateMemoryCaption, useMemories } from "@/lib/memories";
import type { Memory } from "@/lib/memories";
import { formatAccuracy, formatTime } from "@/lib/puzzle";
import { createBanner, createSticker } from "@/lib/stickers";
import type { PlacedSticker } from "@/lib/stickers";
import { visitedPlaces } from "@/lib/stats";

/** A requested id that isn't on this device at all is most likely a cloud run solved on a
 * different one (e.g. a link opened from the Album's "synced from another device" tiles) — this
 * fetches it from the cloud instead of falling through to "no polaroid yet". Returns null while
 * there's nothing to fetch (no id requested, or it was already found locally). */
function useCloudFallback(requestedId: string | null, foundLocally: boolean) {
  const [loaded, setLoaded] = useState<{ id: string; memory: Memory | null } | null>(null);

  useEffect(() => {
    if (!requestedId || foundLocally) return;
    let active = true;
    import("@/lib/cloudRuns").then(({ fetchCloudRunAsMemory }) =>
      fetchCloudRunAsMemory(requestedId)
        .then((memory) => {
          if (active) setLoaded({ id: requestedId, memory });
        })
        .catch((error: unknown) => {
          console.warn("[PinchPop] Could not load that run from the cloud:", error);
          if (active) setLoaded({ id: requestedId, memory: null });
        }),
    );
    return () => {
      active = false;
    };
  }, [requestedId, foundLocally]);

  if (!requestedId || foundLocally) return { memory: null, loading: false };
  const current = loaded?.id === requestedId ? loaded : null;
  return { memory: current?.memory ?? null, loading: !current };
}

export default function ResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const memories = useMemories();
  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID);
  const requested = params.get("m");
  const localMemory = requested ? memories.find((m) => m.id === requested) : undefined;
  const cloudFallback = useCloudFallback(requested, !!localMemory);
  const isCloudOnly = !localMemory && !!cloudFallback.memory;
  const memory = localMemory ?? cloudFallback.memory ?? (requested ? undefined : memories[0]);
  const [frameId, setFrameId] = useState(DEFAULT_FRAME_ID);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!memory) return;
    let active = true;
    memoryPhotoUrl(memory).then((url) => {
      if (active) setPhotoUrl(url);
    });
    return () => {
      active = false;
    };
  }, [memory]);

  const printInput = useMemo(() => {
    if (!memory || !photoUrl) return null;
    const art = getArt(memory.artId);
    const accuracy = memory.accuracy !== undefined ? ` · ${formatAccuracy(memory.accuracy)}` : "";
    return {
      photo: photoUrl,
      aspect: memory.photo ? (memory.aspect ?? 1) : 1,
      caption: memory.caption ?? art.caption,
      timestamp: `${memory.score} pts · ${memory.moves} moves · ${formatTime(memory.seconds)}${accuracy}`,
    };
  }, [memory, photoUrl]);

  if (!memory) {
    if (requested && cloudFallback.loading) {
      return (
        <div className="mx-auto max-w-280 px-5 pt-32 pb-8 text-center sm:px-6 sm:pt-40">
          <Seo
            title="Results"
            description="Solve a puzzle on PinchPop to see your Speed Run score, moves, time and accuracy."
            path="/results"
            noIndex
          />
          <h1 className="sr-only">Loading</h1>
          <Chakra spokes={24} className="mx-auto size-12 animate-spin text-chakra" />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-280 px-5 pt-32 pb-8 sm:px-6 sm:pt-40">
        <Seo
          title="Results"
          description="Solve a puzzle on PinchPop to see your Speed Run score, moves, time and accuracy."
          path="/results"
          noIndex
        />
        <h1 className="sr-only">Results</h1>
        <EmptyState
          title="No polaroid yet"
          body="Solve a puzzle and your print shows up here with its postmark and your score."
        >
          <PopLink to="/game" tone="saffron" size="lg">
            Solve a puzzle
          </PopLink>
        </EmptyState>
      </div>
    );
  }

  const art = getArt(memory.artId);
  const camera = isCameraId(memory.artId);
  const isBest = memories.length > 1 && memories.every((m) => m.score <= memory.score);
  const visited = visitedPlaces(memories).size;

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      {isCloudOnly ? null : <LoginNudge />}
      <Seo
        title={`${art.place} polaroid`}
        description={`Scored ${memory.score} pts in ${memory.moves} moves and ${formatTime(memory.seconds)} — your Speed Run result for ${art.place}.`}
        path="/results"
        noIndex
      />
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative mx-auto w-full max-w-100 py-4">
          <Confetti key={memory.id} />
          {printInput ? (
            <PrintPreview
              input={printInput}
              filterCss={filterCssFor(filterId)}
              frame={frameFor(frameId)}
              stickers={stickers}
              onStickersChange={setStickers}
            />
          ) : null}
          {camera && !isCloudOnly ? (
            <CaptionEditor memory={memory} defaultCaption={art.caption} />
          ) : null}
          {isCloudOnly ? (
            <p className="mt-3 text-center text-sm text-ink-soft">Synced from another device</p>
          ) : null}
        </div>

        <div>
          <h1 className="font-display text-[clamp(36px,7vw,84px)] leading-[0.92] font-extrabold tracking-[-0.055em]">
            Nailed it.
          </h1>
          {isBest ? (
            <p className="sticker mt-4 inline-block -rotate-2 rounded-full bg-marigold px-4 py-1.5 text-base font-semibold">
              New personal best
            </p>
          ) : null}

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            <Tile label="Score" value={String(memory.score)} color="bg-marigold text-ink" />
            <Tile label="Moves" value={String(memory.moves)} color="bg-saffron text-ink" />
            <Tile label="Time" value={formatTime(memory.seconds)} color="bg-leaf text-white" />
            {memory.accuracy !== undefined ? (
              <Tile
                label="Accuracy"
                value={formatAccuracy(memory.accuracy)}
                color="bg-white text-ink"
              />
            ) : null}
          </dl>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {camera
              ? "Saved from camera mode. Your photo counts toward the leaderboard and earns the Say cheese milestone."
              : `${art.place} is stamped in your passport. You have visited ${visited} of ${ART_LIST.length} destinations.`}
          </p>

          <div className="mt-8">
            <div className="flex flex-col gap-3">
              <CollapsibleSection title="Frame" summary={frameFor(frameId).label} defaultOpen>
                <FramePicker value={frameId} onChange={setFrameId} />
              </CollapsibleSection>
              <CollapsibleSection
                title="Filter"
                summary={filterId === DEFAULT_FILTER_ID ? "Default" : undefined}
              >
                <FilterPicker value={filterId} onChange={setFilterId} />
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
            <div className="mt-4">
              <PolaroidActions
                memory={memory}
                filterId={filterId}
                frameId={frameId}
                stickers={stickers}
              />
            </div>
            <ReplayDownload memoryId={memory.id} />
            {camera && !isCloudOnly ? <PublicShareToggle memory={memory} /> : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <PopLink to={camera ? "/camera" : `/game?art=${art.id}`} tone="saffron" size="lg">
              Play again
            </PopLink>
            <PopLink to="/profile" tone="chakra" size="lg">
              Open passport
            </PopLink>
            <PopLink to="/gallery" tone="white" size="lg">
              Open album
            </PopLink>
            {isCloudOnly ? null : (
              <PopButton
                tone="white"
                size="lg"
                onClick={() => {
                  deleteMemory(memory.id);
                  navigate("/gallery");
                }}
              >
                <Trash2 className="size-5 text-sindoor" aria-hidden="true" />
                Delete
              </PopButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const LOGIN_NUDGE_KEY = "pinchpop.loginNudgeShown.v1";

/** A one-time, dismissible nudge toward signing in, shown the first time someone views their own
 * result while signed out — the moment they have something worth keeping. Never shows again after
 * that first time, whether it was dismissed or just ignored, so it never nags on later visits. */
function LoginNudge() {
  const { session, loading } = useSession();
  const [dismissed, setDismissed] = useState(false);
  // Read once at mount, before this run has a chance to mark itself as shown below — this is
  // "was it already shown before now", not "has it been shown this render".
  const [alreadyShown] = useState(() => {
    try {
      return localStorage.getItem(LOGIN_NUDGE_KEY) === "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (loading || session || alreadyShown) return;
    try {
      localStorage.setItem(LOGIN_NUDGE_KEY, "1");
    } catch {
      // Nothing to persist to — the nudge still shows this once, just not reliably skipped later.
    }
  }, [loading, session, alreadyShown]);

  if (loading || session || alreadyShown || dismissed) return null;

  return (
    <div
      role="status"
      className="sticker-lg fixed right-3 bottom-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] items-start gap-3 rounded-2xl bg-chakra p-4 text-white animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:right-6 sm:bottom-6"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight font-extrabold tracking-[-0.03em]">
          Keep this one?
        </p>
        <p className="mt-1 text-sm leading-snug">
          Sign in to sync your photos across devices and join the worldwide leaderboard.
        </p>
        <PopLink to="/account" tone="marigold" size="sm" className="mt-3">
          Sign in
        </PopLink>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Lets a camera photo's caption be added or renamed, right under the polaroid
 * it labels. Destination polaroids keep their fixed, place-tied caption. */
function CaptionEditor({ memory, defaultCaption }: { memory: Memory; defaultCaption: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = memory.caption ?? defaultCaption;

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(memory.caption ?? "");
          setEditing(true);
        }}
        className="mx-auto mt-3 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-chakra"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
        {shown ? `Edit caption ("${shown}")` : "Add a caption"}
      </button>
    );
  }

  function save() {
    setBusy(true);
    updateMemoryCaption(memory.id, value);
    setBusy(false);
    setEditing(false);
  }

  return (
    <div className="mx-auto mt-3 flex max-w-xs items-center gap-2">
      <input
        autoFocus
        maxLength={40}
        placeholder="Add a caption"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-full rounded-full border-2 border-ink bg-white px-3 py-1.5 text-center font-hand text-lg outline-none focus:ring-4 focus:ring-marigold/50"
      />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="pop sticker flex size-9 shrink-0 items-center justify-center rounded-full bg-leaf text-white"
        aria-label="Save caption"
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Pencil className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** Lets a signed-in player opt one camera photo into a public, no-sign-in-required share link —
 * off by default, toggled per-photo. Hidden while signed out (nothing to attach publicity to) or
 * while the run hasn't finished syncing to the cloud yet (checked lazily, see getRunPublicStatus). */
function PublicShareToggle({ memory }: { memory: Memory }) {
  const { session, username } = useProfile();
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    import("@/lib/cloudRuns").then(({ getRunPublicStatus }) =>
      getRunPublicStatus(session.user.id, memory.id).then((value) => {
        if (active) setIsPublic(value);
      }),
    );
    return () => {
      active = false;
    };
  }, [session, memory.id]);

  if (!session || isPublic === null) return null;

  const shareUrl = username
    ? `${window.location.origin}/share/${encodeURIComponent(username)}/${memory.id}`
    : null;

  async function toggle() {
    if (!session) return;
    setBusy(true);
    setMessage(null);
    const next = !isPublic;
    const { setRunPublic } = await import("@/lib/cloudRuns");
    const result = await setRunPublic(session.user.id, memory.id, next);
    if (result.ok) {
      setIsPublic(next);
    } else {
      setMessage(result.message ?? "Something went wrong.");
    }
    setBusy(false);
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">
            {isPublic ? "This photo is public" : "Make this photo public"}
          </p>
          <p className="text-sm text-ink-soft">
            {isPublic
              ? "Anyone with the link can view it, no sign-in needed."
              : "Get a link anyone can open, without signing in."}
          </p>
        </div>
        <PopButton
          tone={isPublic ? "chakra" : "white"}
          size="sm"
          onClick={() => void toggle()}
          disabled={busy}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isPublic ? "Make private" : "Make public"}
        </PopButton>
      </div>
      {isPublic && shareUrl ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm outline-none"
          />
          <PopButton tone="white" size="sm" onClick={() => void copyLink()}>
            {copied ? (
              <Check className="size-4 text-leaf" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
          </PopButton>
        </div>
      ) : null}
      {message ? <p className="mt-2 text-sm text-sindoor">{message}</p> : null}
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`sticker-lg rounded-3xl p-4 sm:p-5 ${color}`}>
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="mt-1 font-display text-[clamp(24px,4vw,40px)] leading-none font-extrabold tracking-tighter tabular-nums">
        {value}
      </dd>
    </div>
  );
}
