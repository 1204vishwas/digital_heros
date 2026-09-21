# Digital Heroes — Backend API
### Node.js + Express + SQLite / Supabase

The backend service for the **Digital Heroes Platform (PRD Level 1 · 2026 Edition)**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` (already pre-created for you):
```powershell
# Copy example if needed
cp .env.example .env
```

Contents of `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=digital-heroes-super-secure-jwt-key-2026-edition
DATABASE_URL=./digital_heroes.db
STRIPE_SECRET_KEY=sk_test_digital_heroes_mock_key_2026
```

### 3. Run Development Server
```powershell
npm run dev
```
- **Base URL**: `http://localhost:5000`
- **Healthcheck**: `http://localhost:5000/api/health`

### 4. Database Seed / Reset
```powershell
npm run seed
```

### 5. Automated Core Logic Tests
```powershell
node test-logic.js
```

---

## 🗄️ Database Details

- **Local Embedded Database**: SQLite (`digital_heroes.db`) via `better-sqlite3`. Tables, relationships, and demo records initialize automatically on boot.
- **Production Supabase / PostgreSQL**: See `supabase_schema.sql` for the cloud database schema.

---

## 📡 API Endpoints Overview

| Route Prefix | Scope | Description |
|---|---|---|
| `/api/auth` | Public & Protected | Registration, Standard Login, **Social Auth (`POST /api/auth/social-login`)** with own email & charity split, Profile (`/me`), Subscription Plan management |
| `/api/scores` | Subscriber | 5-Score rolling buffer CRUD (1-45 Stableford, 1 score per date constraint) |
| `/api/draws` | Public & Admin | Latest draw, History, Live pool calculation in INR (`₹`), Simulation, Publishing |
| `/api/charities` | Public & Admin | Directory, Categories, Profile & Golf Events, Direct Donations, CRUD |
| `/api/winners` | Subscriber & Admin | Winner scorecard proof upload, Admin verification review, Payouts in INR |
| `/api/admin` | Admin only | User management, Activity status monitoring, direct score edits, analytics & score distribution |

---

## 🇮🇳 Currency & Completion Engine Standards
- **Monetary Unit**: Indian Rupee (`INR ₹`). Standard plans: `₹499/mo`, `₹4,990/yr`. Base jackpot rollover: `₹14,25,000`.
- **Activity Status Engine**: Dynamic status (`COMPLETED` vs `IN PROGRESS`) evaluated when a subscriber maintains an active subscription, configures a charity (min 10%), and logs exactly 5 rolling scores.
