/*
  # Add Manual Trade Entry System

  1. New Tables
    - `user_trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `trade_type` (text) - 'stock' or 'option'
      - `symbol` (text) - Stock ticker symbol
      - `company_name` (text) - Company name
      - `quantity` (numeric) - Number of shares or contracts
      - `cost_basis` (numeric) - Average cost per share/contract
      - `current_price` (numeric) - Current market price
      - `option_expiration` (date, nullable) - For options only
      - `option_type` (text, nullable) - 'call' or 'put'
      - `strike_price` (numeric, nullable) - Strike price for options
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `added_by` (uuid, references auth.users) - Admin who added it

  2. Security
    - Enable RLS on user_trades table
    - Users can view their own trades
    - Only admins can insert/update/delete trades

  3. Indexes
    - Index on user_id for fast lookups
    - Index on trade_type for filtering
*/

-- Create user_trades table
CREATE TABLE IF NOT EXISTS user_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('stock', 'option')),
  symbol text NOT NULL,
  company_name text NOT NULL,
  quantity numeric(20, 8) NOT NULL,
  cost_basis numeric(20, 2) NOT NULL,
  current_price numeric(20, 2) NOT NULL DEFAULT 0,
  option_expiration date,
  option_type text CHECK (option_type IN ('call', 'put', NULL)),
  strike_price numeric(20, 2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  added_by uuid REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_trades_user_id ON user_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trades_type ON user_trades(trade_type);
CREATE INDEX IF NOT EXISTS idx_user_trades_symbol ON user_trades(symbol);

-- Enable RLS
ALTER TABLE user_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_trades
CREATE POLICY "Users can view own trades"
  ON user_trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert trades"
  ON user_trades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update trades"
  ON user_trades FOR UPDATE
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

CREATE POLICY "Admins can delete trades"
  ON user_trades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );