"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/i18n";
import {
  Settings as SettingsIcon,
  Store,
  Shield,
  Save,
  Sun,
  Moon,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [storeName, setStoreName] = useState("Open Employee MSME Mart");
  const [upiVpa, setUpiVpa] = useState("openemployee@icici");
  const [ownerPhone, setOwnerPhone] = useState("+91 98765 43210");
  const [defaultLang, setDefaultLang] = useState("hi");
  const [approvalThreshold, setApprovalThreshold] = useState("500");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast("Configuration saved successfully", "success");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="flex items-center space-x-3 pb-4 border-b border-card-border">
          <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white shadow-xs">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">{t.systemSettings}</h1>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              {t.settingsSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Shop Profile */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-card-border">
              <Store className="w-4 h-4 text-teal dark:text-skyblue" />
              <h2 className="text-sm font-bold text-primary-text">{t.shopProfile}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-primary-text block mb-1">Business Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-page rounded-xl border border-card-border text-primary-text font-semibold focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="font-bold text-primary-text block mb-1">Owner Contact Phone</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-page rounded-xl border border-card-border text-primary-text font-semibold focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="font-bold text-primary-text block mb-1">Razorpay Settlement VPA</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3 py-2 bg-page rounded-xl border border-card-border text-primary-text font-mono font-bold focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="font-bold text-primary-text block mb-1">Default Input Language</label>
                <select
                  value={defaultLang}
                  onChange={(e) => setDefaultLang(e.target.value)}
                  className="w-full px-3 py-2 bg-page rounded-xl border border-card-border text-primary-text font-bold focus:outline-none focus:border-teal cursor-pointer"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Safety & Approval Thresholds */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-card-border">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-teal dark:text-skyblue" />
                <h2 className="text-sm font-bold text-primary-text">Safety Guardrails</h2>
              </div>
              <Badge variant="teal">Mandatory Human Sign-off</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-primary-text block mb-1">
                  Autonomous Expense Limit (₹ INR)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2 text-teal dark:text-skyblue font-black">₹</span>
                  <input
                    type="number"
                    value={approvalThreshold}
                    onChange={(e) => setApprovalThreshold(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-page rounded-xl border border-card-border text-primary-text font-black text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <p className="text-xs text-secondary-text mt-1.5 font-medium">
                  Actions and transactions above this threshold will always pause in the Approval Gate.
                </p>
              </div>
            </div>
          </Card>

          {/* Appearance / Theme */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-card-border">
              <div className="flex items-center space-x-2">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-teal dark:text-skyblue" />
                ) : (
                  <Sun className="w-4 h-4 text-teal" />
                )}
                <h2 className="text-sm font-bold text-primary-text">Appearance & Theme</h2>
              </div>
              <Badge variant="teal">{theme === "dark" ? "Dark Theme Active" : "Light Theme Active"}</Badge>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-primary-text">Color Scheme Preference</div>
                <div className="text-xs text-secondary-text font-medium mt-0.5">
                  Seamless toggle between Light (Beige & White) or Dark (Midnight Navy) modes.
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={toggleTheme}
                icon={theme === "dark" ? <Sun className="w-4 h-4 text-skyblue" /> : <Moon className="w-4 h-4 text-teal dark:text-skyblue" />}
              >
                Switch to {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {t.saveSettings}
            </Button>
          </div>
        </form>
      </PageTransition>
    </div>
  );
}
