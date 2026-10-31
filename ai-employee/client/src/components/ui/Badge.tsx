"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "navy" | "success" | "error" | "neutral";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "gold",
  size = "md",
  className = "",
  dot = false,
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  const variantStyles = {
    gold: "bg-accent/15 text-accent border border-accent/30 font-semibold",
    navy: "bg-surface text-text-primary border border-white/[0.08]",
    success: "bg-success/15 text-success border border-success/30 font-semibold",
    error: "bg-error/15 text-error border border-error/30 font-semibold",
    neutral: "bg-white/[0.05] text-text-muted border border-white/[0.08]",
  }[variant];

  const dotColors = {
    gold: "bg-accent",
    navy: "bg-white",
    success: "bg-success",
    error: "bg-error",
    neutral: "bg-text-muted",
  }[variant];

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
}
