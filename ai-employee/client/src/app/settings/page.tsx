"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Settings as SettingsIcon,
  Store,
  PhoneCall,
  Shield,
  Save,
  CheckCircle2,
  Key,
  Globe,
  Sliders,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [storeName, setStoreName] = useState("Open Employee MSME Mart");
  const [upiVpa, setUpiVpa] = useState("openemployee@icici");
  const [ownerPhone, setOwnerPhone] = useState("+91 98765 43210");
  const [defaultLang, setDefaultLang] = useState("hi");
  const [approvalThreshold, setApprovalThreshold] = useState("500");
  const [useMocks, setUseMocks] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast("Shop configuration and safety thresholds saved!", "success");
    }, 450);
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
            <SettingsIcon className="w-5 h-5 text-surface" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">System Settings</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage shop identity, UPI gateway credentials, Bhashini voice pipelines, and approval guardrails.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Shop Profile */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08]">
              <Store className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">Shop & Merchant Identity</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Store Legal Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Razorpay UPI Merchant VPA</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm font-mono text-accent focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Owner Contact (Phone)</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Default Operating Language</label>
                <select
                  value={defaultLang}
                  onChange={(e) => setDefaultLang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Safety & Approval Guardrails */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.08]">
              <Shield className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">Human-in-the-Loop Guardrails</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Mandatory Approval Threshold (₹ INR)
                </label>
                <p className="text-[11px] text-text-muted/60 mb-2">
                  Any payout or supplier purchase exceeding this value pauses for manual approval.
                </p>
                <input
                  type="number"
                  value={approvalThreshold}
                  onChange={(e) => setApprovalThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Mock Integration Fallbacks
                </label>
                <p className="text-[11px] text-text-muted/60 mb-2">
                  Use mock responses when external Bhashini, Exotel or GST API keys are absent.
                </p>
                <label className="flex items-center space-x-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={useMocks}
                    onChange={(e) => setUseMocks(e.target.checked)}
                    className="w-4 h-4 rounded border-white/[0.08] text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-xs font-semibold text-text-primary">
                    Enable Safe Sandbox Mocks (Recommended)
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
