"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Megaphone,
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
} from "lucide-react";

export default function MarketingPage() {
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "instagram">("whatsapp");
  const [productTitle, setProductTitle] = useState("Premium Basmati Rice & Desi Ghee");
  const [discount, setDiscount] = useState("10% OFF");
  const [caption, setCaption] = useState(
    "दिवाली स्पेशल ऑफर! हमारे स्टोर से प्रीमियम बासमती चावल और देसी घी पर पाइये 10% की भारी छूट! आज ही विजिट करें या घर बैठे आर्डर करें। लिमिटेड स्टॉक!"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateCaption = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (activeChannel === "instagram") {
        setCaption(
          `Pure quality at unbeatable rates! Get ${discount} on ${productTitle}. Hand-curated for your family. Tap bio link to order on WhatsApp!`
        );
      } else {
        setCaption(
          `नमस्ते जी! आपके पसंदीदा ${productTitle} पर चल रहा है विशेष ${discount} का ऑफर। आज ही दुकान से प्राप्त करें या WhatsApp पर आर्डर लिखवाएं!`
        );
      }
      setIsGenerating(false);
      toast("AI generated channel-optimized copy", "teal");
    }, 500);
  };

  const handleQueueForApproval = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast("Broadcast queued into Approval Gate for sign-off!", "success");
    }, 450);
  };

  return (
    <div className="min-h-screen bg-page text-primary-text flex flex-col transition-colors duration-200">
      <Navbar />

      <PageTransition className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
                Marketing Engine
              </h1>
              <p className="text-xs text-secondary-text mt-0.5">
                Generate localized festive campaigns and broadcast to regular customers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-card-border">
                <Sparkles className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-bold text-primary-text">Campaign Creator</h3>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1.5">Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChannel("whatsapp")}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                      activeChannel === "whatsapp"
                        ? "bg-teal text-white border-teal shadow-sm"
                        : "bg-page border-card-border text-secondary-text hover:text-primary-text"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannel("instagram")}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                      activeChannel === "instagram"
                        ? "bg-teal text-white border-teal shadow-sm"
                        : "bg-page border-card-border text-secondary-text hover:text-primary-text"
                    }`}
                  >
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1">Product Headline</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1">Discount Tag</label>
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateCaption}
                isLoading={isGenerating}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full"
              >
                Generate Copy
              </Button>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <h3 className="text-sm font-bold text-primary-text">Broadcast Preview</h3>
                <Badge variant="teal">{activeChannel.toUpperCase()}</Badge>
              </div>

              <div>
                <label className="text-xs font-semibold text-secondary-text block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 text-xs bg-page rounded-xl border border-card-border text-primary-text focus:outline-none focus:border-teal leading-relaxed font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-card-border flex items-center justify-between text-xs text-secondary-text">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  <span>Approval Gate will request owner sign-off before dispatch</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleQueueForApproval}
                  isLoading={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  Queue for Approval
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
