export type CameraErrorKind =
  "denied" | "not-found" | "in-use" | "unsupported" | "load" | "unknown";

export interface CameraError {
  kind: CameraErrorKind;
  message: string;
}

/** Turns a getUserMedia or model-loading failure into a message a player can act on. */
export function describeCameraError(error: unknown): CameraError {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      kind: "denied",
      message:
        "Camera permission was blocked. Allow the camera for this site in your browser settings, then try again.",
    };
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return { kind: "not-found", message: "No camera was found. Plug in a webcam and try again." };
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return {
      kind: "in-use",
      message: "Your camera is busy. Close other apps or tabs that use it, then try again.",
    };
  }
  if (error instanceof Error && /timed out|network|fetch|load/i.test(error.message)) {
    return { kind: "load", message: error.message };
  }
  if (error instanceof Error && error.message) {
    return { kind: "unknown", message: error.message };
  }
  return { kind: "unknown", message: "Something went wrong starting camera mode." };
}

export function cameraSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/** Opens the front camera. Needs a secure context (https or localhost) and a user gesture. */
export async function openCamera(): Promise<MediaStream> {
  if (!cameraSupported()) {
    throw Object.assign(new Error("This browser cannot open a camera here."), {
      name: "UnsupportedError",
    });
  }
  return navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
    audio: false,
  });
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
