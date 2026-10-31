"use client";

import React from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { Sparkles, Bot, Shield, PhoneCall, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-base">
      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-white/[0.08] mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
            <Bot className="w-5 h-5 text-surface" />
          </div>
          <div>
            <h1 className="text-base font-bold text-text-primary tracking-tight">Open Employee</h1>
            <p className="text-[11px] text-text-muted">Always-on AI Employee for Indian MSMEs</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-gold-glow"></span>
            </span>
            <span>Agent Active 24/7</span>
          </div>

          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Dashboard &rarr;
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Hero */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <Badge variant="gold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Black & Gold Elegance</span>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
            Your 24/7 AI employee that works even after the shop shuts.
          </h2>

          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            Speak or type in Hinglish, Marathi, Hindi, or English. Automatically tracks sales & inventory,
            forecasts stock reorders, generates multi-channel marketing campaigns, places outbound supplier voice calls, and collects instant Razorpay UPI.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
                <PhoneCall className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Voice Telephony</h4>
                <p className="text-[11px] text-text-muted">Bhashini + Exotel</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Stock & UPI</h4>
                <p className="text-[11px] text-text-muted">Instant Dynamic QR</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Approval Gate</h4>
                <p className="text-[11px] text-text-muted">Human Sign-off</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center space-x-3" hoverEffect>
              <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Computer Use</h4>
                <p className="text-[11px] text-text-muted">Playwright Mock GST</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <AuthCard />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 mt-8 border-t border-white/[0.08] text-center text-xs text-text-muted/60">
        Open Employee Platform &copy; 2026. Empowering Indian small businesses with autonomous AI workers.
      </footer>
    </main>
  );
}
