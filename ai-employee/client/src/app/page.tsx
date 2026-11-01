"use client";

import React from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { Bot, PhoneCall, TrendingUp, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-page text-primary-text transition-colors duration-200">
      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-card-border mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-primary-text tracking-tight">Open Employee</h1>
            <p className="text-[11px] text-secondary-text">Always-on AI Employee for Indian MSMEs</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-card border border-card-border text-primary-text hover:border-teal/50 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-skyblue" /> : <Moon className="w-4 h-4 text-teal dark:text-skyblue" />}
          </button>

          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Dashboard &rarr;
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <PageTransition className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <Badge variant="teal">
            <span>Automated Operations</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-text tracking-tight leading-tight">
            Your 24/7 AI employee that works even after the shop shuts.
          </h2>

          <p className="text-secondary-text text-sm sm:text-base leading-relaxed">
            Speak or type in Hinglish, Marathi, Hindi, or English. Automatically tracks sales & inventory,
            forecasts stock reorders, generates multi-channel marketing campaigns, places outbound supplier voice calls, and collects instant Razorpay UPI.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary-text">Voice Telephony</h4>
                <p className="text-[11px] text-secondary-text">Bhashini + Exotel</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary-text">Stock & UPI</h4>
                <p className="text-[11px] text-secondary-text">Dynamic QR</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary-text">Approval Gate</h4>
                <p className="text-[11px] text-secondary-text">Human Sign-off</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary-text">AI Automation</h4>
                <p className="text-[11px] text-secondary-text">Ledger & Invoices</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-5 flex justify-center">
          <AuthCard />
        </div>
      </PageTransition>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-card-border mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary-text gap-2">
        <div className="flex items-center space-x-2">
          <span>&copy; 2026 Open Employee AI.</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="hover:text-primary-text transition-colors">
            Dashboard
          </Link>
          <Link href="/business" className="hover:text-primary-text transition-colors">
            Business
          </Link>
          <Link href="/agent" className="hover:text-primary-text transition-colors">
            Agent
          </Link>
          <Link href="/settings" className="hover:text-primary-text transition-colors">
            Settings
          </Link>
        </div>
      </footer>
    </main>
  );
}
