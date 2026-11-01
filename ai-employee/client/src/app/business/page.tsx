"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { RazorpayUPIModal } from "@/components/RazorpayUPIModal";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
import { api, Sale, StockItem, FinanceSummary, WhatsAppInboxItem } from "@/lib/api";
import { CheckCheck, FileText, Image as ImageIcon } from "lucide-react";
import {
  TrendingUp,
  Package,
  Wallet,
  Megaphone,
  Plus,
  QrCode,
  Send,
  MessageSquare,
} from "lucide-react";

export default function BusinessPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("sales");
  const [sales, setSales] = useState<Sale[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);

  // Modals
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);

  // Sale form state
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [customer, setCustomer] = useState("");
  const [unit, setUnit] = useState("kg");

  // Stock form state
  const [stockProduct, setStockProduct] = useState("");
  const [stockQty, setStockQty] = useState("10");

  // Marketing state
  const [campaignTopic, setCampaignTopic] = useState("Diwali Festival Sale");
  const [campaignDiscount, setCampaignDiscount] = useState("15%");
  const [campaignOutput, setCampaignOutput] = useState("");
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<WhatsAppInboxItem[]>([]);
  const [targetPhone, setTargetPhone] = useState("+91 98765 43210");
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const loadData = async () => {
    try {
      const [salesData, stockData, financeData, inboxData] = await Promise.all([
        api.getSales(),
        api.getStock(),
        api.getFinanceSummary(),
        api.getWhatsAppInbox(),
      ]);
      setSales(salesData);
      setStock(stockData);
      setFinance(financeData);
      setInboxMessages(inboxData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || !price) return;
    try {
      await api.createSale({
        product,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        unit,
        customer: customer || "Walk-in Customer",
        lang: "hi",
      });
      toast(`Sale recorded: ${product}`, "success");
      setSaleModalOpen(false);
      setProduct("");
      setPrice("");
      setCustomer("");
      loadData();
    } catch {
      toast("Failed to record sale", "error");
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct || !stockQty) return;
    try {
      await api.adjustStock(stockProduct, parseFloat(stockQty), "purchase");
      toast(`Stock updated: +${stockQty} ${stockProduct}`, "success");
      setStockModalOpen(false);
      setStockProduct("");
      loadData();
    } catch {
      toast("Failed to update stock", "error");
    }
  };

  const handleGenerateCampaign = () => {
    setGeneratingCampaign(true);
    setTimeout(() => {
      setCampaignOutput(
        `Namaste! Special ${campaignTopic} offer at our store! Get ${campaignDiscount} off on all grocery & essentials this week. Visit today or order directly via WhatsApp!`
      );
      setGeneratingCampaign(false);
      toast("Campaign broadcast generated", "teal");
    }, 500);
  };

  const handleSendHelloWorldTemplate = async () => {
    try {
      setSendingWhatsApp(true);
      await api.sendWhatsAppTemplate({
        to_phone: targetPhone,
        template_name: "hello_world",
        language_code: "en_US",
        approved: true,
      });
      toast("Template dispatched via WhatsApp Cloud API", "success");
      loadData();
    } catch (err: any) {
      toast(err?.message || "WhatsApp template dispatch failed", "error");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);
      const messageText =
        campaignOutput ||
        `🎉 ${campaignTopic}! Get an exclusive ${campaignDiscount} discount on all grocery & essentials this week at Open Employee MSME Mart. Visit today or reply to order directly on WhatsApp!`;
      const res = await api.sendWhatsAppMessage({
        to_phone: targetPhone,
        text: messageText,
        approved: false,
      });
      if (res?.status === "awaiting_approval") {
        toast("Message routed to Approval Gate for owner confirmation", "teal");
      } else {
        toast("WhatsApp message dispatched successfully", "success");
      }
      loadData();
    } catch (err: any) {
      toast(err?.message || "Failed to send WhatsApp message", "error");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const tabItems: TabItem[] = [
    { id: "sales", label: t.salesTab, icon: <TrendingUp className="w-4 h-4" />, badge: sales.length },
    {
      id: "stock",
      label: "Stock",
      icon: <Package className="w-4 h-4" />,
      badge: stock.filter((s) => s.is_low_stock).length || undefined,
    },
    { id: "finance", label: t.financeTab, icon: <Wallet className="w-4 h-4" /> },
    { id: "marketing", label: t.marketingTab, icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
              Business Operations
            </h1>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              Sales ledger, inventory replenishment, cashflow, and customer outreach.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === "sales" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSaleModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                {t.newSale}
              </Button>
            )}
            {activeTab === "stock" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStockModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                {t.addStock}
              </Button>
            )}
            {activeTab === "finance" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setUpiModalOpen(true)}
                icon={<QrCode className="w-4 h-4" />}
              >
                {t.upiCheckout}
              </Button>
            )}
          </div>
        </div>

        {/* Sliding Teal Underline Tabs */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Sales */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card animateIndex={0}>
                <div className="text-xs text-secondary-text font-bold mb-1">{t.todaySales}</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={finance?.today_revenue || 425} prefix="₹" decimals={2} />
                </div>
              </Card>
              <Card animateIndex={1}>
                <div className="text-xs text-secondary-text font-bold mb-1">Total Sales Recorded</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={sales.length} />
                </div>
              </Card>
              <Card animateIndex={2} className="col-span-2 lg:col-span-1">
                <div className="text-xs text-secondary-text font-bold mb-1">Average Order Ticket</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={85} prefix="₹" decimals={2} />
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary-text">Transactions Ledger</h3>
                <span className="text-xs text-secondary-text font-mono font-semibold">{sales.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-card-border text-xs font-bold text-primary-text uppercase bg-page/50">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <TrendingUp className="w-8 h-8 text-teal dark:text-skyblue opacity-60" />
                            <p className="text-sm font-bold text-primary-text">No Transactions Recorded Today</p>
                            <p className="text-xs text-secondary-text max-w-sm">
                              Speak an entry in the Multilingual Box on the Dashboard or click &ldquo;+ Record Sale&rdquo; above.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sales.map((s) => (
                        <tr key={s.id} className="hover:bg-highlight/30 dark:hover:bg-teal/15 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-secondary-text text-xs font-semibold whitespace-nowrap">
                            {new Date(s.timestamp || s.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-primary-text">{s.product}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-secondary-text">{s.quantity} {s.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-secondary-text">₹{s.price.toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-teal dark:text-skyblue">₹{(s.total ?? s.total_amount ?? 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-primary-text font-semibold">{s.customer}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Stock */}
        {activeTab === "stock" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card animateIndex={0}>
                <div className="text-xs text-secondary-text font-bold mb-1">Catalog Item Count</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={stock.length} />
                </div>
              </Card>
              <Card animateIndex={1}>
                <div className="text-xs text-secondary-text font-bold mb-1">Low Stock Alerts</div>
                <div className="text-2xl font-black text-error">
                  <AnimatedNumber value={stock.filter((s) => s.is_low_stock).length} />
                </div>
              </Card>
              <Card animateIndex={2} className="col-span-2 lg:col-span-1">
                <div className="text-xs text-secondary-text font-bold mb-1">Stock Health Score</div>
                <div className="text-2xl font-black text-success">92%</div>
              </Card>
            </div>

            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary-text">Inventory Catalog</h3>
                <span className="text-xs text-secondary-text font-semibold">Auto-synced on transactions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-card-border text-xs font-bold text-primary-text uppercase bg-page/50">
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Min Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {stock.map((item) => (
                      <tr key={item.product} className="hover:bg-highlight/30 dark:hover:bg-teal/15 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-primary-text">{item.product}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-text">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-secondary-text font-semibold">
                          {item.min_reorder_level} {item.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.is_low_stock ? (
                            <Badge variant="error" dot>Low Stock</Badge>
                          ) : (
                            <Badge variant="success">Optimal</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setStockProduct(item.product);
                              setStockModalOpen(true);
                            }}
                          >
                            Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Finance & UPI */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card animateIndex={0}>
                <div className="text-xs text-secondary-text font-bold mb-1">Today Inflow</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={finance?.today_revenue || 425} prefix="₹" decimals={2} />
                </div>
              </Card>
              <Card animateIndex={1}>
                <div className="text-xs text-secondary-text font-bold mb-1">Monthly Inflow</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={finance?.monthly_revenue || 12850} prefix="₹" decimals={2} />
                </div>
              </Card>
              <Card animateIndex={2}>
                <div className="text-xs text-secondary-text font-bold mb-1">Expenses</div>
                <div className="text-2xl font-black text-primary-text">
                  <AnimatedNumber value={finance?.today_expenses || 120} prefix="₹" decimals={2} />
                </div>
              </Card>
              <Card animateIndex={3}>
                <div className="text-xs text-secondary-text font-bold mb-1">Net Cashflow</div>
                <div className="text-2xl font-black text-success">
                  <AnimatedNumber value={finance?.net_cashflow || 305} prefix="₹" decimals={2} />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RazorpayUPIModal onPaymentSuccess={loadData} />

              <Card className="p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-card-border">
                  <Wallet className="w-5 h-5 text-teal dark:text-skyblue" />
                  <h3 className="text-sm font-bold text-primary-text">Payment Gateway Configuration</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-primary-text">Razorpay UPI Integration</div>
                      <div className="text-xs text-secondary-text font-medium">Automatic webhook reconciliation</div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-primary-text">Settlement Virtual Address</div>
                      <div className="text-xs text-secondary-text font-mono font-bold">openemployee@icici</div>
                    </div>
                    <Badge variant="teal">Primary VPA</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Marketing & WhatsApp Hub */}
        {activeTab === "marketing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Campaign Parameters */}
              <div className="lg:col-span-5 space-y-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-card-border">
                    <MessageSquare className="w-5 h-5 text-teal dark:text-skyblue" />
                    <div>
                      <h3 className="text-sm font-bold text-primary-text">AI WhatsApp Broadcast</h3>
                      <p className="text-xs text-secondary-text">Draft offers, send templates, and sync audience.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-primary-text block mb-1">Target Phone Number</label>
                      <input
                        type="text"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text font-mono font-bold focus:outline-none focus:border-teal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-primary-text block mb-1">Campaign Topic</label>
                      <input
                        type="text"
                        value={campaignTopic}
                        onChange={(e) => setCampaignTopic(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text font-semibold focus:outline-none focus:border-teal"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-primary-text block mb-1">Discount Offer</label>
                      <input
                        type="text"
                        value={campaignDiscount}
                        onChange={(e) => setCampaignDiscount(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text font-semibold focus:outline-none focus:border-teal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleGenerateCampaign}
                        isLoading={generatingCampaign}
                        icon={<Send className="w-3.5 h-3.5" />}
                        className="w-full"
                      >
                        Draft Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleSendHelloWorldTemplate}
                        isLoading={sendingWhatsApp}
                        className="w-full text-xs"
                      >
                        Test Template
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: WhatsApp Message Preview */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-card-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-success" />
                      <h3 className="text-sm font-bold text-primary-text">WhatsApp Message Preview</h3>
                    </div>
                    <Badge variant="teal">Meta Cloud API</Badge>
                  </div>

                  {/* Realistic WhatsApp Chat Bubble Container */}
                  <div className="p-4 rounded-xl bg-page border border-card-border">
                    <div className="flex items-center justify-between text-[11px] text-secondary-text mb-2 border-b border-card-border pb-1">
                      <span className="font-semibold">To: <span className="font-mono text-primary-text">{targetPhone}</span></span>
                      <span>Preview</span>
                    </div>

                    <div className="max-w-md bg-card border border-teal/30 rounded-xl p-3.5 shadow-sm text-xs space-y-2">
                      <p className="text-primary-text whitespace-pre-wrap leading-relaxed">
                        {campaignOutput || `🎉 ${campaignTopic}! Get an exclusive ${campaignDiscount} discount on all grocery & essentials this week at Open Employee MSME Mart. Visit today or reply to order directly on WhatsApp!`}
                      </p>
                      <div className="flex items-center justify-end space-x-1 text-[10px] text-secondary-text">
                        <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-teal dark:text-skyblue" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-secondary-text">
                      Outbound messages require owner sign-off via Approval Gate.
                    </span>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSendWhatsApp}
                      isLoading={sendingWhatsApp}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send via WhatsApp
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* WhatsApp Inbox List & Media/Invoice Viewer */}
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-card-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-teal dark:text-skyblue" />
                  <h3 className="text-sm font-bold text-primary-text">WhatsApp Customer Inbox</h3>
                  <Badge variant="teal">{inboxMessages.length} Messages</Badge>
                </div>
                <span className="text-xs text-secondary-text font-semibold">Real-time webhook sync</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-card-border text-xs font-bold text-primary-text uppercase bg-page/50">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Contact / Phone</th>
                      <th className="py-3 px-4">Direction</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Message / Attachment</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {inboxMessages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-secondary-text">
                          No WhatsApp messages received yet. Webhook listener is ready.
                        </td>
                      </tr>
                    ) : (
                      inboxMessages.map((item) => (
                        <tr key={item.id} className="hover:bg-highlight/30 dark:hover:bg-teal/15 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-secondary-text text-xs whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary-text">
                            {item.sender}
                          </td>
                          <td className="py-3.5 px-4 capitalize">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.direction === "inbound"
                                ? "bg-teal/15 text-teal dark:text-skyblue"
                                : "bg-page text-secondary-text"
                            }`}>
                              {item.direction}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 capitalize">
                            <div className="flex items-center space-x-1.5 font-semibold text-primary-text">
                              {item.message_type === "document" && <FileText className="w-3.5 h-3.5 text-teal dark:text-skyblue" />}
                              {item.message_type === "image" && <ImageIcon className="w-3.5 h-3.5 text-teal dark:text-skyblue" />}
                              <span>{item.message_type}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center space-x-2">
                              {item.is_invoice && (
                                <Badge variant="error" size="sm">Invoice</Badge>
                              )}
                              <span className="truncate text-primary-text font-medium">
                                {item.filename ? `${item.filename} - ` : ""}{item.text || "Media Attachment"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Badge variant={item.status === "sent" ? "success" : item.status === "received" ? "teal" : "neutral"} size="sm">
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modal: Record Sale */}
        <Modal
          isOpen={saleModalOpen}
          onClose={() => setSaleModalOpen(false)}
          title="Record New Sale"
          description="Log item transaction into store ledger."
        >
          <form onSubmit={handleCreateSale} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary-text block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Sugar, Oil, Biscuits"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-primary-text block mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary-text block mb-1">Price per unit (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-primary-text block mb-1">Customer (Optional)</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-medium"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setSaleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Sale
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Adjust Stock */}
        <Modal
          isOpen={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          title="Add Inventory Stock"
          description="Update product stock levels in the ledger."
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-primary-text block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={stockProduct}
                onChange={(e) => setStockProduct(e.target.value)}
                placeholder="Product name"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-primary-text block mb-1">Units to Add</label>
              <input
                type="number"
                required
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal font-bold"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setStockModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Restock Item
              </Button>
            </div>
          </form>
        </Modal>
      </PageTransition>
    </div>
  );
}
