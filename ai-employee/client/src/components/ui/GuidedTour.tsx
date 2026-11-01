"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mic, PackageCheck, ShieldCheck, PhoneCall, ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { Button } from "./Button";

interface TourStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string;
  tip: string;
}

interface GuidedTourProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

const STEPS: TourStep[] = [
  {
    title: "1. Quick Voice & Text Entry",
    subtitle: "Speak or type naturally in Hindi, Marathi, Hinglish or English",
    icon: <Mic className="w-6 h-6 text-teal dark:text-skyblue" />,
    content:
      "Simply say '2 kg sugar becha Ramesh ko 90 rs' or '5 packet biscuit vikla 50 rs'. Our fine-tuned AI extracts the product, quantity, unit, amount, and customer automatically.",
    tip: "Click the glowing mic orb anytime or press Ctrl+K to open quick entry.",
  },
  {
    title: "2. Real-Time Stock & Inventory",
    subtitle: "Automatic stock deduction & smart low-stock detection",
    icon: <PackageCheck className="w-6 h-6 text-teal dark:text-skyblue" />,
    content:
      "Every sale or purchase immediately adjusts your live inventory. When stock dips below your reorder levels, the AI drafts purchase orders and supplier alerts for you.",
    tip: "View real-time alerts on the top dashboard KPI cards.",
  },
  {
    title: "3. Human Approval Gate",
    subtitle: "Complete control before any money moves or calls are made",
    icon: <ShieldCheck className="w-6 h-6 text-teal dark:text-skyblue" />,
    content:
      "Open Employee never spends money or calls outside without your permission. Pending actions appear in the sliding Approval Gate where you can Approve or Reject with one tap.",
    tip: "Audit logs record every single agent proposal and user approval permanently.",
  },
  {
    title: "4. Voice Calls & Telephony",
    subtitle: "Bhashini Indian voice pipeline + Exotel telephony",
    icon: <PhoneCall className="w-6 h-6 text-teal dark:text-skyblue" />,
    content:
      "Place automated supplier confirmation calls or customer reminders. Watch the live voice orb and word-by-word streaming transcripts in real-time.",
    tip: "Explore the live voice simulator in the Agent tab.",
  },
];

export function GuidedTour({ isOpen, onClose, forceOpen = false }: GuidedTourProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setShowModal(true);
      setCurrentStep(0);
      return;
    }
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("openemployee_tour_completed");
      if (!completed && isOpen !== false) {
        setShowModal(true);
      } else if (isOpen) {
        setShowModal(true);
      }
    }
  }, [isOpen, forceOpen]);

  const handleClose = () => {
    setShowModal(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("openemployee_tour_completed", "true");
    }
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!showModal) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/50 backdrop-blur-xs select-none">
        <motion.div
          className="app-card rounded-2xl max-w-lg w-full bg-card border border-card-border shadow-2xl overflow-hidden relative flex flex-col"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-card-border">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal/15 text-teal dark:text-skyblue">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal dark:text-skyblue">
                Quick Guided Tour ({currentStep + 1} of {STEPS.length})
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-highlight/40 transition-colors"
              title="Close tour"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal/15 text-teal dark:text-skyblue flex items-center justify-center shrink-0 border border-teal/25">
                {step.icon}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-primary-text leading-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-secondary-text font-medium mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-primary-text/90 font-medium leading-relaxed bg-page/60 p-4 rounded-xl border border-card-border">
              {step.content}
            </p>

            <div className="p-3 rounded-xl bg-teal/10 border border-teal/25 flex items-start space-x-2 text-xs">
              <span className="font-bold text-teal dark:text-skyblue">Pro-Tip:</span>
              <span className="text-primary-text font-medium">{step.tip}</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-card-border bg-page/40">
            {/* Step Dots */}
            <div className="flex items-center space-x-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? "w-6 bg-teal"
                      : "w-2 bg-card-border hover:bg-teal/40"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <Button variant="secondary" size="sm" onClick={handlePrev} icon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                icon={currentStep === STEPS.length - 1 ? undefined : <ChevronRight className="w-4 h-4" />}
              >
                {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

