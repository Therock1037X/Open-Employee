"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationResult } from "firebase/auth";
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

  // Countdown timer for resending OTP
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
      // Error is set in AuthContext
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

      // Initialize or get recaptcha verifier
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
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-auto flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Authenticating session...</p>
      </div>
    );
  }

  // Already Signed In State
  if (user) {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border border-gray-800 animate-fade-in">
        <div className="flex items-center justify-between pb-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
                className="w-12 h-12 rounded-full ring-2 ring-indigo-500/50 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {(user.displayName || user.phoneNumber || user.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-semibold text-gray-100 text-base">
                  {user.displayName || (user.phoneNumber ? `Phone User (${user.phoneNumber})` : "Authenticated User")}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400 truncate max-w-[220px]">
                {user.email || user.phoneNumber || user.uid}
              </p>
            </div>
          </div>
          <button
            onClick={() => logOut()}
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Sign Out"
            id="auth-logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-3.5 bg-gray-900/80 rounded-xl border border-gray-800/80 text-xs text-gray-300">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-gray-500 font-medium">Auth Provider</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 capitalize">
                {user.providerData[0]?.providerId === "google.com" ? "Google" : "Phone SMS"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">User ID (UID)</span>
              <span className="font-mono text-gray-400 text-[11px] truncate max-w-[170px]">{user.uid}</span>
            </div>
          </div>

          <a
            href="/dashboard"
            className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            id="go-to-dashboard-btn"
          >
            <span>Proceed to AI Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Card
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full mx-auto shadow-2xl border border-gray-800/90 relative overflow-hidden animate-slide-up">
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Employee Authentication</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
        <p className="text-sm text-gray-400 mt-1">
          Sign in to access your autonomous AI employee dashboard
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-900/90 rounded-xl border border-gray-800 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("google");
            setError(null);
          }}
          className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "google"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-google-auth"
        >
          <Mail className="w-4 h-4" />
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
          }}
          className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "phone"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-gray-400 hover:text-gray-200"
          }`}
          id="tab-phone-auth"
        >
          <Phone className="w-4 h-4" />
          <span>Phone OTP</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Tab 1: Google Login */}
      {activeTab === "google" && (
        <div className="space-y-4 animate-fade-in">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
            id="google-signin-btn"
          >
            {isSubmitting ? (
              <RotateCw className="w-5 h-5 text-gray-800 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isSubmitting ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          <p className="text-center text-xs text-gray-500 pt-2">
            Instant 1-click authentication using your Google Account.
          </p>
        </div>
      )}

      {/* Tab 2: Phone Number + SMS OTP */}
      {activeTab === "phone" && (
        <div className="space-y-4 animate-fade-in">
          {!confirmationResult ? (
            /* Step 1: Request OTP Form */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone-input" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-800 glass-input focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-gray-900/90 text-gray-200 text-xs px-2.5 py-3 border-r border-gray-800 focus:outline-none cursor-pointer"
                    id="country-code-select"
                  >
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+65">🇸🇬 +65 (SG)</option>
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
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Invisible Recaptcha container */}
              <div id="recaptcha-container" />

              <button
                type="submit"
                disabled={isSubmitting || !phoneNumber}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                id="send-otp-btn"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Sending SMS Code...</span>
                  </>
                ) : (
                  <>
                    <span>Get Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Verify OTP Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  Code sent to <span className="font-semibold text-gray-200">{countryCode} {phoneNumber}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetPhoneFlow}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Change
                </button>
              </div>

              <div>
                <label htmlFor="otp-input" className="block text-xs font-medium text-gray-300 mb-1.5">
                  6-Digit OTP Code
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
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-xl border border-gray-800 glass-input text-indigo-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length < 6}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                id="verify-otp-btn"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-xs text-gray-500">
                    Resend code in <span className="text-gray-400 font-mono font-medium">{countdown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    Resend SMS Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-5 border-t border-gray-800/80 flex items-center justify-center space-x-2 text-[11px] text-gray-500">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span>Secured with Firebase Enterprise Authentication</span>
      </div>
    </div>
  );
}
