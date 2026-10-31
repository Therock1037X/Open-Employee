"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "gold";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const toast = useCallback((message: string, type: ToastType = "gold") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Auto-dismiss after 4s
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-error shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-accent shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-success/30";
      case "error":
        return "border-error/30";
      default:
        return "border-accent/40 shadow-gold-glow";
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container Top-Right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, y: -8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl bg-surface border ${getBorderColor(
                t.type
              )} shadow-2xl max-w-sm`}
            >
              {getIcon(t.type)}
              <span className="text-xs text-text-primary font-medium">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
