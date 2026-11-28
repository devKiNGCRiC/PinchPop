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

/**
 * The best format this browser can record, or undefined if it cannot record at all. MP4 first:
 * Instagram, X and most phones take it directly, while WebM usually needs converting.
 */
export function pickMimeType(withAudio: boolean): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = withAudio
    ? [
        "video/mp4;codecs=avc1.42E01F,mp4a.40.2",
        "video/mp4;codecs=avc1,mp4a",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ]
    : ["video/mp4;codecs=avc1.42E01F", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/** "mp4" or "webm", for the downloaded file's name. */
export function recordingExtension(mimeType: string): string {
  return mimeType.startsWith("video/mp4") ? "mp4" : "webm";
}

export interface CanvasRecorder {
  /** Stops recording and returns the finished video, or null if nothing was captured. */
  stop(): Promise<Blob | null>;
  /** Stops recording and throws the footage away. */
  discard(): void;
}

/**
 * Starts recording a canvas (the live camera view, pieces and all), plus the game's sounds when
 * given an audio stream. Free and entirely in the browser.
 */
export function startCanvasRecording(
  canvas: HTMLCanvasElement,
  audio: MediaStream | null = null,
): CanvasRecorder | null {
  const audioTracks = audio?.getAudioTracks() ?? [];
  const mimeType = pickMimeType(audioTracks.length > 0);
  if (!mimeType || typeof canvas.captureStream !== "function") return null;

  try {
    const video = canvas.captureStream(30);
    const stream = new MediaStream([...video.getVideoTracks(), ...audioTracks]);
    // A high bitrate so the clip still looks sharp after social apps re-compress it.
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: 128_000,
    });
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
          // Only the canvas track: the audio track is shared and reused by the next recording.
          video.getTracks().forEach((track) => track.stop());
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
