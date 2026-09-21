# Digital Heroes — Golf Performance & Charity Draw Platform
### Product Requirements Document (PRD Level 1) · Edition 2026

A modern, subscription-driven web platform combining golf performance tracking, charity fundraising, and monthly draw-based prize pools. Designed strictly according to the **Digital Heroes PRD (Edition 2026)**, adhering to the *"Feel, not fairway"* design philosophy — emotion-driven, sleek dark editorial styling, leading with charitable impact rather than traditional sport clichés.

---

## ⚡ Quick Start Instructions

Both the frontend and backend are completely decoupled in separate directories and can be run independently or together:

### Option A: Run Both Together from the Root
```powershell
npm run dev
```
*(Runs both backend on `http://localhost:5000` and frontend on `http://localhost:5173` concurrently).*

---

### Option B: Run Separately in Individual Folders

#### 1. Backend
```powershell
cd backend
npm run dev
```
- **Port**: `http://localhost:5000`
- **Healthcheck**: `http://localhost:5000/api/health`

#### 2. Frontend
```powershell
cd frontend
npm run dev
```
- **Port**: `http://localhost:5173`
- Pre-configured Vite proxy automatically routes all `/api` calls and `/uploads` to port 5000.

---

## ⚙️ Environment Variables Configuration (.env)

