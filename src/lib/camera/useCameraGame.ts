import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { CAMERA_ID } from "@/lib/art";
import { createEngine } from "@/lib/camera/engine";
import type { Engine, EngineEvent, Status } from "@/lib/camera/engine";
import { capturePhoto, slicePieces, toSavedPhoto } from "@/lib/camera/effects";
import { describeCameraError, openCamera, stopStream } from "@/lib/camera/media";
import type { CameraError } from "@/lib/camera/media";
import { placedCount } from "@/lib/camera/pieces";
import { createShatter, renderScene, SHATTER_MS } from "@/lib/camera/render";
import type { SceneAssets, Shatter } from "@/lib/camera/render";
import { createSound } from "@/lib/camera/sound";
import { loadTracker } from "@/lib/camera/tracker";
import type { Tracker } from "@/lib/camera/tracker";
import type { Box, Hand, Point } from "@/lib/camera/types";
import { saveMemory } from "@/lib/memories";
import { setRecording, startCanvasRecording } from "@/lib/recording";
import type { CanvasRecorder } from "@/lib/recording";

export type Stage = "idle" | "starting" | "running" | "error";

/** What the page needs to draw its HUD. Updated only when something visible changes. */
export interface CameraUi {
  stage: Stage;
  loadingText: string;
  error: CameraError | null;
  status: Status;
  handsSeen: number;
  countdown: number | null;
  placed: number;
  total: number;
  solved: boolean;
  fistProgress: number;
  soundOn: boolean;
  canSnap: boolean;
  canSave: boolean;
}

const INITIAL: CameraUi = {
  stage: "idle",
  loadingText: "",
  error: null,
  status: "looking",
  handsSeen: 0,
  countdown: null,
  placed: 0,
  total: 9,
  solved: false,
  fistProgress: 0,
  soundOn: true,
  canSnap: false,
  canSave: false,
};

function fitBox(box: Box, width: number, height: number): Box {
  const x = Math.max(0, Math.round(box.x));
  const y = Math.max(0, Math.round(box.y));
  return {
    x,
    y,
    width: Math.max(1, Math.min(Math.round(box.width), width - x)),
    height: Math.max(1, Math.min(Math.round(box.height), height - y)),
  };
}

