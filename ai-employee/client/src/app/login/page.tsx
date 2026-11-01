"use client";

import React from "react";
import { AuthCard } from "@/components/AuthCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { useTheme } from "@/lib/theme-context";
import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-page text-primary-text relative overflow-hidden transition-colors duration-200">
      {/* Top Controls: back to home + theme toggle */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-card border border-card-border text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-all duration-200 shadow-xs"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-skyblue hover:text-white transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-teal dark:text-skyblue hover:text-primary-text transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>
      </div>

      <PageTransition className="w-full max-w-md my-auto z-10">
        <AuthCard />
      </PageTransition>
    </main>
  );
}
