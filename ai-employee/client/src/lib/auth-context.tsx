"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  UserCredential,
  ConfirmationResult,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  signInWithGoogle: () => Promise<UserCredential>;
  setupRecaptcha: (containerId: string, size?: "invisible" | "normal") => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, verifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otpCode: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error("Auth state observer error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      let userFriendlyMessage = err.message || "Failed to sign in with Google";

      if (err.code === "auth/unauthorized-domain") {
        userFriendlyMessage =
          "This domain (e.g. localhost) is not authorized in your Firebase console. Please add it under Authentication > Settings > Authorized Domains.";
      } else if (err.code === "auth/popup-closed-by-user") {
        userFriendlyMessage = "Sign-in popup was closed before completing.";
      } else if (err.code === "auth/popup-blocked") {
        userFriendlyMessage = "Popup was blocked by your browser. Please allow popups for this site.";
      }

      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  const setupRecaptcha = (containerId: string, size: "invisible" | "normal" = "invisible"): RecaptchaVerifier => {
    if (typeof window === "undefined") {
      throw new Error("Recaptcha cannot be initialized on server");
    }

    // Clear any existing window recaptchaVerifier if previously assigned
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // ignore cleanup error
      }
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: size,
      callback: () => {
        // reCAPTCHA solved - will allow signInWithPhoneNumber
      },
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please request OTP again.");
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const sendPhoneOtp = async (
    phoneNumber: string,
    verifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> => {
    setError(null);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      return confirmationResult;
    } catch (err: any) {
      console.error("Error sending phone OTP:", err);
      let message = err.message || "Failed to send SMS verification code.";

      if (err.code === "auth/invalid-phone-number") {
        message = "Invalid phone number format. Please provide full number including country code (e.g. +91 9876543210).";
      } else if (err.code === "auth/missing-phone-number") {
        message = "Please enter a valid phone number.";
      } else if (err.code === "auth/quota-exceeded") {
        message = "SMS quota exceeded for today. Please try again later or use test phone numbers in Firebase.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts from this device. Please wait a moment and try again.";
      }

      setError(message);
      throw new Error(message);
    }
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string
  ): Promise<UserCredential> => {
    setError(null);
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      return userCredential;
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      let message = err.message || "Failed to verify OTP code.";

      if (err.code === "auth/invalid-verification-code") {
        message = "Incorrect OTP code. Please check and re-enter.";
      } else if (err.code === "auth/code-expired") {
        message = "OTP code has expired. Please request a new code.";
      }

      setError(message);
      throw new Error(message);
    }
  };

  const logOut = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message || "Failed to log out");
      throw err;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        verifyPhoneOtp,
        logOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
