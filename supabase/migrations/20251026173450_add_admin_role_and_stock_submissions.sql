/*
  # Add Admin Role and Stock Submission System

  ## Changes
  
  1. **Profiles Table Updates**
    - Add `is_admin` boolean column to identify admin users
    - Set default to false for new users
    - Set 'LiquidPheonix' username to admin

  2. **New Table: stock_submissions**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `stock_symbol` (text, required)
    - `stock_name` (text, required)
    - `title` (text, required)
    - `content` (text, required)
    - `sentiment` (text, default 'neutral', check constraint)
    - `status` (text, default 'pending', values: pending/approved/rejected)
    - `reviewed_by` (uuid, references profiles, nullable)
    - `reviewed_at` (timestamptz, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. **Stock Posts Table Updates**
    - Add `submission_id` column to track which submission was approved
    - Only admin users can create posts directly

  4. **Security**
    - Enable RLS on stock_submissions table
    - Policies for authenticated users to submit stocks
    - Policies for admin to view all submissions
    - Policies for users to view their own submissions
    - Update stock_posts policies to only allow admin to create
    - Public can still view posts and comments
*/

-- Add is_admin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Set LiquidPheonix as admin (case-insensitive match)
UPDATE profiles 
SET is_admin = true 
WHERE LOWER(username) = 'liquidpheonix';

-- Create stock_submissions table
CREATE TABLE IF NOT EXISTS stock_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add submission_id to stock_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_posts' AND column_name = 'submission_id'
  ) THEN
    ALTER TABLE stock_posts ADD COLUMN submission_id uuid REFERENCES stock_submissions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on stock_submissions
ALTER TABLE stock_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for stock_submissions

-- Users can create their own submissions
CREATE POLICY "Authenticated users can create stock submissions"
  ON stock_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON stock_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can view all submissions
CREATE POLICY "Admin can view all submissions"
  ON stock_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin can update submissions (approve/reject)
CREATE POLICY "Admin can update submissions"
  ON stock_submissions
  FOR UPDATE
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

-- Update stock_posts policies

-- Drop existing insert policy for stock_posts
DROP POLICY IF EXISTS "Authenticated users can create posts" ON stock_posts;

-- Only admin can create stock posts
CREATE POLICY "Admin can create stock posts"
  ON stock_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Drop existing update policy for stock_posts
DROP POLICY IF EXISTS "Authenticated users can update own posts" ON stock_posts;

-- Only admin can update stock posts
CREATE POLICY "Admin can update stock posts"
  ON stock_posts
  FOR UPDATE
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

-- Drop existing delete policy for stock_posts
DROP POLICY IF EXISTS "Authenticated users can delete own posts" ON stock_posts;

-- Only admin can delete stock posts
CREATE POLICY "Admin can delete stock posts"
  ON stock_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_submissions_status ON stock_submissions(status);
CREATE INDEX IF NOT EXISTS idx_stock_submissions_user_id ON stock_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
