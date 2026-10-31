"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { api, Sale } from "@/lib/api";
import { TrendingUp, Plus, Search, Filter, Download, ArrowUpRight, CheckCircle2, User, Calendar } from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New Sale Form State
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
        lang: "en",
      });
      setShowModal(false);
      setProduct("");
      setPrice("");
      setCustomer("");
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.product.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSalesVolume = sales.reduce((acc, s) => acc + s.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Sales Management</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real-time sales registry powered by AI voice/text parsing and UPI receipts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right pr-2">
              <span className="text-[11px] text-gray-400 block">Total Revenue</span>
              <span className="text-lg font-bold text-emerald-400">₹{totalSalesVolume.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, product, or sale ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider bg-gray-900/40">
                  <th className="py-3 px-4">Invoice / ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{s.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-100">{s.product}</td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {s.quantity} {s.unit}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">₹{s.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{s.total_amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-gray-300">{s.customer}</td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs font-mono">
                      {new Date(s.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Sale Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-gray-800 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-4">Record New Sale</h3>
              <form onSubmit={handleCreateSale} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Sugar (चीनी)"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-300 block mb-1">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="packet">packet</option>
                      <option value="piece">piece</option>
                      <option value="box">box</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-100 focus:outline-none focus:border-indigo-500"
                  />
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Save & Deduct Stock
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
