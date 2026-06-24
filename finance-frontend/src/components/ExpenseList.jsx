import { useEffect, useState } from "react";
import api from "../api";

const CATEGORY_COLORS = {
  Food: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30",
  Transport: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
  Shopping: "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30",
  Bills: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
  Entertainment: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
  Health: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  Other: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/40",
};

export default function ExpenseList({ refreshKey, getToken }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (startDate) params.start = startDate;
        if (endDate) params.end = endDate;

        // Fetch session token from Clerk
        const token = await getToken();
        console.log("DEBUG: [ExpenseList] Fetched Clerk Token:", token ? `${token.slice(0, 15)}...` : "null/undefined");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await api.get("/transactions", { params, headers });
        if (isMounted) setItems(res.data);
      } catch (err) {
        if (isMounted) setError("Couldn't load transactions. Is the backend running?");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [refreshKey, startDate, endDate]);

  // Client-side filtering for search & type
  const filteredItems = items.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
  }

  // Render Skeletons for Loading State
  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-slate-100 dark:bg-slate-900 rounded"></div>
          <div className="h-10 w-24 bg-slate-100 dark:bg-slate-900 rounded"></div>
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="space-y-1.5 w-1/3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300">
      {/* Header and Counters */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
              Transactions
              <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-2 py-0.5 transition-colors">
                {filteredItems.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Monitor, search, and audit your finance records</p>
          </div>
          {(search || typeFilter !== "all" || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition self-start sm:self-center"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all appearance-none cursor-pointer font-medium"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Incomes</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          {/* Date Range picker */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all font-medium"
              title="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 transition-all font-medium"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50/30 border-t border-rose-100 dark:border-rose-900/35 flex flex-col items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50/20 dark:bg-slate-900/10">
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">No Transactions Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto transition-colors">
            Try adjusting your search query, clearing filters, or logging a new transaction to begin.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider transition-colors">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-6 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDisplayDate(tx.date)}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                    {tx.description}
                  </td>

                  {/* Category badge */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other
                      }`}
                    >
                      {tx.category || "Other"}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold capitalize ${
                        tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                      {tx.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`py-3.5 px-6 text-right font-bold text-base whitespace-nowrap ${
                      tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-850 dark:text-white"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
