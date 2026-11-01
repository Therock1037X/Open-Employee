"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  MicOff,
  Sparkles,
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

  // NLP Parse effect
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

        const fullMessage = `Interpreted ${result.action_type.toUpperCase()}: ${result.quantity || 1} ${result.unit || "unit"} ${result.product || "Product"} for ₹${(result.amount || 0).toFixed(2)}${result.party ? ` to ${result.party}` : ""}. Ready to record.`;
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
      } catch {
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
        toast(`Expense Logged: ₹${parsed.amount || 500} for ${parsed.product || "Store Operation"}`, "teal");
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
    <div className="w-full bg-card border border-card-border rounded-xl p-5 sm:p-6 shadow-card relative overflow-hidden transition-colors duration-200">
      {/* Top Language Selector Chips and Agent Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-primary-text font-bold">Input Language:</span>
          <div className="flex items-center space-x-1 p-1 bg-page rounded-xl border border-card-border">
            {langChips.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? "bg-teal text-white shadow-xs"
                    : "text-secondary-text hover:text-primary-text hover:bg-card"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* AI Agent Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-page border border-card-border text-xs shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal"></span>
          </span>
          <span className="text-primary-text text-xs font-semibold">
            {isParsing ? "Agent Parsing..." : isListening ? "Listening..." : "Agent Ready"}
          </span>
        </div>
      </div>

      {/* Input Field with Mic Button */}
      <div className="relative">
        <div className="flex items-center bg-page rounded-xl border-2 border-card-border focus-within:border-teal transition-all shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && parsed) handleCommit();
            }}
            placeholder='Type or speak: "2 kg sugar becha Ramesh ko 90 rs" or "5 liter tel vikla 750 rs"...'
            className="w-full bg-transparent px-4 sm:px-6 py-4 text-base sm:text-lg text-primary-text placeholder:text-secondary-text placeholder:opacity-75 focus:outline-none font-semibold"
          />

          <div className="flex items-center space-x-2 pr-3">
            {/* Mic button with soft ripple ONLY while listening */}
            <div className="relative flex items-center justify-center">
              {isListening && !shouldReduceMotion && (
                <span className="mic-ripple-ring absolute inset-0 rounded-xl bg-teal opacity-70 pointer-events-none" />
              )}
              <button
                type="button"
                onClick={toggleMic}
                title={isListening ? "Stop listening" : "Speak in regional language"}
                aria-label={isListening ? "Stop listening" : "Speak in regional language"}
                className={`relative p-3 rounded-xl border transition-all duration-200 ${
                  isListening
                    ? "bg-teal text-white border-teal shadow-button-lift"
                    : "bg-card border-card-border text-teal dark:text-skyblue hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
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

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs text-primary-text font-bold mr-1">Presets:</span>
        {examplePills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(pill.label);
              setSelectedLanguage(pill.lang as any);
            }}
            className="preset-chip"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* AI Live Interpretation Panel */}
      {parsed && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-page border border-card-border shadow-xs"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-card-border text-xs">
            <div className="flex items-center space-x-2 text-primary-text font-bold">
              <Sparkles className="w-4 h-4 text-teal dark:text-skyblue" />
              <span>Parsed Intent</span>
            </div>
            <Badge variant="teal">
              Confidence {Math.round(parsed.confidence * 100)}%
            </Badge>
          </div>

          <p className="text-xs text-primary-text font-mono leading-relaxed mb-3 font-semibold">
            {agentTypingText}
            {!shouldReduceMotion && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal animate-pulse align-middle" />
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-card border border-card-border shadow-xs">
              <span className="text-[11px] text-secondary-text font-semibold block">Action</span>
              <span className="font-bold text-teal dark:text-skyblue uppercase text-xs">{parsed.action_type}</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-card-border shadow-xs">
              <span className="text-[11px] text-secondary-text font-semibold block">Product</span>
              <span className="font-bold text-primary-text truncate block">{parsed.product}</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-card-border shadow-xs">
              <span className="text-[11px] text-secondary-text font-semibold block">Quantity</span>
              <span className="font-bold text-primary-text">{parsed.quantity} {parsed.unit || "unit"}</span>
            </div>
            <div className="p-3 rounded-lg bg-card border border-card-border shadow-xs">
              <span className="text-[11px] text-secondary-text font-semibold block">Amount</span>
              <span className="font-black text-primary-text text-sm">₹{(parsed.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
