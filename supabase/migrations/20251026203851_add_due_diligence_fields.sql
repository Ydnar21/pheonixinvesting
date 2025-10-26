/*
  # Add Due Diligence Fields to User Trades Table

  1. Changes
    - Add `dd_summary` (text) - Quick summary of why the admin is in the position
    - Add `price_targets` (text) - Price targets for the position
    - Add `dd_updated_at` (timestamptz) - Timestamp when DD was last updated
  
  2. Notes
    - Fields are nullable to allow existing trades without DD
    - DD can be added/updated after trade creation
    - Only admin users will be able to edit these fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_trades' AND column_name = 'dd_summary'
  ) THEN
    ALTER TABLE user_trades ADD COLUMN dd_summary text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_trades' AND column_name = 'price_targets'
  ) THEN
    ALTER TABLE user_trades ADD COLUMN price_targets text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_trades' AND column_name = 'dd_updated_at'
  ) THEN
    ALTER TABLE user_trades ADD COLUMN dd_updated_at timestamptz DEFAULT now();
  END IF;
END $$;