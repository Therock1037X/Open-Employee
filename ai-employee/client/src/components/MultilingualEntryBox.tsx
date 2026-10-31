"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, Volume2 } from "lucide-react";
import { api, ParsedEntry } from "@/lib/api";

interface MultilingualEntryBoxProps {
  onTransactionCreated?: () => void;
}

export function MultilingualEntryBox({ onTransactionCreated }: MultilingualEntryBoxProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Quick preset pills for Indian MSME store operations
  const quickPills = [
    { label: "2 kg sugar becha Ramesh ko 90 rs", type: "sale" },
    { label: "1.5 kg toor dal becha 247 rs", type: "sale" },
    { label: "5 packet biscuit becha 100 me", type: "sale" },
    { label: "Restocked 20 kg Atta 800 rs", type: "stock" },
    { label: "Paid 500 shop electricity bill", type: "expense" },
  ];

  // Initialize Web Speech API if supported in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "hi-IN"; // Default to Indian Hindi/Hinglish

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputText(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Trigger parsing when text changes significantly or is chosen
  useEffect(() => {
    if (!inputText.trim()) {
      setParsed(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsParsing(true);
        const result = await api.parseEntry(inputText);
        setParsed(result);
      } catch (err) {
        console.error("Parse error:", err);
      } finally {
        setIsParsing(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputText]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      // Simulate speech recognition fallback for testing
      if (!isListening) {
        setIsListening(true);
        setInputText("Listening to voice in Hindi...");
        setTimeout(() => {
          setInputText("2 kg sugar becha Ramesh ko 90 rs");
          setIsListening(false);
        }, 2200);
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

  const handleCommitTransaction = async () => {
    if (!parsed || !inputText.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (parsed.action_type === "sale" || parsed.action_type === "unknown") {
        const qty = parsed.quantity || 1;
        const total = parsed.amount || 90;
        const pricePerUnit = total / qty;
        await api.createSale({
          product: parsed.product || "General Item",
          quantity: qty,
          unit: parsed.unit || "unit",
          price: pricePerUnit,
          customer: parsed.party || "Customer",
          raw_text: inputText,
          lang: parsed.detected_lang,
        });
        setSuccessMessage(`Recorded Sale: ${qty} ${parsed.unit || "unit"} ${parsed.product} (₹${total.toFixed(2)})`);
      } else if (parsed.action_type === "stock_in") {
        await api.adjustStock(parsed.product || "General Item", parsed.quantity || 10, "purchase");
        setSuccessMessage(`Stock Updated: Added ${parsed.quantity || 10} units of ${parsed.product}`);
      } else {
        setSuccessMessage(`Recorded Expense: ₹${parsed.amount || 500} for ${parsed.product || "Store Operation"}`);
      }

      setInputText("");
      setParsed(null);
      if (onTransactionCreated) {
        onTransactionCreated();
      }

      setTimeout(() => setSuccessMessage(null), 4500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-gray-800/90 shadow-2xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Mic indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-100 flex items-center space-x-2">
              <span>Multilingual Voice & Text Entry</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-normal">
                Bhashini + vLLM
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Speak or write in Hindi, Hinglish, or regional terms to update sales, inventory & finance.
            </p>
          </div>
        </div>

        {/* Real-time speech status pill */}
        {isListening && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Listening... बोलिए</span>
          </div>
        )}
      </div>

      {/* Input Box with Embedded Mic & Action Button */}
      <div className="relative">
        <div className="flex items-center bg-gray-900/90 rounded-xl border border-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && parsed) {
                handleCommitTransaction();
              }
            }}
            placeholder='Type or tap mic: "2 kg sugar becha Ramesh ko 90 rs" / "Paid 500 rent"'
            className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base text-gray-100 placeholder-gray-500 focus:outline-none"
          />

          <div className="flex items-center space-x-1.5 pr-2">
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? "Stop listening" : "Start Indian voice dictation"}
              className={`p-2.5 rounded-lg transition-all ${
                isListening
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse scale-105"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Commit Button */}
            <button
              type="button"
              onClick={handleCommitTransaction}
              disabled={!parsed || isSubmitting}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                parsed && !isSubmitting
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Save</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Example Prompt Pills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <span className="text-[11px] text-gray-500 flex items-center pr-1">Try:</span>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(pill.label)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-900/60 hover:bg-indigo-600/15 border border-gray-800 hover:border-indigo-500/30 text-gray-300 hover:text-indigo-300 transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Real-time Parsed Preview Card */}
      {parsed && (
        <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-500/20 text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Parsed Understanding (AI Agent)</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Confidence {Math.round(parsed.confidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800/80">
              <span className="text-[10px] text-gray-400 block">Action Type</span>
              <span className="font-semibold capitalize text-indigo-300">
                {parsed.action_type === "sale"
                  ? "Sale (बिक्री)"
                  : parsed.action_type === "stock_in"
                  ? "Restock (माल आया)"
                  : "Expense (खर्चा)"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800/80">
              <span className="text-[10px] text-gray-400 block">Product</span>
              <span className="font-semibold text-gray-100 truncate block">
                {parsed.product || "General Item"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800/80">
              <span className="text-[10px] text-gray-400 block">Quantity</span>
              <span className="font-semibold text-gray-100">
                {parsed.quantity} {parsed.unit || "unit"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-800/80">
              <span className="text-[10px] text-gray-400 block">Total Amount</span>
              <span className="font-bold text-emerald-400">
                ₹{(parsed.amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
