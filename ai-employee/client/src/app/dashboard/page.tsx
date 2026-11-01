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
import { ApprovalSlideCard } from "@/components/ApprovalSlideCard";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PageTransition } from "@/components/ui/PageTransition";
import { Sparkline } from "@/components/ui/Sparkline";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/i18n";
import { api, StockItem, FinanceSummary, AuditEvent } from "@/lib/api";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Package,
} from "lucide-react";

type ChartRange = "7d" | "30d" | "1y";

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>("7d");
  const [agentLiveTyping, setAgentLiveTyping] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Multi-range Sales Trend Data
  const chartDatasets: Record<ChartRange, { label: string; sales: number }[]> = {
    "7d": [
      { label: "Mon", sales: 2400 },
      { label: "Tue", sales: 3100 },
      { label: "Wed", sales: 2800 },
      { label: "Thu", sales: 4200 },
      { label: "Fri", sales: 3900 },
      { label: "Sat", sales: 5800 },
      { label: "Sun", sales: 6450 },
    ],
    "30d": [
      { label: "Week 1", sales: 18500 },
      { label: "Week 2", sales: 22400 },
      { label: "Week 3", sales: 27900 },
      { label: "Week 4", sales: 31200 },
    ],
    "1y": [
      { label: "Jan", sales: 72000 },
      { label: "Mar", sales: 88000 },
      { label: "May", sales: 94000 },
      { label: "Jul", sales: 110000 },
      { label: "Sep", sales: 125000 },
      { label: "Nov", sales: 142000 },
    ],
  };

  // Top products list
  const topProducts = [
    { name: "Madhur Pure Sugar", quantity: "142 kg sold", progress: 88, revenue: "₹6,390" },
    { name: "Fortune Mustard Oil", quantity: "98 L sold", progress: 72, revenue: "₹13,720" },
    { name: "Aashirvaad Chakki Atta", quantity: "85 kg sold", progress: 60, revenue: "₹3,400" },
    { name: "Parle-G Gold Biscuits", quantity: "320 pkts sold", progress: 48, revenue: "₹3,200" },
    { name: "India Gate Basmati Rice", quantity: "45 kg sold", progress: 34, revenue: "₹4,050" },
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

  // Live typing effect simulation for agent feed header
  useEffect(() => {
    const fullText = "Monitoring inventory levels, listening for inbound WhatsApp inquiries, and ready to dispatch supplier reorders.";
    let charIdx = 0;
    setAgentLiveTyping("");
    const interval = setInterval(() => {
      if (charIdx <= fullText.length) {
        setAgentLiveTyping(fullText.slice(0, charIdx));
        charIdx += 2;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const isDark = theme === "dark";
  const chartStrokeColor = isDark ? "var(--palette-skyblue)" : "var(--palette-teal)";
  const axisColor = isDark ? "var(--text-secondary)" : "var(--text-primary)";
  const axisLineColor = "var(--border-card)";
  const gridColor = "var(--border-card)";

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200 pb-20 md:pb-8">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Greeting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-card-border/60">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-secondary-text mb-1">
              <Calendar className="w-3.5 h-3.5 text-teal dark:text-skyblue" />
              <span>{currentDateFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary-text tracking-tight">
              {t.greeting}
            </h1>
            <p className="text-xs sm:text-sm text-secondary-text font-medium mt-1">
              {t.todaySummary} &bull; <span className="text-success font-bold">Store active</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <span className="text-xs font-bold text-primary-text">
              Autonomous Agent: Running
            </span>
          </div>
        </div>

        {/* Sliding Approval Card (slides in whenever agent has pending actions) */}
        <ApprovalSlideCard onApprovalResolved={handleRefresh} />

        {/* Top KPI Cards with Sparklines & Count-up */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* KPI 1: Today's Sales */}
          <Card animateIndex={0} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2 font-bold">
              <span>{t.todaySales}</span>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text">
              <AnimatedNumber
                value={finance?.today_revenue || 4250}
                prefix="₹"
                decimals={2}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[11px] text-success flex items-center space-x-1 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                <span>+24% vs yesterday</span>
              </div>
              <Sparkline data={[1200, 1900, 2400, 3100, 2800, 3900, 4250]} color="green" />
            </div>
          </Card>

          {/* KPI 2: Low Stock Alerts */}
          <Card animateIndex={1} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2 font-bold">
              <span>{t.lowStock}</span>
              <div className="p-2 rounded-xl bg-error/15 text-error border border-error/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text flex items-baseline">
              <AnimatedNumber value={lowStockCount || 2} />
              <span className="text-xs font-bold text-secondary-text ml-2">Items Low</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-error font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reorder queued</span>
              </span>
              <Sparkline data={[5, 4, 4, 3, 2, 2, 2]} color="red" />
            </div>
          </Card>

          {/* KPI 3: Approvals Gate */}
          <Card animateIndex={2} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2 font-bold">
              <span>{t.approvals}</span>
              <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text flex items-baseline">
              <AnimatedNumber value={3} />
              <span className="text-xs font-bold text-secondary-text ml-2">Pending Sign-off</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-teal dark:text-skyblue font-bold">
                Protection Active
              </span>
              <Sparkline data={[1, 2, 1, 3, 2, 4, 3]} color="teal" />
            </div>
          </Card>

          {/* KPI 4: Overdue Receivables */}
          <Card animateIndex={3} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-primary-text mb-2 font-bold">
              <span>{t.overdue}</span>
              <div className="p-2 rounded-xl bg-error/15 text-error border border-error/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary-text">
              <AnimatedNumber value={150} prefix="₹" decimals={2} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[11px] text-success flex items-center space-x-1 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                <span>-62% vs last week</span>
              </div>
              <Sparkline data={[400, 350, 300, 250, 200, 150]} color="green" />
            </div>
          </Card>
        </div>

        {/* Natural-Language Multilingual Quick-Entry Box */}
        <section id="entry" className="w-full">
          <MultilingualEntryBox onTransactionCreated={handleRefresh} />
        </section>

        {/* Charts & Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Smooth Area Chart with 7D / 30D / 1Y Toggle */}
          <div className="lg:col-span-7 space-y-6">
            <Card hoverEffect className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border mb-4 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-primary-text tracking-tight">
                    {t.hourlyTrend}
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5 font-medium">
                    Transaction volume across UPI and cash payments
                  </p>
                </div>

                {/* Range Toggle: 7-day, 30-day, 1-year */}
                <div className="flex items-center space-x-1 p-1 bg-page rounded-xl border border-card-border">
                  {(["7d", "30d", "1y"] as ChartRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        chartRange === range
                          ? "bg-teal text-white shadow-xs"
                          : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "1 Year"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-64 w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      key={`${theme}-${chartRange}`}
                      data={chartDatasets[chartRange]}
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
                        dataKey="label"
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
                        tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "var(--palette-navy-dark)" : "var(--palette-white)",
                          borderColor: "var(--border-card)",
                          borderRadius: "1rem",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: "700",
                          boxShadow: "var(--shadow-card-hover)",
                        }}
                        formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Sales"]}
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
                  <div className="w-full h-full skeleton-shimmer rounded-2xl opacity-30" />
                )}
              </div>
            </Card>

            {/* Top Products List with Animated Progress Bars */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-card-border mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-teal dark:text-skyblue" />
                  <h3 className="text-sm font-extrabold text-primary-text">
                    {t.topProducts}
                  </h3>
                </div>
                <Badge variant="teal">This Month</Badge>
              </div>

              <div className="space-y-3.5">
                {topProducts.map((prod, idx) => (
                  <div key={prod.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 rounded-full bg-teal/15 text-teal dark:text-skyblue font-mono font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-primary-text">{prod.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-secondary-text font-medium text-[11px]">{prod.quantity}</span>
                        <span className="font-extrabold text-primary-text font-mono">{prod.revenue}</span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-page border border-card-border overflow-hidden">
                      <motion.div
                        className="h-full bg-teal rounded-full"
                        initial={shouldReduceMotion ? false : { width: 0 }}
                        animate={{ width: `${prod.progress}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Live Agent Activity Feed with typing effect & UPI */}
          <div className="lg:col-span-5 space-y-6">
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-card-border mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center text-white shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-primary-text">{t.agentFeed}</h3>
                    <p className="text-[11px] text-secondary-text font-medium">
                      Continuous background reasoning
                    </p>
                  </div>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
              </div>

              {/* Agent live status quote with typing effect */}
              <div className="p-3.5 rounded-xl bg-page border border-card-border mb-4 text-xs font-mono text-primary-text leading-relaxed">
                <div className="flex items-center space-x-1.5 text-teal dark:text-skyblue font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Agent Thought Stream</span>
                </div>
                <p className="text-secondary-text">
                  {agentLiveTyping}
                  {!shouldReduceMotion && (
                    <span className="inline-block w-1.5 h-3 ml-1 bg-teal animate-pulse" />
                  )}
                </p>
              </div>

              {/* Activity Feed items with Status Chips */}
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => {
                  const isDone = log.status === "success";
                  const isApproval = log.action.includes("approval") || log.status === "pending";

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-page border border-card-border flex items-start space-x-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-teal/15 border border-teal/30 text-teal dark:text-skyblue flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary-text capitalize">
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-secondary-text font-mono font-semibold">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-secondary-text">
                            Actor: <strong className="text-primary-text">{log.actor}</strong>
                          </span>

                          {/* Status Chips */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isApproval
                                ? "bg-teal/20 text-teal dark:text-skyblue border border-teal/40"
                                : isDone
                                ? "bg-success/20 text-success border border-success/40"
                                : "bg-card-border text-secondary-text"
                            }`}
                          >
                            {isApproval ? "waiting approval" : isDone ? "done" : "running"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Embedded UPI Checkout Component */}
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

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        onQuickEntryClick={() => {
          const entryElement = document.getElementById("entry");
          entryElement?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
