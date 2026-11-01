"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { AgentOrb, AgentOrbState } from "@/components/ui/AgentOrb";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface TranscriptBubble {
  id: string;
  sender: "ai" | "user";
  speakerName: string;
  text: string;
  displayedText?: string;
  language: "Hindi" | "Marathi" | "English";
  timestamp: string;
}

const DEMO_TRANSCRIPT_SCRIPT: {
  sender: "ai" | "user";
  speakerName: string;
  fullText: string;
  lang: "Hindi" | "Marathi" | "English";
}[] = [
  {
    sender: "ai",
    speakerName: "Open Employee AI",
    fullText: "Namaste Sharma ji, Open Employee bol raha hoon. Kya aaj 50 kg sugar aur 10 liter tel ka stock chahiye?",
    lang: "Hindi",
  },
  {
    sender: "user",
    speakerName: "Balaji Traders (Supplier)",
    fullText: "Haan Ramesh bhai, sugar ₹42 per kg aur tel ₹140 liter lagega. Kal subah bhej doon?",
    lang: "Hindi",
  },
  {
    sender: "ai",
    speakerName: "Open Employee AI",
    fullText: "Theek hai ji! Total ₹3,500 ka purchase order generate karke owner ki approval ke liye submit kar diya hai.",
    lang: "Hindi",
  },
  {
    sender: "user",
    speakerName: "Balaji Traders (Supplier)",
    fullText: "Bahut badhiya, confirm ho gaya. Shukriya!",
    lang: "Hindi",
  },
];