Both the backend and frontend include pre-configured `.env` and `.env.example` files:

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=digital-heroes-super-secure-jwt-key-2026-edition
DATABASE_URL=./digital_heroes.db
STRIPE_SECRET_KEY=sk_test_digital_heroes_mock_key_2026
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Digital Heroes
VITE_EDITION=2026
VITE_ENABLE_MOCK_CHECKOUT=true
```

---

## 🔑 Pre-Seeded Test Credentials

The database is pre-seeded with sample users, historical scores, charities, past draws, and sample winning tickets with uploaded proof screenshots. You can log in manually or click the **one-click quick login buttons** on the [`/login`](http://localhost:5173/login) page:

| Role | Email | Password | Access & Features |
|---|---|---|---|
| **Golfer / Subscriber** | `golfer@digitalheroes.com` | `golfer123` | Active ₹499/mo subscriber (Callum Vance), 5 rolling Stableford scores, 15% charity split to *Birdies for Brain Tumors*, ticket in active pool, winner claim history, **ACTIVITY STATUS: COMPLETED ✓**. |
| **Platform Administrator** | `admin@digitalheroes.com` | `admin123` | Full control across all 5 admin surfaces: User management, Draw simulator & publisher, Charity CRUD, Winner verification & payout completion, Reports & analytics. |

---

## 🇮🇳 Indian Rupee Currency System (INR `₹`)

All financial mechanics across the platform are natively formatted according to the **Indian Numbering System** (`en-IN`, e.g., `₹14,25,000`, `₹499`, `₹4,990`):
- **Monthly Subscription**: `₹499 / month`
- **Yearly Subscription**: `₹4,990 / year` (Save ₹998 with 2 months free)
- **Charity Guarantee**: Minimum 10% of subscription directed to chosen charity
- **Starting Jackpot Rollover**: Seeded at `₹14,25,000` with rolling jackpot accumulation
- **Direct Donations**: Preset buttons `₹100`, `₹250`, `₹500`, `₹1,000`, `₹2,500` + custom amount

---

## 🏆 Automatic Person Activity Completion Tracking

A real-time, dynamic **Activity Completion Engine** tracks subscriber participation status across the platform:
- **Condition 1**: Active subscription (`status === 'active'`)
- **Condition 2**: Charity configured with minimum 10% voluntary allocation
- **Condition 3**: Exactly 5 rolling Stableford scores entered (1–45)
- **Automatic Status Display**:
  - **`ACTIVITY STATUS: COMPLETED ✓`** (Emerald glow + 100% progress bar) when all 3 conditions are satisfied. User is 100% eligible for the monthly cash draw!
  - **`ACTIVITY STATUS: IN PROGRESS (X/3 DONE)`** (Amber indicator) with interactive step checklist guiding the golfer to complete remaining requirements.
  - Dynamically updates immediately when scores are added, edited, or deleted.
  - Reflected in the top **Navbar** chip, the **Golfer Dashboard**, and the **Admin Surface 01** user table.

---

## 🌐 Own Email ID Social Authentication (Google & Facebook) & 100% Responsive UI

Both the **[`/signup`](http://localhost:5173/signup)** and **[`/login`](http://localhost:5173/login)** pages feature dedicated, production-ready Social Authentication with Google and Facebook:

### 1. Authenticate with Your OWN Email ID
- **Custom Google & Facebook Email Authentication**:
  - Clicking **"Sign up with Google"** or **"Sign up with Facebook"** opens an interactive authentication dialog where users directly enter their **own email ID** (e.g. `yourname@gmail.com` or `yourname@facebook.com`).
  - Full client-side email format validation ensures an `@` and valid domain name before proceeding.
  - **Custom or Auto-Derived Display Name**: Users can type their full name, or leave it blank to let the system parse and capitalize a clean display name from their email prefix.
- **Automatic Subscription & Charity Pairing**:
  - When signing up with a custom social email, the system automatically captures the selected subscription plan (**₹499/mo** or **₹4,990/yr**) and voluntary charity percentage (**10% to 50%**), stores the record securely in the database, and issues an authenticated JWT token.
  - Returning users logging in with their Google or Facebook email are instantly recognized and signed into their existing dashboard.
- **1-Tap Evaluator Autofill Pills**:
  - Quick-fill preset buttons (`Callum Vance`, `Arjun Patel`, `Priya Sharma`) allow one-click evaluation without typing.
- **Backend API**: Powered by `POST /api/auth/social-login` with safe foreign key resolution and fallback handling.

### 2. 100% Fully Responsive Layout Across All Devices
- **Mobile Smartphone Optimized (320px–480px)**:
  - Plan selection cards (`₹499/mo` vs `₹4,990/yr`), evaluator quick-login credentials, and social auth buttons use dynamic `grid-cols-1 sm:grid-cols-2` layouts that stack neatly on phones, preventing horizontal overflow or truncated text.
  - Card padding adapts smoothly (`p-5 sm:p-8 md:p-10`) to provide comfortable touch margins on compact phone screens.
- **Responsive Dialog Viewports**:
  - Social authentication modal utilizes `max-h-[92vh]`, safe scrollbars, and touch-target heights (`py-2.5 sm:py-3`), guaranteeing flawless usability on mobile phones, tablets, laptops, and ultra-wide desktop monitors.

---

## 🗄️ Database Architecture & Setup

### 1. Local Database (Zero-Configuration Embedded SQLite)
- **Engine**: SQLite via `better-sqlite3`.
- **Location**: `backend/digital_heroes.db`.
- **Initialization**: Automatically created and migrated on startup! No need to install or configure external database servers.
- **Re-seeding Data Anytime**:
  ```powershell
  cd backend
  node src/db/seed.js
  ```

### 2. Production Database (PostgreSQL / Supabase Ready, PRD § 15.1)
- For cloud deployment to **Supabase** or **PostgreSQL**, use the production SQL schema located at:
  [`backend/supabase_schema.sql`](file:///c:/Users/vishu/OneDrive/Desktop/intern/backend/supabase_schema.sql).
- It provides identical relational tables, constraints, foreign keys, and indexes for direct execution in the Supabase SQL editor.

---

## 📋 Comprehensive PRD Feature Verification

### § 01 & § 12 · UI / UX ("Feel, not fairway")
- [x] Emotion-driven, high-contrast dark editorial aesthetic (slate `#0B0F17`, coral `#FF5A36`, mint `#10B981`, amber `#F59E0B`).
- [x] Deliberately avoids golf clichés (no fairways, plaid, or club clipart).
- [x] Dedicated [`/login`](http://localhost:5173/login) and [`/signup`](http://localhost:5173/signup) standalone pages with 1-click test credentials and interactive charity/plan selection.
- [x] Homepage features live jackpot ticker formatted in INR (`₹`), countdown clock to next monthly draw, how-it-works interactive 3-step breakdown, and prominent subscription CTA.
- [x] Fully responsive across mobile, tablet, and desktop screens.

### § 03 · Three Distinct User Roles
- [x] **Public Visitor**: Explores platform concept, browses charities, inspects draw mechanics, initiates subscription.
- [x] **Registered Subscriber**: Manages profile, inputs/edits 5 rolling scores, chooses charity recipient & voluntary percentage, tracks tickets and winnings, submits scorecard proof, monitors Activity Completion status.
- [x] **Administrator**: Accesses the 5 PRD control surfaces, runs simulations, configures draw algorithms, approves/rejects winner proofs, marks payouts, monitors platform analytics, inspects subscriber activity status.

### § 04 · Subscription & Payment System
- [x] Plans: Monthly (₹499/mo) and Yearly (₹4,990/yr discounted rate — 2 months free).
- [x] Real-time subscription check on protected endpoints.
- [x] Handles active, renewal date, cancellation, and lapsed subscription states.
- [x] Simulated PCI-compliant checkout workflow.

### § 05 · Score Management System (Stableford 1–45)
- [x] Strict score range: `1` to `45` enforced on frontend and backend.
- [x] Each score requires a date (`YYYY-MM-DD`).
- [x] **Unique date constraint**: Only 1 score permitted per date. Duplicate entries for the same date are rejected with clear user error feedback.
- [x] **5-score rolling buffer**: Only the latest 5 scores are retained. A 6th score automatically evicts the oldest recorded score.
- [x] Displayed in reverse chronological order (most recent first). Full edit and delete support.

### § 06 & § 07 · Draw Engine & Prize Pool Allocation
- [x] **Draw Types**: 5-number match (Jackpot), 4-number match, 3-number match.
- [x] **Dual Draw Logic**:
  - **Random Mode**: Uniform lottery generation across numbers 1–45.
  - **Algorithmic Mode**: Frequency-weighted generator proportional to active subscribers' recorded scores.
- [x] **Prize Pool Allocation**:
  - 5-Number match: **40%** share — **Jackpot Rollover: Yes** (rolls forward if unclaimed).
  - 4-Number match: **35%** share — Rollover: No.
  - 3-Number match: **25%** share — Rollover: No.
- [x] Auto-calculation of tier pool sizes in INR (`₹`) based on active paying subscriber counts.
- [x] Equal splitting among multiple winners within the same match tier.
- [x] **Admin Simulation Before Publish**: Admins can preview simulated winning numbers, subscriber matches, and payout totals before committing.

### § 08 · Charity System
- [x] Minimum 10% subscription fee guaranteed to charity.
- [x] Voluntary slider allows subscribers to increase their contribution percentage (up to 50%+).
- [x] **Independent Direct Donation option**: Non-gameplay direct gifts with customizable INR amounts (`₹100` - `₹2,500`) and messages.
- [x] **Charity Directory**: Search and category filtering (Youth, Health, Environment, Veterans, Mental Health, Accessibility).
- [x] **Charity Profiles**: Mission overview, progress bars towards annual targets in INR, and upcoming golf days/events.
- [x] **Homepage Spotlight**: Featured charity section on landing page.

### § 09 · Winner Verification & Payout Workflow
- [x] Verification applies strictly to winners (3, 4, or 5 matches).
- [x] Scorecard Proof Upload: Winner uploads screenshot from their golf platform (Golfshot, HowDidiDo, Golf Genius, etc.).
- [x] Admin Review: Inspect uploaded screenshot proof, approve or reject with reason.
- [x] Payment State Transition: `Pending Review` → `Approved` / `Rejected` → `Paid` (with payment timestamp).

### § 10 · User Dashboard (All 5 Modules)
- [x] 1. Subscription status badge, renewal date, plan switcher, cancel/reactivate.
- [x] 2. **Automatic Activity Completion Tracker** with 3-step dynamic checklist & eligibility indicator.
- [x] 3. 5-Score entry, edit, and deletion interface with rolling eviction notices.
- [x] 4. Selected charity badge and interactive contribution percentage slider.
- [x] 5. Participation summary with active 5-number monthly ticket and draw countdown.
- [x] 6. Winnings overview with prize claim records, payout statuses, and proof upload dialog.

### § 11 · Admin Dashboard (All 5 Control Surfaces)
- [x] **01 User Management**: View/edit user profiles, adjust subscriptions, directly edit golf scores, and monitor **Activity Completion** status.
- [x] **02 Draw Management**: Configure Random vs Algorithmic mode, run simulations, view simulated winners in INR, publish official draw, manage rollover jackpot.
- [x] **03 Charity Management**: Add, edit, delete charities, manage media URLs, add upcoming golf days, set target goals in INR.
- [x] **04 Winners Management**: View all winners across draws, filter by status, inspect proof screenshot modal, approve/reject, mark payouts as paid in INR.
- [x] **05 Reports & Analytics**: Total users, active subscribers, total prize pool history in INR, current rollover, charity fund totals, and active score frequency bar chart (1–45).

---

## 📂 Project Directory Structure

```
intern/
├── package.json               # Root runner with concurrently (npm run dev)
├── README.md                  # Complete documentation & PRD mapping
├── backend/                   # Express + SQLite API (npm run dev)
│   ├── package.json           # Backend dependencies & dev script
│   ├── digital_heroes.db      # Embedded database (auto-generated)
│   ├── test-logic.js          # Core logic verification test script
│   ├── supabase_schema.sql    # Cloud PostgreSQL / Supabase schema
│   ├── uploads/               # Uploaded winner scorecard screenshots
│   └── src/
│       ├── server.js          # Express app & route mounting
│       ├── db/
│       │   ├── database.js    # SQLite connection with WAL & FKs
│       │   ├── schema.sql     # Local relational schema
│       │   └── seed.js        # Seed demo dataset
│       ├── middleware/
│       │   └── auth.js        # JWT auth, admin check, sub status guard
│       ├── services/
│       │   ├── scoreService.js# 5-score rolling buffer & unique date logic
│       │   └── drawService.js # Random & weighted algo draw engine
│       └── routes/
│           ├── authRoutes.js  # Register, login, subscription update
│           ├── scoreRoutes.js # Score CRUD
│           ├── drawRoutes.js  # Draws, pools, simulation, publish
│           ├── charityRoutes.js# Directory, profile, direct donate, CRUD
│           ├── winnerRoutes.js # Winner proofs, approval, payout
│           └── adminRoutes.js # 5 control surfaces & reports analytics
└── frontend/                  # React + Vite + Tailwind CSS (npm run dev)
    ├── package.json           # Frontend dependencies & dev script
    ├── vite.config.js         # Vite config with proxy to :5000
    ├── tailwind.config.js     # Custom editorial design tokens
    ├── index.html             # HTML shell with Google Fonts
    └── src/
        ├── main.jsx           # Entry point
        ├── App.jsx            # Route definitions
        ├── index.css          # Tailwind directives & glow effects
        ├── api/
        │   └── client.js      # Unified API client
        ├── context/
        │   └── AuthContext.jsx# Auth & subscriber state management
        ├── utils/
        │   └── currency.js    # Indian Rupee (INR ₹) formatting utilities
        ├── components/
        │   ├── Navbar.jsx     # Navigation with live jackpot pill & Activity chip
        │   ├── Footer.jsx     # Modern editorial footer
        │   ├── SocialAuthModal.jsx # Responsive Google/Facebook own email auth dialog
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── HomePage.jsx   # Landing page ("Feel, not fairway")
            ├── LoginPage.jsx  # Dedicated Login with 1-click test credentials
            ├── SignupPage.jsx # Dedicated Signup with interactive plan & charity picker
            ├── DrawMechanicsPage.jsx # Rules & interactive checker
            ├── CharityDirectoryPage.jsx # Search, filters, direct donate
            ├── CharityDetailPage.jsx    # Profile, golf days, donate modal
            ├── UserDashboardPage.jsx    # Complete golfer dashboard + Activity Tracker
            ├── AdminDashboardPage.jsx   # Full 5-surface control center + Activity column
            └── AuthPage.jsx   # Legacy tabbed auth (redirects to /login)
```

---

## 🧪 Automated Verification Script

To run the backend logic verification test suite at any time:
```powershell
cd backend
node test-logic.js
```
This automatically verifies:
1. Addition of 5 sequential Stableford scores.
2. 6th score rolling eviction of the oldest entry.
3. Duplicate play date rejection.
4. Score range validation (1–45).
5. Draw pool calculation (40% / 35% / 25%) and rollover accumulation.
6. Random vs Algorithmic weighted frequency draw simulation.
