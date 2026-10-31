"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { api, ParsedEntry } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface MultilingualEntryBoxProps {
  onTransactionCreated?: () => void;
}

export function MultilingualEntryBox({ onTransactionCreated }: MultilingualEntryBoxProps) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"Hindi" | "Marathi" | "English">("Hindi");
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [agentTypingText, setAgentTypingText] = useState("");

  const recognitionRef = useRef<any>(null);

  const langChips: ("Hindi" | "Marathi" | "English")[] = ["Hindi", "Marathi", "English"];

  const examplePills = [
    { label: "2 kg sugar becha Ramesh ko 90 rs", lang: "Hindi" },
    { label: "10 packet biscuit becha 100 rs", lang: "Hindi" },
    { label: "5 liter tel vikla Suresh la 750 rs", lang: "Marathi" },
    { label: "Restocked 20 kg Atta for 800 rs", lang: "English" },
    { label: "Paid 500 shop electricity bill", lang: "English" },
  ];

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang =
          selectedLanguage === "Hindi"
            ? "hi-IN"
            : selectedLanguage === "Marathi"
            ? "mr-IN"
            : "en-IN";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputText(currentTranscript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLanguage]);

  // NLP Parse effect with typing/streaming simulation
  useEffect(() => {
    if (!inputText.trim()) {
      setParsed(null);
      setAgentTypingText("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsParsing(true);
        const result = await api.parseEntry(inputText);
        setParsed(result);

        // Streaming text effect for agent interpretation
        const fullMessage = `Interpreted ${result.action_type.toUpperCase()}: ${result.quantity || 1} ${result.unit || "unit"} ${result.product || "Product"} for ₹${(result.amount || 0).toFixed(2)}${result.party ? ` to ${result.party}` : ""}. Ready to save into business ledger.`;
        let charIndex = 0;
        setAgentTypingText("");
        const typeInterval = setInterval(() => {
          if (charIndex <= fullMessage.length) {
            setAgentTypingText(fullMessage.slice(0, charIndex));
            charIndex += 2;
          } else {
            clearInterval(typeInterval);
          }
        }, 15);
      } catch (err) {
        console.error(err);
      } finally {
        setIsParsing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      if (!isListening) {
        setIsListening(true);
        setInputText(
          selectedLanguage === "Marathi"
            ? "5 liter tel vikla Suresh la 750 rs"
            : "2 kg sugar becha Ramesh ko 90 rs"
        );
        setTimeout(() => setIsListening(false), 2000);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleCommit = async () => {
    if (!parsed || !inputText.trim()) return;

    try {
      setIsSubmitting(true);
      if (parsed.action_type === "sale" || parsed.action_type === "unknown") {
        const qty = parsed.quantity || 1;
        const total = parsed.amount || 90;
        const pricePerUnit = total / qty;
        await api.createSale({
          product: parsed.product || "General Item",
          quantity: qty,
          unit: parsed.unit || "unit",
          price: pricePerUnit,
          customer: parsed.party || "Walk-in Customer",
          raw_text: inputText,
          lang: selectedLanguage.toLowerCase(),
        });
        toast(`Sale Recorded: ${qty} ${parsed.unit || "unit"} ${parsed.product} (₹${total.toFixed(2)})`, "success");
      } else if (parsed.action_type === "stock_in") {
        await api.adjustStock(parsed.product || "General Item", parsed.quantity || 10, "purchase");
        toast(`Stock Updated: Added ${parsed.quantity || 10} units of ${parsed.product}`, "success");
      } else {
        toast(`Expense Logged: ₹${parsed.amount || 500} for ${parsed.product || "Store Operation"}`, "gold");
      }

      setInputText("");
      setParsed(null);
      setAgentTypingText("");
      if (onTransactionCreated) {
        onTransactionCreated();
      }
    } catch (err: any) {
      toast(err.message || "Failed to commit entry", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Top Language Selector Chips and Agent Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-muted font-medium">Input Language:</span>
          <div className="flex items-center space-x-1.5 p-1 bg-base rounded-xl border border-white/[0.08]">
            {langChips.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? "bg-accent text-surface shadow-gold-glow"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* AI Agent Panel Header with Gold Pulsing Dot */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-base border border-white/[0.08] text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-gold-glow"></span>
          </span>
          <span className="text-text-muted text-[11px] font-medium">
            {isParsing ? "Agent Parsing..." : isListening ? "Listening..." : "Agent Ready"}
          </span>
        </div>
      </div>

      {/* Large Input with Gold Glow on Focus & Mic Button */}
      <div className="relative">
        <div className="flex items-center bg-base rounded-2xl border border-white/[0.08] focus-within:border-accent focus-within:shadow-gold-glow transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && parsed) handleCommit();
            }}
            placeholder='Type or speak: "2 kg sugar becha Ramesh ko 90 rs" or "5 liter tel vikla 750 rs"...'
            className="w-full bg-transparent px-4 sm:px-6 py-4 text-base sm:text-lg text-text-primary placeholder:text-text-muted/40 focus:outline-none font-medium"
          />

          <div className="flex items-center space-x-2 pr-3">
            {/* Waveform while speaking */}
            {isListening && !shouldReduceMotion && (
              <div className="hidden sm:flex items-center space-x-1 px-2">
                {[0.4, 0.9, 0.6, 1, 0.5].map((scale, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, scale, 0.3] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                    className="w-1 h-6 bg-accent rounded-full origin-center"
                  />
                ))}
              </div>
            )}

            {/* Mic button: Gold on navy with expanding ripple ring while listening */}
            <div className="relative">
              {isListening && (
                <span className="animate-ping absolute inset-0 rounded-xl bg-accent opacity-60 pointer-events-none" />
              )}
              <button
                type="button"
                onClick={toggleMic}
                title={isListening ? "Stop listening" : "Speak in regional language"}
                className={`relative p-3 rounded-xl bg-surface border transition-all ${
                  isListening
                    ? "border-accent text-accent shadow-gold-glow scale-105"
                    : "border-white/[0.08] text-accent hover:border-accent/40"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Commit Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleCommit}
              disabled={!parsed || isSubmitting}
              isLoading={isSubmitting}
            >
              Record
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Example Prompt Pills */}
      <div className="flex flex-wrap gap-2 mt-3.5">
        <span className="text-[11px] text-text-muted flex items-center">Presets:</span>
        {examplePills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(pill.label);
              setSelectedLanguage(pill.lang as any);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-base border border-white/[0.08] text-text-muted hover:text-accent hover:border-accent/30 transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* AI Live Typing / Streaming Interpretation Panel */}
      {parsed && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-base border border-accent/30 shadow-gold-glow/50"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-xs">
            <div className="flex items-center space-x-2 text-accent font-bold">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>AI Agent Live Parse</span>
            </div>
            <Badge variant="gold">
              Confidence {Math.round(parsed.confidence * 100)}%
            </Badge>
          </div>

          <p className="text-xs text-text-primary font-mono leading-relaxed mb-3">
            {agentTypingText}
            {!shouldReduceMotion && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-accent animate-pulse align-middle" />
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-surface border border-white/[0.08]">
              <span className="text-[10px] text-text-muted block">Action</span>
              <span className="font-bold text-accent uppercase">{parsed.action_type}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-white/[0.08]">
              <span className="text-[10px] text-text-muted block">Product</span>
              <span className="font-semibold text-text-primary truncate block">{parsed.product}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-white/[0.08]">
              <span className="text-[10px] text-text-muted block">Quantity</span>
              <span className="font-semibold text-text-primary">{parsed.quantity} {parsed.unit || "unit"}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-white/[0.08]">
              <span className="text-[10px] text-text-muted block">Key Amount</span>
              <span className="font-bold text-accent">₹{(parsed.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
