import {
  Aperture,
  Camera,
  CircleCheck,
  Hand,
  LoaderCircle,
  Puzzle,
  RotateCcw,
  Save,
  ShieldCheck,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { PopButton, PopLink } from "@/components/PopButton";
import type { Status } from "@/lib/camera/engine";
import { cameraSupported } from "@/lib/camera/media";
import { useCameraGame } from "@/lib/camera/useCameraGame";
import { cn } from "@/lib/utils";

interface StatusInfo {
  label: string;
  Icon: LucideIcon;
  tone: string;
  /** Which of the four steps this status belongs to (0-based). */
  step: number;
}

const STATUS: Record<Status, StatusInfo> = {
  looking: {
    label: "Raise both hands so the camera can see them",
    Icon: Hand,
    tone: "bg-white text-ink",
    step: 0,
  },
  tracking: {
    label: "Spread your index fingers to frame the shot, then pinch with both hands",
    Icon: Hand,
    tone: "bg-marigold text-ink",
    step: 0,
  },
  armed: { label: "Hold the pinch…", Icon: Aperture, tone: "bg-saffron text-ink", step: 1 },
  countdown: { label: "Hold still, capturing…", Icon: Timer, tone: "bg-saffron text-ink", step: 1 },
  puzzle: {
    label: "Pinch a piece to pick it up, release it in the right spot",
    Icon: Puzzle,
    tone: "bg-chakra text-white",
    step: 2,
  },
  solved: {
    label: "Solved! Hold a fist to save, or press Save",
    Icon: CircleCheck,
    tone: "bg-leaf text-white",
    step: 3,
  },
  saving: { label: "Saving your polaroid…", Icon: Save, tone: "bg-leaf text-white", step: 3 },
};

const STEPS = [
  { title: "Frame", body: "Both index fingers make the corners." },
  { title: "Pinch to snap", body: "Pinch with both hands and hold." },
  { title: "Solve", body: "Pinch a piece, drag it home." },
  { title: "Save", body: "Hold a fist to keep your polaroid." },
];

export default function CameraPage() {
  const navigate = useNavigate();
  const {
    videoRef,
    canvasRef,
    ui,
    start,
    stop,
    snapNow,
    reset,
    save,
    toggleSound,
    pointerHandlers,
  } = useCameraGame((id) => navigate(`/results?m=${id}`));

  const running = ui.stage === "running";
  const info = STATUS[ui.status];
  const StatusIcon = info.Icon;
  const statusText =
    ui.status === "countdown" && ui.countdown !== null
      ? `Hold still, capturing in ${ui.countdown}…`
      : ui.status === "puzzle"
        ? `${info.label} (${ui.placed} of ${ui.total} placed)`
        : info.label;
  const secure = typeof window === "undefined" || window.isSecureContext;

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Camera mode · PinchPop</title>
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        Camera mode
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        Frame a shot with your hands, pinch to snap it, then solve your own photo. No mouse needed.
      </p>

      <div className="sticker-lg relative mt-8 overflow-hidden rounded-3xl bg-ink">
        <video
          ref={videoRef}
          playsInline
          muted
          aria-hidden="true"
          className="pointer-events-none absolute size-px opacity-0"
        />
        <div style={running ? undefined : { aspectRatio: "16 / 9" }}>
          <canvas
            ref={canvasRef}
            aria-label="Live camera view"
            className={cn("h-auto w-full touch-none select-none", running ? "block" : "hidden")}
            {...pointerHandlers}
          />
        </div>

        {ui.stage === "idle" || ui.stage === "error" ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-chakra-deep p-5 text-center text-white">
            <Chakra
              spokes={24}
              className="pointer-events-none absolute -top-40 -right-40 size-125 text-white/10"
            />
            <div className="relative max-w-md">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-marigold text-ink shadow-pop">
                <Camera className="size-8" aria-hidden="true" />
              </span>
              {ui.stage === "error" && ui.error ? (
                <>
                  <h2 className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
                    Camera mode could not start
                  </h2>
                  <p role="alert" className="mt-3 text-lg leading-relaxed text-white/85">
                    {ui.error.message}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em] sm:text-3xl">
                    Ready for your close-up?
                  </h2>
                  <p className="mt-3 text-lg leading-relaxed text-white/85">
                    Raise both hands to frame the shot, pinch to snap it, then put the puzzle back
                    together with your hands.
                  </p>
                </>
              )}
              {!secure || !cameraSupported() ? (
                <p role="alert" className="mt-4 text-base text-marigold">
                  Camera mode needs a secure connection (https) and a browser with camera access.
                </p>
              ) : (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <PopButton onClick={() => void start()} tone="saffron" size="lg">
                    <Camera className="size-5" aria-hidden="true" />
                    {ui.stage === "error" ? "Try again" : "Start camera"}
                  </PopButton>
                  <PopLink to="/game" tone="white" size="lg">
                    Use mouse instead
                  </PopLink>
                </div>
              )}
              <p className="mt-6 flex items-start justify-center gap-2 text-left text-sm leading-snug text-white/70">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-leaf-light"
                  aria-hidden="true"
                />
                Your video stays in this browser and is never uploaded. The free MediaPipe hand
                tracker downloads once (about 8 MB).
              </p>
            </div>
          </div>
        ) : null}

        {ui.stage === "starting" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-chakra-deep p-6 text-center text-white">
            <Chakra spokes={24} className="size-20 animate-spin text-marigold" />
            <p role="status" className="max-w-sm text-lg font-semibold">
              {ui.loadingText}
            </p>
            <p className="max-w-sm text-sm text-white/70">
              Your browser may ask to use the camera. Choose Allow.
            </p>
          </div>
        ) : null}

        {running ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
              <p
                aria-live="polite"
                className={cn(
                  "sticker inline-flex max-w-[calc(100%-7rem)] items-center gap-2 rounded-2xl px-3 py-2 text-sm leading-snug font-semibold sm:text-base",
                  info.tone,
                )}
              >
                <StatusIcon className="size-5 shrink-0" aria-hidden="true" />
                {statusText}
              </p>
              <div className="pointer-events-auto flex gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={ui.soundOn}
                  aria-label={ui.soundOn ? "Mute sounds" : "Turn sounds on"}
                  className="pop sticker flex size-11 items-center justify-center rounded-full bg-white"
                >
                  {ui.soundOn ? (
                    <Volume2 className="size-5" aria-hidden="true" />
                  ) : (
                    <VolumeX className="size-5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop camera"
                  className="pop sticker flex size-11 items-center justify-center rounded-full bg-coral"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {ui.fistProgress > 0 ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                <div className="sticker w-full max-w-xs rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold">
                    {ui.solved ? "Hold your fist to save…" : "Hold your fist to start over…"}
                  </p>
                  <div
                    role="progressbar"
                    aria-label="Fist hold progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(ui.fistProgress * 100)}
                    className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-ivory"
                  >
                    <div
                      className={cn("h-full", ui.solved ? "bg-leaf" : "bg-coral")}
                      style={{ width: `${ui.fistProgress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <PopButton onClick={snapNow} disabled={!running || !ui.canSnap} tone="saffron" size="md">
          <Aperture className="size-5" aria-hidden="true" />
          Snap now
        </PopButton>
        <PopButton onClick={save} disabled={!running || !ui.canSave} tone="leaf" size="md">
          <Save className="size-5" aria-hidden="true" />
          Save polaroid
        </PopButton>
        <PopButton onClick={reset} disabled={!running} tone="white" size="md">
          <RotateCcw className="size-5" aria-hidden="true" />
          Start over
        </PopButton>
        <p className="text-base text-ink-soft">
          No hands free? You can also drag the pieces with your mouse or finger.{" "}
          <Link
            to="/how-to-play"
            className="font-semibold text-chakra underline underline-offset-4"
          >
            How to play
          </Link>
        </p>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const active = running && info.step === i;
          return (
            <li
              key={step.title}
              aria-current={active ? "step" : undefined}
              className={cn(
                "sticker rounded-2xl p-4 transition-colors",
                active ? "bg-marigold" : "bg-white",
              )}
            >
              <span className="font-display text-3xl leading-none font-extrabold tracking-tighter">
                {i + 1}
              </span>
              <h2 className="mt-3 font-display text-lg font-extrabold tracking-[-0.03em]">
                {step.title}
              </h2>
              <p className="mt-1 text-base leading-snug text-ink-soft">{step.body}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 flex items-center gap-2 text-base text-ink-soft">
        {ui.stage === "starting" ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : null}
        Tip: good light on your face and a plain background help the camera find your hands.
      </p>
    </div>
  );
}
