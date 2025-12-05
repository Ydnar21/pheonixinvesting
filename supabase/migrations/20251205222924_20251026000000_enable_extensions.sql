/*
  # Enable Required PostgreSQL Extensions

  1. Extensions
    - `pgcrypto` - Required for password hashing and UUID generation

  2. Notes
    - These extensions are required for various features throughout the application
    - pgcrypto is needed for the admin user creation migration
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
