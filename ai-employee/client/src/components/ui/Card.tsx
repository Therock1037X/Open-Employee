"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  animateIndex?: number;
}

export function Card({
  children,
  className = "",
  hoverEffect = false,
  animateIndex = 0,
  ...props
}: CardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const motionProps =
    !mounted || shouldReduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.25,
            ease: "easeOut",
            delay: animateIndex * 0.05,
          },
        };

  return (
    <motion.div
      {...motionProps}
      className={`app-card rounded-2xl p-6 ${
        hoverEffect ? "app-card-hover" : ""
      } ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
