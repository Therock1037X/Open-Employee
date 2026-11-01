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
      sm: "px-3.5 py-1.5 text-xs rounded-xl",
      md: "px-5 py-2.5 text-sm rounded-xl font-bold",
      lg: "px-6 py-3.5 text-base rounded-xl font-bold",
    }[size];

    const variantStyles = {
      // Primary: Teal with crisp white text
      primary:
        "bg-teal text-white font-bold hover:opacity-95 shadow-xs disabled:bg-card-border/70 disabled:text-secondary-text disabled:border disabled:border-card-border disabled:opacity-80",
      // Secondary: Card background, primary text, thin border, hover subtle highlight
      secondary:
        "bg-card text-primary-text border border-card-border font-semibold hover:bg-highlight/40 dark:hover:bg-teal/20",
      // Outline: Teal border and text
      outline:
        "bg-transparent text-teal dark:text-skyblue border border-teal dark:border-skyblue font-semibold hover:bg-teal/10",
      // Danger: Red
      danger:
        "bg-error/15 text-error border border-error/30 font-bold hover:bg-error/25",
      // Success: Green
      success:
        "bg-success/15 text-success border border-success/30 font-bold hover:bg-success/25",
      // Ghost
      ghost:
        "bg-transparent text-secondary-text hover:text-primary-text hover:bg-highlight/30 dark:hover:bg-teal/20 font-semibold",
    }[variant];

    const motionProps = shouldReduceMotion
      ? {}
      : {
          whileHover: disabled || isLoading ? {} : { y: -1 },
          whileTap: disabled || isLoading ? {} : { scale: 0.98 },
          transition: { type: "spring", stiffness: 450, damping: 25 },
        };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        {...motionProps}
        className={`inline-flex items-center justify-center transition-colors select-none ${sizeStyles} ${variantStyles} ${
          disabled || isLoading ? "cursor-not-allowed transform-none" : "cursor-pointer"
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
        {!isLoading && icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
