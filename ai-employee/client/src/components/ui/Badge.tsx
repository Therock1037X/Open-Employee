"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "teal" | "gold" | "navy" | "skyblue" | "success" | "error" | "neutral";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "teal",
  size = "md",
  className = "",
  dot = false,
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  const resolvedVariant = variant === "gold" ? "teal" : variant;

  const variantStyles = {
    teal: "bg-teal/15 text-teal-dark dark:text-skyblue border border-teal/40 font-bold",
    navy: "bg-navy/10 text-navy dark:bg-white/15 dark:text-white border border-navy/30 dark:border-white/25 font-bold",
    skyblue: "bg-skyblue/40 text-navy dark:bg-skyblue/20 dark:text-skyblue border border-skyblue/60 font-bold",
    success: "bg-success/15 text-emerald-700 dark:text-emerald-300 border border-success/35 font-bold",
    error: "bg-error/15 text-red-700 dark:text-red-300 border border-error/35 font-bold",
    neutral: "bg-page text-primary-text border border-card-border font-bold",
  }[resolvedVariant];

  const dotColors = {
    teal: "bg-teal dark:bg-skyblue",
    navy: "bg-navy dark:bg-white",
    skyblue: "bg-teal dark:bg-skyblue",
    success: "bg-success",
    error: "bg-error",
    neutral: "bg-secondary-text",
  }[resolvedVariant];

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
}
