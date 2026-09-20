import { Art } from "@/components/Art";
import type { Memory } from "@/lib/memories";

interface MemoryImageProps {
  memory: Memory;
  className?: string;
}

/** A run's picture: the camera photo if it has one, otherwise its destination illustration. */
export function MemoryImage({ memory, className }: MemoryImageProps) {
  if (memory.photo) {
    return (
      <img
        src={memory.photo}
        alt=""
        aria-hidden="true"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  return <Art artId={memory.artId} decorative className={className} />;
}
