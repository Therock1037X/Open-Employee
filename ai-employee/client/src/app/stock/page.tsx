"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, StockItem } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Package, AlertTriangle, Plus, Search, CheckCircle2 } from "lucide-react";

export default function StockPage() {
  const { toast } = useToast();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLow, setFilterLow] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [product, setProduct] = useState("");
  const [delta, setDelta] = useState("20");
  const [reason, setReason] = useState<"purchase" | "adjust">("purchase");

  const fetchStock = async () => {
    try {
      setLoading(true);
      const data = await api.getStock();
      setStock(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !delta) return;
    try {
      await api.adjustStock(product, parseFloat(delta), reason);
      toast(`Stock updated: ${product} (+${delta})`, "success");
      setShowModal(false);
      setProduct("");
      setDelta("20");
      fetchStock();
    } catch (err) {
      toast("Error updating stock", "error");
    }
  };

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase());
    const matchesLow = filterLow ? item.is_low_stock : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = stock.filter((s) => s.is_low_stock).length;

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
              <Package className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">Stock & Inventory</h1>
              <p className="text-xs text-text-muted mt-0.5">
                Real-time warehouse tracking with automated depletion and reorder threshold alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterLow(!filterLow)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                filterLow
                  ? "bg-accent/20 text-accent border-accent/40 shadow-gold-glow"
                  : "bg-surface text-text-muted border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              <span>Low Stock ({lowStockCount})</span>
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Restock Item
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by title or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/[0.08] text-xs sm:text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent focus:shadow-gold-glow"
          />
        </div>

        {/* Inventory Table Card */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-text-muted text-[11px] uppercase tracking-wider bg-base/50">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Cost / Selling</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredStock.map((item) => (
                  <tr key={item.product} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{item.product}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-text-primary">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="w-32 bg-base h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${
                            item.is_low_stock ? "bg-accent shadow-gold-glow" : "bg-success"
                          }`}
                          style={{
                            width: `${Math.min(100, (item.quantity / (item.min_reorder_level * 2)) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono">
                      {item.min_reorder_level} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      ₹{item.unit_cost.toFixed(2)} / <strong className="text-accent font-mono">₹{item.selling_price.toFixed(2)}</strong>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.is_low_stock ? (
                        <Badge variant="gold" dot>
                          REORDER
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          HEALTHY
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setProduct(item.product);
                          setDelta("25");
                          setShowModal(true);
                        }}
                      >
                        +25 Restock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Restock Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Restock Inventory"
          description="Record incoming purchase shipment or manual audit adjustment."
        >
          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Product</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Atta (गेहूं का आटा)"
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Units to Add (+)</label>
              <input
                type="number"
                step="0.5"
                required
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e: any) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="purchase">Supplier Purchase (Restock)</option>
                <option value="adjust">Stock Audit Correction</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Restock
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
