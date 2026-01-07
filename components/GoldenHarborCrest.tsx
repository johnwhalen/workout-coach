"use client";

interface GoldenHarborCrestProps {
  size?: number;
  className?: string;
}

export const GoldenHarborCrest = ({ size = 48, className = "" }: GoldenHarborCrestProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield background */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="harborBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
      </defs>

      {/* Shield shape */}
      <path
        d="M50 5 L90 20 L90 55 Q90 80 50 95 Q10 80 10 55 L10 20 Z"
        fill="url(#harborBlue)"
        stroke="url(#goldGradient)"
        strokeWidth="3"
      />

      {/* Inner gold border */}
      <path
        d="M50 12 L83 24 L83 53 Q83 74 50 87 Q17 74 17 53 L17 24 Z"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Harbor/anchor element */}
      <g transform="translate(50, 35)">
        {/* Anchor ring */}
        <circle cx="0" cy="-5" r="6" fill="none" stroke="url(#goldGradient)" strokeWidth="2" />
        {/* Anchor shaft */}
        <line x1="0" y1="1" x2="0" y2="25" stroke="url(#goldGradient)" strokeWidth="2.5" />
        {/* Anchor arms */}
        <path
          d="M-15 20 Q-8 25 0 22 Q8 25 15 20"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Crossbar */}
        <line x1="-10" y1="8" x2="10" y2="8" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Dumbbells flanking the anchor */}
      <g transform="translate(25, 48)">
        <rect x="-4" y="-8" width="8" height="16" rx="1" fill="url(#goldGradient)" opacity="0.8" />
        <rect x="-2" y="-5" width="4" height="10" rx="0.5" fill="#1e3a5f" />
      </g>
      <g transform="translate(75, 48)">
        <rect x="-4" y="-8" width="8" height="16" rx="1" fill="url(#goldGradient)" opacity="0.8" />
        <rect x="-2" y="-5" width="4" height="10" rx="0.5" fill="#1e3a5f" />
      </g>

      {/* "G" and "H" letters */}
      <text
        x="32"
        y="78"
        fontFamily="serif"
        fontSize="12"
        fontWeight="bold"
        fill="url(#goldGradient)"
      >
        G
      </text>
      <text
        x="60"
        y="78"
        fontFamily="serif"
        fontSize="12"
        fontWeight="bold"
        fill="url(#goldGradient)"
      >
        H
      </text>

      {/* Stars */}
      <polygon
        points="50,70 51,73 54,73 52,75 53,78 50,76 47,78 48,75 46,73 49,73"
        fill="url(#goldGradient)"
      />
    </svg>
  );
};

export default GoldenHarborCrest;
