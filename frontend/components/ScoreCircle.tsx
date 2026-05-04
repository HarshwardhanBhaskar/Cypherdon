"use client";

import React from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/**
 * Animated circular progress ring for ATS scores and match percentages.
 * Color transitions: red < 40, amber 40-69, green 70+
 */
export default function ScoreCircle({
  score,
  size = 120,
  strokeWidth = 8,
  label = "ATS Score",
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { main: "#10b981", glow: "rgba(16,185,129,0.2)" };
    if (s >= 40) return { main: "#f59e0b", glow: "rgba(245,158,11,0.2)" };
    return { main: "#ef4444", glow: "rgba(239,68,68,0.2)" };
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.main}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s ease-out, stroke 0.5s ease",
              filter: `drop-shadow(0 0 6px ${color.glow})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold font-mono"
            style={{ color: color.main }}
          >
            {score}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}
