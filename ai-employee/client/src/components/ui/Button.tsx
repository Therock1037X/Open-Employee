"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      icon,
      isLoading,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-xl",
      md: "px-4 py-2.5 text-sm rounded-xl",
      lg: "px-6 py-3.5 text-base rounded-2xl",
    }[size];

    const variantStyles = {
      primary:
        "bg-accent text-surface font-bold hover:shadow-gold-glow hover:-translate-y-0.5 active:scale-[0.97]",
      secondary:
        "bg-surface text-text-primary border border-white/[0.08] hover:border-accent/40 hover:-translate-y-0.5 active:scale-[0.97]",
      outline:
        "bg-transparent text-accent border border-accent hover:bg-accent/10 active:scale-[0.97]",
      danger:
        "bg-error/20 text-error border border-error/30 hover:bg-error/30 active:scale-[0.97]",
      success:
        "bg-success/20 text-success border border-success/30 hover:bg-success/30 active:scale-[0.97]",
      ghost:
        "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface/60",
    }[variant];

    const motionProps = shouldReduceMotion
      ? {}
      : {
          whileHover: disabled || isLoading ? {} : { y: -2 },
          whileTap: disabled || isLoading ? {} : { scale: 0.97 },
          transition: { type: "spring", stiffness: 400, damping: 25 },
        };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        {...motionProps}
        className={`inline-flex items-center justify-center font-medium transition-colors select-none ${sizeStyles} ${variantStyles} ${
          disabled || isLoading ? "opacity-50 cursor-not-allowed transform-none" : "cursor-pointer"
        } ${className}`}
        {...(props as any)}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {!isLoading && icon && <span className="mr-2 inline-flex">{icon}</span>}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
