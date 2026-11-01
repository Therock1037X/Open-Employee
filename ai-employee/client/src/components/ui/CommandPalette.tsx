"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Briefcase,
  Package,
  ShoppingCart,
  DollarSign,
  Share2,
  Cpu,
  ShieldCheck,
  ClipboardList,
  Settings,
  Sun,
  Moon,
  Mic,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Action" | "System";
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTour?: () => void;
  onFocusEntry?: (presetText?: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenTour,
  onFocusEntry,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const allItems: CommandItem[] = [
    // Navigation
    {
      id: "nav-dash",
      title: "Go to Dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => {
        router.push("/dashboard");
        onClose();
      },
    },
    {
      id: "nav-business",
      title: "Go to Business Overview",
      category: "Navigation",
      icon: <Briefcase className="w-4 h-4" />,
      action: () => {
        router.push("/business");
        onClose();
      },
    },
    {
      id: "nav-stock",
      title: "Go to Stock & Inventory",
      category: "Navigation",
      icon: <Package className="w-4 h-4" />,
      action: () => {
        router.push("/stock");
        onClose();
      },
    },
    {
      id: "nav-sales",
      title: "Go to Sales Ledger",
      category: "Navigation",
      icon: <ShoppingCart className="w-4 h-4" />,
      action: () => {
        router.push("/sales");
        onClose();
      },
    },
    {
      id: "nav-finance",
      title: "Go to Finance & Expenses",
      category: "Navigation",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        router.push("/finance");
        onClose();
      },
    },
    {
      id: "nav-marketing",
      title: "Go to Marketing & Social Posts",
      category: "Navigation",
      icon: <Share2 className="w-4 h-4" />,
      action: () => {
        router.push("/marketing");
        onClose();
      },
    },
    {
      id: "nav-agent",
      title: "Go to AI Agent Hub & Telephony",
      category: "Navigation",
      icon: <Cpu className="w-4 h-4" />,
      action: () => {
        router.push("/agent");
        onClose();
      },
    },
    {
      id: "nav-approvals",
      title: "Review Pending Approvals",
      category: "Navigation",
      icon: <ShieldCheck className="w-4 h-4" />,
      action: () => {
        router.push("/approvals");
        onClose();
      },
    },
    {
      id: "nav-audit",
      title: "View Immutable Audit Log",
      category: "Navigation",
      icon: <ClipboardList className="w-4 h-4" />,
      action: () => {
        router.push("/audit");
        onClose();
      },
    },
    {
      id: "nav-settings",
      title: "Settings & Store Config",
      category: "Navigation",
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        router.push("/settings");
        onClose();
      },
    },

    // Quick Actions
    {
      id: "act-quick-entry",
      title: "Quick Voice / Text Sale Entry",
      category: "Quick Action",
      icon: <Mic className="w-4 h-4 text-teal dark:text-skyblue" />,
      shortcut: "↵",
      action: () => {
        onClose();
        if (onFocusEntry) {
          onFocusEntry(query ? query : undefined);
        } else {
          router.push("/dashboard#entry");
        }
      },
    },
    {
      id: "act-tour",
      title: "Start Guided Tour",
      category: "Quick Action",
      icon: <HelpCircle className="w-4 h-4 text-teal dark:text-skyblue" />,
      action: () => {
        onClose();
        if (onOpenTour) onOpenTour();
      },
    },
    {
      id: "act-theme",
      title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "System",
      icon:
        theme === "dark" ? (
          <Sun className="w-4 h-4 text-skyblue" />
        ) : (
          <Moon className="w-4 h-4 text-teal" />
        ),
      action: () => {
        toggleTheme();
        onClose();
      },
    },
  ];

  const filteredItems = allItems.filter((item) => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return true;
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery)
    );
  });

  // Handle keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim() && onFocusEntry) {
        onClose();
        onFocusEntry(query);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-navy-dark/50 backdrop-blur-xs select-none">
        <motion.div
          className="app-card rounded-2xl max-w-xl w-full bg-card border border-card-border shadow-2xl overflow-hidden relative flex flex-col"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.18 }}
          onKeyDown={handleKeyDown}
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-card-border bg-page/40">
            <Search className="w-5 h-5 text-secondary-text shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command, page name, or quick transaction..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-primary-text placeholder:text-secondary-text/70"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-md text-secondary-text hover:text-primary-text mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-secondary-text bg-card border border-card-border rounded-md shadow-xs">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center">
                <Sparkles className="w-8 h-8 text-teal dark:text-skyblue mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-primary-text">
                  No exact match for &quot;{query}&quot;
                </p>
                <p className="text-[11px] text-secondary-text mt-1">
                  Press Enter to send this as a quick transaction to the AI entry box.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onFocusEntry) onFocusEntry(query);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-teal text-white text-xs font-bold"
                >
                  Send &quot;{query}&quot; to Entry Box
                </button>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-teal text-white"
                        : "text-primary-text hover:bg-highlight/30 dark:hover:bg-teal/20"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-teal/15 text-teal dark:text-skyblue"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <span>{item.title}</span>
                        <span
                          className={`text-[10px] font-medium ml-2 px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-card border border-card-border text-secondary-text"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                    {item.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-page border border-card-border text-secondary-text"
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-card-border bg-page/30 text-[10px] text-secondary-text font-semibold">
            <div className="flex items-center space-x-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span>Open Employee Command Menu</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