/** A centred frame for players who trigger the shutter with a button instead of their hands. */
function defaultFrame(width: number, height: number): Box {
  const w = width * 0.56;
  const h = height * 0.62;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

/**
 * Runs camera mode: opens the webcam, loads the hand tracker, and drives the engine and renderer
 * once per animation frame. React state is touched only when the HUD needs to change.
 */
export function useCameraGame(onSaved: (memoryId: string) => void) {
  const [engine] = useState(createEngine);
  const [sound] = useState(createSound);
  const [ui, setUi] = useState<CameraUi>(() => ({ ...INITIAL, soundOn: sound.isEnabled() }));

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<Tracker | null>(null);
  const frameRef = useRef(0);
  const runningRef = useRef(false);
  const assetsRef = useRef<SceneAssets | null>(null);
  const flashAtRef = useRef<number | null>(null);
  const solvedAtRef = useRef<number | null>(null);
  const uiKeyRef = useRef("");
  const pointerDownRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastHandsRef = useRef<Hand[]>([]);
  const recorderRef = useRef<CanvasRecorder | null>(null);
  const shatterRef = useRef<Shatter | null>(null);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  const teardown = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(frameRef.current);
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = undefined;
    recorderRef.current?.discard();
    recorderRef.current = null;
    shatterRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    assetsRef.current = null;
    flashAtRef.current = null;
    solvedAtRef.current = null;
    lastVideoTimeRef.current = -1;
    lastHandsRef.current = [];
    pointerDownRef.current = false;
  }, []);

  useEffect(
    () => () => {
      teardown();
      sound.close();
    },
    [teardown, sound],
  );

  const syncUi = useCallback(() => {
    const view = engine.view();
    const placed = view.puzzle ? placedCount(view.puzzle) : 0;
    const next = {
      status: view.status,
      handsSeen: view.handsSeen,
      countdown: view.countdown,
      placed,
      solved: view.puzzle?.solved ?? false,
      fistProgress: Math.round(view.fistProgress * 20) / 20,
      canSnap: view.phase === "tracking",
      canSave: view.phase === "puzzle" && (view.puzzle?.solved ?? false),
    };
    const key = JSON.stringify(next);
    if (key === uiKeyRef.current) return;
    uiKeyRef.current = key;
    setUi((prev) => ({ ...prev, ...next }));
  }, [engine]);

  const finishSave = useCallback(() => {
    const assets = assetsRef.current;
    if (!assets || saveTimerRef.current !== undefined) return;
    const stats = engine.stats();
    const photo = toSavedPhoto(assets.color);
    // Keep the run immediately, so it survives even if the tab closes mid-animation.
    const memory = saveMemory({
      artId: CAMERA_ID,
      moves: Math.max(1, stats.moves),
      seconds: stats.seconds,
      accuracy: stats.accuracy,
      photo: photo.dataUrl,
      aspect: photo.aspect,
    });

    const board = engine.view().puzzle?.box;
    shatterRef.current = board ? createShatter(board, assets.color, performance.now()) : null;
    sound.shatter();

    // Let the photo burst apart, then finish the replay and move on to the results page.
    saveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        const recorder = recorderRef.current;
        recorderRef.current = null;
        const blob = await recorder?.stop();
        if (blob) setRecording({ memoryId: memory.id, blob, mimeType: blob.type });
        sound.saved();
        teardown();
        onSavedRef.current(memory.id);
      })();
    }, SHATTER_MS);
  }, [engine, sound, teardown]);

  const doCapture = useCallback(
    (box: Box, now: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const frame = fitBox(box, canvas.width, canvas.height);
      const photo = capturePhoto(video, frame);
      const puzzle = engine.beginPuzzle(frame, now, Math.random);
      // Record the puzzle-solving as a WebM replay the player can download afterwards.
      recorderRef.current?.discard();
      recorderRef.current = startCanvasRecording(canvas);
      assetsRef.current = { pieces: slicePieces(photo.blackAndWhite, puzzle), color: photo.color };
      flashAtRef.current = now;
      solvedAtRef.current = puzzle.solved ? now : null;
      sound.shutter();
    },
    [engine, sound],
  );

  const handleEvents = useCallback(
    (events: EngineEvent[], now: number) => {
      for (const event of events) {
        switch (event.type) {
          case "countdown":
            sound.beep(event.n);
            break;
          case "capture":
            doCapture(event.box, now);
            break;
          case "pickup":
            sound.pickup();
            break;
          case "snap":
            sound.snap();
            break;
          case "complete":
            solvedAtRef.current = now;
            sound.complete();
            break;
          case "save":
            finishSave();
            break;
          case "reset":
            recorderRef.current?.discard();
            recorderRef.current = null;
            assetsRef.current = null;
            flashAtRef.current = null;
            solvedAtRef.current = null;
            break;
          default:
            break;
        }
      }
    },
    [doCapture, finishSave, sound],
  );

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    sound.unlock();
    setUi((prev) => ({
      ...prev,
      stage: "starting",
      error: null,
      loadingText: "Opening your camera…",
    }));

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) throw new Error("The camera view is not ready yet.");

      const stream = await openCamera();
      streamRef.current = stream;
      video.srcObject = stream;
      if (video.readyState < 1) {
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
      }
      await video.play();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const tracker = await loadTracker((text) =>
        setUi((prev) => ({ ...prev, loadingText: text })),
      );
      if (!runningRef.current) {
        tracker.close();
        return;
      }
      trackerRef.current = tracker;
      engine.reset();
      // Dev-only handle so automated browser tests can locate puzzle pieces. Stripped from production builds.
      if (import.meta.env.DEV)
        (window as unknown as { __pinchpopEngine?: Engine }).__pinchpopEngine = engine;
      uiKeyRef.current = "";
      setUi((prev) => ({ ...prev, stage: "running", soundOn: sound.isEnabled() }));

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available in this browser.");

      const tick = () => {
        if (!runningRef.current) return;
        const now = performance.now();
        if (video.readyState >= 2) {
          // Detect only when the webcam delivered a new frame; reuse the last hands otherwise.
          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            try {
              lastHandsRef.current = tracker.detect(video, now);
            } catch (error) {
              console.warn("[PinchPop] Hand detection failed for a frame:", error);
            }
          }
          const hands = lastHandsRef.current;
          const events = engine.update(
            { hands, now, width: canvas.width, height: canvas.height },
            Math.random,
          );
          handleEvents(events, now);
          if (!runningRef.current) return;
          renderScene(ctx, {
            video,
            hands,
            view: engine.view(),
            assets: assetsRef.current,
            now,
            flashAt: flashAtRef.current,
            solvedAt: solvedAtRef.current,
            shatter: shatterRef.current,
          });
          syncUi();
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } catch (error) {
      console.warn("[PinchPop] Camera mode failed to start:", error);
      teardown();
      setUi((prev) => ({ ...prev, stage: "error", error: describeCameraError(error) }));
    }
  }, [engine, handleEvents, sound, syncUi, teardown]);

  const stop = useCallback(() => {
    teardown();
    engine.reset();
    uiKeyRef.current = "";
    setUi((prev) => ({ ...INITIAL, soundOn: prev.soundOn }));
  }, [engine, teardown]);

  const snapNow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = engine.view().frameBox ?? defaultFrame(canvas.width, canvas.height);
    engine.requestCapture(box, performance.now());
  }, [engine]);

  const reset = useCallback(() => {
    recorderRef.current?.discard();
    recorderRef.current = null;
    engine.reset();
    assetsRef.current = null;
    flashAtRef.current = null;
    solvedAtRef.current = null;
  }, [engine]);

  const save = useCallback(() => {
    if (engine.requestSave()) finishSave();
  }, [engine, finishSave]);

  const toggleSound = useCallback(() => {
    sound.setEnabled(!sound.isEnabled());
    setUi((prev) => ({ ...prev, soundOn: sound.isEnabled() }));
  }, [sound]);

  // Mouse and touch drag the puzzle pieces too, for players without hands-free room or lighting.
  const toCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const pointerHandlers = {
    onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (engine.view().phase !== "puzzle") return;
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerDownRef.current = true;
      const now = performance.now();
      handleEvents(engine.pointer(true, toCanvasPoint(event), now, Math.random), now);
    },
    onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!pointerDownRef.current) return;
      const now = performance.now();
      handleEvents(engine.pointer(true, toCanvasPoint(event), now, Math.random), now);
    },
    onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      const now = performance.now();
      handleEvents(engine.pointer(false, toCanvasPoint(event), now, Math.random), now);
    },
  };

  return {
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
  };
}
