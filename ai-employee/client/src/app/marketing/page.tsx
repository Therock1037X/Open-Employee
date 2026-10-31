"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  Megaphone,
  MessageSquare,
  Instagram,
  ShoppingBag,
  Sparkles,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function MarketingPage() {
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState<"whatsapp" | "instagram" | "indiamart">("whatsapp");
  const [productTitle, setProductTitle] = useState("Premium Basmati Rice & Desi Ghee");
  const [discount, setDiscount] = useState("10% OFF");
  const [targetAudience, setTargetAudience] = useState("Regular Walk-in Customers (142 contacts)");
  const [caption, setCaption] = useState(
    "🌟 दिवाली स्पेशल ऑफर! हमारे स्टोर से प्रीमियम बासमती चावल और देसी घी पर पाइये 10% की भारी छूट! आज ही विजिट करें या घर बैठे आर्डर करें। लिमिटेड स्टॉक! 🛍️✨ #DesiGhee #BasmatiRice #FestivalOffer #LocalShop"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateCaption = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (activeChannel === "instagram") {
        setCaption(
          `✨ Pure quality at unbeatable rates! Get ${discount} on ${productTitle}. Hand-curated for your family's authentic Indian meals. Tap the bio link to order on WhatsApp! 🌾🍲 #IndianKitchen #GroceryShopping #ShopLocal #SmallBusinessIndia`
        );
      } else if (activeChannel === "indiamart") {
        setCaption(
          `B2B Bulk Offer: Direct supplier pricing on ${productTitle}. Minimum order quantity: 50 kg. Verified GST invoice and fast local dispatch available. Contact us for bulk rates.`
        );
      } else {
        setCaption(
          `नमस्ते जी! 🙏 आपके पसंदीदा ${productTitle} पर चल रहा है विशेष ${discount} का ऑफर। आज ही अपनी दुकान से प्राप्त करें या WhatsApp पर रिप्लाई करके आर्डर लिखवाएं!`
        );
      }
      setIsGenerating(false);
      toast("AI generated channel-optimized caption", "gold");
    }, 600);
  };

  const handleQueueForApproval = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast("Post queued into Mandatory Approval Gate for your sign-off!", "success");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow">
              <Megaphone className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Autonomous Marketing & Multi-Channel Posts
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                AI auto-generates regional captions and schedules WhatsApp, Instagram, and IndiaMART campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Channel Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-surface border border-white/[0.08] rounded-2xl max-w-lg">
          <button
            onClick={() => {
              setActiveChannel("whatsapp");
              handleGenerateCaption();
            }}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChannel === "whatsapp"
                ? "bg-accent text-surface shadow-gold-glow"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel("instagram");
              handleGenerateCaption();
            }}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChannel === "instagram"
                ? "bg-accent text-surface shadow-gold-glow"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </button>

          <button
            onClick={() => {
              setActiveChannel("indiamart");
              handleGenerateCaption();
            }}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeChannel === "indiamart"
                ? "bg-accent text-surface shadow-gold-glow"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>IndiaMART</span>
          </button>
        </div>

        {/* 2-Column: Left = Composer, Right = Post Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Post Composer (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold text-text-primary flex items-center space-x-2">
                  <span>Campaign Content Generator</span>
                  <Badge variant="gold">Fine-tuned Qwen / Llama</Badge>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Regenerate
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  Product / Promotion Focus
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">
                    Discount / Incentive
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">
                    Target Broadcast Segment
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-base border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">
                  AI Auto-Generated Caption (Regional Hinglish / Hindi / English)
                </label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-base border border-white/[0.08] text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent focus:shadow-gold-glow leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Will be routed through Mandatory Approval Gate</span>
                </div>
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

          {/* Right Column: Live Mock Channel Device Card (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-wider font-mono">
                  {activeChannel} Live Preview
                </span>
                <Badge variant="navy">Customer View</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-base border border-white/[0.08] space-y-3">
                {/* Simulated Post Header */}
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-surface text-xs">
                    OE
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Open Employee Store</h4>
                    <span className="text-[10px] text-text-muted">Broadcast to {targetAudience}</span>
                  </div>
                </div>

                {/* Simulated Banner graphic */}
                <div className="w-full h-40 rounded-xl bg-surface border border-white/[0.08] flex flex-col items-center justify-center text-center p-4">
                  <div className="text-accent text-2xl font-black mb-1">{discount}</div>
                  <div className="text-sm font-bold text-text-primary">{productTitle}</div>
                  <span className="text-[10px] text-text-muted mt-2 px-2 py-0.5 rounded bg-base border border-white/[0.08]">
                    Verified Fresh Quality Guarantee
                  </span>
                </div>

                {/* Simulated Caption */}
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {caption}
                </p>

                {/* Simulated Action */}
                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-accent font-semibold">
                  <span>WhatsApp 1-Click Order Link</span>
                  <span>bit.ly/order-now</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