export function VoiceCallScreen() {
  const shouldReduceMotion = useReducedMotion();
  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [orbState, setOrbState] = useState<AgentOrbState>("idle");
  const [bubbles, setBubbles] = useState<TranscriptBubble[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles]);

  // Call timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Simulate turn-by-turn conversation when call is active
  useEffect(() => {
    if (!callActive || callEnded) return;

    if (currentTurn >= DEMO_TRANSCRIPT_SCRIPT.length) {
      // Auto finish after last turn
      const finishTimer = setTimeout(() => {
        endCall();
      }, 2500);
      return () => clearTimeout(finishTimer);
    }

    const turnData = DEMO_TRANSCRIPT_SCRIPT[currentTurn];
    setOrbState(turnData.sender === "ai" ? "speaking" : "listening");

    // Typewriter effect word-by-word
    const words = turnData.fullText.split(" ");
    let wordIdx = 0;

    const newBubble: TranscriptBubble = {
      id: `turn-${currentTurn}`,
      sender: turnData.sender,
      speakerName: turnData.speakerName,
      text: turnData.fullText,
      displayedText: "",
      language: turnData.lang,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setBubbles((prev) => [...prev, newBubble]);

    const wordInterval = setInterval(() => {
      wordIdx += 1;
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === newBubble.id
            ? { ...b, displayedText: words.slice(0, wordIdx).join(" ") }
            : b
        )
      );

      if (wordIdx >= words.length) {
        clearInterval(wordInterval);
        // Switch turn after pause
        const nextTurnTimer = setTimeout(() => {
          setCurrentTurn((prev) => prev + 1);
        }, 1200);
        return () => clearTimeout(nextTurnTimer);
      }
    }, 120);

    return () => clearInterval(wordInterval);
  }, [callActive, currentTurn, callEnded]);

  const startCall = () => {
    setCallActive(true);
    setCallEnded(false);
    setSeconds(0);
    setCurrentTurn(0);
    setBubbles([]);
    setOrbState("speaking");
  };

  const endCall = () => {
    setCallActive(false);
    setCallEnded(true);
    setOrbState("idle");
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Waveform heights
  const waveformHeights = [24, 45, 68, 90, 52, 74, 38, 85, 60, 40, 75, 30];

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      {/* Call Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-card-border gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-primary-text">
              Exotel & Bhashini Live Voice Telephony
            </h3>
            <p className="text-xs text-secondary-text font-medium">
              8 kHz 16-bit PCM WebSocket & Indian Language NMT/TTS Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {callActive && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-error/15 text-error border border-error/30 text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span>LIVE: {formatTimer(seconds)}</span>
            </div>
          )}
          <Badge variant={callActive ? "success" : "teal"}>
            {callActive ? "Call in Progress" : callEnded ? "Call Finished" : "Ready"}
          </Badge>
        </div>
      </div>

      {/* Voice Orb & Audio Waveform Stage */}
      <div className="p-8 rounded-2xl bg-page/70 border border-card-border flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-teal/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Center Animated Orb */}
        <div className="relative mb-6 z-10">
          <AgentOrb state={orbState} size="lg" />
        </div>

        {/* Dynamic Waveform Visualizer */}
        {callActive && !shouldReduceMotion ? (
          <div className="flex items-center space-x-1.5 h-10 mb-2 z-10">
            {waveformHeights.map((h, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-teal dark:bg-skyblue rounded-full"
                animate={
                  isMuted
                    ? { height: 4 }
                    : {
                        height: [10, Math.min(36, h * 0.45), 10],
                        opacity: [0.6, 1, 0.6],
                      }
                }
                transition={{
                  duration: 0.6 + (i % 3) * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 h-10 mb-2 opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-teal rounded-full" />
            ))}
          </div>
        )}

        <div className="text-xs font-bold text-secondary-text z-10">
          {callActive
            ? orbState === "speaking"
              ? "AI speaking Indian-language audio..."
              : "Listening to caller speech (ASR)..."
            : callEnded
            ? "Call session completed"
            : "Click 'Start Voice Call' to launch live conversation simulation"}
        </div>
      </div>

      {/* Live Streaming Transcript Window */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-text">
            Live Streamed Transcript
          </h4>
          <span className="text-[11px] font-mono text-secondary-text">
            {bubbles.length} turns recorded
          </span>
        </div>

        <div className="h-56 overflow-y-auto p-4 rounded-2xl bg-card border border-card-border space-y-3">
          {bubbles.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-secondary-text font-medium">
              Transcript will stream word-by-word once a call starts.
            </div>
          ) : (
            bubbles.map((bubble) => {
              const isAi = bubble.sender === "ai";
              return (
                <motion.div
                  key={bubble.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[11px] font-bold text-secondary-text">
                    <span>{bubble.speakerName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-page border border-card-border text-teal dark:text-skyblue font-mono font-bold">
                      {bubble.language}
                    </span>
                    <span className="text-[10px] text-secondary-text/80 font-mono">
                      {bubble.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                      isAi
                        ? "bg-teal/15 text-primary-text border border-teal/25 rounded-tl-none"
                        : "bg-page text-primary-text border border-card-border rounded-tr-none"
                    }`}
                  >
                    {bubble.displayedText || bubble.text}
                    {callActive && bubble.displayedText !== bubble.text && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-teal animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Outcome Summary Card */}
      {callEnded && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="p-5 rounded-2xl bg-teal/10 border-2 border-teal/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h4 className="text-sm font-extrabold text-primary-text">
                  Call Outcome & Automated Action
                </h4>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-card border border-card-border">
                <span className="text-secondary-text font-bold block">Duration</span>
                <span className="text-primary-text font-mono font-black text-sm">
                  {formatTimer(seconds)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-card-border">
                <span className="text-secondary-text font-bold block">Target</span>
                <span className="text-primary-text font-bold text-xs truncate">
                  Balaji Traders (Supplier)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-card-border">
                <span className="text-secondary-text font-bold block">Proposed PO</span>
                <span className="text-primary-text font-bold font-mono text-sm">
                  ₹3,500.00
                </span>
              </div>
            </div>

            <p className="text-xs text-secondary-text font-medium">
              Purchase order queued for approval. Action logged to immutable audit ledger with recorded call SID.
            </p>
          </div>
        </motion.div>
      )}

      {/* Call Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-card-border">
        {!callActive ? (
          <Button
            variant="primary"
            onClick={startCall}
            icon={<PhoneCall className="w-4 h-4" />}
          >
            {callEnded ? "Start Another Test Call" : "Start Voice Call Simulation"}
          </Button>
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              variant={isMuted ? "danger" : "secondary"}
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              icon={isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            >
              {isMuted ? "Unmute Mic" : "Mute Mic"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={endCall}
              icon={<PhoneOff className="w-4 h-4" />}
            >
              End Call
            </Button>
          </div>
        )}

        <div className="text-xs text-secondary-text font-semibold flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Telephony active window: 9 AM – 8 PM IST</span>
        </div>
      </div>
    </Card>
  );
}

