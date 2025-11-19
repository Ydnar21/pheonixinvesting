/*
  # Create Admin User

  1. Changes
    - Create admin user with username: LiquidPhoenix
    - Password: LiquidPheonix
    - Set is_admin flag to true
    
  2. Security
    - Admin user is created with specific credentials
    - User can change password after first login
*/

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'LiquidPhoenix@liquidphoenix.local';
  
  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'LiquidPhoenix@liquidphoenix.local',
      crypt('LiquidPheonix', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    -- Create profile with admin flag
    INSERT INTO profiles (id, username, is_admin, created_at, updated_at)
    VALUES (admin_user_id, 'LiquidPhoenix', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET is_admin = true, username = 'LiquidPhoenix';
  ELSE
    -- Update existing user to be admin
    UPDATE profiles SET is_admin = true WHERE id = admin_user_id;
  END IF;
END $$;