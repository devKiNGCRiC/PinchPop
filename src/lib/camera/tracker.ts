import type { Hand } from "@/lib/camera/types";

// MediaPipe Hand Landmarker: free, open source (Apache-2.0) and it runs entirely in the browser,
// so there is no server to pay for. The WASM runtime comes from the jsDelivr CDN and the model file
// from Google's public MediaPipe bucket. Keep MEDIAPIPE_VERSION equal to the installed package.
const MEDIAPIPE_VERSION = "1.0.1";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const LOAD_TIMEOUT_MS = 25000;

export interface Tracker {
  /** Detect hands in the current video frame. `nowMs` must increase on every call. */
  detect(video: HTMLVideoElement, nowMs: number): Hand[];
  close(): void;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

/** Loads the hand tracker, preferring the GPU and falling back to the CPU. */
export async function loadTracker(onStage?: (text: string) => void): Promise<Tracker> {
  onStage?.("Loading the hand tracker…");
  const { FilesetResolver, HandLandmarker } = await withTimeout(
    import("@mediapipe/tasks-vision"),
    LOAD_TIMEOUT_MS,
    "Timed out loading the hand tracker code. Check your internet connection.",
  );
  const vision = await withTimeout(
    FilesetResolver.forVisionTasks(WASM_URL),
    LOAD_TIMEOUT_MS,
    "Timed out loading the hand tracking runtime. Check your internet connection.",
  );

  onStage?.("Downloading the hand model (about 8 MB, only the first time)…");
  const create = (delegate: "GPU" | "CPU") =>
    withTimeout(
      HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6,
      }),
      LOAD_TIMEOUT_MS,
      "Timed out downloading the hand model. Check your internet connection.",
    );

  let landmarker;
  try {
    landmarker = await create("GPU");
  } catch (gpuError) {
    console.warn("[PinchPop] GPU hand tracking failed, retrying on the CPU:", gpuError);
    onStage?.("Switching to the CPU…");
    landmarker = await create("CPU");
  }

  const tracker = landmarker;
  return {
    detect(video, nowMs) {
      const result = tracker.detectForVideo(video, nowMs);
      return result.landmarks.map((hand) => hand.map((p) => ({ x: p.x, y: p.y })));
    },
    close() {
      tracker.close();
    },
  };
}
