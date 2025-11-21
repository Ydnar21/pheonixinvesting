/*
  # Watchlist System

  1. New Tables
    - `watchlist_stocks`
      - `id` (uuid, primary key)
      - `symbol` (text, stock ticker symbol)
      - `company_name` (text)
      - `sector` (text, e.g., Technology, Healthcare, Finance, etc.)
      - `term` (text, either 'long' or 'short')
      - `added_by` (uuid, references profiles)
      - `added_at` (timestamptz)
      - `notes` (text, optional admin notes)
      - `current_price` (numeric, optional)
      - `target_price` (numeric, optional)
    
    - `watchlist_submissions`
      - `id` (uuid, primary key)
      - `symbol` (text)
      - `company_name` (text)
      - `sector` (text)
      - `term` (text, 'long' or 'short')
      - `submitted_by` (uuid, references profiles)
      - `submitted_at` (timestamptz)
      - `status` (text, 'pending', 'approved', or 'denied')
      - `notes` (text, user's rationale)
      - `admin_notes` (text, optional admin feedback)
      - `reviewed_by` (uuid, nullable, references profiles)
      - `reviewed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on both tables
    - Watchlist stocks: Everyone can read, only admins can insert/update/delete
    - Submissions: Users can insert their own, admins can read/update all, users can read their own
*/

-- Create watchlist_stocks table
CREATE TABLE IF NOT EXISTS watchlist_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  term text NOT NULL CHECK (term IN ('long', 'short')),
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  added_at timestamptz DEFAULT now(),
  notes text,
  current_price numeric(10, 2),
  target_price numeric(10, 2)
);

-- Create watchlist_submissions table
CREATE TABLE IF NOT EXISTS watchlist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  term text NOT NULL CHECK (term IN ('long', 'short')),
  submitted_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  notes text,
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

-- Enable RLS
ALTER TABLE watchlist_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_submissions ENABLE ROW LEVEL SECURITY;

-- Watchlist stocks policies
CREATE POLICY "Anyone can view watchlist stocks"
  ON watchlist_stocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert watchlist stocks"
  ON watchlist_stocks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update watchlist stocks"
  ON watchlist_stocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete watchlist stocks"
  ON watchlist_stocks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Watchlist submissions policies
CREATE POLICY "Users can view their own submissions"
  ON watchlist_submissions FOR SELECT
  TO authenticated
  USING (
    submitted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can submit stocks"
  ON watchlist_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins can update submissions"
  ON watchlist_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete submissions"
  ON watchlist_submissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_sector ON watchlist_stocks(sector);
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_term ON watchlist_stocks(term);
CREATE INDEX IF NOT EXISTS idx_watchlist_submissions_status ON watchlist_submissions(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_submissions_submitted_by ON watchlist_submissions(submitted_by);
