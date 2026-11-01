"use client";

import React, { useState } from "react";
import { QrCode, CheckCircle2, X, Copy, Check, RefreshCw } from "lucide-react";
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
      toast("Generated Dynamic UPI QR Intent", "teal");
    } catch {
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
    } catch {
      toast("Simulation failed", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const copyUPIIntent = () => {
    if (activeOrder) {
      navigator.clipboard.writeText(activeOrder.upi_intent_url);
      setCopied(true);
      toast("UPI Link Copied to Clipboard", "teal");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-card border border-card-border rounded-xl p-5 sm:p-6 shadow-card relative transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-card-border">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-primary-text flex items-center space-x-2">
              <span>UPI Checkout</span>
              <Badge variant="teal">Instant Settlement</Badge>
            </h3>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">Scan and pay with any UPI application</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-highlight/30 dark:hover:bg-teal/20"
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
              <label className="text-xs font-bold text-primary-text block mb-1">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-teal dark:text-skyblue font-black">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-page border border-card-border text-sm text-primary-text focus:outline-none focus:border-teal font-black"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-primary-text block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer"
                className="w-full px-3 py-2.5 rounded-xl bg-page border border-card-border text-sm text-primary-text focus:outline-none focus:border-teal font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-primary-text block mb-1">
              Payment Reference Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Store purchase billing"
              className="w-full px-3 py-2.5 rounded-xl bg-page border border-card-border text-sm text-primary-text focus:outline-none focus:border-teal font-medium"
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
            Generate Dynamic UPI QR
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center">
          {activeOrder.status === "paid" ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-success/20 text-success border border-success/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-primary-text">Payment Verified</h4>
              <p className="text-xs font-medium text-secondary-text">
                ₹{activeOrder.amount.toFixed(2)} received from {activeOrder.customer_name}.
              </p>
              <div className="px-3 py-1.5 rounded-lg bg-page border border-card-border text-xs font-mono font-bold text-teal dark:text-skyblue">
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
                New Payment
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* QR Code Presentation */}
              <div className="p-4 rounded-xl bg-white border-2 border-card-border flex flex-col items-center shadow-md">
                <svg className="w-40 h-40 text-navy" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="13" width="12" height="12" rx="1" />

                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="13" width="12" height="12" rx="1" />

                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                  <rect x="13" y="75" width="12" height="12" rx="1" />

                  {/* QR Data Dots */}
                  <rect x="42" y="12" width="6" height="6" rx="1" />
                  <rect x="52" y="12" width="6" height="6" rx="1" />
                  <rect x="42" y="24" width="6" height="6" rx="1" />
                  <rect x="12" y="42" width="6" height="6" rx="1" />
                  <rect x="24" y="42" width="6" height="6" rx="1" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="var(--palette-teal)" />
                  <rect x="68" y="42" width="6" height="6" rx="1" />
                  <rect x="78" y="52" width="6" height="6" rx="1" />
                  <rect x="42" y="68" width="6" height="6" rx="1" />
                  <rect x="54" y="78" width="6" height="6" rx="1" />
                  <rect x="68" y="68" width="16" height="16" rx="2" />
                </svg>
                <span className="text-xs font-black text-navy mt-2 tracking-wider uppercase">
                  BHIM UPI Dynamic QR
                </span>
              </div>

              {/* Amount and Customer */}
              <div className="text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-primary-text font-mono">
                  ₹{activeOrder.amount.toFixed(2)}
                </span>
                <p className="text-xs font-semibold text-secondary-text">Customer: {activeOrder.customer_name}</p>
              </div>

              {/* Copy Intent Link */}
              <div className="flex items-center space-x-2 w-full max-w-sm">
                <input
                  type="text"
                  readOnly
                  value={activeOrder.upi_intent_url}
                  className="w-full text-xs bg-page px-3 py-2.5 rounded-xl border border-card-border font-mono font-semibold text-primary-text truncate focus:outline-none"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyUPIIntent}
                  icon={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              {/* Mock Webhook Simulator */}
              <div className="w-full pt-3 border-t border-card-border flex flex-col items-center space-y-2">
                <span className="text-xs text-secondary-text font-medium">Customer simulation:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulatePayment}
                  isLoading={isSimulating}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="w-full max-w-sm"
                >
                  Simulate Payment Received
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
