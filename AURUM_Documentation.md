# AURUM — AI-Powered Wealth & Expense Dashboard
### Documentation, Features Guide, & Development Changelog

AURUM is a premium, high-converting personal finance dashboard styled after modern SaaS platforms like Stripe, Linear, and Vercel. It allows users to log transactions, upload bank statements in bulk, auto-categorize spending using Large Language Models (LLMs), generate structured spending advisories, and track metrics.

---

## 1. Core Features & Architecture

### A. Dashboard Analytics & Financial Health Overview
* **Quick Stats Metrics Grid**: 
  - **Net Balance**: Computes net worth (Inflows minus Outflows) with color indicators (negative values show in rose-red).
  - **Total Income**: Sums all cash inflows.
  - **Total Expenses**: Sums all cash outlays.
  - **Active Categories**: Tracks unique spending headers currently in use.
* **Frosted Donut Chart (Spend by Category)**: Converted from a basic solid pie chart. Features borderless cells, custom color mappings, interactive tooltips, and a center display showing the total monthly expenditure.
* **Gradient Bar Chart (Monthly Trends)**: Displays spending over time with a custom SVG gradient (Indigo-to-Violet), rounded bar caps, soft slate background gridlines, and a dark floating tooltip card.

### B. AI Spending Insights & Wealth Advisor
* **Generative Financial Advisory**: Uses Groq-hosted Llama-3 models to run regression-style analyses on the user's spending data.
* **Abuse Protection**: Restricts generation to 5 requests per minute per IP.
* **SaaS UI Presentation**: Housed in a dark terminal card featuring an active pulse scanner when the LLM is processing.

### C. Financial Records Table & Advanced Filtering
* **Unified Table**: Columns for Date, Description, Category, Type, and Amount (formatted in Indian Rupees `₹` with commas and decimals).
* **Live Query Search**: Text filter that dynamically matches description strings as the user types.
* **Cash Flow Toggles**: Filter transactions by type (All, Incomes, or Expenses).
* **Date Range Queries**: Direct database filtering using start and end pickers. Connects to MongoDB query parameters (`GET /transactions?start=...&end=...`).
* **Category Pill Tags**: Clean theme-adaptive color pill badges.

### D. Bulk Statement CSV Importer
* **Drag-and-Drop Zone**: Frosted glass import zone supporting drag-and-drop or browsing for CSV files.
* **AI Auto-Categorization Loop**: Submits rows to the database backend, running the description through the Llama classifier.
* **CSV Guide Template**: Displays the required CSV schema (`date,amount,description,type`) in an inline code box.

### E. Slide-over Global Transaction Drawer
* **Universal Action Button**: "+ Add Transaction" button in the sidebar triggers a slide-over panel.
* **Theme Adaptability**: Blends into the theme (white in light mode, deep slate in dark mode).
* **Validation & Spinners**: Displays inline errors, currency prefixes, and button loading spinners.

### F. Theme Engine & Aesthetics
* **Persistent Dark/Light Mode**: Synced with browser settings by default, with manual toggle stored in `localStorage`.
* **Glassmorphism**: Translucent frosted panels (`backdrop-blur-md`) with borders adjusting dynamically to the background.
* **Fluid Easing (350ms)**: Global CSS transitions on backgrounds, text colors, borders, and SVGs using a custom cubic-bezier curve.
* **Modern Typography & Backgrounds**: Inter and Plus Jakarta Sans Google Fonts on a premium neutral off-white background (`#fafafa`) that provides excellent contrast for floating panels.

### G. Server Rate Limiting & Security
* **IP Rate Limiting**: Uses the `slowapi` library to inspect request headers and rate-limit client IPs to prevent API abuse.
* **Rate Limits Configured**:
  - `POST /analytics/insights` (AI Insights): 5 requests/minute.
  - `POST /transactions/upload` (CSV Import): 10 requests/minute.
  - `POST /transactions` (Add Transaction): 30 requests/minute.
  - `GET /transactions` & `GET /analytics/summary` (Database queries): 100 requests/minute.

### H. Multi-Tenant User Isolation (Clerk Auth)
* **Clerk Auth Providers**: The application is wrapped in `<ClerkProvider>` on the frontend, enforcing authentication before loading data.
* **FastAPI JWT Decoder**: The backend decodes and verifies incoming Bearer tokens using Clerk's JWKS public keys.
* **Isolated Database Schema**: Transactions are mapped to the authenticated user's ID (`userId`), isolating each user's financial ledger.

---

