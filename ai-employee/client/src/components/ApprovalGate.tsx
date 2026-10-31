"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, X, AlertTriangle, ArrowRight, Clock, MessageSquare, PhoneCall, Wallet, Bot } from "lucide-react";
import { api, ApprovalTask } from "@/lib/api";

interface ApprovalGateProps {
  onApprovalResolved?: () => void;
}

export function ApprovalGate({ onApprovalResolved }: ApprovalGateProps) {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovals();
      setTasks(data);
    } catch (err) {
      console.error("Error loading approvals:", err);
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
      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: decision } : t))
      );
      if (onApprovalResolved) {
        onApprovalResolved();
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "exotel_call":
        return <PhoneCall className="w-4 h-4 text-sky-400" />;
      case "razorpay_payout":
        return <Wallet className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bot className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 flex items-center space-x-2">
              <span>Mandatory Approval Gate</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold">
                Human-in-the-Loop
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Agent requires owner sign-off before executing any external messaging or financial payouts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Pending Actions:</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            {tasks.filter((t) => t.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all ${
              task.status === "pending"
                ? "bg-gray-900/80 border-gray-800 hover:border-gray-700"
                : task.status === "approved"
                ? "bg-emerald-950/20 border-emerald-500/30 opacity-70"
                : "bg-rose-950/20 border-rose-500/30 opacity-70"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-800 border border-gray-700/80">
                    {getChannelIcon(task.channel)}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-100">{task.action}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    {task.task_id}
                  </span>
                  {task.amount && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ₹{task.amount.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{task.reason}</p>

                <div className="flex items-center space-x-3 text-[11px] text-gray-500 pt-1">
                  <span>Target: <strong className="text-gray-400">{task.target}</strong></span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(task.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {task.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleDecision(task.id, "rejected")}
                      disabled={processingId === task.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleDecision(task.id, "approved")}
                      disabled={processingId === task.id}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 flex items-center space-x-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Run</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      task.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {task.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
