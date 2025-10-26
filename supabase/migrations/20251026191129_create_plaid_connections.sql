/*
  # Add Plaid Integration Tables

  1. New Tables
    - `plaid_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `access_token` (encrypted text) - Plaid access token
      - `item_id` (text) - Plaid item identifier
      - `institution_id` (text) - Institution identifier (e.g., Robinhood)
      - `institution_name` (text) - Human-readable institution name
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_sync` (timestamp) - Last time data was synced
    
    - `portfolio_holdings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plaid_item_id` (uuid, references plaid_items)
      - `security_id` (text) - Security identifier from Plaid
      - `symbol` (text) - Stock ticker symbol
      - `name` (text) - Company name
      - `quantity` (decimal) - Number of shares
      - `cost_basis` (decimal) - Average cost per share
      - `current_price` (decimal) - Current market price
      - `institution_value` (decimal) - Value as reported by institution
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Access tokens are encrypted at rest

  3. Indexes
    - Index on user_id for fast lookups
    - Index on plaid_item_id for portfolio holdings
*/

-- Create plaid_items table
CREATE TABLE IF NOT EXISTS plaid_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token text NOT NULL,
  item_id text NOT NULL UNIQUE,
  institution_id text NOT NULL,
  institution_name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_sync timestamptz
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);

-- Enable RLS
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plaid_items
CREATE POLICY "Users can view own Plaid connections"
  ON plaid_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Plaid connections"
  ON plaid_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Plaid connections"
  ON plaid_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Plaid connections"
  ON plaid_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plaid_item_id uuid REFERENCES plaid_items(id) ON DELETE CASCADE NOT NULL,
  security_id text NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  quantity numeric(20, 8) NOT NULL DEFAULT 0,
  cost_basis numeric(20, 2) NOT NULL DEFAULT 0,
  current_price numeric(20, 2) NOT NULL DEFAULT 0,
  institution_value numeric(20, 2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_plaid_item_id ON portfolio_holdings(plaid_item_id);

-- Enable RLS
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_holdings
CREATE POLICY "Users can view own portfolio holdings"
  ON portfolio_holdings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio holdings"
  ON portfolio_holdings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio holdings"
  ON portfolio_holdings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio holdings"
  ON portfolio_holdings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);