## 2. Changelog (Changes Made During Overhaul)

### Frontend Overhaul (`finance-frontend`)

#### 1. Core Configuration & Base Styling
* **[index.html](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/index.html)**:
  - Added preconnect links and Google Fonts stylesheets for *Plus Jakarta Sans* and *Inter*.
  - Renamed application to `AURUM | AI-Powered Wealth & Expense Tracker`.
  - Added antialiased styling classes to the body tag.
* **[index.css](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/index.css)**:
  - Configured `@variant dark (&:where(.dark, .dark *));` to support class-based dark mode toggling in Tailwind v4.0.
  - Created `.glass-card` and `.glass-header` classes with backdrop-filters and alpha-borders.
  - Set the default body light mode background to a clean off-white hex `#fafafa` and configured transition speeds.
  - Styled system scrollbars.

#### 2. Component Redesigns & Clerk Integration
* **[package.json](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/package.json)**:
  - Added `@clerk/clerk-react` to dependencies and ran `npm install`.
* **[main.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/main.jsx)**:
  - Wrapped the React tree inside `<ClerkProvider>` and configured it with `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`.
  - Upgraded missing-key validations to render a premium, user-friendly setup warning card instead of throwing uncaught bootstrap crashes.
* **[Navbar.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/components/Navbar.jsx)**:
  - Redesigned into a theme-adaptive glass sidebar.
  - Rebranded heading to **AURUM**.
  - Bound the profile box to Clerk's `useUser()` hook to display name, email, and avatar image.
  - Integrated Clerk's `signOut()` utility directly into a custom Logout button.
* **[CsvImporter.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/components/CsvImporter.jsx)**:
  - Created a drag-and-drop importer component.
  - Connected the uploader to the `/transactions/upload` API with Bearer token headers.
* **[AddExpenseForm.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/components/AddExpenseForm.jsx)**:
  - Polished form fields and added close callbacks.
  - Attached Clerk Bearer token headers to transaction creation POST requests.
* **[ExpenseList.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/components/ExpenseList.jsx)**:
  - Added description search, transaction type filters, and date range inputs.
  - Integrated loading skeleton blocks.
  - Attached Clerk Bearer token headers to transactions list GET queries.
* **[Dashboard.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/components/Dashboard.jsx)**:
  - Configured the component to fetch both analytics summaries and transaction listings using Clerk Bearer headers to compute isolated stats.
  - Replaced the solid pie chart with a frosted donut chart.
  - Custom-styled the bar chart and insights container, attaching Bearer headers to all API endpoints.
* **[App.jsx](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-frontend/src/App.jsx)**:
  - Wrapped dashboard layout in `<SignedIn>` container.
  - Embedded Clerk's `<SignIn />` component directly inside a premium split grid on the landing page for signed-out users, removing the necessity of triggering modal popups.
  - Custom-themed the `<SignIn />` container's internal appearance variables dynamically (colors, backgrounds, inputs) based on the active dark/light mode toggle.
  - Fixed dark mode visibility issues of the "Sign in with Google" text by targeting Clerk's `socialButtonsBlockButtonText` style key with important override rules.
  - Added SVGs and link configurations for **GitHub** and **X (Twitter)** directly inside both the dashboard and landing footers.
  - Centralized global social redirect actions: pointing X links to `https://x.com/apz_999` and GitHub links to `https://github.com/Anubhab38`.
  - Rebranded copy across the application's hero grid, copyright declarations, about headers, and title fields to **AURUM**.

---

### Backend Protection & Auth (`finance-backend`)

* **[requirements.txt](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-backend/requirements.txt)**:
  - Added the `slowapi==0.1.9` package to backend dependencies.
  - Added `PyJWT==2.8.0` and `cryptography==42.0.5` dependencies for token signature decoding.
* **[auth.py](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-backend/auth.py) [NEW]**:
  - Implemented the `ClerkAuth` dependency class.
  - Integrates `PyJWT`'s `PyJWKClient` to fetch, cache, and decode tokens against Clerk's JWKS keys endpoint.
* **[main.py](file:///D:/WEBFULLSTACK/PROJECTS/finance/finance-backend/main.py)**:
  - Imported `Request` and `Depends` from fastapi, alongside `Limiter` and `ClerkAuth` dependencies.
  - Configured IP rate limits on all endpoints.
  - Injected `userId: str = Depends(ClerkAuth())` into endpoints.
  - Refactored routes to filter and tag transaction documents inside MongoDB using the authenticated `userId`.
