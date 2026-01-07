"use client";

interface GoldenHarborCrestProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Minimal geometric anchor mark.
 * Swiss design principles: single concept, stroke-based, scales from 16px to 320px.
 */
export const GoldenHarborCrest = ({
  size = 48,
  className = "",
  color = "#DAA520",
}: GoldenHarborCrestProps) => {
  // Stroke width scales with size for consistent visual weight
  const strokeWidth = Math.max(2, size / 20);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ring at top */}
      <circle cx="24" cy="10" r="5" />

      {/* Vertical shaft */}
      <line x1="24" y1="15" x2="24" y2="40" />

      {/* Crossbar */}
      <line x1="16" y1="24" x2="32" y2="24" />

      {/* Curved arms at bottom */}
      <path d="M10 36 Q17 42 24 38 Q31 42 38 36" />
    </svg>
  );
};

export default GoldenHarborCrest;
