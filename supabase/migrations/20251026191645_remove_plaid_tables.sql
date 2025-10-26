/*
  # Remove Plaid Integration Tables

  1. Cleanup
    - Drop portfolio_holdings table
    - Drop plaid_items table
  
  2. Notes
    - All related data will be removed
    - This is a destructive operation
*/

-- Drop tables if they exist
DROP TABLE IF EXISTS portfolio_holdings CASCADE;
DROP TABLE IF EXISTS plaid_items CASCADE;