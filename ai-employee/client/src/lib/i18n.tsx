"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "hi" | "mr";

interface Translations {
  dashboard: string;
  business: string;
  agent: string;
  settings: string;
  online: string;
  greeting: string;
  todaySummary: string;
  todaySales: string;
  lowStock: string;
  approvals: string;
  overdue: string;
  hourlyTrend: string;
  topProducts: string;
  agentFeed: string;
  quickEntryPlaceholder: string;
  recordSale: string;
  searchCommand: string;
  takeTour: string;
  approve: string;
  reject: string;
}

const DICTIONARY: Record<LanguageCode, Translations> = {
  en: {
    dashboard: "Dashboard",
    business: "Business",
    agent: "Agent Hub",
    settings: "Settings",
    online: "Online",
    greeting: "Namaste, Ramesh",
    todaySummary: "Store operations smooth • 14 sales processed today",
    todaySales: "Today's Sales",
    lowStock: "Low Stock Alerts",
    approvals: "Approvals Gate",
    overdue: "Overdue Receivables",
    hourlyTrend: "Sales Trend",
    topProducts: "Top Products",
    agentFeed: "Live Agent Feed",
    quickEntryPlaceholder: "Type or speak: '2 kg sugar becha Ramesh ko 90 rs'...",
    recordSale: "Record Entry",
    searchCommand: "Search or jump to...",
    takeTour: "Guided Tour",
    approve: "Approve",
    reject: "Reject",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    business: "व्यापार",
    agent: "एआई एजेंट",
    settings: "सेटिंग्स",
    online: "सक्रिय",
    greeting: "नमस्ते, रमेश",
    todaySummary: "दुकान चालू है • आज 14 बिक्री पूरी हुई",
    todaySales: "आज की बिक्री",
    lowStock: "कम स्टॉक चेतावनी",
    approvals: "स्वीकृति द्वार",
    overdue: "बाकी उधारी",
    hourlyTrend: "बिक्री का ग्राफ",
    topProducts: "शीर्ष उत्पाद",
    agentFeed: "एजेंट गतिविधियाँ",
    quickEntryPlaceholder: "बोलें या लिखें: '2 किलो चीनी बेची रमेश को 90 रुपये'...",
    recordSale: "दर्ज करें",
    searchCommand: "खोजें या जाएँ...",
    takeTour: "टूर देखें",
    approve: "स्वीकृत करें",
    reject: "अस्वीकार",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    business: "व्यवसाय",
    agent: "एआय एजंट",
    settings: "सेटिंग्ज",
    online: "सक्रिय",
    greeting: "नमस्कार, रमेश",
    todaySummary: "दुकान सुरळीत सुरू आहे • आज 14 व्यवहार पूर्ण झाले",
    todaySales: "आजची विक्री",
    lowStock: "कमी स्टॉक इशारा",
    approvals: "मंजुरी गेट",
    overdue: "थकबाकी उधारी",
    hourlyTrend: "विक्रीचा आलेख",
    topProducts: "प्रमुख उत्पादने",
    agentFeed: "एजंट हालचाली",
    quickEntryPlaceholder: "बोला किंवा लिहा: '2 किलो साखर विकली रमेशला 90 रुपये'...",
    recordSale: "नोंदवा",
    searchCommand: "शोधा किंवा जा...",
    takeTour: "मार्गदर्शक टूर",
    approve: "मंजूर करा",
    reject: "नाकारा",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openemployee_language") as LanguageCode;
      if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("openemployee_language", lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: DICTIONARY[language] || DICTIONARY.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

