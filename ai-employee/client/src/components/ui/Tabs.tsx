"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`flex items-center space-x-1 border-b border-card-border overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-lg select-none whitespace-nowrap ${
              isActive
                ? "text-teal dark:text-white"
                : "text-secondary-text hover:text-primary-text hover:bg-highlight/20 dark:hover:bg-teal/10"
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-teal text-white"
                    : "bg-card-border text-secondary-text dark:bg-teal/30 dark:text-skyblue"
                }`}
              >
                {tab.badge}
              </span>
            )}

            {/* Sliding Teal underline between tabs */}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-teal rounded-full"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 450, damping: 30 }
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

