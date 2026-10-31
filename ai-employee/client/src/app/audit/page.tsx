"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { ClipboardList, Shield, Database } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Audit Trail & System Logs</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Complete, immutable log of every agent action, sales entry, voice call, and approval event.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Log Component */}
        <AuditLogViewer />
      </main>
    </div>
  );
}
