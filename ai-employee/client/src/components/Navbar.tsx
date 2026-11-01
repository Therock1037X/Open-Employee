"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Bot,
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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "mr", name: "मराठी (Marathi)" },
    { code: "en", name: "English" },
  ];

  // 4 Primary navigation items
  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/business",
      label: "Business",
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
      label: "Agent",
      icon: Cpu,
      isActive:
        pathname.startsWith("/agent") ||
        pathname === "/approvals" ||
        pathname === "/audit",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "A";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-card-border bg-card/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group select-none">
            <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-primary-text text-base tracking-tight">
                  Open Employee
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-teal/15 text-teal dark:text-skyblue border border-teal/30">
                  AI
                </span>
              </div>
            </div>
          </Link>

          {/* Minimal Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = link.isActive;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    active
                      ? "text-teal dark:text-white"
                      : "text-secondary-text hover:text-primary-text hover:bg-highlight/40 dark:hover:bg-teal/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>

                  {/* Sliding Teal underline between tabs/links */}
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

          {/* Right Controls: status dot, language switcher, theme toggle, avatar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status dot */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-card border border-card-border text-xs shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="hidden sm:inline text-primary-text text-xs font-semibold">
                Online
              </span>
            </div>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs font-semibold text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-all duration-200 shadow-xs"
                title="Select Language"
                aria-label="Select Language"
              >
                <Languages className="w-4 h-4 text-teal dark:text-skyblue" />
                <span className="hidden sm:inline font-semibold">{selectedLang}</span>
                <ChevronDown className="w-3.5 h-3.5 text-secondary-text" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-card-border shadow-xl py-1.5 z-50">
                  <div className="px-3.5 py-1.5 border-b border-card-border text-[11px] uppercase font-bold text-secondary-text">
                    Input Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.name.split(" ")[0]);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-secondary-text hover:bg-highlight/30 dark:hover:bg-teal/20 hover:text-primary-text flex items-center justify-between transition-colors"
                    >
                      <span className="font-semibold text-primary-text">{lang.name}</span>
                      {selectedLang === lang.name.split(" ")[0] && (
                        <span className="w-2 h-2 rounded-full bg-teal" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle: Sun/Moon icon */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-card border border-card-border text-primary-text hover:border-teal hover:bg-highlight/30 dark:hover:bg-teal/20 transition-all duration-200 shadow-xs"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-skyblue hover:text-white transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-teal dark:text-skyblue hover:text-primary-text transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>

            {/* Avatar & User Menu */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-xs border border-card-border hover:ring-2 hover:ring-teal/50 shadow-xs transition-all"
                  title={user.email || "User profile"}
                  aria-label="User profile"
                >
                  {userInitial}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-card border border-card-border shadow-xl py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-card-border">
                      <p className="text-xs font-bold text-primary-text truncate">
                        {user.displayName || "Store Owner"}
                      </p>
                      <p className="text-[11px] text-secondary-text truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary-text hover:bg-highlight/30 dark:hover:bg-teal/20 hover:text-primary-text flex items-center space-x-2 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logOut();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-error hover:bg-error/10 flex items-center space-x-2 transition-colors"
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
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
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
  );
}
