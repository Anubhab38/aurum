import React from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

export default function Navbar({ activeTab, setActiveTab, onAddTransaction }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "csv_upload",
      name: "Import CSV",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
  ];


  const getUserInitials = () => {
    if (!user) return "JD";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return (user.username?.slice(0, 2) || user.primaryEmailAddress?.emailAddress.slice(0, 2) || "JD").toUpperCase();
  };

  return (
    <aside className="w-64 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl text-slate-500 dark:text-slate-400 flex flex-col h-screen sticky top-0 border-r border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/60 dark:border-slate-800/60 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-slate-800 dark:text-white text-lg tracking-tight transition-colors">AURUM</span>
          <span className="text-[10px] block text-indigo-650 dark:text-indigo-400 font-bold tracking-wider uppercase">Fintech SaaS</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 py-4">
        <button
          onClick={onAddTransaction}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] duration-150 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer group ${
                isActive
                  ? "bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-sm border-l-2 border-indigo-600 dark:border-indigo-500 font-bold"
                  : "hover:bg-slate-200/40 dark:hover:bg-slate-900/30 text-slate-655 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span className={`${isActive ? "text-indigo-655 dark:text-indigo-400" : "text-slate-400 group-hover:text-indigo-655 dark:group-hover:text-slate-255"}`}>
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Box */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-800"
              alt="User Avatar"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate transition-colors">
              {user?.fullName || user?.username || "Guest User"}
            </p>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate transition-colors">
              {user?.primaryEmailAddress?.emailAddress || "no-email@clerk.com"}
            </p>
          </div>
        </div>

        {/* Clerk Sign Out Trigger */}
        <button
          onClick={() => signOut()}
          className="w-8 h-8 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
          title="Sign Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
