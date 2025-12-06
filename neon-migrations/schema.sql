-- Liquid Phoenix Database Schema for Neon
-- Complete schema migration from Supabase
-- This file contains all tables, indexes, and constraints needed

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('earnings', 'dividend', 'split', 'meeting', 'other')),
  ticker TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_ticker ON calendar_events(ticker);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);

-- ============================================================================
-- CALENDAR EVENT VOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_votes_event ON calendar_event_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_votes_user ON calendar_event_votes(user_id);

-- ============================================================================
-- STOCK VOTING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('bullish', 'bearish')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_stock_votes_ticker ON stock_votes(ticker);
CREATE INDEX IF NOT EXISTS idx_stock_votes_user ON stock_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_votes_created ON stock_votes(created_at DESC);

-- ============================================================================
-- WATCHLIST SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS watchlist_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  sector TEXT,
  market_cap TEXT,
  current_price DECIMAL(10, 2),
  target_price DECIMAL(10, 2),
  thesis TEXT NOT NULL,
  catalyst TEXT,
  risks TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_ticker ON watchlist_stocks(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist_stocks(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_submitted_by ON watchlist_stocks(submitted_by);
CREATE INDEX IF NOT EXISTS idx_watchlist_created ON watchlist_stocks(created_at DESC);

-- ============================================================================
-- WATCHLIST VOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS watchlist_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES watchlist_stocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stock_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_votes_stock ON watchlist_votes(stock_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_votes_user ON watchlist_votes(user_id);

-- ============================================================================
-- LEGACY TABLES (May be removed in future)
-- ============================================================================

-- Stock Submissions (Legacy)
CREATE TABLE IF NOT EXISTS stock_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_submissions_status ON stock_submissions(status);
CREATE INDEX IF NOT EXISTS idx_stock_submissions_ticker ON stock_submissions(ticker);

-- Trades (Legacy)
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  company_name TEXT,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('stock', 'option')),
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell')),
  quantity DECIMAL(10, 4) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(15, 2),
  trade_date DATE NOT NULL,
  option_type TEXT CHECK (option_type IN ('call', 'put', NULL)),
  strike_price DECIMAL(10, 2),
  expiration_date DATE,
  break_even_price DECIMAL(10, 2),
  earnings_date DATE,
  thesis TEXT,
  catalyst TEXT,
  risk_assessment TEXT,
  position_size_reasoning TEXT,
  exit_strategy TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_type ON trades(trade_type);
CREATE INDEX IF NOT EXISTS idx_trades_action ON trades(action);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_stocks_updated_at BEFORE UPDATE ON watchlist_stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (Optional - for convenience)
-- ============================================================================

-- View for approved watchlist stocks with vote counts
CREATE OR REPLACE VIEW approved_watchlist_with_votes AS
SELECT
  w.*,
  COALESCE(upvotes.count, 0) as upvote_count,
  COALESCE(downvotes.count, 0) as downvote_count,
  u.username as submitted_by_username,
  u.display_name as submitted_by_display_name
FROM watchlist_stocks w
LEFT JOIN users u ON w.submitted_by = u.id
LEFT JOIN (
  SELECT stock_id, COUNT(*) as count
  FROM watchlist_votes
  WHERE vote_type = 'upvote'
  GROUP BY stock_id
) upvotes ON w.id = upvotes.stock_id
LEFT JOIN (
  SELECT stock_id, COUNT(*) as count
  FROM watchlist_votes
  WHERE vote_type = 'downvote'
  GROUP BY stock_id
) downvotes ON w.id = downvotes.stock_id
WHERE w.status = 'approved';

-- View for calendar events with vote counts
CREATE OR REPLACE VIEW calendar_events_with_votes AS
SELECT
  e.*,
  COALESCE(upvotes.count, 0) as upvote_count,
  COALESCE(downvotes.count, 0) as downvote_count,
  u.username as submitted_by_username,
  u.display_name as submitted_by_display_name
FROM calendar_events e
LEFT JOIN users u ON e.submitted_by = u.id
LEFT JOIN (
  SELECT event_id, COUNT(*) as count
  FROM calendar_event_votes
  WHERE vote_type = 'upvote'
  GROUP BY event_id
) upvotes ON e.id = upvotes.event_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as count
  FROM calendar_event_votes
  WHERE vote_type = 'downvote'
  GROUP BY event_id
) downvotes ON e.id = downvotes.event_id;

-- View for stock vote summary
CREATE OR REPLACE VIEW stock_vote_summary AS
SELECT
  ticker,
  COUNT(*) FILTER (WHERE vote_type = 'bullish') as bullish_count,
  COUNT(*) FILTER (WHERE vote_type = 'bearish') as bearish_count,
  COUNT(*) as total_votes,
  MAX(created_at) as last_vote_at
FROM stock_votes
GROUP BY ticker;

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add initial admin user or seed data here if needed
-- Example:
-- INSERT INTO users (email, username, display_name, is_admin)
-- VALUES ('admin@liquidphoenix.com', 'admin', 'Admin User', true)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- GRANTS (Adjust based on your security model)
-- ============================================================================

-- These are examples - adjust based on your actual user roles
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anonymous_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated_user;
