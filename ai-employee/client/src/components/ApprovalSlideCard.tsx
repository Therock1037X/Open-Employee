"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShieldAlert, Check, X, AlertTriangle, ArrowRight } from "lucide-react";
import { api, ApprovalTask } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ApprovalSlideCardProps {
  onApprovalResolved?: () => void;
}

export function ApprovalSlideCard({ onApprovalResolved }: ApprovalSlideCardProps) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [approvals, setApprovals] = useState<ApprovalTask[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const data = await api.getApprovals();
      setApprovals(data.filter((a) => a.status === "pending"));
    } catch (err) {
      // Ignore background errors
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string, action: "approve" | "reject") => {
    setLoadingId(id);
    try {
      const decision = action === "approve" ? "approved" : "rejected";
      await api.resolveApproval(id, decision);
      toast(
        action === "approve"
          ? "Action approved & agent resumed execution"
          : "Action rejected by owner",
        action === "approve" ? "success" : "info"
      );
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      if (onApprovalResolved) onApprovalResolved();
    } catch (err) {
      toast("Failed to resolve approval", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const pendingItem = approvals[0];

  return (
    <AnimatePresence>
      {pendingItem && (
        <motion.div
          key={pendingItem.id}
          className="w-full select-none"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="app-card rounded-2xl p-4 sm:p-5 bg-card border-2 border-teal/50 shadow-card-hover relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Accent Bar */}
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-teal" />

            {/* Content Info */}
            <div className="flex items-start sm:items-center space-x-3.5 pl-2">
              <div className="w-10 h-10 rounded-xl bg-teal/15 text-teal dark:text-skyblue flex items-center justify-center shrink-0 border border-teal/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal text-white tracking-wide">
                    Human Approval Required
                  </span>
                  {pendingItem.amount && (
                    <span className="text-xs font-black text-primary-text font-mono bg-page px-2 py-0.5 rounded-md border border-card-border">
                      ₹{pendingItem.amount.toFixed(2)}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-primary-text mt-1">
                  {pendingItem.action}: {pendingItem.target}
                </h4>
                <p className="text-xs text-secondary-text font-medium mt-0.5">
                  {pendingItem.reason || "Awaiting owner authorization before dispatching."}
                </p>
              </div>
            </div>

            {/* Right Buttons: Approve and Reject */}
            <div className="flex items-center space-x-2.5 self-end md:self-center shrink-0">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleResolve(pendingItem.id, "reject")}
                isLoading={loadingId === pendingItem.id}
                icon={<X className="w-4 h-4" />}
              >
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleResolve(pendingItem.id, "approve")}
                isLoading={loadingId === pendingItem.id}
                icon={<Check className="w-4 h-4" />}
              >
                Approve
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
