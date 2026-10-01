import { useState } from "react";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Confetti } from "@/components/Confetti";
import { EmptyState } from "@/components/EmptyState";
import { FilterPicker } from "@/components/FilterPicker";
import { PolaroidActions } from "@/components/PolaroidActions";
import { PopButton, PopLink } from "@/components/PopButton";
import { ReplayDownload } from "@/components/ReplayDownload";
import { Polaroid } from "@/components/Polaroid";
import { Seo } from "@/components/Seo";
import { ART_LIST, getArt, isCameraId } from "@/lib/art";
import { DEFAULT_FILTER_ID, filterCssFor } from "@/lib/filters";
import { deleteMemory, updateMemoryCaption, useMemories } from "@/lib/memories";
import type { Memory } from "@/lib/memories";
import { formatAccuracy, formatTime } from "@/lib/puzzle";
import { postmarkDate, tiltFor, visitedPlaces } from "@/lib/stats";

export default function ResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const memories = useMemories();
  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID);
  const requested = params.get("m");
  const memory = memories.find((m) => m.id === requested) ?? memories[0];

  if (!memory) {
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
      <Seo
        title={`${art.place} polaroid`}
        description={`Scored ${memory.score} pts in ${memory.moves} moves and ${formatTime(memory.seconds)} — your Speed Run result for ${art.place}.`}
        path="/results"
        noIndex
      />
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative mx-auto w-full max-w-100 py-4">
          <Confetti key={memory.id} />
          <Polaroid
            artId={memory.artId}
            photo={memory.photo}
            aspect={memory.aspect}
            caption={memory.caption ?? art.caption}
            tilt={tiltFor(memory.id) || 3}
            tape
            develop
            postmark={{ place: art.place, date: postmarkDate(memory.createdAt) }}
            filter={filterCssFor(filterId)}
          >
            <span className="mt-1 text-sm font-semibold text-ink-soft">
              {camera ? "Taken in camera mode" : `${art.name}, ${art.state}`}
            </span>
          </Polaroid>
          {camera ? <CaptionEditor memory={memory} defaultCaption={art.caption} /> : null}
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
            <FilterPicker value={filterId} onChange={setFilterId} />
            <div className="mt-4">
              <PolaroidActions memory={memory} filterId={filterId} />
            </div>
            <ReplayDownload memoryId={memory.id} />
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
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lets a camera photo's caption ("your shot" by default) be renamed, right under the polaroid
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
        Edit caption ("{shown}")
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
        placeholder={defaultCaption}
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
