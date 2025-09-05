import React from "react";

// Template for creating icon components
// Replace the SVG content with your actual icon paths

export const IconTemplate: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ className = "", size = 24, color = "currentColor" }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Replace this path with your actual icon SVG path */}
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Example usage:
// <IconTemplate size={32} color="#FF6B6B" className="hover:scale-110" />
