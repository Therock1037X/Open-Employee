"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock, Loader2, XCircle } from "lucide-react";

export type TaskTimelineStatus = "planned" | "approved" | "executing" | "done" | "rejected" | "failed";

export interface TimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending" | "rejected";
  timestamp?: string;
  detail?: string;
}

interface TimelineProps {
  currentStage: TaskTimelineStatus;
  className?: string;
  steps?: TimelineStep[];
  compact?: boolean;
}

const DEFAULT_STAGES: { id: TaskTimelineStatus; label: string }[] = [
  { id: "planned", label: "Planned" },
  { id: "approved", label: "Approved" },
  { id: "executing", label: "Executing" },
  { id: "done", label: "Done" },
];

export function Timeline({
  currentStage,
  className = "",
  steps,
  compact = false,
}: TimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  const stageOrder: Record<TaskTimelineStatus, number> = {
    planned: 1,
    approved: 2,
    executing: 3,
    done: 4,
    rejected: 2,
    failed: 3,
  };

  const currentIndex = stageOrder[currentStage] || 1;

  const resolvedSteps: TimelineStep[] =
    steps ||
    DEFAULT_STAGES.map((s, idx) => {
      const stepIdx = idx + 1;
      let status: TimelineStep["status"] = "pending";

      if (currentStage === "rejected" && s.id === "approved") {
        status = "rejected";
      } else if (stepIdx < currentIndex || currentStage === "done") {
        status = "completed";
      } else if (stepIdx === currentIndex) {
        status = "current";
      } else {
        status = "pending";
      }

      return {
        id: s.id,
        label: s.label,
        status,
      };
    });

  return (
    <div className={`w-full select-none ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line behind circles */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-card-border z-0" />

        {/* Dynamic active line progress */}
        <motion.div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-[2px] bg-teal z-0"
          initial={false}
          animate={{
            width: `${Math.max(
              0,
              Math.min(100, ((currentIndex - 1) / (resolvedSteps.length - 1)) * 100)
            )}%`,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />

        {resolvedSteps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";
          const isRejected = step.status === "rejected";

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              {/* Node Circle */}
              <motion.div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-teal text-white border-teal shadow-xs"
                    : isCurrent
                    ? "bg-card text-teal border-teal ring-4 ring-teal/20"
                    : isRejected
                    ? "bg-error/15 text-error border-error ring-4 ring-error/20"
                    : "bg-card text-secondary-text border-card-border"
                }`}
                initial={shouldReduceMotion ? false : { scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.08 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={shouldReduceMotion ? false : { scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  </motion.div>
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : isRejected ? (
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Clock className="w-3 h-3 text-secondary-text/70" />
                )}
              </motion.div>

              {/* Label */}
              {!compact && (
                <div className="mt-1.5 text-center">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block ${
                      isCurrent || isCompleted
                        ? "text-primary-text"
                        : "text-secondary-text"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] text-secondary-text block font-mono">
                      {step.timestamp}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

