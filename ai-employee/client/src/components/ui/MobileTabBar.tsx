"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Briefcase, Cpu, Settings, Plus } from "lucide-react";

interface MobileTabBarProps {
  onQuickEntryClick?: () => void;
}

export function MobileTabBar({ onQuickEntryClick }: MobileTabBarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const tabs = [
    {
      href: "/dashboard",
      label: "Home",
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
      href: "#entry",
      label: "Add",
      icon: Plus,
      isAction: true,
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-card-border pb-safe transition-colors select-none">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          if (tab.isAction) {
            return (
              <button
                key={tab.label}
                onClick={onQuickEntryClick}
                className="relative -top-3 flex flex-col items-center justify-center p-3 rounded-full bg-teal text-white shadow-button-lift active:scale-95 transition-transform"
                title="Quick Entry"
                aria-label="Quick Entry"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] rounded-xl text-xs font-semibold relative transition-colors ${
                active
                  ? "text-teal dark:text-skyblue"
                  : "text-secondary-text hover:text-primary-text"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>

              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute bottom-1 w-6 h-[2px] bg-teal rounded-full"
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
      </div>
    </div>
  );
}

