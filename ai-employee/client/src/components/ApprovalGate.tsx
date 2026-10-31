"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  MessageSquare,
  PhoneCall,
  Wallet,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { api, ApprovalTask } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface ApprovalGateProps {
  onApprovalResolved?: () => void;
}

export function ApprovalGate({ onApprovalResolved }: ApprovalGateProps) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovals();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      await api.resolveApproval(id, decision);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: decision } : t))
      );
      toast(
        decision === "approved"
          ? "Approved! Action dispatched to execution queue."
          : "Action Rejected and safely dismissed.",
        decision === "approved" ? "success" : "error"
      );
      if (onApprovalResolved) onApprovalResolved();
    } catch (err) {
      toast("Error resolving approval", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="w-4 h-4 text-success" />;
      case "exotel_call":
        return <PhoneCall className="w-4 h-4 text-accent" />;
      case "razorpay_payout":
        return <Wallet className="w-4 h-4 text-accent" />;
      default:
        return <Bot className="w-4 h-4 text-text-primary" />;
    }
  };

  return (
    <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-gold-glow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center space-x-2">
              <span>Mandatory Approval Gate</span>
              <Badge variant="gold">Human-in-the-Loop</Badge>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Owner sign-off required before money movements or external customer/supplier messages.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-text-muted">Pending Actions:</span>
          <span className="font-mono font-bold text-accent px-2 py-0.5 rounded-full bg-base border border-accent/30">
            {tasks.filter((t) => t.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-3">
        {tasks.map((task, idx) => {
          const isPending = task.status === "pending";
          const isApproved = task.status === "approved";
          const isRejected = task.status === "rejected";

          return (
            <motion.div
              key={task.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className={`p-4 rounded-xl transition-all ${
                isPending
                  ? "bg-base border border-accent/40 shadow-gold-glow animate-pulse-gold"
                  : isApproved
                  ? "bg-surface/80 border border-success/30 opacity-80"
                  : "bg-surface/80 border border-error/30 opacity-80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-surface border border-white/[0.08]">
                      {getChannelIcon(task.channel)}
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">{task.action}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-white/[0.08] text-text-muted">
                      {task.task_id}
                    </span>
                    {task.amount && (
                      <span className="text-xs font-mono font-bold text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30">
                        ₹{task.amount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{task.reason}</p>

                  <div className="flex items-center space-x-3 text-[11px] text-text-muted/60 pt-1">
                    <span>
                      Target: <strong className="text-text-muted">{task.target}</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(task.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </div>

                  {/* Agent Action Step Timeline */}
                  <div className="pt-2 flex items-center space-x-2 text-[10px] text-text-muted font-mono">
                    <span className="text-accent flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                      <span>Trigger: Stock Low</span>
                    </span>
                    <span>&rarr;</span>
                    <span className="text-accent flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                      <span>Plan Generated</span>
                    </span>
                    <span>&rarr;</span>
                    <span className={isApproved ? "text-success font-bold" : "text-text-muted"}>
                      {isApproved ? "Approved & Dispatched" : isRejected ? "Dismissed" : "Awaiting Owner"}
                    </span>
                  </div>
                </div>

                {/* Animated Decision Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {isPending ? (
                    <>
                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDecision(task.id, "rejected")}
                          disabled={processingId === task.id}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDecision(task.id, "approved")}
                          disabled={processingId === task.id}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Approve</span>
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <Badge variant={isApproved ? "success" : "error"}>
                      {task.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
