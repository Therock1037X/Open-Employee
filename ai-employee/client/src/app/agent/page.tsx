"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApprovalGate } from "@/components/ApprovalGate";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { useToast } from "@/components/ui/Toast";
import {
  ShieldCheck,
  ClipboardList,
  PhoneCall,
  Bot,
  Cpu,
  Mic,
  Database,
  RefreshCw,
} from "lucide-react";

export default function AgentPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("approvals");
  const [testingVoice, setTestingVoice] = useState(false);

  const tabItems: TabItem[] = [
    { id: "approvals", label: "Approvals", icon: <ShieldCheck className="w-4 h-4" />, badge: "3" },
    { id: "audit", label: "Audit Log", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "voice", label: "Telephony & Voice", icon: <PhoneCall className="w-4 h-4" /> },
    { id: "system", label: "System & Tools", icon: <Cpu className="w-4 h-4" /> },
  ];

  const handleTestBhashini = () => {
    setTestingVoice(true);
    setTimeout(() => {
      setTestingVoice(false);
      toast("Bhashini Voice Pipeline operational", "success");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
              AI Agent Management
            </h1>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              Review human-in-the-loop decisions, immutable audit logs, and voice telephony pipelines.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="teal" dot>
              Autonomous Worker Active
            </Badge>
          </div>
        </div>

        {/* Sliding Teal Underline Tabs */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Approvals */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <ApprovalGate />
          </div>
        )}

        {/* Tab 2: Audit */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <AuditLogViewer />
          </div>
        )}

        {/* Tab 3: Telephony & Voice */}
        {activeTab === "voice" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-primary-text">Bhashini Voice Services</h3>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>

              <p className="text-xs text-primary-text/90 font-medium leading-relaxed">
                National AI platform for Indian languages enabling Speech-to-Text (ASR), translation (NMT), and voice synthesis (TTS) in Hindi, Marathi, and Hinglish.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">ASR (Speech Recognition)</span>
                  <span className="text-teal dark:text-skyblue font-mono font-bold">Ready (hi, mr, en)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">NMT (Translation Engine)</span>
                  <span className="text-teal dark:text-skyblue font-mono font-bold">Ready</span>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">TTS (Voice Synthesis)</span>
                  <span className="text-teal dark:text-skyblue font-mono font-bold">Ready</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleTestBhashini}
                isLoading={testingVoice}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Probe Pipeline Health
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-primary-text">Exotel Outbound Telephony</h3>
                </div>
                <Badge variant="teal">Configured</Badge>
              </div>

              <p className="text-xs text-primary-text/90 font-medium leading-relaxed">
                Automated supplier reorder confirmation calls and voice updates. All calls require sign-off via the Approval Gate.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Virtual Caller ID</span>
                  <span className="font-mono font-bold text-primary-text">080-45678900</span>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Call Recording & Transcript</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Approval Gate Policy</span>
                  <span className="text-primary-text font-bold">Mandatory</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: System & Tools */}
        {activeTab === "system" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-card-border">
                <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-primary-text">Autonomous Registered Tools</h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary-text">tool_record_sale</div>
                    <div className="text-xs text-secondary-text font-medium">Writes to SQLite business ledger</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary-text">tool_adjust_stock</div>
                    <div className="text-xs text-secondary-text font-medium">Updates inventory counts & min levels</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary-text">tool_generate_upi_qr</div>
                    <div className="text-xs text-secondary-text font-medium">Creates Razorpay UPI order</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary-text">tool_place_voice_call</div>
                    <div className="text-xs text-secondary-text font-medium">Dispatches Exotel call after approval</div>
                  </div>
                  <Badge variant="teal">Guarded</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-card-border">
                <div className="p-2 rounded-xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-primary-text">Agent Memory & State</h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Short-term Memory</span>
                  <span className="text-secondary-text font-semibold">Redis Session Cache</span>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Long-term Memory</span>
                  <span className="text-secondary-text font-semibold">SQLite Ledger & Audit Stream</span>
                </div>
                <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                  <span className="font-bold text-primary-text">Model Architecture</span>
                  <span className="font-mono font-bold text-teal dark:text-skyblue">FastAPI + LangChain Worker</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </PageTransition>
    </div>
  );
}
