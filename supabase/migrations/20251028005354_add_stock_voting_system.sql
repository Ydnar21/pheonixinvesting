/*
  # Add Stock Voting System

  1. New Tables
    - `stock_votes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to stock_posts)
      - `user_id` (uuid, foreign key to profiles)
      - `short_term_sentiment` (text) - bullish, bearish, or neutral for short-term
      - `long_term_sentiment` (text) - bullish, bearish, or neutral for long-term
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `stock_votes` table
    - Add policy for authenticated users to read all votes
    - Add policy for authenticated users to insert their own votes
    - Add policy for authenticated users to update their own votes
    - Add unique constraint to prevent duplicate votes per user per post
  
  3. Notes
    - Users can vote on both short-term and long-term sentiment
    - Users can update their votes
    - Votes are tracked separately from likes
*/

CREATE TABLE IF NOT EXISTS stock_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES stock_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  short_term_sentiment text NOT NULL CHECK (short_term_sentiment IN ('bullish', 'bearish', 'neutral')),
  long_term_sentiment text NOT NULL CHECK (long_term_sentiment IN ('bullish', 'bearish', 'neutral')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE stock_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON stock_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON stock_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON stock_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stock_votes_post_id ON stock_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_stock_votes_user_id ON stock_votes(user_id);