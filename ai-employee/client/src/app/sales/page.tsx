"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, Sale } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useToast } from "@/components/ui/Toast";
import { TrendingUp, Plus, Search } from "lucide-react";

export default function SalesPage() {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [customer, setCustomer] = useState("");
  const [unit, setUnit] = useState("kg");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      toast("Failed to record sale", "error");
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.product.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalVolume = sales.reduce((acc, s) => acc + s.total_amount, 0);

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
              <TrendingUp className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Sales Registry</h1>
              <p className="text-xs text-text-muted mt-0.5">
                Automated multi-channel sales and immediate stock balance deductions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[11px] text-text-muted block">Total Gross Revenue</span>
              <AnimatedNumber value={totalVolume} prefix="₹" decimals={2} className="text-xl" isGold />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Record Sale
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer, or product..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/[0.08] text-xs sm:text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:shadow-gold-glow"
          />
        </div>

        {/* Sales Table Card */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-text-muted text-[11px] uppercase tracking-wider bg-base/50">
                  <th className="py-3 px-4">Invoice / ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredSales.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-accent font-bold">{s.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{s.product}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {s.quantity} {s.unit}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">₹{s.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-accent">
                      ₹{s.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">{s.customer}</td>
                    <td className="py-3.5 px-4 text-text-muted/60 text-xs font-mono">
                      {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record New Sale"
          description="Log item sold; inventory will automatically deplete and finance ledger will credit."
        >
          <form onSubmit={handleCreateSale} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Product</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Sugar (चीनी)"
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="packet">packet</option>
                  <option value="piece">piece</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Price per Unit (₹)</label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Customer</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Deduct Stock
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
