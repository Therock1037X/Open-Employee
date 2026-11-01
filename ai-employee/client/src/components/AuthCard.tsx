"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
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
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      setIsSubmitting(true);
      setError(null);
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
      }
      const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, "")}`;
      const confirmation = await sendPhoneOtp(fullPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setCountdown(60);
    } catch (err: any) {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await verifyPhoneOtp(confirmationResult, otpCode);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      setIsSubmitting(true);
      setError(null);
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
      }
      const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, "")}`;
      const confirmation = await sendPhoneOtp(fullPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setCountdown(60);
    } catch (err: any) {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authenticated State View
  if (user) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-md transition-colors duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-card-border">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-teal"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg">
                {(user.displayName || user.phoneNumber || user.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-primary-text text-base">
                  {user.displayName || (user.phoneNumber ? `Phone User (${user.phoneNumber})` : "Shop Owner")}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-secondary-text truncate max-w-[220px]">
                {user.email || user.phoneNumber || user.uid}
              </p>
            </div>
          </div>
          <button
            onClick={() => logOut()}
            className="p-2 text-secondary-text hover:text-error hover:bg-error/10 rounded-xl transition-colors"
            title="Sign Out"
            id="auth-logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-page rounded-xl border border-card-border text-xs text-secondary-text">
            <div className="flex justify-between items-center mb-1.5">
              <span>Authentication Provider</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal/15 text-teal capitalize">
                {user.providerData[0]?.providerId === "google.com" ? "Google" : "Phone SMS"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Security Token</span>
              <span className="font-mono text-secondary-text text-[11px] truncate max-w-[170px]">Verified Active</span>
            </div>
          </div>

          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-teal text-white font-bold hover:opacity-95 shadow-sm transition-all"
            id="go-to-dashboard-btn"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Card
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-md relative overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span>Shop Owner Login</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-primary-text">Welcome Back</h2>
        <p className="text-xs text-secondary-text mt-1">
          Access your autonomous AI employee
        </p>
      </div>

      {/* Sliding Pill Tab Switch */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-page rounded-xl border border-card-border mb-6 relative">
        <button
          type="button"
          onClick={() => {
            setActiveTab("google");
            setError(null);
          }}
          className={`relative z-10 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "google" ? "text-white" : "text-secondary-text hover:text-primary-text"
          }`}
          id="tab-google-auth"
        >
          {activeTab === "google" && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-teal rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Mail className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
          }}
          className={`relative z-10 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "phone" ? "text-white" : "text-secondary-text hover:text-primary-text"
          }`}
          id="tab-phone-auth"
        >
          {activeTab === "phone" && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-teal rounded-lg shadow-sm"
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
              "Connecting..."
            ) : (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Sign In with Google</span>
              </div>
            )}
          </Button>
          <p className="text-center text-[11px] text-secondary-text pt-1">
            Fast, secure authentication via Google Cloud.
          </p>
        </div>
      )}

      {/* Phone Login Tab */}
      {activeTab === "phone" && (
        <div className="space-y-4">
          {!confirmationResult ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone-input" className="block text-xs font-medium text-secondary-text mb-1.5">
                  Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-card-border bg-page focus-within:border-teal">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-card text-primary-text text-xs px-2.5 py-3 border-r border-card-border focus:outline-none cursor-pointer"
                    id="country-code-select"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
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
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/50 focus:outline-none"
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
                <span className="text-secondary-text">
                  Sent to <strong className="text-primary-text">{countryCode} {phoneNumber}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationResult(null);
                    setOtpCode("");
                  }}
                  className="text-teal hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              <div>
                <label htmlFor="otp-input" className="block text-xs font-medium text-secondary-text mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-xl border border-card-border bg-page text-primary-text focus:outline-none focus:border-teal"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || otpCode.length !== 6}
                isLoading={isSubmitting}
                className="w-full"
                id="verify-otp-btn"
              >
                Verify & Continue
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isSubmitting}
                  className={`text-xs inline-flex items-center space-x-1.5 ${
                    countdown > 0 ? "text-secondary-text/60 cursor-not-allowed" : "text-teal hover:underline font-medium"
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${countdown > 0 ? "animate-spin" : ""}`} />
                  <span>{countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP SMS"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
