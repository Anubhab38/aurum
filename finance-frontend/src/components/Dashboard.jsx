import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api";

const PIE_COLORS = [
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
];

// Custom Premium Tooltip (adapted for dark mode toggle)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 text-white rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-slate-400 font-semibold mb-0.5">{data.name || data.payload.month}</p>
        <p className="text-indigo-400 dark:text-indigo-300 font-bold text-sm">
          ₹{Number(data.value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ refreshKey, getToken }) {
  const [summary, setSummary] = useState({ by_category: [], by_month: [] });
  const [transactions, setTransactions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoadingSummary(true);
      setSummaryError(null);
      try {
        // Fetch session token from Clerk
        const token = await getToken();
        console.log("DEBUG: [Dashboard] Fetched Clerk Token:", token ? `${token.slice(0, 15)}...` : "null/undefined");
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, txRes] = await Promise.all([
          api.get("/analytics/summary", { headers }),
          api.get("/transactions", { headers }),
        ]);

        if (isMounted) {
          setSummary(summaryRes.data);
          setTransactions(txRes.data);
        }
      } catch (err) {
        if (isMounted) {
          setSummaryError("Couldn't load dashboard analytics. Is the backend running?");
        }
      } finally {
        if (isMounted) {
          setLoadingSummary(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  async function handleGenerateInsight() {
    setLoadingInsight(true);
    setInsightError(null);
    try {
      // Fetch session token from Clerk
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const res = await api.post("/analytics/insights", {}, { headers });
      setInsight(res.data.insight);
    } catch (err) {
      setInsightError("Couldn't generate insights right now.");
    } finally {
      setLoadingInsight(false);
    }
  }

  // Calculate Metrics
  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const activeCategories = summary.by_category?.length || 0;
  const hasExpenseData = summary.by_category && summary.by_category.length > 0;

  // Loading Skeletons
  if (loadingSummary) {
    return (
      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 space-y-3 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {/* Chart Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6 h-80 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-6"></div>
            <div className="w-40 h-40 rounded-full border-8 border-slate-100 dark:border-slate-800 mx-auto mt-4"></div>
          </div>
          <div className="glass-card rounded-xl p-6 h-80 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-6"></div>
            <div className="space-y-3 mt-10">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Net Balance</p>
              <h3 className={`text-2xl font-extrabold mt-1.5 tracking-tight transition-colors ${
                netBalance >= 0 ? "text-slate-800 dark:text-white" : "text-rose-600 dark:text-rose-400"
              }`}>
                {netBalance >= 0 ? "" : "-"}₹{Math.abs(netBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1 transition-colors">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Live balance</span> computed from logs.
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Total Income</p>
              <h3 className="text-2xl font-extrabold mt-1.5 tracking-tight text-slate-800 dark:text-white transition-colors">
                ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1 transition-colors">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Inflows</span> generated from CSV or additions.
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Total Expenses</p>
              <h3 className="text-2xl font-extrabold mt-1.5 tracking-tight text-slate-800 dark:text-white transition-colors">
                ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1 transition-colors">
            <span className="font-semibold text-rose-600 dark:text-rose-400">Outflows</span> auto-categorized by AI.
          </div>
        </div>

        {/* Categories Card */}
        <div className="glass-card rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Active Categories</p>
              <h3 className="text-2xl font-extrabold mt-1.5 tracking-tight text-slate-800 dark:text-white transition-colors">
                {activeCategories}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1 transition-colors">
            <span className="font-semibold text-violet-600 dark:text-violet-400">Distributions</span> across spending streams.
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Spend by Category Donut Chart */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Spend by Category</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">Expense allocation grouped by auto-classification</p>
          </div>

          <div className="my-6 relative flex items-center justify-center min-h-[220px]">
            {summaryError ? (
              <p className="text-sm text-rose-500">{summaryError}</p>
            ) : !hasExpenseData ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors">No expense records found. Add transactions to generate analytics.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={summary.by_category}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {summary.by_category.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label Overlay */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Total Spend</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight mt-0.5 transition-colors">
                    ₹{totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Custom Legend list */}
          {hasExpenseData && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors">
              {summary.by_category.map((item, index) => (
                <div key={item.category} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  ></span>
                  <span>
                    {item.category}: <span className="text-slate-400 dark:text-slate-500 font-medium">₹{Math.round(item.total)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spend by Month Bar Chart */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Spend by Month</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">Monthly outgoing trends comparison</p>
          </div>

          <div className="my-6 min-h-[220px] flex items-center justify-center">
            {summaryError ? (
              <p className="text-sm text-rose-500">{summaryError}</p>
            ) : !summary.by_month || summary.by_month.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 transition-colors">No monthly trends available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.by_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  {/* Soft grid lines that render beautifully in both modes */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.05)", radius: 4 }} />
                  <Bar dataKey="total" name="Spent" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 transition-colors">
            <span>Aggregated from transactions database</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 transition-colors">INR Base</span>
          </div>
        </div>
      </div>

      {/* 3. AI Insights Panel */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-xl border border-slate-800 dark:border-slate-900 shadow-xl p-6 relative overflow-hidden group transition-colors">
        {/* Background gradient blur */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl group-hover:bg-indigo-500/20 transition duration-300 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Wealth Advisor
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Generative financial insights and savings proposals</p>
          </div>

          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight || !hasExpenseData}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 dark:disabled:bg-slate-900 disabled:text-slate-600 dark:disabled:text-slate-700 text-white text-xs font-bold rounded-lg px-4 py-2.5 transition flex items-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-[0.98]"
          >
            {loadingInsight ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing logs...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {insight ? "Regenerate Analysis" : "Generate AI Insights"}
              </>
            )}
          </button>
        </div>

        {insightError && (
          <div className="mt-4 bg-rose-950/20 border border-rose-900/40 rounded-lg p-4 flex gap-2.5 text-rose-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold">{insightError}</span>
          </div>
        )}

        <div className="mt-5 min-h-[60px] flex items-center">
          {!insight && !loadingInsight ? (
            <p className="text-xs text-slate-400 italic">
              {hasExpenseData
                ? "Click 'Generate AI Insights' to let the advisor run a regression model and summarize your spending behaviors."
                : "Add transactions first to unlock AI-driven financial insights."}
            </p>
          ) : loadingInsight ? (
            <div className="w-full space-y-2 pb-1 animate-pulse">
              <div className="h-3 bg-slate-800/40 rounded w-full"></div>
              <div className="h-3 bg-slate-800/40 rounded w-11/12"></div>
              <div className="h-3 bg-slate-800/40 rounded w-4/5"></div>
            </div>
          ) : (
            <div className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex gap-3 text-slate-300 leading-relaxed text-sm font-medium relative">
              <span className="absolute -top-3 left-4 px-2 py-0.5 bg-slate-800 text-[9px] font-bold text-slate-400 rounded border border-slate-700 uppercase tracking-widest">
                Llama 3.1 Model
              </span>
              <div className="text-indigo-400 shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.24 1.93-.66 2.775a.75.75 0 01-1.32-.714 6.5 6.5 0 10-8.04 0 .75.75 0 11-1.32.714A7.994 7.994 0 012 10a8 8 0 1114 0zm-8.25-1.5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zM12.75 8.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">{insight}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
