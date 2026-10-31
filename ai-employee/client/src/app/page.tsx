import { AuthCard } from "@/components/AuthCard";
import { Sparkles, Bot, Shield, PhoneCall, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#090d16] to-[#090d16]">
      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-gray-800/60 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-100 tracking-tight">Open Employee</h1>
            <p className="text-[11px] text-gray-400">Autonomous AI Employee for Indian MSMEs</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Agent Online</span>
        </div>
      </header>

      {/* Main Content Hero */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Multilingual AI Operations Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your 24/7 AI employee that works even after the shop shuts.
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Speak or type in Hinglish or regional languages. Automatically updates sales and stock,
            forecasts inventory, places voice calls to suppliers, and manages GST filings through Playwright automation.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <PhoneCall className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Indian-Language Calls</h4>
                <p className="text-[11px] text-gray-500">Bhashini + Exotel telephony</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Stock & Finance</h4>
                <p className="text-[11px] text-gray-500">Razorpay UPI & predictions</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Approval Gate</h4>
                <p className="text-[11px] text-gray-500">Human audit for every payment</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center space-x-3">
              <Bot className="w-5 h-5 text-violet-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-gray-200">Computer Use</h4>
                <p className="text-[11px] text-gray-500">GST mock portal automation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <AuthCard />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 mt-8 border-t border-gray-900 text-center text-xs text-gray-600">
        Open Employee Platform &copy; 2026. Empowering Indian small businesses with autonomous AI workers.
      </footer>
    </main>
  );
}
