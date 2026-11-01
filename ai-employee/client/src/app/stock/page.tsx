"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { api, StockItem } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useToast } from "@/components/ui/Toast";
import { Package, Plus } from "lucide-react";

export default function StockPage() {
  const { toast } = useToast();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [targetProduct, setTargetProduct] = useState("");
  const [qtyToAdd, setQtyToAdd] = useState("10");

  const fetchStock = async () => {
    try {
      const data = await api.getStock();
      setStock(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct || !qtyToAdd) return;
    try {
      await api.adjustStock(targetProduct, parseFloat(qtyToAdd), "purchase");
      toast(`Stock updated: Added ${qtyToAdd} to ${targetProduct}`, "success");
      setShowModal(false);
      setTargetProduct("");
      fetchStock();
    } catch {
      toast("Failed to update stock", "error");
    }
  };

  const lowStockCount = stock.filter((s) => s.is_low_stock).length;

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Inventory & Stock
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Automated stock monitoring with low-inventory purchase triggers.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTargetProduct("");
              setShowModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Stock
          </Button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card animateIndex={0} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Catalog Item Count</div>
            <div className="text-2xl sm:text-3xl font-black">
              <AnimatedNumber value={stock.length} />
            </div>
          </Card>
          <Card animateIndex={1} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Low Stock Alerts</div>
            <div className="text-2xl sm:text-3xl font-black text-error">
              <AnimatedNumber value={lowStockCount} />
            </div>
          </Card>
          <Card animateIndex={2} hoverEffect className="p-6">
            <div className="text-xs text-secondary-text font-medium mb-1">Reorder Level Policy</div>
            <div className="text-2xl sm:text-3xl font-black text-teal">
              Automated
            </div>
          </Card>
        </div>

        {/* Stock Inventory Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary-text">Store Inventory Items</h3>
            <span className="text-xs text-secondary-text font-mono">{stock.length} SKUs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-card-border text-[11px] text-secondary-text uppercase bg-page/50">
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Current Stock</th>
                  <th className="py-2.5 px-4">Min Reorder Level</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {stock.map((item) => (
                  <tr key={item.product} className="hover:bg-highlight/20 dark:hover:bg-teal/10 transition-colors">
                    <td className="py-3 px-4 font-bold text-primary-text">{item.product}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-primary-text">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-secondary-text">
                      {item.min_reorder_level} {item.unit}
                    </td>
                    <td className="py-3 px-4">
                      {item.is_low_stock ? (
                        <Badge variant="error" dot>Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Optimal</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setTargetProduct(item.product);
                          setShowModal(true);
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

        {/* Restock Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Restock Inventory"
          description="Add units to product inventory ledger."
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary-text block mb-1">Product</label>
              <input
                type="text"
                required
                value={targetProduct}
                onChange={(e) => setTargetProduct(e.target.value)}
                placeholder="Product name"
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-secondary-text block mb-1">Units to Add</label>
              <input
                type="number"
                required
                value={qtyToAdd}
                onChange={(e) => setQtyToAdd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Stock
              </Button>
            </div>
          </form>
        </Modal>
      </PageTransition>
    </div>
  );
}
