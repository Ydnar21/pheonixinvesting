/*
  # Add Earnings Date to Trades

  1. Changes
    - Add `earnings_date` column to `user_trades` table
      - `earnings_date` (date, nullable) - stores the next earnings date for the stock
  
  2. Notes
    - This field will be visible in the portfolio dashboard description
    - Admins can set this when adding or editing trades
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_trades' AND column_name = 'earnings_date'
  ) THEN
    ALTER TABLE user_trades ADD COLUMN earnings_date date;
  END IF;
END $$;