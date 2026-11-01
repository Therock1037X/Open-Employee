"use client";

import React, { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
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
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PageTransition } from "@/components/ui/PageTransition";
import { useTheme } from "@/lib/theme-context";
import { api, StockItem, FinanceSummary, AuditEvent } from "@/lib/api";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      const [finRes, stockRes, , auditRes] = await Promise.all([
        api.getFinanceSummary(),
        api.getStock(),
        api.getSales(),
        api.getAuditLogs(),
      ]);
      setFinance(finRes);
      setStockItems(stockRes);
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

  const isDark = theme === "dark";
  const chartStrokeColor = isDark ? "var(--palette-skyblue)" : "var(--palette-teal)";
  const axisColor = isDark ? "var(--text-secondary)" : "var(--text-primary)";
  const axisLineColor = "var(--border-card)";
  const gridColor = "var(--border-card)";

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* KPI 1: Today's Sales */}
          <Card animateIndex={0} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2.5 font-bold">
              <span>Today&apos;s Sales</span>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text">
              <AnimatedNumber
                value={finance?.today_revenue || 425}
                prefix="₹"
                decimals={2}
              />
            </div>
            <div className="mt-2 text-xs text-success flex items-center space-x-1 font-bold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+24% vs yesterday</span>
            </div>
          </Card>

          {/* KPI 2: Low Stock */}
          <Card animateIndex={1} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2.5 font-bold">
              <span>Low Stock Alerts</span>
              <div className="p-2 rounded-xl bg-error/15 text-error border border-error/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text flex items-baseline">
              <AnimatedNumber value={lowStockCount || 2} />
              <span className="text-xs font-bold text-secondary-text ml-2">Items Low</span>
            </div>
            <div className="mt-2 text-xs text-secondary-text flex items-center space-x-1 font-semibold">
              <span>Purchase order queued</span>
            </div>
          </Card>

          {/* KPI 3: Pending Approvals */}
          <Card animateIndex={2} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2.5 font-bold">
              <span>Approvals Gate</span>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text flex items-baseline">
              <AnimatedNumber value={3} />
              <span className="text-xs font-bold text-secondary-text ml-2">Pending</span>
            </div>
            <div className="mt-2 text-xs text-secondary-text flex items-center space-x-1 font-semibold">
              <span>Sign-off gate active</span>
            </div>
          </Card>

          {/* KPI 4: Overdue Receivables */}
          <Card animateIndex={3} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2.5 font-bold">
              <span>Overdue Receivables</span>
              <div className="p-2 rounded-xl bg-error/15 text-error border border-error/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text">
              <AnimatedNumber value={150} prefix="₹" decimals={2} />
            </div>
            <div className="mt-2 text-xs text-secondary-text flex items-center space-x-1 font-semibold">
              <span>1 reminder queued</span>
            </div>
          </Card>
        </div>

        {/* Natural-Language Multilingual Entry Box */}
        <section id="entry" className="w-full">
          <MultilingualEntryBox onTransactionCreated={handleRefresh} />
        </section>

        {/* Charts & Agent Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sales Trend Chart */}
          <div className="lg:col-span-7 space-y-6">
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-card-border mb-4">
                <div>
                  <h3 className="text-base font-bold text-primary-text tracking-tight">
                    Hourly Sales Trend
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5 font-medium">
                    Real-time transaction volume across UPI and cash
                  </p>
                </div>
                <Badge variant="teal">Today</Badge>
              </div>

              {/* Recharts Area Chart with generous margins for axis labels */}
              <div className="h-64 w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      key={theme}
                      data={chartData}
                      margin={{ top: 10, right: 15, left: 10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={isDark ? "var(--palette-skyblue)" : "var(--palette-teal)"}
                            stopOpacity={isDark ? 0.45 : 0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor={isDark ? "var(--palette-skyblue)" : "var(--palette-teal)"}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis
                        dataKey="time"
                        stroke={axisLineColor}
                        tick={{ fill: axisColor, fontSize: 12, fontWeight: 700 }}
                        dy={8}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={axisLineColor}
                        tick={{ fill: axisColor, fontSize: 12, fontWeight: 700 }}
                        dx={-4}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "var(--palette-navy-dark)" : "var(--palette-white)",
                          borderColor: "var(--border-card)",
                          borderRadius: "0.75rem",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: "700",
                          boxShadow: "var(--shadow-card)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke={chartStrokeColor}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#salesTrendGradient)"
                        isAnimationActive={!shouldReduceMotion}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full skeleton-shimmer rounded-xl opacity-30" />
                )}
              </div>
            </Card>

            {/* Critical Low Stock Alert Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-card-border mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <h3 className="text-sm font-bold text-primary-text">
                    Inventory Replenishment
                  </h3>
                </div>
                <Badge variant="teal">Automated</Badge>
              </div>

              <div className="space-y-3">
                {stockItems
                  .filter((s) => s.is_low_stock)
                  .map((item) => (
                    <div
                      key={item.product}
                      className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-primary-text">{item.product}</div>
                        <div className="text-xs text-secondary-text mt-0.5 font-medium">
                          Remaining: <span className="text-primary-text font-mono font-bold">{item.quantity} {item.unit}</span> (Min: {item.min_reorder_level} {item.unit})
                        </div>
                      </div>
                      <Badge variant="error" dot>
                        Low Stock
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Agent Live Activity & Embedded UPI */}
          <div className="lg:col-span-5 space-y-6">
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-card-border mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center text-white shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-text">Agent Feed</h3>
                    <p className="text-xs text-secondary-text font-medium">Autonomous execution logs</p>
                  </div>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-page border border-card-border flex items-start space-x-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal/15 border border-teal/30 text-teal dark:text-skyblue flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary-text capitalize">{log.action.replace(/_/g, " ")}</span>
                        <span className="text-xs text-secondary-text font-mono font-semibold">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-text mt-1 font-medium">
                        Actor: <strong className="text-primary-text font-bold">{log.actor}</strong> &bull; Status: <span className="text-success font-bold capitalize">{log.status}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Embedded UPI Checkout */}
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
      </PageTransition>
    </div>
  );
}
