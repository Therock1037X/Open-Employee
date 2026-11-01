"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useLanguage, LanguageCode } from "@/lib/i18n";
import { AgentOrb, AgentOrbState } from "@/components/ui/AgentOrb";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { GuidedTour } from "@/components/ui/GuidedTour";
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  Settings,
  Languages,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [agentState, setAgentState] = useState<AgentOrbState>("idle");

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  const currentLangLabel = currentLangObj.native;

  // 4 Primary navigation items
  const navLinks = [
    {
      href: "/dashboard",
      label: t.dashboard,
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/business",
      label: t.business,
      icon: Briefcase,
      isActive:
        pathname.startsWith("/business") ||
        pathname === "/sales" ||
        pathname === "/stock" ||
        pathname === "/finance" ||
        pathname === "/marketing",
    },
    {
      href: "/agent",
      label: t.agent,
      icon: Cpu,
      isActive:
        pathname.startsWith("/agent") ||
        pathname === "/approvals" ||
        pathname === "/audit",
    },
    {
      href: "/settings",
      label: t.settings,
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "R";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-card-border bg-card/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Agent Orb */}
            <div className="flex items-center space-x-3.5">
              <Link href="/dashboard" className="flex items-center space-x-3 group select-none">
                <div className="relative">
                  <AgentOrb
                    state={agentState}
                    size="sm"
                    onClick={() => setCommandPaletteOpen(true)}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-primary-text text-base tracking-tight">
                      Open Employee
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                      AI
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation with Sliding Teal Underline */}
            <nav className="hidden md:flex items-center space-x-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = link.isActive;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors duration-150 ${
                      active
                        ? "text-teal dark:text-white"
                        : "text-secondary-text hover:text-primary-text hover:bg-highlight/30 dark:hover:bg-teal/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>

                    {/* Sliding Underline */}
                    {active && (
                      <motion.div
                        layoutId="activeNavUnderline"
                        className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] bg-teal rounded-full"
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

            {/* Right Controls: Command palette trigger, tour, language switcher, theme toggle, avatar */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Command Palette Button (Ctrl+K) */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs text-secondary-text hover:text-primary-text hover:border-teal transition-all shadow-xs"
                title="Search or command (Ctrl+K)"
                aria-label="Search or command"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-semibold text-secondary-text text-[11px]">
                  {t.searchCommand}
                </span>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-page border border-card-border rounded shadow-xs">
                  ⌘K
                </kbd>
              </button>

              {/* Guided Tour Trigger Button */}
              <button
                onClick={() => setTourOpen(true)}
                className="p-2 rounded-xl bg-card border border-card-border text-secondary-text hover:text-teal hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-all shadow-xs"
                title={t.takeTour}
                aria-label={t.takeTour}
              >
                <Sparkles className="w-4 h-4 text-teal dark:text-skyblue" />
              </button>

              {/* Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-card-border text-xs font-bold text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-all shadow-xs"
                  title="Switch Language (हिन्दी / मराठी / English)"
                  aria-label="Switch Language"
                >
                  <Languages className="w-4 h-4 text-teal dark:text-skyblue" />
                  <span className="hidden sm:inline font-bold">{currentLangLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-secondary-text" />
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-2xl bg-card border border-card-border shadow-xl py-2 z-50">
                    <div className="px-3.5 py-1 border-b border-card-border text-[10px] uppercase font-extrabold text-secondary-text">
                      Bhashini Languages / भाषा
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary-text hover:bg-highlight/30 dark:hover:bg-teal/20 hover:text-primary-text flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className={language === lang.code ? "text-teal dark:text-skyblue font-extrabold" : "text-primary-text"}>
                            {lang.native}
                          </span>
                          <span className="text-[10px] text-secondary-text">
                            ({lang.name})
                          </span>
                        </div>
                        {language === lang.code && (
                          <span className="w-2 h-2 rounded-full bg-teal" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle with Smooth Sun/Moon Animation */}
              <motion.button
                onClick={toggleTheme}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                className="p-2 rounded-xl bg-card border border-card-border text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-colors shadow-xs"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                <motion.div
                  key={theme}
                  initial={shouldReduceMotion ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-skyblue" />
                  ) : (
                    <Moon className="w-4 h-4 text-teal" />
                  )}
                </motion.div>
              </motion.button>

              {/* Avatar & User Profile */}
              {user ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-black text-xs border border-card-border hover:ring-2 hover:ring-teal/50 shadow-xs transition-all"
                    title={user.email || "User profile"}
                    aria-label="User profile"
                  >
                    {userInitial}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-card-border shadow-xl py-2 z-50">
                      <div className="px-3.5 py-2 border-b border-card-border">
                        <p className="text-xs font-extrabold text-primary-text truncate">
                          {user.displayName || "Ramesh Sharma"}
                        </p>
                        <p className="text-[11px] text-secondary-text truncate">{user.email || "Kirana Owner"}</p>
                      </div>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-secondary-text hover:bg-highlight/30 dark:hover:bg-teal/20 hover:text-primary-text flex items-center space-x-2 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logOut();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-error hover:bg-error/10 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-8 h-8 rounded-full bg-card border border-card-border text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 flex items-center justify-center transition-colors shadow-xs"
                  title="Login"
                  aria-label="Login"
                >
                  <UserIcon className="w-4 h-4 text-teal dark:text-skyblue" />
                </Link>
              )}

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-card border border-card-border text-secondary-text hover:text-primary-text"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-card-border space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = link.isActive;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                      active
                        ? "bg-teal text-white"
                        : "text-secondary-text hover:bg-highlight/30 dark:hover:bg-teal/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenTour={() => setTourOpen(true)}
      />

      {/* Guided Tour Modal */}
      <GuidedTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        forceOpen={tourOpen}
      />
    </>
  );
}
