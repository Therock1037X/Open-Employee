"use client";

import React, { useState } from "react";
import { QrCode, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, X, Smartphone, Copy, Check } from "lucide-react";
import { api, UPIOrder } from "@/lib/api";

interface RazorpayUPIModalProps {
  initialAmount?: number;
  initialCustomer?: string;
  onPaymentSuccess?: (order: UPIOrder) => void;
  onClose?: () => void;
}

export function RazorpayUPIModal({
  initialAmount = 150,
  initialCustomer = "Customer",
  onPaymentSuccess,
  onClose,
}: RazorpayUPIModalProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [customerName, setCustomerName] = useState(initialCustomer);
  const [note, setNote] = useState("Store Billing");
  const [activeOrder, setActiveOrder] = useState<UPIOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateUPI = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    try {
      setIsLoading(true);
      const order = await api.createUPIOrder({
        amount: numAmount,
        customer_name: customerName,
        note: note,
      });
      setActiveOrder(order);
    } catch (err) {
      console.error("UPI generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!activeOrder) return;
    try {
      setIsSimulating(true);
      const updated = await api.simulateUPISuccess(activeOrder.order_id);
      setActiveOrder(updated);
      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyUPIIntent = () => {
    if (activeOrder) {
      navigator.clipboard.writeText(activeOrder.upi_intent_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 sm:p-6 border border-gray-800 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-100 flex items-center space-x-2">
              <span>Razorpay Instant UPI Checkout</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/15 text-sky-400 font-semibold uppercase">
                Zero Gateway Fee
              </span>
            </h3>
            <p className="text-xs text-gray-400">Scan via GPay, PhonePe, Paytm, or BHIM UPI</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content */}
      {!activeOrder ? (
        // Order Creation Form
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Amount (₹ INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-300 block mb-1">Payment Reference / Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Store groceries purchase"
              className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleGenerateUPI}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Generate Dynamic UPI QR Code</span>
              </>
            )}
          </button>
        </div>
      ) : (
        // Active UPI QR Display & Payment State
        <div className="mt-5 flex flex-col items-center">
          {activeOrder.status === "paid" ? (
            // Success Screen
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-gray-100">Payment Successfully Received!</h4>
              <p className="text-sm text-gray-400">
                ₹{activeOrder.amount.toFixed(2)} received from {activeOrder.customer_name}.
              </p>
              <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                Order ID: {activeOrder.order_id}
              </div>
              <button
                onClick={() => {
                  setActiveOrder(null);
                  setAmount("150");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
              >
                Collect Another Payment
              </button>
            </div>
          ) : (
            // QR Code Presentation
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="p-4 rounded-2xl bg-white shadow-2xl flex flex-col items-center relative group">
                {/* SVG Rendered QR Code placeholder matching UPI standards */}
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#090d16" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#090d16" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#090d16" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#090d16" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#090d16" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#090d16" />

                  {/* QR Matrix Pattern Dots */}
                  <rect x="37" y="8" width="5" height="5" fill="#090d16" />
                  <rect x="47" y="8" width="6" height="5" fill="#090d16" />
                  <rect x="57" y="8" width="5" height="5" fill="#090d16" />
                  <rect x="37" y="18" width="7" height="6" fill="#090d16" />
                  <rect x="48" y="18" width="5" height="5" fill="#090d16" />
                  <rect x="37" y="28" width="5" height="5" fill="#090d16" />
                  <rect x="57" y="28" width="6" height="6" fill="#090d16" />

                  {/* Center branding dot */}
                  <rect x="42" y="42" width="16" height="16" rx="4" fill="#4f46e5" />
                  <circle cx="50" cy="50" r="4" fill="white" />

                  {/* Bottom matrix patterns */}
                  <rect x="37" y="67" width="6" height="6" fill="#090d16" />
                  <rect x="48" y="67" width="8" height="5" fill="#090d16" />
                  <rect x="62" y="67" width="6" height="7" fill="#090d16" />
                  <rect x="74" y="67" width="5" height="5" fill="#090d16" />
                  <rect x="85" y="67" width="6" height="6" fill="#090d16" />
                  <rect x="37" y="78" width="6" height="6" fill="#090d16" />
                  <rect x="50" y="78" width="8" height="6" fill="#090d16" />
                  <rect x="67" y="78" width="6" height="6" fill="#090d16" />
                  <rect x="80" y="78" width="7" height="6" fill="#090d16" />
                  <rect x="37" y="89" width="8" height="6" fill="#090d16" />
                  <rect x="52" y="89" width="6" height="6" fill="#090d16" />
                  <rect x="67" y="89" width="6" height="6" fill="#090d16" />
                  <rect x="80" y="89" width="6" height="6" fill="#090d16" />
                </svg>

                <div className="mt-2 text-center">
                  <div className="text-xs font-bold text-gray-900 tracking-wider">₹{activeOrder.amount.toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 font-mono">openemployee@icici</div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 text-xs text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for payment from customer...</span>
              </div>

              {/* Quick Actions */}
              <div className="w-full flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={copyUPIIntent}
                  className="flex-1 py-2 px-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs text-gray-300 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{copied ? "Copied UPI Link" : "Copy UPI Link"}</span>
                </button>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-center space-x-1.5 transition-colors"
                  title="Test payment webhook without actual UPI transfer"
                >
                  {isSimulating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Simulate Pay (Webhook)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
