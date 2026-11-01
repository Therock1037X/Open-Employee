"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { ApprovalGate } from "@/components/ApprovalGate";
import { ShieldCheck, Info } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Approval Gate
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Owner sign-off required for money movements and supplier calls.
              </p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="p-4 rounded-xl bg-card border border-card-border text-xs text-secondary-text flex items-start space-x-3 shadow-sm">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal" />
          <div className="space-y-1">
            <p className="font-semibold text-primary-text">Protection Policy:</p>
            <p className="text-secondary-text leading-relaxed">
              When the AI detects low stock or drafts broadcasts, it pauses execution in pending status. Review details and authorize with one click.
            </p>
          </div>
        </div>

        {/* Approval Gate Component */}
        <ApprovalGate />
      </PageTransition>
    </div>
  );
}
