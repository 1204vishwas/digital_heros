-- Digital Heroes Relational Schema (SQLite & Supabase/PostgreSQL compatible)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'subscriber', -- 'admin' | 'subscriber'
  subscription_plan TEXT NOT NULL DEFAULT 'none', -- 'none' | 'monthly' | 'yearly'
  subscription_status TEXT NOT NULL DEFAULT 'inactive', -- 'active' | 'inactive' | 'lapsed' | 'cancelled'
  subscription_price REAL DEFAULT 0.0,
  renewal_date TEXT,
  charity_id INTEGER,
  charity_percentage REAL DEFAULT 10.0, -- Minimum 10%
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 45),
  score_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, score_date) -- PRD § 05: Only one score entry is permitted per date
);

CREATE TABLE IF NOT EXISTS charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  mission TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  cover_image TEXT,
  website_url TEXT,
  target_amount REAL DEFAULT 50000.0,
  raised_amount REAL DEFAULT 0.0,
  is_featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS charity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  charity_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  charity_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  donation_type TEXT NOT NULL DEFAULT 'subscription_split', -- 'subscription_split' | 'direct_donation'
  donor_name TEXT,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS draws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draw_code TEXT UNIQUE,
  draw_date TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'random', -- 'random' | 'algorithmic'
  winning_numbers TEXT NOT NULL, -- JSON array e.g. "[7, 14, 23, 31, 42]"
  status TEXT NOT NULL DEFAULT 'simulated', -- 'simulated' | 'published'
  active_subscribers_count INTEGER DEFAULT 0,
  total_pool REAL DEFAULT 0.0,
  jackpot_rollover_in REAL DEFAULT 0.0,
  jackpot_rollover_out REAL DEFAULT 0.0,
  tier_5_pool REAL DEFAULT 0.0,
  tier_4_pool REAL DEFAULT 0.0,
  tier_3_pool REAL DEFAULT 0.0,
  tier_5_winners_count INTEGER DEFAULT 0,
  tier_4_winners_count INTEGER DEFAULT 0,
  tier_3_winners_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draw_winners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draw_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  match_type TEXT NOT NULL, -- '5-match' | '4-match' | '3-match'
  matched_numbers TEXT NOT NULL, -- JSON array
  prize_amount REAL NOT NULL,
  proof_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid'
  paid_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
