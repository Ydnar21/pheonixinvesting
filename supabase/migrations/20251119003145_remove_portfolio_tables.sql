/*
  # Remove Portfolio Tables

  1. Changes
    - Drop user_trades table (trade tracking)
    - Drop portfolio_goal table (goal tracking)
    
  2. Reason
    - Portfolio dashboard feature has been removed from the application
    - These tables are no longer needed
*/

-- Drop portfolio goal table
DROP TABLE IF EXISTS portfolio_goal CASCADE;

-- Drop user trades table
DROP TABLE IF EXISTS user_trades CASCADE;
