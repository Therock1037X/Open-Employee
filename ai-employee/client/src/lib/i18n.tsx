"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode =
  | "en"
  | "hi"
  | "mr"
  | "gu"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "bn"
  | "pa";

export interface RegionalLanguageMeta {
  code: LanguageCode;
  name: string;
  native: string;
  speechCode: string;
}

export const REGIONAL_LANGUAGES: RegionalLanguageMeta[] = [
  { code: "hi", name: "Hindi", native: "हिन्दी", speechCode: "hi-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", speechCode: "mr-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", speechCode: "gu-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", speechCode: "ta-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", speechCode: "te-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", speechCode: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", speechCode: "ml-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", speechCode: "bn-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", speechCode: "pa-IN" },
  { code: "en", name: "English", native: "English", speechCode: "en-IN" },
];

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
    settings: "સેટિંગ્સ",
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
  gu: {
    dashboard: "ડેશબોર્ડ",
    business: "વેપાર",
    agent: "AI એજન્ટ",
    settings: "સેટિંગ્સ",
    online: "ઓનલાઇન",
    greeting: "નમસ્તે, રમેશ",
    todaySummary: "દુકાન વ્યવહાર સરળ • આજે ૧૪ વ્યવહારો પૂર્ણ થયા",
    todaySales: "આજનું વેચાણ",
    lowStock: "ઓછો સ્ટોક ચેતવણી",
    approvals: "મંજૂરી ગેટ",
    overdue: "બાકી ઉધારી",
    hourlyTrend: "વેચાણ ટ્રેન્ડ",
    topProducts: "ટોચના ઉત્પાદનો",
    agentFeed: "લાઇવ એજન્ટ ફીડ",
    quickEntryPlaceholder: "બોલો અથવા લખો: '2 કિલો ખાંડ વેચી રમેશને 90 રૂપિયા'...",
    recordSale: "નોંધો",
    searchCommand: "શોધો અથવા જાઓ...",
    takeTour: "માર્ગદર્શિકા ટૂર",
    approve: "મંજૂર કરો",
    reject: "અસ્વીકાર કરો",
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    business: "வணிகம்",
    agent: "AI உதவியாளர்",
    settings: "அமைப்புகள்",
    online: "ஆன்லைன்",
    greeting: "வணக்கம், ரமேஷ்",
    todaySummary: "கடை இயங்குகிறது • இன்று 14 விற்பனைகள் முடிந்தது",
    todaySales: "இன்றைய விற்பனை",
    lowStock: "குறைந்த இருப்பு எச்சரிக்கை",
    approvals: "ஒப்புதல் வாயில்",
    overdue: "பாக்கி வரவுகள்",
    hourlyTrend: "விற்பனை போக்கு",
    topProducts: "முக்கிய பொருட்கள்",
    agentFeed: "நேரலை பதிவுகள்",
    quickEntryPlaceholder: "பேசுங்கள் அல்லது தட்டச்சு செய்க: 'ரமேஷுக்கு 2 கிலோ சர்க்கரை 90 ரூபாய்'...",
    recordSale: "பதிவு செய்க",
    searchCommand: "தேடவும்...",
    takeTour: "சுற்றுப்பயணம்",
    approve: "ஒப்புதல்",
    reject: "நிராகரி",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    business: "వ్యాపారం",
    agent: "AI ఏజెంట్",
    settings: "సెట్టింగ్‌లు",
    online: "ఆన్‌లైన్",
    greeting: "నమస్కారం, రమేష్",
    todaySummary: "షాప్ సజావుగా సాగుతోంది • నేడు 14 అమ్మకాలు జరిగాయి",
    todaySales: "నేటి అమ్మకాలు",
    lowStock: "తక్కువ స్టాక్ హెచ్చరిక",
    approvals: "ఆమోదాల గేట్",
    overdue: "బాకీ రాబడులు",
    hourlyTrend: "సేల్స్ ట్రెండ్",
    topProducts: "అగ్ర ఉత్పత్తులు",
    agentFeed: "లైవ్ ఏజెంట్ ఫీడ్",
    quickEntryPlaceholder: "మాట్లాడండి లేదా టైప్ చేయండి: 'రమేష్‌కు 2 కిలోల చక్కెర 90 రూపాయలు'...",
    recordSale: "నమోదు చేయండి",
    searchCommand: "శోధించండి...",
    takeTour: "టూర్ చూడండి",
    approve: "ఆమోదించు",
    reject: "తిరస్కరించు",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    business: "ವ್ಯಾಪಾರ",
    agent: "AI ಸಹಾಯಕ",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    online: "ಆನ್‌ಲೈನ್",
    greeting: "ನಮಸ್ಕಾರ, ರಮೇಶ್",
    todaySummary: "ಅಂಗಡಿ ಸಕ್ರಿಯವಾಗಿದೆ • ಇಂದು 14 ವಹಿವಾಟುಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
    todaySales: "ಇಂದಿನ ಮಾರಾಟ",
    lowStock: "ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ",
    approvals: "ಅನುಮೋದನೆ ಗೇಟ್",
    overdue: "ಬಾಕಿ ಮೊತ್ತ",
    hourlyTrend: "ಮಾರಾಟದ ಪ್ರವೃತ್ತಿ",
    topProducts: "ಪ್ರಮುಖ ಉತ್ಪನ್ನಗಳು",
    agentFeed: "ಲೈವ್ ಏಜೆಂಟ್ ಫೀಡ್",
    quickEntryPlaceholder: "ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ: 'ರಮೇಶ್‌ಗೆ 2 ಕೆಜಿ ಸಕ್ಕರೆ 90 ರೂ'...",
    recordSale: "ದಾಖಲಿಸಿ",
    searchCommand: "ಹುಡುಕಿ...",
    takeTour: "ಟೂರ್ ವೀಕ್ಷಿಸಿ",
    approve: "ಅನುಮೋದಿಸಿ",
    reject: "ತಿರಸ್ಕರಿಸಿ",
  },
  ml: {
    dashboard: "ഡാഷ്‌ബോർഡ്",
    business: "ബിസിനസ്സ്",
    agent: "AI ഏജന്റ്",
    settings: "ക്രമീകരണങ്ങൾ",
    online: "ഓൺലൈൻ",
    greeting: "നമസ്കാരം, രമേഷ്",
    todaySummary: "കട സുഗമമായി പ്രവർത്തിക്കുന്നു • ഇന്ന് 14 വിൽപ്പന പൂർത്തിയായി",
    todaySales: "ഇന്നത്തെ വിൽപ്പന",
    lowStock: "കുറഞ്ഞ സ്റ്റോക്ക് മുന്നറിയിപ്പ്",
    approvals: "അംഗീകാര ഗേറ്റ്",
    overdue: "കുടിശ്ശിക",
    hourlyTrend: "വിൽപ്പന ട്രെൻഡ്",
    topProducts: "പ്രധാന ഉൽപ്പന്നങ്ങൾ",
    agentFeed: "തത്സമയ ഫീഡ്",
    quickEntryPlaceholder: "സംസാരിക്കുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക: 'രമേശിന് 2 കിലോ പഞ്ചസാര 90 രൂപ'...",
    recordSale: "രേഖപ്പെടുത്തുക",
    searchCommand: "തിരയുക...",
    takeTour: "ഗൈഡഡ് ടൂർ",
    approve: "അംഗീകരിക്കുക",
    reject: "നിരസിക്കുക",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    business: "ব্যবসা",
    agent: "এআই সহকারী",
    settings: "সেটিংস",
    online: "অনলাইন",
    greeting: "নমস্কার, রমেশ",
    todaySummary: "দোকান চালু আছে • আজ ১৪টি বিক্রি সম্পন্ন হয়েছে",
    todaySales: "আজকের বিক্রি",
    lowStock: "কম স্টক সতর্কতা",
    approvals: "অনুমোদন গেট",
    overdue: "বাকি টাকা",
    hourlyTrend: "বিক্রির ধারা",
    topProducts: "শীর্ষ পণ্য",
    agentFeed: "লাইভ এজেন্ট ফিড",
    quickEntryPlaceholder: "বলুন বা লিখুন: 'রমেশকে ২ কেজি চিনি বেচেছি ৯০ টাকা'...",
    recordSale: "নথিভুক্ত করুন",
    searchCommand: "খুঁজুন...",
    takeTour: "ট্যুর দেখুন",
    approve: "অনুমোদন করুন",
    reject: "বাতিল করুন",
  },
  pa: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    business: "ਵਪਾਰ",
    agent: "AI ਏਜੰਟ",
    settings: "ਸੈਟਿੰਗਾਂ",
    online: "ਆਨਲਾਈਨ",
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਰਮੇਸ਼",
    todaySummary: "ਦੁਕਾਨ ਚਾਲੂ ਹੈ • ਅੱਜ 14 ਵਿਕਰੀਆਂ ਪੂਰੀਆਂ ਹੋਈਆਂ",
    todaySales: "ਅੱਜ ਦੀ ਵਿਕਰੀ",
    lowStock: "ਘੱਟ ਸਟਾਕ ਚੇਤਾਵਨੀ",
    approvals: "ਮਨਜ਼ੂਰੀ ਗੇਟ",
    overdue: "ਬਕਾਇਆ ਉਧਾਰ",
    hourlyTrend: "ਵਿਕਰੀ ਦਾ ਰੁਝਾਨ",
    topProducts: "ਚੋਟੀ ਦੇ ਉਤਪਾਦ",
    agentFeed: "ਲਾਈਵ ਏਜੰਟ ਫੀਡ",
    quickEntryPlaceholder: "ਬੋਲੋ ਜਾਂ ਲਿਖੋ: 'ਰਮੇਸ਼ ਨੂੰ 2 ਕਿਲੋ ਖੰਡ 90 ਰੁਪਏ ਵੇਚੀ'...",
    recordSale: "ਦਰਜ ਕਰੋ",
    searchCommand: "ਖੋਜੋ...",
    takeTour: "ਟੂਰ ਵੇਖੋ",
    approve: "ਮਨਜ਼ੂਰ ਕਰੋ",
    reject: "ਰੱਦ ਕਰੋ",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languages: RegionalLanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: DICTIONARY.en,
  languages: REGIONAL_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("hi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openemployee_language") as LanguageCode;
      if (saved && DICTIONARY[saved]) {
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
        languages: REGIONAL_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
