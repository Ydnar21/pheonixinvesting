/*
  # Add Portfolio Goal Tracking

  1. New Tables
    - `portfolio_goal`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - Owner of the goal
      - `starting_amount` (numeric) - Starting portfolio value (e.g., 15000)
      - `target_amount` (numeric) - Target portfolio value (e.g., 100000)
      - `target_date` (date) - Goal deadline date
      - `created_at` (timestamptz) - When goal was created
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `portfolio_goal` table
    - Users can read all goals (public visibility)
    - Users can insert their own goal
    - Users can update their own goal
    - Users can delete their own goal

  3. Important Notes
    - One goal per user (enforced by unique constraint)
    - Goals are publicly visible to create accountability
    - Amounts stored as numeric for precision
*/

CREATE TABLE IF NOT EXISTS portfolio_goal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starting_amount numeric NOT NULL DEFAULT 15000,
  target_amount numeric NOT NULL DEFAULT 100000,
  target_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE portfolio_goal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio goals"
  ON portfolio_goal FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own portfolio goal"
  ON portfolio_goal FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio goal"
  ON portfolio_goal FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio goal"
  ON portfolio_goal FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_goal_user_id ON portfolio_goal(user_id);