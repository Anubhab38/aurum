import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] flex items-center justify-center p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Clerk Integration Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AURUM uses Clerk to securely isolate financial ledgers per user.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg text-left border border-slate-100 dark:border-slate-900 text-xs font-mono select-all">
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
          </div>
          <p className="text-xs text-slate-450 dark:text-slate-550 leading-relaxed">
            Please add your publishable key to <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-350">finance-frontend/.env</code> and restart the development server.
          </p>
        </div>
      </div>
    </StrictMode>
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}
