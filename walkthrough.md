# Digital Heroes — Golf Performance & Charity Draw Platform
## Walkthrough & System Verification (Edition 2026)

We have built and verified the complete full-stack **Digital Heroes** platform according to the **Product Requirements Document (PRD Level 1 · 2026 Edition)**, with clean separation between frontend and backend, adherence to the *"Feel, not fairway"* design language, and zero-configuration local database readiness.

---

## 🚀 How to Run the Application

Both the frontend and backend are decoupled in separate directories and can be run independently or together:

### Option 1: Run Both Concurrently with One Command (Root)
From the project root (`intern/`):
```powershell
npm run dev
```
This automatically boots:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

### Option 2: Run in Separate Terminals

#### Terminal 1 — Backend:
```powershell
cd backend
npm run dev
```

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm run dev
```

---

## ⚙️ Environment Variables (.env)

Both services are equipped with production-ready `.env` and `.env.example` configurations:
- **`backend/.env`**: Controls `PORT=5000`, `JWT_SECRET`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, and Supabase parameters.
- **`frontend/.env`**: Controls `VITE_API_URL=http://localhost:5000`, `VITE_APP_NAME`, and feature flags.

---

## 🗄️ Database Details

You asked: *"and if any databases needed the tell me"*

1. **Local Development (Ready Out-of-the-Box)**:
   - Built with **SQLite** via `better-sqlite3`.
   - **Zero configuration required**: Tables and seed data are automatically initialized on startup at `backend/digital_heroes.db`.
   - Complete relational integrity with foreign keys, UNIQUE constraints on `(user_id, score_date)`, transactions, and WAL mode.
   - To re-seed the demo dataset at any time:
     ```powershell
     cd backend
     node src/db/seed.js
     ```

2. **Cloud Deployment (Supabase / PostgreSQL, PRD § 15.1)**:
   - If deploying to **Supabase** or **PostgreSQL**, use the complete production SQL migration script located at:
     [`backend/supabase_schema.sql`](file:///c:/Users/vishu/OneDrive/Desktop/intern/backend/supabase_schema.sql).

---

## 🔑 Pre-Configured Test Credentials

| Account | Email | Password | Access Level & Pre-Loaded Data |
|---|---|---|---|
| **Golfer / Subscriber** | `golfer@digitalheroes.com` | `golfer123` | Callum Vance: Active $19/mo subscriber, 5 rolling scores, 15% charity split to *Birdies for Brain Tumors*, active ticket in pool, winning ticket claim with proof upload. |
| **Platform Administrator** | `admin@digitalheroes.com` | `admin123` | Full access across all 5 admin surfaces: user management, draw simulation & publishing, charity management, winner proof review, and analytics. |

*(Quick-login buttons are also provided directly on the `/auth` page for instant 1-click evaluation).*

---

## 🛡️ PRD Feature Verification Matrix

| Section | PRD Specification | Verification Result |
|---|---|---|
| **§ 01 & § 12** | Aesthetic: "Feel, not fairway" | Dark slate, vibrant coral & mint palette, glowing jackpot ticker, countdown timer, micro-interactions, responsive mobile/desktop. |
| **§ 03** | Three User Roles | Public Visitor, Registered Subscriber, and Administrator guarded by role-based JWT authentication and real-time subscription checks. |
| **§ 04** | Subscription System | Monthly ($19/mo) and Yearly ($190/yr discounted) plans. Handles active, renewal date, cancellation, and lapsed states. |
| **§ 05** | Score Management | Strict Stableford 1–45 range, required date, **unique 1 score per date rule** (duplicates rejected), **automatic 5-score rolling buffer** (6th score replaces oldest), reverse chronological ordering. |
| **§ 06 & § 07** | Draw Engine & Pool Allocation | 5, 4, and 3-number match tiers. **Random lottery mode** vs **Algorithmic mode** (weighted by score frequency). 40% (Tier 5 with Rollover), 35% (Tier 4), 25% (Tier 3). Equal prize splitting among winners. Admin simulation before publish. |
| **§ 08** | Charity System | Minimum 10% contribution guarantee, voluntary percentage slider (up to 50%+), **independent direct donation option** not tied to gameplay, searchable charity directory with categories, charity profiles with upcoming golf days/events, homepage spotlight. |
| **§ 09** | Winner Verification | Winners upload scorecard screenshots from golf platform (Golfshot, HowDidiDo, etc.). Admin review interface to Approve or Reject. Payment state: `Pending Review` → `Approved` / `Rejected` → `Paid`. |
| **§ 10** | User Dashboard | All 5 modules functional: 1. Subscription status & renewal; 2. 5-Score entry/edit; 3. Charity & % slider; 4. Participation ticket & countdown; 5. Winnings overview & proof upload modal. |
| **§ 11** | Admin Dashboard | All 5 control surfaces functional: 1. User management; 2. Draw simulator & publisher; 3. Charity CRUD & golf days; 4. Winners verification & payouts; 5. Reports & analytics with 1-45 score frequency chart. |
| **§ 15 & § 16** | Mandatory Deliverables | Clean structured codebase, test credentials, automated tests, responsive layout, error handling. |

---

## 🧪 Automated Core Logic Verification Output

Ran `node test-logic.js` in `backend/`:
```
🧪 Testing Digital Heroes Platform Core Logic...

1️⃣ Adding 5 sequential scores...
   Added 5 scores. Count: 5. Oldest date was 2026-03-01.

2️⃣ Adding 6th score (rolling eviction test)...
   Scores count after 6th insertion: 5 (Expected: 5)
   Current score dates: 2026-03-06, 2026-03-05, 2026-03-04, 2026-03-03, 2026-03-02
✅ Success: Oldest score was automatically evicted.

3️⃣ Testing duplicate date prevention on 2026-03-06...
✅ Success: Duplicate date caught: "A score for 2026-03-06 already exists. You may edit or delete the existing entry."

4️⃣ Testing score bounds (0 and 46)...
✅ Success: Out of bounds caught: "Score must be a valid Stableford number between 1 and 45"

5️⃣ Testing Draw Engine...
   Active Subscribers: 15
   Total Pool: $14991
   Tier 5 (40% + Rollover): $14546.4
   Tier 4 (35%): $259.35
   Tier 3 (25%): $185.25
   Simulated Random Draw: [7,15,17,40,44]
   Random Winners: Tier 5: 0, Tier 4: 0, Tier 3: 0
   Simulated Algorithmic Draw: [16,29,35,38,43]
   Algorithmic Winners: Tier 5: 0, Tier 4: 0, Tier 3: 2

✨ All Core Logic Tests Passed!
```
