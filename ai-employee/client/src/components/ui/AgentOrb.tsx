"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Mic, Sparkles, Volume2 } from "lucide-react";

export type AgentOrbState = "idle" | "working" | "listening" | "speaking";

interface AgentOrbProps {
  state?: AgentOrbState;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  showLabel?: boolean;
}

export function AgentOrb({
  state = "idle",
  size = "sm",
  onClick,
  className = "",
  showLabel = false,
}: AgentOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  const dimensions = {
    sm: { container: "w-8 h-8", icon: "w-4 h-4", rings: 32 },
    md: { container: "w-12 h-12", icon: "w-6 h-6", rings: 48 },
    lg: { container: "w-32 h-32 sm:w-36 sm:h-36", icon: "w-12 h-12 sm:w-14 sm:h-14", rings: 140 },
  }[size];

  const stateLabels: Record<AgentOrbState, string> = {
    idle: "AI Standing By",
    working: "AI Processing...",
    listening: "AI Listening...",
    speaking: "AI Speaking...",
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`AI Agent: ${stateLabels[state]}`}
      title={stateLabels[state]}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? "cursor-pointer group" : ""
      } ${className}`}
    >
      {/* Outer Ripple Rings for "listening" or "speaking" */}
      {state === "listening" && !shouldReduceMotion && (
        <>
          <motion.span
            className="absolute rounded-full border border-teal/40 bg-teal/10"
            initial={{ width: "100%", height: "100%", opacity: 0.8 }}
            animate={{ width: "180%", height: "180%", opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute rounded-full border border-skyblue/50 bg-skyblue/10"
            initial={{ width: "100%", height: "100%", opacity: 0.6 }}
            animate={{ width: "230%", height: "230%", opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.6, ease: "easeOut" }}
          />
        </>
      )}

      {state === "speaking" && !shouldReduceMotion && (
        <motion.span
          className="absolute rounded-full bg-teal/20 blur-md"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "130%", height: "130%" }}
        />
      )}

      {/* Spinning Halo when "working" */}
      {state === "working" && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-[-4px] rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, var(--palette-teal) 50%, var(--palette-skyblue) 100%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Core Orb Body */}
      <motion.div
        className={`${dimensions.container} rounded-full relative flex items-center justify-center shadow-card overflow-hidden`}
        style={{
          background:
            state === "idle"
              ? "radial-gradient(circle at 35% 35%, var(--palette-teal-light) 0%, var(--palette-teal) 70%, var(--palette-navy) 100%)"
              : state === "working"
              ? "radial-gradient(circle at 35% 35%, var(--palette-skyblue) 0%, var(--palette-teal) 60%, var(--palette-navy) 100%)"
              : state === "listening"
              ? "radial-gradient(circle at 35% 35%, #6EE7B7 0%, var(--palette-teal) 65%, var(--palette-navy) 100%)"
              : "radial-gradient(circle at 35% 35%, var(--palette-skyblue-bright) 0%, var(--palette-teal) 60%, var(--palette-navy) 100%)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : state === "idle"
            ? {
                scale: [1, 1.04, 1],
                boxShadow: [
                  "0 0 10px -2px rgba(86, 124, 141, 0.3)",
                  "0 0 20px 2px rgba(86, 124, 141, 0.55)",
                  "0 0 10px -2px rgba(86, 124, 141, 0.3)",
                ],
              }
            : state === "working"
            ? {
                scale: [1, 1.02, 1],
              }
            : state === "listening"
            ? {
                scale: [1, 1.08, 0.98, 1],
              }
            : {
                scale: [1, 1.06, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: state === "idle" ? 3 : 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        {/* Glass reflection highlight on top-left of orb */}
        <div className="absolute top-1 left-1.5 w-1/3 h-1/3 rounded-full bg-white/35 blur-[1px] pointer-events-none" />

        {/* Center icon */}
        <div className="text-white drop-shadow-sm flex items-center justify-center z-10">
          {state === "idle" && <Bot className={dimensions.icon} />}
          {state === "working" && <Sparkles className={`${dimensions.icon} animate-pulse`} />}
          {state === "listening" && <Mic className={dimensions.icon} />}
          {state === "speaking" && <Volume2 className={dimensions.icon} />}
        </div>
      </motion.div>

      {/* Optional Side Label */}
      {showLabel && (
        <span className="ml-2 text-xs font-bold text-primary-text hidden sm:inline">
          {stateLabels[state]}
        </span>
      )}
    </div>
  );
}

