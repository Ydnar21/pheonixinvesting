/*
  # Add Break-Even Price for Options

  1. Changes
    - Add `break_even_price` column to user_trades table for options
    - This represents the break-even price for the option contract

  2. Notes
    - For stocks, this field will be NULL
    - For options, admin will enter: avg price bought, current price, and break-even price
    - The system will calculate contract value and gain/loss percentage
*/

-- Add break_even_price column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_trades' AND column_name = 'break_even_price'
  ) THEN
    ALTER TABLE user_trades ADD COLUMN break_even_price numeric(20, 2);
  END IF;
END $$;