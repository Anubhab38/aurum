import { useState } from "react";
import api from "../api";

/**
 * Form to add a single transaction. Calls POST /transactions, then tells
 * the parent (App) to refresh the list + dashboard via onAdded().
 */
export default function AddExpenseForm({ onAdded, onClose, getToken }) {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10), // defaults to today
    type: "expense",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.amount || !form.description || !form.date) {
      setError("Please fill in amount, description, and date.");
      return;
    }

    setSubmitting(true);
    try {
      // Fetch session token from Clerk
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      await api.post(
        "/transactions",
        {
          amount: parseFloat(form.amount),
          description: form.description,
          date: form.date,
          type: form.type,
        },
        { headers }
      );

      // Reset amount and description; preserve date/type for rapid additions
      setForm((prev) => ({ ...prev, amount: "", description: "" }));
      onAdded?.();
      onClose?.(); // Close the drawer/modal if applicable
    } catch (err) {
      setError("Couldn't save the transaction. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-transparent p-2">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Create Transaction</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Record a new income or expense</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Amount</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-medium text-sm">₹</span>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Type</label>
          <div className="relative">
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Description</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Starbucks Coffee, Office Rent, Dividends"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        {form.type === "expense" && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-indigo-500 animate-pulse-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-categorization powered by AI is enabled.
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Date</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 flex gap-2 text-rose-600 dark:text-rose-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-semibold rounded-lg py-2.5 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition cursor-pointer active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving Transaction...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </>
        )}
      </button>
    </form>
  );
}
