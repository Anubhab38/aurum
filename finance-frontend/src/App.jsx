import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignIn, useAuth } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import AddExpenseForm from "./components/AddExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import CsvImporter from "./components/CsvImporter";

// Application & Social Links Configuration - Update these URLs for your project later
const APP_LINKS = {
  github: "https://github.com/Anubhab38",
  twitter: "https://x.com/apz_999",
  privacy: "#privacy",
  terms: "#terms",
  support: "#support",
  pricing: "#pricing",
  docs: "#docs",
  blog: "#blog",
  status: "#status",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Clerk Auth Token Retrieval hook
  const { getToken } = useAuth();

  // Dark/Light Mode Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function handleTransactionAdded() {
    setRefreshKey((prev) => prev + 1);
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard Overview";
      case "transactions":
        return "Financial Records";
      case "csv_upload":
        return "Import Statement";
      default:
        return "AURUM Financials";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] flex transition-colors duration-300">
      
      {/* ========================================================
          1. AUTHENTICATED STATE VIEW (SignedIn)
         ======================================================== */}
      <SignedIn>
        {/* Left Sidebar Navigation (Glassmorphic) */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddTransaction={() => setIsAddDrawerOpen(true)}
        />

        {/* Right Main Panel */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Sticky App Header Bar (Glassmorphic) */}
          <header className="h-16 glass-header px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
                {getTabTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M6.343 12a6 6 0 1112 0 6 6 0 01-12 0z" />
                  </svg>
                )}
              </button>

              <span className="text-xs text-slate-400 font-semibold cursor-default">v1.2.0</span>
            </div>
          </header>

          {/* Tab Content Area */}
          <main className="flex-grow p-8 max-w-6xl mx-auto w-full space-y-6">
            {activeTab === "dashboard" && (
              <Dashboard refreshKey={refreshKey} getToken={getToken} />
            )}

            {activeTab === "transactions" && (
              <div className="space-y-6">
                <ExpenseList refreshKey={refreshKey} getToken={getToken} />
              </div>
            )}

            {activeTab === "csv_upload" && (
              <CsvImporter onImported={handleTransactionAdded} getToken={getToken} />
            )}
          </main>

          {/* App Footer */}
          <footer className="bg-slate-100/30 dark:bg-slate-950/20 border-t border-slate-200/50 dark:border-slate-800/40 py-12 transition-colors">
            <div className="max-w-6xl mx-auto px-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight transition-colors">AURUM</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm transition-colors">
                    A high-end, AI-powered personal wealth dashboard that helps you track expenditures, import statements in bulk, and gain deep intelligence into your monthly spending habits.
                  </p>
                  <div className="flex items-center gap-3">
                    <a href={APP_LINKS.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" /></svg></a>
                    <a href={APP_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"><svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></a>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest transition-colors">Product</h4>
                  <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                    <li><button onClick={() => setActiveTab("dashboard")} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">Overview</button></li>
                    <li><button onClick={() => setActiveTab("transactions")} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">Transactions Table</button></li>
                    <li><button onClick={() => setActiveTab("csv_upload")} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">CSV Import Zone</button></li>
                    <li><a href={APP_LINKS.pricing} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Pricing Plans</a></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest transition-colors">Resources</h4>
                  <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                    <li><a href={APP_LINKS.docs} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Documentation</a></li>
                    <li><a href={APP_LINKS.support} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Help & Support</a></li>
                    <li><a href={APP_LINKS.status} className="hover:text-slate-655 dark:hover:text-slate-300 transition-colors">System Status</a></li>
                    <li><span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">API v1.2</span></li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest transition-colors">Company</h4>
                  <ul className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                    <li><a href="#about" className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">About AURUM</a></li>
                    <li><a href={APP_LINKS.blog} className="hover:text-slate-655 dark:hover:text-slate-300 transition-colors">Corporate Blog</a></li>
                    <li><a href="#careers" className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Careers</a></li>
                    <li><a href="#security" className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Security Details</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-200/40 dark:border-slate-800/30 my-8"></div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
                <p className="transition-colors">© 2026 AURUM Finance Technologies. All rights reserved.</p>
                <div className="flex items-center gap-4 font-semibold">
                  <a href={APP_LINKS.privacy} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                  <span className="text-slate-200 dark:text-slate-850 select-none">•</span>
                  <a href={APP_LINKS.terms} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
                  <span className="text-slate-200 dark:text-slate-850 select-none">•</span>
                  <a href={APP_LINKS.support} className="hover:text-slate-650 dark:hover:text-slate-300 transition-colors">Support Portal</a>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Slide-over Global Transaction Drawer */}
        {isAddDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsAddDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
                <AddExpenseForm
                  onAdded={handleTransactionAdded}
                  onClose={() => setIsAddDrawerOpen(false)}
                  getToken={getToken}
                />
              </div>
            </div>
          </div>
        )}
      </SignedIn>

      {/* ========================================================
          2. DE-AUTHENTICATED STATE VIEW (SignedOut SaaS Landing)
         ======================================================== */}
      <SignedOut>
        <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[#fafafa] dark:bg-[#090d16]">
          {/* Background Ambient Blobs */}
          <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

          {/* Sticky Header */}
          <header className="h-16 glass-header px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight transition-colors">AURUM</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                {theme === "light" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M6.343 12a6 6 0 1112 0 6 6 0 01-12 0z" />
                  </svg>
                )}
              </button>
            </div>
          </header>

          {/* Hero & Login Section Split */}
          <main className="flex-grow flex items-center justify-center py-12 px-8 relative z-10">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-7 space-y-8 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors">
                  ✨ Live AI Wealth Intelligence
                </span>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-[1.1] transition-colors">
                  Own your wealth.<br />
                  Track with <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">AI Intelligence.</span>
                </h2>

                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed transition-colors">
                  AURUM overhauls the personal ledger. Log transactions, upload bank CSV statements, and let generative models classify and analyze your budget limits.
                </p>

                {/* Minimalist Feature Icons Grid */}
                <div className="grid grid-cols-2 gap-6 pt-6 max-w-xl">
                  <div className="space-y-2">
                    <span className="text-xl">💰</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white transition-colors">Ledger Isolations</h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 transition-colors">Secure multi-tenant database separation.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xl">⚡</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white transition-colors">AI Categorizer</h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 transition-colors">Llama models auto-classifying descriptions.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xl">📊</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white transition-colors">Glassmorphic Charts</h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 transition-colors">Premium donut and monthly metrics.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xl">🔒</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white transition-colors">Clerk Security</h4>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 transition-colors">IP-limited secure token verification.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Clerk SignIn Card */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-[400px] border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300">
                  <SignIn 
                    appearance={{
                      variables: {
                        colorPrimary: '#4f46e5',
                        colorBackground: theme === 'dark' ? '#0f172a' : '#ffffff',
                        colorText: theme === 'dark' ? '#f8fafc' : '#0f172a',
                        colorTextSecondary: theme === 'dark' ? '#94a3b8' : '#475569',
                        borderRadius: '0.75rem',
                      },
                      elements: {
                        card: 'shadow-none border-0 bg-transparent p-0 m-0 w-full',
                        headerTitle: 'text-lg font-bold text-slate-800 dark:text-white',
                        headerSubtitle: 'text-xs text-slate-500 dark:text-slate-400',
                        socialButtonsBlockButton: 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all',
                        socialButtonsBlockButtonText: '!text-slate-700 dark:!text-slate-200 font-medium',
                        formButtonPrimary: 'bg-indigo-650 hover:bg-indigo-500 text-white font-semibold shadow-md transition-all active:scale-[0.98]',
                        footerActionLink: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-550',
                        formFieldInput: 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white',
                        formFieldLabel: 'text-xs font-semibold text-slate-600 dark:text-slate-400',
                      }
                    }}
                  />
                </div>
              </div>

            </div>
          </main>

          {/* Landing Footer with GitHub and X */}
          <footer className="bg-slate-100/30 dark:bg-slate-950/20 border-t border-slate-200/50 dark:border-slate-800/40 py-8 transition-colors text-xs text-slate-400 dark:text-slate-500 relative z-10">
            <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 AURUM Finance Technologies. All rights reserved.</p>
              
              {/* Centered Privacy / Terms links */}
              <div className="flex items-center gap-4 font-semibold">
                <a href={APP_LINKS.privacy} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                <span className="text-slate-200 dark:text-slate-850 select-none">•</span>
                <a href={APP_LINKS.terms} className="hover:text-slate-655 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
              </div>

              {/* Social icons at footer */}
              <div className="flex items-center gap-3">
                <a href={APP_LINKS.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href={APP_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </SignedOut>
    </div>
  );
}
