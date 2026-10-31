"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { MultilingualEntryBox } from "@/components/MultilingualEntryBox";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { ApprovalGate } from "@/components/ApprovalGate";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { api, Sale, StockItem, FinanceSummary, AuditEvent } from "@/lib/api";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sales Trend Chart Data
  const chartData = [
    { time: "9 AM", sales: 120 },
    { time: "11 AM", sales: 240 },
    { time: "1 PM", sales: 480 },
    { time: "3 PM", sales: 320 },
    { time: "5 PM", sales: 610 },
    { time: "7 PM", sales: 780 },
    { time: "9 PM", sales: 940 },
  ];

  const loadData = async () => {
    try {
      const [finRes, stockRes, salesRes, auditRes] = await Promise.all([
        api.getFinanceSummary(),
        api.getStock(),
        api.getSales(),
        api.getAuditLogs(),
      ]);
      setFinance(finRes);
      setStockItems(stockRes);
      setSales(salesRes);
      setAuditLogs(auditRes);
      setLowStockCount(stockRes.filter((s) => s.is_low_stock).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top KPI Cards (8px grid, count-up animation on load) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* KPI 1: Today's Sales */}
          <Card animateIndex={0} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Today&apos;s Sales</span>
              <div className="p-1.5 rounded-lg bg-accent/15 text-accent">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber
                value={finance?.today_revenue || 425}
                prefix="₹"
                decimals={2}
                isGold
              />
            </div>
            <div className="mt-2 text-[11px] text-success flex items-center space-x-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24% vs yesterday</span>
            </div>
          </Card>

          {/* KPI 2: Low Stock */}
          <Card
            animateIndex={1}
            hoverEffect
            className="border-accent/30 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Low Stock Alerts</span>
              <div className="p-1.5 rounded-lg bg-accent/20 text-accent animate-pulse">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={lowStockCount || 2} isGold />
              <span className="text-xs font-normal text-text-muted ml-2">Items Low</span>
            </div>
            <div className="mt-2 text-[11px] text-accent flex items-center space-x-1 font-semibold">
              <span>Agent queued purchase orders</span>
            </div>
          </Card>

          {/* KPI 3: Pending Approvals */}
          <Card animateIndex={2} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Pending Approvals</span>
              <div className="p-1.5 rounded-lg bg-white/[0.08] text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={3} isGold />
              <span className="text-xs font-normal text-text-muted ml-2">Awaiting Sign-off</span>
            </div>
            <div className="mt-2 text-[11px] text-text-muted flex items-center space-x-1">
              <span>Human-in-the-loop gate active</span>
            </div>
          </Card>

          {/* KPI 4: Overdue Payments */}
          <Card animateIndex={3} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-medium">
              <span>Overdue Receivables</span>
              <div className="p-1.5 rounded-lg bg-error/15 text-error">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={150} prefix="₹" decimals={2} isGold={false} />
            </div>
            <div className="mt-2 text-[11px] text-text-muted flex items-center space-x-1">
              <span>1 customer reminder drafted</span>
            </div>
          </Card>
        </div>

        {/* Natural-Language Entry Box at the top with Gold glow on focus */}
        <section id="entry" className="w-full">
          <MultilingualEntryBox onTransactionCreated={handleRefresh} />
        </section>

        {/* Charts & Agent Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sales Trend Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div>
                  <h3 className="text-base font-bold text-text-primary tracking-tight">
                    Hourly Sales Trend
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Real-time transaction velocity across UPI and cash
                  </p>
                </div>
                <Badge variant="gold">Today&apos;s Run</Badge>
              </div>

              {/* Recharts Area Chart in Gold / Navy */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FCA311" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#14213D" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" stroke="#E5E5E5" fontSize={11} tickLine={false} />
                    <YAxis stroke="#E5E5E5" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#14213D",
                        borderColor: "rgba(255,255,255,0.12)",
                        borderRadius: "1rem",
                        color: "#FFFFFF",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#FCA311" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#FCA311"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goldGradient)"
                      isAnimationActive={!shouldReduceMotion}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Critical Low Stock Alert Card */}
            <Card className="border border-accent/30 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-text-primary">
                    Inventory Replenishment Queue
                  </h3>
                </div>
                <span className="text-xs text-accent font-bold">Automatic Monitoring</span>
              </div>

              <div className="space-y-3">
                {stockItems
                  .filter((s) => s.is_low_stock)
                  .map((item) => (
                    <div
                      key={item.product}
                      className="p-3.5 rounded-xl bg-base border border-white/[0.08] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-primary">{item.product}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Remaining: <span className="text-accent font-mono font-bold">{item.quantity} {item.unit}</span> (Min: {item.min_reorder_level} {item.unit})
                        </div>
                      </div>
                      <Badge variant="gold">
                        PO Prepared in Approvals
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Agent Activity Feed & Embedded UPI (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Agent Activity Feed */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
                    <Bot className="w-4 h-4 text-surface" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Agent Live Activity</h3>
                    <p className="text-[11px] text-text-muted">Autonomous background execution</p>
                  </div>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-gold-glow"></span>
                </span>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log, index) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-base border border-white/[0.08] flex items-start space-x-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary capitalize">{log.action.replace(/_/g, " ")}</span>
                        <span className="text-[10px] text-text-muted/60 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 font-mono">
                        Actor: <strong className="text-accent">{log.actor}</strong> &bull; Status: {log.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Embedded Razorpay UPI Checkout */}
            <RazorpayUPIModal onPaymentSuccess={handleRefresh} />
          </div>
        </div>

        {/* Approval Gate Section */}
        <section className="w-full">
          <ApprovalGate onApprovalResolved={handleRefresh} />
        </section>

        {/* Audit Log Table Section */}
        <section className="w-full">
          <AuditLogViewer />
        </section>
      </main>
    </div>
  );
}
