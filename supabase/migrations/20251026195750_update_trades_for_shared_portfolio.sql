/*
  # Update Trade Permissions for Shared Portfolio

  1. Changes
    - Remove user-specific RLS policy for viewing trades
    - Add policy allowing all authenticated users to view all trades
    - Keep admin-only policies for insert/update/delete
    - Remove user_id requirement (trades belong to the admin's portfolio, not individual users)

  2. Security
    - All authenticated users can view all trades
    - Only admins can add, edit, or delete trades
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own trades" ON user_trades;

-- Create new policy allowing all authenticated users to view all trades
CREATE POLICY "All users can view trades"
  ON user_trades FOR SELECT
  TO authenticated
  USING (true);

-- Admin policies remain unchanged (admins can insert/update/delete)