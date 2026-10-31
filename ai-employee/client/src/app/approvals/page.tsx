"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { ApprovalGate } from "@/components/ApprovalGate";
import { ShieldCheck, Lock, AlertCircle, Info } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Mandatory Approval Gate
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Zero autonomous financial payouts or external broadcasts occur without explicit shop owner sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start space-x-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
          <div className="space-y-1">
            <p className="font-semibold text-gray-200">How the Approval Gate Protects Your Shop:</p>
            <p className="text-gray-400 leading-relaxed">
              When the AI detects low inventory (e.g. Atta or Mustard Oil), it plans a supplier purchase order or outbound Hindi call, but pauses execution in <code className="text-indigo-300 font-mono">awaiting_approval</code> status. You review the quantity, pricing, and destination before granting approval. Every decision is cryptographically logged in the audit trail.
            </p>
          </div>
        </div>

        {/* Approval Gate Component */}
        <ApprovalGate />
      </main>
    </div>
  );
}
