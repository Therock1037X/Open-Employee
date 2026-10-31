"use client";

import React from "react";
import { AuthCard } from "@/components/AuthCard";
import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-base relative overflow-hidden">
      {/* Corner Navigation back to home */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md my-auto z-10">
        <AuthCard />
      </div>
    </main>
  );
}
