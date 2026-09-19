interface ChakraProps {
  spokes?: number;
  className?: string;
}

/** The spoked wheel: an Ashoka Chakra and a camera aperture at once. Drawn in currentColor. */
export function ChakraShapes({ spokes = 24 }: { spokes?: number }) {
  return (
    <>
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" fill="none" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (i * 2 * Math.PI) / spokes;
        return (
          <line
            key={i}
            x1={50 + 11 * Math.cos(angle)}
            y1={50 + 11 * Math.sin(angle)}
            x2={50 + 43 * Math.cos(angle)}
            y2={50 + 43 * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

export function Chakra({ spokes = 24, className }: ChakraProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <ChakraShapes spokes={spokes} />
    </svg>
  );
}
