/*
  # Neon Database Schema (Modified from Supabase)

  ## IMPORTANT CHANGES FROM ORIGINAL

  1. Created `users` table to replace `auth.users`
  2. Removed ALL Row Level Security (RLS) policies
  3. Removed `auth.uid()` references
  4. Removed Supabase Storage references

  ## SECURITY WARNING

  This schema has NO built-in security. You MUST implement:
  - Authentication in your application layer
  - Authorization checks before every query
  - Session management
  - User verification for all operations

  ## New Tables Structure

  ### Core Tables
  - users (replaces auth.users)
  - profiles
  - stock_posts
  - post_comments
  - post_likes
  - comment_likes
  - user_trades
  - stock_votes
  - calendar_events
  - calendar_votes
  - user_follows
  - direct_messages
  - watchlist_stocks
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE (Replaces auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  email_confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  profile_picture_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- ============================================================================
-- STOCK POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_posts_user_id ON stock_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_posts_stock_symbol ON stock_posts(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_posts_created_at ON stock_posts(created_at DESC);

-- ============================================================================
-- POST COMMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES stock_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- ============================================================================
-- LIKES
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES stock_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);

-- ============================================================================
-- STOCK VOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('buy', 'sell', 'hold')),
  target_price numeric(10, 2),
  reasoning text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

CREATE INDEX IF NOT EXISTS idx_stock_votes_stock_symbol ON stock_votes(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_votes_user_id ON stock_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_votes_created_at ON stock_votes(created_at DESC);

-- ============================================================================
-- CALENDAR EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('earnings', 'dividend', 'meeting', 'ipo', 'economic', 'other')),
  stock_symbol text,
  event_date date NOT NULL,
  is_approved boolean DEFAULT false,
  submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_stock_symbol ON calendar_events(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_approved ON calendar_events(is_approved);

-- ============================================================================
-- CALENDAR VOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('bullish', 'bearish', 'neutral')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_votes_event_id ON calendar_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_votes_user_id ON calendar_votes(user_id);

-- ============================================================================
-- USER FOLLOWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- ============================================================================
-- DIRECT MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(sender_id, receiver_id, created_at);

-- ============================================================================
-- WATCHLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS watchlist_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_symbol text NOT NULL UNIQUE,
  company_name text NOT NULL,
  sector text,
  current_price numeric(10, 2),
  target_price numeric(10, 2),
  thesis text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  submitted_by_username text,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_symbol ON watchlist_stocks(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_status ON watchlist_stocks(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_submitted_by ON watchlist_stocks(submitted_by);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if two users are mutual follows
CREATE OR REPLACE FUNCTION are_mutual_follows(user1_id uuid, user2_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = user1_id AND following_id = user2_id
  ) AND EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = user2_id AND following_id = user1_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM direct_messages
    WHERE receiver_id = user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

/*
  After running this migration, you MUST:

  1. Implement user authentication in your application
     - Hash passwords with bcrypt or similar
     - Generate and validate JWT tokens
     - Handle login/logout/signup

  2. Add authorization checks in your queries
     - Verify user owns the resource before updating/deleting
     - Check user is authenticated before allowing operations

  3. Replace Supabase client with Neon client
     - Use @neondatabase/serverless
     - Rewrite all queries to use SQL

  4. Handle sessions
     - Store session tokens securely
     - Validate tokens on each request
     - Implement refresh token logic

  5. Replace file storage
     - Use S3, Cloudinary, or similar
     - Update profile picture upload logic

  Example authorization check:

  -- Before deleting a post, verify ownership
  DELETE FROM stock_posts
  WHERE id = $1 AND user_id = $2; -- $2 must be current user's ID

  -- Check result to ensure row was deleted
  -- If no rows deleted, user didn't own the post
*/
