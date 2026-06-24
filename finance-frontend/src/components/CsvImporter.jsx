import React, { useState, useRef } from "react";
import api from "../api";

export default function CsvImporter({ onImported, getToken }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only CSV files are supported.");
      }
    }
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Only CSV files are supported.");
      }
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Fetch session token from Clerk
      const token = await getToken();

      const res = await api.post("/transactions/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setResult(res.data);
      setFile(null);
      onImported?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to upload. Please check your connection and CSV column names."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Uploader Card */}
      <div className="glass-card rounded-xl p-6 transition-all">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Bulk Import Statement</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Import multiple transactions at once. Your expenses will be auto-categorized by AI.
        </p>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`mt-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : file
              ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10"
              : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-4 transition-colors">
                Drag and drop your file here, or <span className="text-indigo-600 dark:text-indigo-400 font-medium">browse</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">Supports CSV files up to 10MB</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-4 truncate max-w-xs transition-colors">{file.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          )}
        </div>

        {/* Upload Trigger / Action buttons */}
        {file && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/10"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing (AI Auto-Categorizing)...
                </>
              ) : (
                "Upload and Import"
              )}
            </button>
            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Results Feedback */}
        {result && (
          <div className="mt-6 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4 flex gap-3 transition-colors">
            <div className="text-emerald-600 dark:text-emerald-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 transition-colors">Import Successful</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1 transition-colors">
                Successfully processed and imported <strong>{result.inserted_count}</strong> transactions.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-xl p-4 flex gap-3 transition-colors">
            <div className="text-rose-600 dark:text-rose-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-400 transition-colors">Import Failed</h4>
              <p className="text-xs text-rose-700 dark:text-rose-500 mt-1 transition-colors">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* CSV Instructions Card */}
      <div className="glass-card rounded-xl p-6 transition-all">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider transition-colors">CSV Template Format</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          To successfully import transactions, ensure your CSV columns exactly match the headings below:
        </p>

        <div className="mt-4 bg-slate-900 dark:bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-lg overflow-x-auto border border-slate-800 leading-relaxed select-all">
          date,amount,description,type<br />
          2026-06-20,120.50,Uber Cab Ride,expense<br />
          2026-06-21,50000.00,Monthly Salary,income<br />
          2026-06-22,450.00,Dinner at Pizza Hut,expense
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 transition-colors">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">date</span>
            Must be in YYYY-MM-DD format.
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">amount</span>
            Number representing value.
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">description</span>
            Detail of spending (AI reads this to categorize!).
          </div>
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">type</span>
            Must be either <code>expense</code> or <code>income</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
