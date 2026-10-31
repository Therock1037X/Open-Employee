"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, StockItem } from "@/lib/api";
import { Package, AlertTriangle, Plus, Search, RefreshCw, CheckCircle2, TrendingDown, ArrowDownRight } from "lucide-react";

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLow, setFilterLow] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Restock Form State
  const [product, setProduct] = useState("");
  const [delta, setDelta] = useState("10");
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
      setShowModal(false);
      setProduct("");
      setDelta("10");
      fetchStock();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(search.toLowerCase());
    const matchesLow = filterLow ? item.is_low_stock : true;
    return matchesSearch && matchesLow;
  });

  const lowStockCount = stock.filter((s) => s.is_low_stock).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Stock & Inventory</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Autonomous inventory tracking with automatic depletion upon sales and predictive restock triggers.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilterLow(!filterLow)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                filterLow
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Low Stock Alerts ({lowStockCount})</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-600/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Restock / Adjust</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Stock Items Grid / Table */}
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider bg-gray-900/40">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Cost / Selling Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredStock.map((item) => (
                  <tr key={item.product} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-100">{item.product}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-200">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="w-32 bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.is_low_stock ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{
                            width: `${Math.min(100, (item.quantity / (item.min_reorder_level * 2)) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {item.min_reorder_level} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      ₹{item.unit_cost.toFixed(2)} / ₹{item.selling_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.is_low_stock ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>LOW STOCK</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>HEALTHY</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setProduct(item.product);
                          setDelta("20");
                          setShowModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
                      >
                        + Add 20
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restock Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-gray-800 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-4">Stock Movement / Restock</h3>
              <form onSubmit={handleAdjustStock} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Atta (गेहूं का आटा)"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Quantity Delta (+/-)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Reason</label>
                  <select
                    value={reason}
                    onChange={(e: any) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="purchase">Supplier Purchase (Restock)</option>
                    <option value="adjust">Inventory Audit Adjustment</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                  >
                    Update Stock Balance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
