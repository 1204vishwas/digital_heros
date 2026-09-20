-- ====================================================================
-- DIGITAL HEROES — POSTGRESQL / SUPABASE PRODUCTION SCHEMA (PRD § 15.1)
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'subscriber', -- 'admin' | 'subscriber'
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'none', -- 'none' | 'monthly' | 'yearly'
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active' | 'inactive' | 'lapsed' | 'cancelled'
  subscription_price NUMERIC(10,2) DEFAULT 0.00,
  renewal_date DATE,
  charity_id BIGINT,
  charity_percentage NUMERIC(5,2) DEFAULT 10.00, -- Minimum 10%
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Charities Table
CREATE TABLE IF NOT EXISTS charities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  mission TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  logo_url TEXT,
  cover_image TEXT,
  website_url TEXT,
  target_amount NUMERIC(12,2) DEFAULT 50000.00,
  raised_amount NUMERIC(12,2) DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users 
ADD CONSTRAINT fk_user_charity FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- 3. Golf Scores Table (PRD § 05: 1-45 Stableford, 1 score per date)
CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_score_date UNIQUE (user_id, score_date)
);

-- 4. Charity Events Table (Golf Days)
CREATE TABLE IF NOT EXISTS charity_events (
  id BIGSERIAL PRIMARY KEY,
  charity_id BIGINT NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Donations Table (Direct Donations & Subscription Splits)
CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  charity_id BIGINT NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  donation_type VARCHAR(50) NOT NULL DEFAULT 'subscription_split', -- 'subscription_split' | 'direct_donation'
  donor_name VARCHAR(255),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Draws Table (PRD § 06 & § 07)
CREATE TABLE IF NOT EXISTS draws (
  id BIGSERIAL PRIMARY KEY,
  draw_code VARCHAR(100) UNIQUE,
  draw_date DATE NOT NULL,
  mode VARCHAR(50) NOT NULL DEFAULT 'random', -- 'random' | 'algorithmic'
  winning_numbers JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'simulated', -- 'simulated' | 'published'
  active_subscribers_count INTEGER DEFAULT 0,
  total_pool NUMERIC(12,2) DEFAULT 0.00,
  jackpot_rollover_in NUMERIC(12,2) DEFAULT 0.00,
  jackpot_rollover_out NUMERIC(12,2) DEFAULT 0.00,
  tier_5_pool NUMERIC(12,2) DEFAULT 0.00,
  tier_4_pool NUMERIC(12,2) DEFAULT 0.00,
  tier_3_pool NUMERIC(12,2) DEFAULT 0.00,
  tier_5_winners_count INTEGER DEFAULT 0,
  tier_4_winners_count INTEGER DEFAULT 0,
  tier_3_winners_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Draw Winners & Proof Verification Table (PRD § 09)
CREATE TABLE IF NOT EXISTS draw_winners (
  id BIGSERIAL PRIMARY KEY,
  draw_id BIGINT NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type VARCHAR(50) NOT NULL, -- '5-match' | '4-match' | '3-match'
  matched_numbers JSONB NOT NULL,
  prize_amount NUMERIC(12,2) NOT NULL,
  proof_url TEXT,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'paid'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO system_settings (key, value)
VALUES 
  ('jackpot_rollover', '14250.00'),
  ('prize_pool_percentage', '50.0')
ON CONFLICT (key) DO NOTHING;
