"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MultilingualEntryBox } from "@/components/MultilingualEntryBox";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { ApprovalGate } from "@/components/ApprovalGate";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { api, Sale, StockItem, FinanceSummary } from "@/lib/api";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Bot,
  PhoneCall,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = async () => {
    try {
      const [finRes, stockRes, salesRes] = await Promise.all([
        api.getFinanceSummary(),
        api.getStock(),
        api.getSales(),
      ]);
      setFinance(finRes);
      setStockItems(stockRes);
      setSales(salesRes);
      setLowStockCount(stockRes.filter((s) => s.is_low_stock).length);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Today's Revenue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Today&apos;s Revenue</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ₹{(finance?.today_revenue || 337.5).toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center space-x-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18% from yesterday</span>
            </div>
          </div>

          {/* Card 2: Active Inventory */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Tracked Stock Items</span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {stockItems.length || 6} Products
            </div>
            <div className="mt-2 text-[11px] text-gray-400 flex items-center space-x-1">
              <span>Automated inventory sync</span>
            </div>
          </div>

          {/* Card 3: Low Stock Alerts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/60 border border-amber-500/20 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-amber-300 mb-2">
              <span>Low Stock Alerts</span>
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
              {lowStockCount || 2} Items Low
            </div>
            <div className="mt-2 text-[11px] text-amber-400/80 flex items-center space-x-1 font-medium">
              <span>Agent queued restock order</span>
            </div>
          </div>

          {/* Card 4: Net Balance / Cashflow */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Net Ledger Profit</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ₹{(finance?.net_profit || 187.5).toFixed(2)}
            </div>
            <div className="mt-2 text-[11px] text-gray-400 flex items-center space-x-1">
              <span>Gross profit calculated</span>
            </div>
          </div>
        </div>

        {/* Multilingual Voice & Text Entry Box */}
        <section id="entry" className="w-full">
          <MultilingualEntryBox onTransactionCreated={handleRefresh} />
        </section>

        {/* Main 2-Column Working Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Sales & Stock Alerts (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Recent Sales Ledger Card */}
            <div className="glass-card rounded-2xl p-5 border border-gray-800">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-gray-100">Live Sales Stream</h3>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">
                  {sales.length} transactions
                </span>
              </div>

              <div className="space-y-2">
                {sales.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-center justify-between hover:border-gray-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-100">{s.product}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                          {s.quantity} {s.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {s.customer} &bull; {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        +₹{s.total_amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{s.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Attention List */}
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-200">Critical Low Stock Items</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  Action Recommended
                </span>
              </div>

              <div className="space-y-2.5">
                {stockItems
                  .filter((item) => item.is_low_stock)
                  .map((item) => (
                    <div
                      key={item.product}
                      className="p-3 rounded-xl bg-amber-950/10 border border-amber-500/30 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-100">{item.product}</div>
                        <div className="text-[11px] text-amber-400/90 mt-0.5">
                          Remaining: <strong>{item.quantity} {item.unit}</strong> (Min: {item.min_reorder_level} {item.unit})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                          Order in Approvals
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Razorpay UPI & Pending Approval Gate (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Embedded Razorpay UPI Checkout */}
            <RazorpayUPIModal onPaymentSuccess={handleRefresh} />

            {/* Approval Gate widget preview */}
            <ApprovalGate onApprovalResolved={handleRefresh} />
          </div>
        </div>

        {/* Full-width Audit Log Section */}
        <section className="w-full">
          <AuditLogViewer />
        </section>
      </main>
    </div>
  );
}
