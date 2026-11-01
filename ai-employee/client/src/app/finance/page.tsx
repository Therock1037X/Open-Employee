"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { api, FinanceEntry, FinanceSummary } from "@/lib/api";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [ledger, setLedger] = useState<FinanceEntry[]>([]);

  const fetchFinance = async () => {
    try {
      const [sumRes, ledRes] = await Promise.all([
        api.getFinanceSummary(),
        api.getFinanceLedger(),
      ]);
      setSummary(sumRes);
      setLedger(ledRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Finance & UPI
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Automated bookkeeping with dynamic Razorpay UPI settlement.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card animateIndex={0} hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-secondary-text mb-2 font-medium">
              <span>Gross Inflow</span>
              <div className="p-1.5 rounded-lg bg-success/15 text-success">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={summary?.total_income || 337.5}
                prefix="₹"
                decimals={2}
              />
            </div>
          </Card>

          <Card animateIndex={1} hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-secondary-text mb-2 font-medium">
              <span>Gross Outflow</span>
              <div className="p-1.5 rounded-lg bg-error/15 text-error">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={summary?.total_expense || 0}
                prefix="₹"
                decimals={2}
              />
            </div>
          </Card>

          <Card animateIndex={2} hoverEffect className="p-6">
            <div className="flex items-center justify-between text-xs text-secondary-text mb-2 font-medium">
              <span>Net Cash Flow</span>
              <div className="p-1.5 rounded-lg bg-teal/15 text-teal dark:text-skyblue">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-success">
              <AnimatedNumber
                value={summary?.net_cashflow || 337.5}
                prefix="₹"
                decimals={2}
              />
            </div>
          </Card>
        </div>

        {/* Dynamic UPI Checkout & Ledger Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <RazorpayUPIModal onPaymentSuccess={fetchFinance} />
          </div>

          <div className="lg:col-span-7">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary-text">Reconciliation Ledger</h3>
                <Badge variant="teal">Auto-synced</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-card-border text-[11px] text-secondary-text uppercase bg-page/50">
                      <th className="py-2.5 px-4">Time</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-highlight/20 dark:hover:bg-teal/10 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-secondary-text whitespace-nowrap">
                          {new Date(entry.timestamp || entry.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-primary-text capitalize">{entry.category}</td>
                        <td className="py-3 px-4 text-secondary-text truncate max-w-[180px]">{entry.description}</td>
                        <td className="py-3 px-4">
                          {entry.type === "income" ? (
                            <Badge variant="success">INCOME</Badge>
                          ) : (
                            <Badge variant="error">EXPENSE</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal">
                          ₹{entry.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
