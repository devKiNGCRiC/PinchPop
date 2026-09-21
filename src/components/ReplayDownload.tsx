import { Clapperboard } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { downloadBlob } from "@/lib/export";
import { useRecording } from "@/lib/recording";

interface ReplayDownloadProps {
  memoryId: string;
}

/** Download the WebM replay of the puzzle just solved (GAME-08). Only exists for this tab session. */
export function ReplayDownload({ memoryId }: ReplayDownloadProps) {
  const recording = useRecording();
  if (!recording || recording.memoryId !== memoryId) return null;
  const sizeMb = Math.max(0.1, recording.blob.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="mt-2">
      <PopButton
        tone="white"
        onClick={() => downloadBlob(recording.blob, `pinchpop-replay-${memoryId}.webm`)}
      >
        <Clapperboard className="size-5" aria-hidden="true" />
        Download replay ({sizeMb} MB)
      </PopButton>
      <p className="mt-2 max-w-md text-sm text-ink-soft">
        A video of you solving it. It is only kept until you close or refresh this tab.
      </p>
    </div>
  );
}
