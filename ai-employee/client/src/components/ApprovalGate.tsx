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
    } catch {
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
        return <PhoneCall className="w-4 h-4 text-teal dark:text-skyblue" />;
      case "razorpay_payout":
        return <Wallet className="w-4 h-4 text-teal dark:text-skyblue" />;
      default:
        return <Bot className="w-4 h-4 text-primary-text" />;
    }
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-xl p-5 sm:p-6 shadow-card transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-card-border">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal/15 border border-teal/30 text-teal dark:text-skyblue flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-primary-text flex items-center space-x-2">
              <span>Approval Gate</span>
              <Badge variant="teal">Sign-off Required</Badge>
            </h3>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              Review and authorize supplier calls, large payouts, or customer broadcasts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-secondary-text font-bold">Pending:</span>
          <span className="font-mono font-bold text-primary-text px-2.5 py-1 rounded-full bg-page border border-card-border text-xs">
            {tasks.filter((t) => t.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-3">
        {tasks.map((task, idx) => {
          const isPending = task.status === "pending";
          const isApproved = task.status === "approved";

          return (
            <motion.div
              key={task.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isPending
                  ? "bg-page border-teal/40 shadow-xs"
                  : isApproved
                  ? "bg-card border-success/30"
                  : "bg-card border-error/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-card border border-card-border shadow-xs">
                      {getChannelIcon(task.channel)}
                    </div>
                    <h4 className="text-sm font-bold text-primary-text">{task.action}</h4>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-card border border-card-border text-secondary-text">
                      {task.task_id}
                    </span>
                    {task.amount && (
                      <span className="text-xs font-mono font-black text-teal dark:text-skyblue bg-teal/15 px-2.5 py-0.5 rounded border border-teal/30">
                        ₹{task.amount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-primary-text/90 font-medium leading-relaxed">{task.reason}</p>

                  <div className="flex items-center space-x-3 text-xs text-secondary-text pt-1 font-semibold">
                    <span>
                      Target: <strong className="text-primary-text">{task.target}</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(task.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </div>

                  {/* Agent Action Step Timeline */}
                  <div className="pt-2 flex items-center space-x-2 text-xs text-secondary-text font-mono font-semibold">
                    <span className="text-teal dark:text-skyblue flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal dark:text-skyblue" />
                      <span>Trigger</span>
                    </span>
                    <span>&rarr;</span>
                    <span className="text-teal dark:text-skyblue flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal dark:text-skyblue" />
                      <span>Plan</span>
                    </span>
                    <span>&rarr;</span>
                    <span className={isApproved ? "text-success font-bold" : "text-secondary-text font-bold"}>
                      {isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Decision Buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {isPending ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDecision(task.id, "rejected")}
                        disabled={processingId === task.id}
                        icon={<X className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleDecision(task.id, "approved")}
                        disabled={processingId === task.id}
                        isLoading={processingId === task.id}
                        icon={<Check className="w-4 h-4" />}
                      >
                        Approve
                      </Button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isApproved
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-error/15 text-error border border-error/30"
                      }`}
                    >
                      {task.status.toUpperCase()}
                    </span>
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
