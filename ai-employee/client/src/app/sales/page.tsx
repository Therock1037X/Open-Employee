"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { api, Sale } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useToast } from "@/components/ui/Toast";
import { TrendingUp, Plus } from "lucide-react";

export default function SalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [customer, setCustomer] = useState("");
  const [unit, setUnit] = useState("kg");

  const fetchSales = async () => {
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
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
      toast(`Sale recorded for ${product}`, "success");
      setShowModal(false);
      setProduct("");
      setPrice("");
      setCustomer("");
      fetchSales();
    } catch {
      toast("Failed to record sale", "error");
    }
  };

  const totalRevenue = sales.reduce((acc, s) => acc + (s.total ?? s.total_amount ?? 0), 0);

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Sales Ledger
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Real-time transaction history recorded via voice and manual entry.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Record Sale
          </Button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card animateIndex={0} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Total Revenue</div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={totalRevenue || 425} prefix="₹" decimals={2} />
            </div>
          </Card>
          <Card animateIndex={1} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Sales Count</div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={sales.length} />
            </div>
          </Card>
          <Card animateIndex={2} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Average Ticket</div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={sales.length ? totalRevenue / sales.length : 85} prefix="₹" decimals={2} />
            </div>
          </Card>
        </div>

        {/* Sales Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary-text">Sales History</h3>
            <span className="text-xs text-secondary-text font-mono">{sales.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-card-border text-[11px] text-secondary-text uppercase bg-page/50">
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Unit Price</th>
                  <th className="py-2.5 px-4">Total</th>
                  <th className="py-2.5 px-4">Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-highlight/20 dark:hover:bg-teal/10 transition-colors">
                    <td className="py-3 px-4 font-mono text-secondary-text text-[11px] whitespace-nowrap">
                      {new Date(s.timestamp || s.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-primary-text">{s.product}</td>
                    <td className="py-3 px-4 font-mono text-secondary-text">{s.quantity} {s.unit}</td>
                    <td className="py-3 px-4 font-mono text-secondary-text">₹{s.price.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-teal">₹{(s.total ?? s.total_amount ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-secondary-text">{s.customer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Record Sale Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record New Sale"
          description="Log item transaction into store ledger."
        >
          <form onSubmit={handleCreateSale} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary-text block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Sugar, Oil, Biscuits"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1">Price per unit (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary-text block mb-1">Customer</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Sale
              </Button>
            </div>
          </form>
        </Modal>
      </PageTransition>
    </div>
  );
}
