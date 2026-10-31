"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animateIndex?: number;
  goldBorderPulse?: boolean;
}

export function Card({
  children,
  className = "",
  hoverEffect = false,
  animateIndex = 0,
  goldBorderPulse = false,
  ...props
}: CardProps) {
  const shouldReduceMotion = useReducedMotion();

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const motionProps =
    !isClient || shouldReduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.3,
            ease: "easeOut",
            delay: animateIndex * 0.06,
          },
        };

  return (
    <motion.div
      {...motionProps}
      className={`bg-surface border ${
        goldBorderPulse
          ? "border-accent/60 shadow-gold-glow animate-pulse-gold"
          : "border-white/[0.08]"
      } rounded-2xl p-6 ${
        hoverEffect
          ? "hover:border-accent/30 hover:shadow-[0_10px_30px_-10px_rgba(252,163,17,0.15)] transition-all duration-200"
          : ""
      } ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
