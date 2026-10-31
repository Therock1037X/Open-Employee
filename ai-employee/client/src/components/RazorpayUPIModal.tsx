"use client";

import React, { useState } from "react";
import { QrCode, CheckCircle2, X, Smartphone, Copy, Check, RefreshCw } from "lucide-react";
import { api, UPIOrder } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
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
      toast("Generated Dynamic UPI QR Intent", "gold");
    } catch (err) {
      toast("Error creating UPI checkout", "error");
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
      toast(`UPI Payment of ₹${activeOrder.amount.toFixed(2)} Received!`, "success");
      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    } catch (err) {
      toast("Simulation failed", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const copyUPIIntent = () => {
    if (activeOrder) {
      navigator.clipboard.writeText(activeOrder.upi_intent_url);
      setCopied(true);
      toast("UPI Link Copied to Clipboard", "gold");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
            <QrCode className="w-5 h-5 text-surface" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center space-x-2">
              <span>Razorpay Instant UPI Checkout</span>
              <Badge variant="gold">Zero Fee</Badge>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Scan via GPay, PhonePe, Paytm, or BHIM UPI</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content */}
      {!activeOrder ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-accent font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer"
                className="w-full px-3 py-2.5 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Payment Note / Invoice Reference
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Store purchase billing"
              className="w-full px-3 py-2.5 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateUPI}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            isLoading={isLoading}
            className="w-full"
            icon={<QrCode className="w-4 h-4" />}
          >
            Generate Dynamic UPI QR Code
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center">
          {activeOrder.status === "paid" ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-success/20 text-success border border-success/40 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">Payment Successfully Verified!</h4>
              <p className="text-xs text-text-muted">
                ₹{activeOrder.amount.toFixed(2)} received from {activeOrder.customer_name}.
              </p>
              <div className="px-3 py-1.5 rounded-lg bg-base border border-white/[0.08] text-xs font-mono text-accent">
                Order ID: {activeOrder.order_id}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveOrder(null);
                  setAmount("150");
                }}
              >
                Collect Another Payment
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* QR Code Presentation */}
              <div className="p-4 rounded-2xl bg-white shadow-gold-glow flex flex-col items-center">
                <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="#14213D" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="13" width="12" height="12" rx="1" fill="#14213D" />

                  <rect x="67" y="5" width="28" height="28" rx="4" fill="#14213D" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="13" width="12" height="12" rx="1" fill="#14213D" />

                  <rect x="5" y="67" width="28" height="28" rx="4" fill="#14213D" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="75" width="12" height="12" rx="1" fill="#14213D" />

                  <rect x="37" y="8" width="5" height="5" fill="#14213D" />
                  <rect x="47" y="8" width="6" height="5" fill="#14213D" />
                  <rect x="57" y="8" width="5" height="5" fill="#14213D" />
                  <rect x="37" y="18" width="7" height="6" fill="#14213D" />
                  <rect x="48" y="18" width="5" height="5" fill="#14213D" />
                  <rect x="37" y="28" width="5" height="5" fill="#14213D" />
                  <rect x="57" y="28" width="6" height="6" fill="#14213D" />

                  <rect x="42" y="42" width="16" height="16" rx="4" fill="#FCA311" />
                  <circle cx="50" cy="50" r="4" fill="#14213D" />

                  <rect x="37" y="67" width="6" height="6" fill="#14213D" />
                  <rect x="48" y="67" width="8" height="5" fill="#14213D" />
                  <rect x="62" y="67" width="6" height="7" fill="#14213D" />
                  <rect x="74" y="67" width="5" height="5" fill="#14213D" />
                  <rect x="85" y="67" width="6" height="6" fill="#14213D" />
                  <rect x="37" y="78" width="6" height="6" fill="#14213D" />
                  <rect x="50" y="78" width="8" height="6" fill="#14213D" />
                  <rect x="67" y="78" width="6" height="6" fill="#14213D" />
                  <rect x="80" y="78" width="7" height="6" fill="#14213D" />
                  <rect x="37" y="89" width="8" height="6" fill="#14213D" />
                  <rect x="52" y="89" width="6" height="6" fill="#14213D" />
                  <rect x="67" y="89" width="6" height="6" fill="#14213D" />
                  <rect x="80" y="89" width="6" height="6" fill="#14213D" />
                </svg>

                <div className="mt-2 text-center">
                  <div className="text-sm font-black text-surface tracking-wider">
                    ₹{activeOrder.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-surface font-mono font-bold">openemployee@icici</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2 text-xs text-accent">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span className="font-medium">Waiting for customer to scan and pay...</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyUPIIntent}
                  className="flex-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-success" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  isLoading={isSimulating}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Simulate Pay</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
