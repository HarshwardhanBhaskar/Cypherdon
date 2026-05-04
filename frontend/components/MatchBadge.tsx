"use client";

import React from "react";

interface MatchBadgeProps {
  score: number;
  size?: number;
}

/**
 * Circular SVG ring that visualizes job match percentage.
 * Color transitions from red → amber → green based on score.
 */
export default function MatchBadge({ score, size = 64 }: MatchBadgeProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return "#10b981"; // green
    if (s >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const color = getColor(score);

  return (
    <div className="match-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span
        className="absolute text-xs font-bold font-mono"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}
