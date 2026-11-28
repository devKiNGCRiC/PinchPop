import { Clapperboard } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { downloadBlob } from "@/lib/export";
import { recordingExtension, useRecording } from "@/lib/recording";

interface ReplayDownloadProps {
  memoryId: string;
}

/** Download the video of the camera run just finished (GAME-08): framing, countdown, puzzle and
 * solve, with sound. Only exists for this tab session. */
export function ReplayDownload({ memoryId }: ReplayDownloadProps) {
  const recording = useRecording();
  if (!recording || recording.memoryId !== memoryId) return null;
  const sizeMb = Math.max(0.1, recording.blob.size / (1024 * 1024)).toFixed(1);
  const ext = recordingExtension(recording.mimeType);

  return (
    <div className="mt-2">
      <PopButton
        tone="white"
        onClick={() => downloadBlob(recording.blob, `pinchpop-${memoryId}.${ext}`)}
      >
        <Clapperboard className="size-5" aria-hidden="true" />
        Download video ({ext.toUpperCase()}, {sizeMb} MB)
      </PopButton>
      <p className="mt-2 max-w-md text-sm text-ink-soft">
        Your whole run with sound, from framing the shot to the solve.{" "}
        {ext === "mp4"
          ? "Ready to post on Instagram, X or WhatsApp."
          : "Your browser saves WebM; most editors and some apps take it directly."}{" "}
        It is only kept until you close or refresh this tab.
      </p>
    </div>
  );
}
