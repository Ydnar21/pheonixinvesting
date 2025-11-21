/*
  # Add Submitted By Field to Watchlist

  1. Changes
    - Add `submitted_by_user` field to `watchlist_stocks` to track the original user who suggested the stock
    - This allows us to give credit to users when their stock picks are approved
    - Separate from `added_by` which tracks the admin who approved it

  2. Notes
    - This field will be populated when a submission is approved
    - NULL for stocks added directly by admins
*/

-- Add submitted_by_user field to track original submitter
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist_stocks' AND column_name = 'submitted_by_user'
  ) THEN
    ALTER TABLE watchlist_stocks ADD COLUMN submitted_by_user uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_submitted_by_user ON watchlist_stocks(submitted_by_user);
