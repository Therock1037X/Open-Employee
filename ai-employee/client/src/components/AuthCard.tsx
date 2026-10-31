"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AuthCard() {
  const {
    user,
    loading,
    error,
    setError,
    signInWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    logOut,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"google" | "phone">("google");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const recaptchaVerifierRef = useRef<any>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const verifier = setupRecaptcha("recaptcha-container", "invisible");
      recaptchaVerifierRef.current = verifier;

      const fullNumber = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
      const result = await sendPhoneOtp(fullNumber, verifier);
      setConfirmationResult(result);
      setCountdown(60);
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await verifyPhoneOtp(confirmationResult, otpCode.trim());
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPhoneFlow = () => {
    setConfirmationResult(null);
    setOtpCode("");
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-auto flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-text-muted text-sm">Authenticating session...</p>
      </div>
    );
  }

  // Already Signed In State
  if (user) {
    return (
      <div className="bg-surface border border-white/[0.08] rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
                className="w-12 h-12 rounded-full ring-2 ring-accent object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-surface font-black text-lg shadow-gold-glow">
                {(user.displayName || user.phoneNumber || user.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-text-primary text-base">
                  {user.displayName || (user.phoneNumber ? `Phone User (${user.phoneNumber})` : "Shop Owner")}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-text-muted truncate max-w-[220px]">
                {user.email || user.phoneNumber || user.uid}
              </p>
            </div>
          </div>
          <button
            onClick={() => logOut()}
            className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-colors"
            title="Sign Out"
            id="auth-logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-base/60 rounded-xl border border-white/[0.08] text-xs text-text-muted">
            <div className="flex justify-between items-center mb-1.5">
              <span>Authentication Provider</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/15 text-accent capitalize">
                {user.providerData[0]?.providerId === "google.com" ? "Google" : "Phone SMS"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Security Token</span>
              <span className="font-mono text-text-muted text-[11px] truncate max-w-[170px]">Verified Active</span>
            </div>
          </div>

          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-accent text-surface font-bold shadow-gold-glow hover:-translate-y-0.5 active:scale-[0.97] transition-all"
            id="go-to-dashboard-btn"
          >
            <span>Enter AI Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Card with Animated Gold Gradient Border
  return (
    <div className="relative p-[1.5px] rounded-2xl gold-gradient-border max-w-md w-full mx-auto shadow-2xl">
      <div className="bg-surface rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Black & Gold Elegance</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">Shop Owner Login</h2>
          <p className="text-xs text-text-muted mt-1">
            Access your 24/7 autonomous employee platform
          </p>
        </div>

        {/* Sliding Pill Tab Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-base rounded-xl border border-white/[0.08] mb-6 relative">
          <button
            type="button"
            onClick={() => {
              setActiveTab("google");
              setError(null);
            }}
            className={`relative z-10 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "google" ? "text-surface" : "text-text-muted hover:text-text-primary"
            }`}
            id="tab-google-auth"
          >
            {activeTab === "google" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-accent rounded-lg shadow-gold-glow"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Mail className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Google Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("phone");
              setError(null);
            }}
            className={`relative z-10 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "phone" ? "text-surface" : "text-text-muted hover:text-text-primary"
            }`}
            id="tab-phone-auth"
          >
            {activeTab === "phone" && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-accent rounded-lg shadow-gold-glow"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <Phone className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Phone OTP</span>
          </button>
        </div>

        {/* Error Banner with Shake Animation */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: [-8, 8, -6, 6, -3, 3, 0] }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 p-3.5 rounded-xl bg-error/15 border border-error/30 flex items-start space-x-2.5 text-xs text-error font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Login Tab */}
        {activeTab === "google" && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full"
              id="google-signin-btn"
            >
              {isSubmitting ? (
                "Connecting to Google..."
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </div>
              )}
            </Button>
            <p className="text-center text-[11px] text-text-muted pt-1">
              One-click instant authentication via Google Cloud Auth.
            </p>
          </div>
        )}

        {/* Phone Login Tab */}
        {activeTab === "phone" && (
          <div className="space-y-4">
            {!confirmationResult ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="phone-input" className="block text-xs font-medium text-text-muted mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-base focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-surface text-text-primary text-xs px-2.5 py-3 border-r border-white/[0.08] focus:outline-none cursor-pointer"
                      id="country-code-select"
                    >
                      <option value="+91">🇮🇳 +91 (IN)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                    </select>
                    <input
                      id="phone-input"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div id="recaptcha-container" />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || !phoneNumber}
                  isLoading={isSubmitting}
                  className="w-full"
                  id="send-otp-btn"
                >
                  Send OTP via SMS
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Code sent to <span className="font-semibold text-text-primary">{countryCode} {phoneNumber}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetPhoneFlow}
                    className="text-accent hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="otp-input" className="block text-xs font-medium text-text-muted mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 rounded-xl border border-white/[0.08] bg-base text-accent focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || otpCode.length < 6}
                  isLoading={isSubmitting}
                  className="w-full"
                  id="verify-otp-btn"
                >
                  Verify & Enter
                </Button>

                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <span className="text-xs text-text-muted">
                      Resend in <span className="text-accent font-mono font-bold">{countdown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs text-accent hover:underline font-semibold"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-center space-x-2 text-[11px] text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Protected with Firebase Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}
