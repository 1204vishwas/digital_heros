# Digital Heroes — Frontend Client
### React 18 + Vite + Tailwind CSS + Lucide Icons

The user client for the **Digital Heroes Platform (PRD Level 1 · 2026 Edition)** adhering to the *"Feel, not fairway"* design language.

---

## ⚡ Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` (already pre-created for you):
```powershell
cp .env.example .env
```

Contents of `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Digital Heroes
VITE_EDITION=2026
VITE_ENABLE_MOCK_CHECKOUT=true
```

### 3. Run Development Server
```powershell
npm run dev
```
- **Local URL**: `http://localhost:5173`
- The Vite development server automatically proxies `/api` and `/uploads` requests to the backend.

### 4. Build for Production
```powershell
npm run build
```

---

## 🧭 Pages & Component Architecture

- `/` — **HomePage**: Hero section with live jackpot counter, countdown clock, 3-step guide, featured charity spotlight, and tier pool breakdown.
- `/mechanics` — **DrawMechanicsPage**: PRD draw rules explanation, interactive match checker, and past draw archive.
- `/charities` — **CharityDirectoryPage**: Filterable directory by category, search, progress bars, and direct donation modal.
- `/charities/:slug` — **CharityDetailPage**: Full charity story, upcoming golf days/events, and donations ledger.
- `/auth` — **AuthPage**: Sign in and registration with charity selection, contribution slider, plan switcher, and evaluator 1-click test logins.
- `/dashboard` — **UserDashboardPage**: Complete 5-module golfer dashboard (Subscription status, 5-Score manager, Charity slider, Draw ticket summary, Winnings & proof claim).
- `/admin` — **AdminDashboardPage**: 5 PRD Control Surfaces (User management, Draw simulator & publisher, Charity CRUD, Winner proof verification, Reports & Analytics).
