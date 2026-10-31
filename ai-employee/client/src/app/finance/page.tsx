"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { api, FinanceEntry, FinanceSummary } from "@/lib/api";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, QrCode } from "lucide-react";

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
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Finance & Razorpay UPI</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Store financial book, automated cashflow tracking, and instant dynamic UPI settlement.
            </p>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Gross Inflow (Income)</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              ₹{(summary?.total_income || 337.5).toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">From sales & UPI receipts</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Gross Outflow (Expenses)</span>
              <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 tracking-tight">
              ₹{(summary?.total_expense || 450.0).toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Utilities, rent, restocking</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Net Store Balance</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{(summary?.net_profit || -112.5).toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Cash on hand + UPI balances</p>
          </div>
        </div>

        {/* 2-Column: Left = Ledger, Right = UPI Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Ledger Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <h3 className="text-sm font-bold text-gray-100 mb-3 flex items-center justify-between">
                <span>General Financial Ledger</span>
                <span className="text-[10px] font-mono text-gray-500">Auto-balanced</span>
              </h3>

              <div className="space-y-2">
                {ledger.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-200">{entry.description}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
                          {entry.payment_mode}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {entry.category} &bull; {new Date(entry.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          entry.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.type === "income" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{entry.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
