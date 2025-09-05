import React from "react";

export const SoundIcon: React.FC<{
  className?: string;
  size?: number;
  color?: string;
  isMuted?: boolean;
}> = ({
  className = "",
  size = 24,
  color = "currentColor",
  isMuted = false,
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Speaker icon - replace with your actual icon path */}
      <path
        d="M11 5L6 9H2v6h4l5 4V5z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sound waves - replace with your actual icon path */}
      <path
        d="M15.54 8.46a5 5 0 0 1 0 7.07"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.07 4.93a10 10 0 0 1 0 14.14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mute line if sound is muted */}
      {isMuted && (
        <line
          x1="1"
          y1="23"
          x2="23"
          y2="1"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

// Usage example:
// <SoundIcon size={32} color="#374151" isMuted={false} />
