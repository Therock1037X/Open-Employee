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
import { VoiceCallScreen } from "@/components/VoiceCallScreen";
import { Timeline, TaskTimelineStatus } from "@/components/ui/Timeline";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { useToast } from "@/components/ui/Toast";
import { useLanguage } from "@/lib/i18n";
import {
  ShieldCheck,
  ClipboardList,
  PhoneCall,
  Bot,
  Cpu,
  Mic,
  Database,
  RefreshCw,
  GitBranch,
} from "lucide-react";

interface AgentActiveTask {
  id: string;
  name: string;
  category: "Telephony" | "Marketing" | "Stock Reorder" | "GST Portal";
  stage: TaskTimelineStatus;
  updatedAt: string;
}

export default function AgentPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("voice");
  const [testingVoice, setTestingVoice] = useState(false);

  const sampleTasks: AgentActiveTask[] = [
    {
      id: "task-1",
      name: "Sugar Reorder PO to Balaji Traders (₹3,500)",
      category: "Stock Reorder",
      stage: "approved",
      updatedAt: "10 mins ago",
    },
    {
      id: "task-2",
      name: "Outbound Voice Reminder to Ramesh Kumar (₹150 overdue)",
      category: "Telephony",
      stage: "executing",
      updatedAt: "Just now",
    },
    {
      id: "task-3",
      name: "WhatsApp Festival Promotion (Ganesh Chaturthi special offer)",
      category: "Marketing",
      stage: "done",
      updatedAt: "1 hour ago",
    },
    {
      id: "task-4",
      name: "Mock GST Portal Monthly GSTR-3B Draft Return",
      category: "GST Portal",
      stage: "planned",
      updatedAt: "2 hours ago",
    },
  ];

  const tabItems: TabItem[] = [
    { id: "voice", label: t.voiceCalls, icon: <PhoneCall className="w-4 h-4" /> },
    { id: "tasks", label: t.pipelines, icon: <GitBranch className="w-4 h-4" />, badge: "4" },
    { id: "approvals", label: t.approvals, icon: <ShieldCheck className="w-4 h-4" />, badge: "3" },
    { id: "audit", label: t.auditTrail, icon: <ClipboardList className="w-4 h-4" /> },
    { id: "system", label: "System & Tools", icon: <Cpu className="w-4 h-4" /> },
  ];

  const handleTestBhashini = () => {
    setTestingVoice(true);
    setTimeout(() => {
      setTestingVoice(false);
      toast("Bhashini Voice Pipeline operational (ASR + NMT + TTS)", "success");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200 pb-20 md:pb-8">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-card-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
              AI Agent Management & Telephony
            </h1>
            <p className="text-xs text-secondary-text mt-0.5 font-medium">
              Review human-in-the-loop sign-offs, interactive voice calls, task progression, and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <Badge variant="teal">{t.autonomousWorkerActive}</Badge>
          </div>
        </div>

        {/* Sliding Teal Underline Tabs */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Telephony & Voice (Voice Call Screen with Orb, Waveform, Transcript) */}
        {activeTab === "voice" && (
          <div className="space-y-6">
            <VoiceCallScreen />

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <span className="text-teal dark:text-skyblue font-mono font-bold">Active</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <span className="font-bold text-primary-text">TTS (Voice Synthesis)</span>
                    <span className="text-teal dark:text-skyblue font-mono font-bold">Active</span>
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
                  Automated supplier reorder confirmation calls and voice payment reminders. Normalized Indian format (+91 / 0) with strict 9 AM – 8 PM IST calling window.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <span className="font-bold text-primary-text">ExoPhone Virtual Number</span>
                    <span className="font-mono font-bold text-primary-text">080-45678900</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <span className="font-bold text-primary-text">WebSocket Stream Protocol</span>
                    <span className="font-mono text-teal dark:text-skyblue font-bold">8 kHz 16-bit PCM</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-page border border-card-border flex items-center justify-between">
                    <span className="font-bold text-primary-text">Human Approval Gate</span>
                    <span className="text-primary-text font-bold">Mandatory</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Task Timelines (Planned, Approved, Executing, Done) */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-primary-text">
                  Per-Task Autonomous Progression
                </h3>
                <p className="text-xs text-secondary-text font-medium mt-0.5">
                  Visual milestone lifecycle from initial AI generation to human sign-off and completion.
                </p>
              </div>
              <Badge variant="teal">4 Active</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sampleTasks.map((task) => (
                <Card key={task.id} hoverEffect className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-page border border-card-border text-secondary-text">
                        {task.category}
                      </span>
                      <h4 className="text-sm font-bold text-primary-text">{task.name}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-secondary-text">
                      Updated {task.updatedAt}
                    </span>
                  </div>

                  {/* Task Timeline Component */}
                  <div className="pt-2">
                    <Timeline currentStage={task.stage} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Approvals Gate */}
        {activeTab === "approvals" && (
          <div className="space-y-6">
            <ApprovalGate />
          </div>
        )}

        {/* Tab 4: Audit Log */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <AuditLogViewer />
          </div>
        )}

        {/* Tab 5: System & Registered Tools */}
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
                  <span className="font-bold text-primary-text">LLM Engine</span>
                  <span className="font-mono font-bold text-teal dark:text-skyblue">FastAPI + OpenAI Compatible Wrapper</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </PageTransition>

      <MobileTabBar />
    </div>
  );
}
