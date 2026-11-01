"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`app-card rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-card-border/80 ${className}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="w-14 h-14 rounded-2xl bg-teal/15 text-teal dark:text-skyblue flex items-center justify-center mb-3 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-bold text-primary-text">{title}</h3>
      <p className="text-xs text-secondary-text font-medium max-w-sm mt-1 mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

