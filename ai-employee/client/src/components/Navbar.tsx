"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  Bot,
  LayoutDashboard,
  TrendingUp,
  Package,
  Wallet,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  Settings,
  Languages,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "en", name: "English" },
  ];

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sales", label: "Sales", icon: TrendingUp },
    { href: "/stock", label: "Stock", icon: Package },
    { href: "/finance", label: "Finance & UPI", icon: Wallet },
    { href: "/marketing", label: "Marketing", icon: Megaphone },
    { href: "/approvals", label: "Approvals", icon: ShieldCheck, badge: "3" },
    { href: "/audit", label: "Audit Log", icon: ClipboardList },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-base/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-surface shadow-gold-glow transition-transform group-hover:scale-105 font-bold">
              <Bot className="w-5 h-5 text-surface" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-text-primary text-base tracking-tight">Open Employee</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-accent/20 text-accent border border-accent/40">
                  AI MSME
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-medium">Black & Gold Elegance</p>
            </div>
          </Link>

          {/* Desktop Navigation Links with Sliding Gold Indicator */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-accent"
                      : "text-text-muted hover:text-text-primary hover:bg-surface/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-accent text-surface">
                      {link.badge}
                    </span>
                  )}

                  {/* Sliding Gold Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-accent rounded-full shadow-gold-glow"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 450, damping: 30 }
                      }
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* AI Agent Status Pill with Gold Pulsing Dot */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface border border-white/[0.08] text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-gold-glow"></span>
              </span>
              <span className="text-text-muted text-[11px]">Agent Online</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface border border-white/[0.08] text-xs text-text-primary hover:border-accent/40 transition-colors"
                title="Select Language"
              >
                <Languages className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline font-medium">{selectedLang}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-surface border border-white/[0.08] shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-white/[0.08] text-[10px] uppercase font-bold text-text-muted">
                    Input Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.name.split(" ")[0]);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-base hover:text-accent flex items-center justify-between transition-colors"
                    >
                      <span>{lang.name}</span>
                      {selectedLang === lang.name.split(" ")[0] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold-glow" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => logOut()}
                  className="p-2 rounded-xl bg-surface border border-white/[0.08] text-text-muted hover:text-error hover:border-error/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-accent text-surface text-xs font-bold shadow-gold-glow hover:-translate-y-0.5 active:scale-[0.97] transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-surface border border-white/[0.08] text-text-muted hover:text-text-primary"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-white/[0.08] space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-text-muted hover:bg-surface/60"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-surface">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
