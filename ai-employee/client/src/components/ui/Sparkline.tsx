"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "green" | "red" | "teal";
  className?: string;
}

export function Sparkline({
  data,
  width = 72,
  height = 24,
  color = "green",
  className = "",
}: SparklineProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * innerWidth;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  const strokeColors = {
    green: "var(--palette-success)",
    red: "var(--palette-error)",
    teal: "var(--palette-teal)",
  };

  const fillColors = {
    green: "rgba(16, 185, 129, 0.18)",
    red: "rgba(239, 68, 68, 0.18)",
    teal: "rgba(86, 124, 141, 0.18)",
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible select-none ${className}`}
      aria-hidden="true"
    >
      <path d={areaD} fill={fillColors[color]} />
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColors[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}

