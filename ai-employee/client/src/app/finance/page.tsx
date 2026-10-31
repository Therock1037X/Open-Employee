"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { api, FinanceEntry, FinanceSummary } from "@/lib/api";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [ledger, setLedger] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      const [sumRes, ledRes] = await Promise.all([
        api.getFinanceSummary(),
        api.getFinanceLedger(),
      ]);
      setSummary(sumRes);
      setLedger(ledRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
              <Wallet className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Finance & UPI Reconciliation
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Automated store bookkeeping with instant dynamic Razorpay UPI settlement.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Gross Inflow (Income)</span>
              <div className="p-1.5 rounded-lg bg-success/15 text-success">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={summary?.total_income || 337.5}
                prefix="₹"
                decimals={2}
                isGold
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">From recorded sales and UPI receipts</p>
          </Card>

          <Card hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Gross Outflow (Expenses)</span>
              <div className="p-1.5 rounded-lg bg-error/15 text-error">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={summary?.total_expense || 450.0}
                prefix="₹"
                decimals={2}
                isGold={false}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">Shop utilities, rent, supplier purchases</p>
          </Card>

          <Card hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Net Store Balance</span>
              <div className="p-1.5 rounded-lg bg-accent/15 text-accent">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={summary?.net_profit || 187.5}
                prefix="₹"
                decimals={2}
                isGold
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">Cash in drawer + active UPI settlements</p>
          </Card>
        </div>

        {/* 2-Column: Left = Ledger, Right = UPI Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Ledger Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <h3 className="text-sm font-bold text-text-primary">Financial Ledger Entries</h3>
                <Badge variant="gold">Auto-Balanced</Badge>
              </div>

              <div className="space-y-3">
                {ledger.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-base border border-white/[0.08] flex items-center justify-between hover:border-white/[0.15] transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-text-primary">{entry.description}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface border border-white/[0.08] text-text-muted">
                          {entry.payment_mode}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted/60 mt-0.5">
                        {entry.category} &bull; {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-mono font-bold ${
                          entry.type === "income" ? "text-accent" : "text-error"
                        }`}
                      >
                        {entry.type === "income" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-text-muted/40 font-mono">{entry.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Embedded Razorpay UPI Terminal (5 cols) */}
          <div className="lg:col-span-5">
            <RazorpayUPIModal onPaymentSuccess={fetchFinance} />
          </div>
        </div>
      </main>
    </div>
  );
}
