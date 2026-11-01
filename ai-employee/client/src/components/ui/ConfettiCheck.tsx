"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

interface ConfettiCheckProps {
  show: boolean;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export function ConfettiCheck({
  show,
  onComplete,
  title = "Saved Successfully!",
  subtitle = "Stock and business ledger updated",
  duration = 2200,
}: ConfettiCheckProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  // Generate 20 confetti particles around the center
  const colors = [
    "var(--palette-teal)",
    "var(--palette-skyblue)",
    "var(--palette-success)",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
  ];

  const particles: Particle[] = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * 360;
    const distance = 55 + (i % 4) * 20;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      color: colors[i % colors.length],
      size: 6 + (i % 3) * 3,
      rotation: Math.random() * 360,
    };
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/40 backdrop-blur-xs select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="app-card rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl flex flex-col items-center bg-card border-card-border"
            initial={shouldReduceMotion ? false : { scale: 0.85, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
          >
            {/* Center Check Circle Container */}
            <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
              {/* Confetti particles bursting out */}
              {!shouldReduceMotion &&
                particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute rounded-sm pointer-events-none"
                    style={{
                      backgroundColor: p.color,
                      width: p.size,
                      height: p.size,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: [1, 1, 0],
                      scale: [0, 1.2, 0.6],
                      rotate: p.rotation,
                    }}
                    transition={{
                      duration: 0.75,
                      ease: "easeOut",
                      delay: 0.05,
                    }}
                  />
                ))}

              {/* Success Badge / Circle */}
              <motion.div
                className="w-16 h-16 rounded-full bg-success flex items-center justify-center text-white shadow-lg relative z-10"
                initial={shouldReduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <motion.div
                  initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <Check className="w-9 h-9 stroke-[3.5]" />
                </motion.div>
              </motion.div>
            </div>

            <h3 className="text-lg font-black text-primary-text tracking-tight">{title}</h3>
            <p className="text-xs text-secondary-text font-medium mt-1">{subtitle}</p>

            <div className="mt-4 pt-3 border-t border-card-border w-full flex justify-center">
              <span className="text-[11px] font-bold text-teal dark:text-skyblue flex items-center space-x-1">
                <span>AI Automated Sync Complete</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

