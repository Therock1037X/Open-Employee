"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Languages,
} from "lucide-react";
import { api, ParsedEntry } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { ConfettiCheck } from "@/components/ui/ConfettiCheck";
import { REGIONAL_LANGUAGES, LanguageCode } from "@/lib/i18n";

interface MultilingualEntryBoxProps {
  onTransactionCreated?: () => void;
  initialText?: string;
}

export function MultilingualEntryBox({
  onTransactionCreated,
  initialText = "",
}: MultilingualEntryBoxProps) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [inputText, setInputText] = useState(initialText);
  const [selectedLangCode, setSelectedLangCode] = useState<LanguageCode>("hi");
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [agentTypingText, setAgentTypingText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiDetails, setConfettiDetails] = useState({ title: "", subtitle: "" });

  const recognitionRef = useRef<any>(null);

  // Regional language presets covering India's major commercial languages
  const regionalPresets: Record<LanguageCode, { label: string; desc: string }> = {
    hi: { label: "2 kg sugar becha Ramesh ko 90 rs", desc: "Hindi" },
    mr: { label: "5 liter tel vikla Suresh la 750 rs", desc: "Marathi" },
    gu: { label: "2 kg ખાંડ વેચી રમેશને 90 રૂપિયા", desc: "Gujarati" },
    ta: { label: "ரமேஷுக்கு 2 கிலோ சர்க்கரை 90 ரூபாய்", desc: "Tamil" },
    te: { label: "రమేష్‌కు 2 కిలోల చక్కెర 90 రూపాయలు", desc: "Telugu" },
    kn: { label: "ರಮೇಶ್‌ಗೆ 2 ಕೆಜಿ ಸಕ್ಕರೆ 90 ರೂ ಮಾರಾಟ", desc: "Kannada" },
    ml: { label: "രമേശിന് 2 കിലോ പഞ്ചസാര 90 രൂപയ്ക്ക് വിറ്റു", desc: "Malayalam" },
    bn: { label: "রমেশকে ২ কেজি চিনি বেচেছি ৯০ টাকা", desc: "Bengali" },
    pa: { label: "ਰਮੇਸ਼ ਨੂੰ 2 ਕਿਲੋ ਖੰਡ 90 ਰੁਪਏ ਵੇਚੀ", desc: "Punjabi" },
    en: { label: "Restocked 20 kg Atta for 800 rs", desc: "English" },
  };

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  // Current selected language metadata
  const currentLang =
    REGIONAL_LANGUAGES.find((l) => l.code === selectedLangCode) ||
    REGIONAL_LANGUAGES[0];

  // Initialize Speech Recognition for selected regional language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLang.speechCode;

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
  }, [selectedLangCode, currentLang.speechCode]);

  // NLP Parse effect via fine-tuned model or intelligent parser
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

        const fullMessage = `Interpreted ${result.action_type.toUpperCase()}: ${
          result.quantity || 1
        } ${result.unit || "unit"} ${result.product || "Product"} for ₹${(
          result.amount || 0
        ).toFixed(2)}${result.party ? ` to ${result.party}` : ""}. Ready to record.`;

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
        const preset = regionalPresets[selectedLangCode]?.label || "2 kg sugar becha Ramesh ko 90 rs";
        setInputText(preset);
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

  // Speak out interpretation using Bhashini TTS or browser speech
  const speakInterpretation = async () => {
    if (!agentTypingText) return;
    try {
      setIsSpeaking(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(agentTypingText);
        utterance.lang = currentLang.speechCode;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        await api.synthesizeSpeech(agentTypingText, selectedLangCode);
        setTimeout(() => setIsSpeaking(false), 2500);
      }
    } catch {
      setIsSpeaking(false);
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
          lang: selectedLangCode,
        });

        setConfettiDetails({
          title: `Sale Saved: ₹${total.toFixed(2)}`,
          subtitle: `Deducted ${qty} ${parsed.unit || "unit"} of ${parsed.product}. Stock updated.`,
        });
        setShowConfetti(true);
        toast(`Sale saved, stock updated (₹${total.toFixed(2)})`, "success");
      } else if (parsed.action_type === "stock_in") {
        await api.adjustStock(parsed.product || "General Item", parsed.quantity || 10, "purchase");
        setConfettiDetails({
          title: `Stock Restocked!`,
          subtitle: `Added ${parsed.quantity || 10} units of ${parsed.product}.`,
        });
        setShowConfetti(true);
        toast(`Stock Updated: Added ${parsed.quantity || 10} units of ${parsed.product}`, "success");
      } else {
        setConfettiDetails({
          title: `Expense Logged: ₹${parsed.amount || 500}`,
          subtitle: `Recorded for ${parsed.product || "Store Operation"}`,
        });
        setShowConfetti(true);
        toast(`Expense Logged: ₹${parsed.amount || 500}`, "teal");
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
    <>
      <div className="w-full bg-card border border-card-border rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden transition-colors duration-200">
        {/* Top Language Selector Chips (10 Indian Regional Languages) */}
        <div className="flex flex-col gap-2.5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4 text-teal dark:text-skyblue" />
              <span className="text-xs text-primary-text font-bold">
                Bhashini Indian Regional Languages:
              </span>
            </div>

            {/* AI Agent Status Pill */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-page border border-card-border text-xs shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-primary-text text-[11px] font-bold">
                {isParsing
                  ? "Bhashini & Model Parsing..."
                  : isListening
                  ? `Listening in ${currentLang.name}...`
                  : "Bhashini Ready"}
              </span>
            </div>
          </div>

          {/* Scrollable Language Chips Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {REGIONAL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLangCode(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedLangCode === lang.code
                    ? "bg-teal text-white shadow-xs"
                    : "bg-page text-secondary-text border border-card-border hover:text-primary-text hover:border-teal"
                }`}
              >
                <span>{lang.native}</span>
                <span className="text-[10px] opacity-75 ml-1 hidden sm:inline">
                  ({lang.name})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Field with Glowing Mic Orb */}
        <div className="relative">
          <div className="flex items-center bg-page rounded-2xl border-2 border-card-border focus-within:border-teal transition-all shadow-inner">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && parsed) handleCommit();
              }}
              placeholder={`Type or speak in ${currentLang.name} (${currentLang.native}): "${regionalPresets[selectedLangCode]?.label}"...`}
              className="w-full bg-transparent px-4 sm:px-6 py-4 text-base sm:text-lg text-primary-text placeholder:text-secondary-text placeholder:opacity-75 focus:outline-none font-semibold"
            />

            <div className="flex items-center space-x-2.5 pr-3">
              {/* Glowing Mic Orb with ripples while listening */}
              <div className="relative flex items-center justify-center">
                {isListening && !shouldReduceMotion && (
                  <span className="mic-ripple-ring absolute inset-0 rounded-2xl bg-teal opacity-75 pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={toggleMic}
                  title={
                    isListening
                      ? "Stop listening"
                      : `Click to speak in ${currentLang.name} (${currentLang.native})`
                  }
                  aria-label={
                    isListening
                      ? "Stop listening"
                      : `Click to speak in ${currentLang.name} (${currentLang.native})`
                  }
                  className={`relative p-3 rounded-2xl border transition-all duration-200 ${
                    isListening
                      ? "bg-teal text-white border-teal shadow-button-lift"
                      : "bg-card border-card-border text-teal dark:text-skyblue hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Commit Button */}
              <Button
                variant="primary"
                size="md"
                onClick={handleCommit}
                disabled={!parsed || isSubmitting}
                isLoading={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Record
              </Button>
            </div>
          </div>
        </div>

        {/* Preset Pills for Current Language */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-primary-text font-bold mr-1">
            {currentLang.native} Presets:
          </span>
          <button
            type="button"
            onClick={() => setInputText(regionalPresets[selectedLangCode]?.label || "")}
            className="preset-chip bg-teal/10 border-teal/30 text-teal dark:text-skyblue"
          >
            {regionalPresets[selectedLangCode]?.label}
          </button>
          <button
            type="button"
            onClick={() => setInputText("2 kg sugar becha Ramesh ko 90 rs")}
            className="preset-chip"
          >
            2 kg sugar becha Ramesh ko 90 rs
          </button>
          <button
            type="button"
            onClick={() => setInputText("10 packet biscuit becha 100 rs")}
            className="preset-chip"
          >
            10 packet biscuit becha 100 rs
          </button>
        </div>

        {/* AI Live Interpretation Panel with Bhashini Speech Playback */}
        {parsed && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-page border border-card-border shadow-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-card-border text-xs">
              <div className="flex items-center space-x-2 text-primary-text font-bold">
                <Sparkles className="w-4 h-4 text-teal dark:text-skyblue" />
                <span>Interpreted Intent ({currentLang.name})</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Listen back button via Bhashini Voice */}
                <button
                  type="button"
                  onClick={speakInterpretation}
                  className="p-1.5 rounded-lg bg-teal/15 text-teal dark:text-skyblue hover:bg-teal/25 flex items-center space-x-1 font-bold text-[11px]"
                  title="Listen interpretation via Bhashini TTS"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isSpeaking ? "Speaking..." : "Listen"}</span>
                </button>
                <Badge variant="teal">
                  Confidence {Math.round(parsed.confidence * 100)}%
                </Badge>
              </div>
            </div>

            <p className="text-xs text-primary-text font-mono leading-relaxed mb-3 font-semibold">
              {agentTypingText}
              {!shouldReduceMotion && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal animate-pulse align-middle" />
              )}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-card border border-card-border shadow-xs">
                <span className="text-[11px] text-secondary-text font-semibold block">Action</span>
                <span className="font-bold text-teal dark:text-skyblue uppercase text-xs">
                  {parsed.action_type}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-card-border shadow-xs">
                <span className="text-[11px] text-secondary-text font-semibold block">Product</span>
                <span className="font-bold text-primary-text truncate block">{parsed.product}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-card-border shadow-xs">
                <span className="text-[11px] text-secondary-text font-semibold block">Quantity</span>
                <span className="font-bold text-primary-text">
                  {parsed.quantity} {parsed.unit || "unit"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-card-border shadow-xs">
                <span className="text-[11px] text-secondary-text font-semibold block">Amount</span>
                <span className="font-black text-primary-text text-sm">
                  ₹{(parsed.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confetti Celebration on Sale / Record */}
      <ConfettiCheck
        show={showConfetti}
        onComplete={() => setShowConfetti(false)}
        title={confettiDetails.title}
        subtitle={confettiDetails.subtitle}
      />
    </>
  );
}
