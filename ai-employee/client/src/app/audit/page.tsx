"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { ClipboardList } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Audit Trail
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Complete, immutable log of agent operations, sales records, and approval events.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log Component */}
        <AuditLogViewer />
      </PageTransition>
    </div>
  );
}
