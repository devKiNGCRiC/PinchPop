import { useSyncExternalStore } from "react";

/** A replay of one camera-mode puzzle. It lives in memory only, so it is gone when the tab closes. */
export interface Recording {
  memoryId: string;
  blob: Blob;
  mimeType: string;
}

let current: Recording | null = null;
const listeners = new Set<() => void>();

function emit(next: Recording | null): void {
  current = next;
  listeners.forEach((listener) => listener());
}

export function setRecording(recording: Recording): void {
  emit(recording);
}

export function clearRecording(): void {
  if (current) emit(null);
}

export function useRecording(): Recording | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => null,
  );
}

/** The best WebM flavour this browser can record, or undefined if it cannot record at all. */
export function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

export interface CanvasRecorder {
  /** Stops recording and returns the finished video, or null if nothing was captured. */
  stop(): Promise<Blob | null>;
  /** Stops recording and throws the footage away. */
  discard(): void;
}

/** Starts recording a canvas (the live camera view, pieces and all) to WebM. Free and in-browser. */
export function startCanvasRecording(canvas: HTMLCanvasElement): CanvasRecorder | null {
  const mimeType = pickMimeType();
  if (!mimeType || typeof canvas.captureStream !== "function") return null;

  try {
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.start(1000);

    const finish = (): Promise<Blob | null> =>
      new Promise((resolve) => {
        if (recorder.state === "inactive") {
          resolve(chunks.length ? new Blob(chunks, { type: mimeType }) : null);
          return;
        }
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          resolve(chunks.length ? new Blob(chunks, { type: mimeType }) : null);
        };
        recorder.stop();
      });

    return {
      stop: finish,
      discard() {
        chunks.length = 0;
        void finish();
      },
    };
  } catch (error) {
    console.warn("[PinchPop] Could not start recording:", error);
    return null;
  }
}
