/*
  # Add User Profiles and Messaging System

  1. Changes to Profiles Table
    - Add profile_picture_url column for avatar images
    - Add bio column for user descriptions
    - Update policies for profile updates

  2. New Tables
    - `user_follows`
      - id (uuid, primary key)
      - follower_id (uuid) - User who is following
      - following_id (uuid) - User being followed
      - created_at (timestamp)
      - Unique constraint on follower_id + following_id

    - `direct_messages`
      - id (uuid, primary key)
      - sender_id (uuid) - User sending the message
      - receiver_id (uuid) - User receiving the message
      - message (text) - Message content
      - read (boolean) - Whether message has been read
      - created_at (timestamp)

  3. Security
    - Users can update their own profile picture and bio
    - Users can follow/unfollow other users
    - Users can only view messages they sent or received
    - Users can only send messages to mutual follows
    - Enable RLS on all tables

  4. Indexes
    - Add indexes for follow queries
    - Add indexes for message queries
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_picture_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_picture_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- User follows policies
CREATE POLICY "Anyone can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON user_follows FOR DELETE
  TO authenticated
  USING (follower_id = auth.uid());

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(sender_id, receiver_id, created_at);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Direct messages policies
CREATE POLICY "Users can view their messages"
  ON direct_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages to mutual follows"
  ON direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_follows
      WHERE follower_id = auth.uid() AND following_id = receiver_id
    ) AND
    EXISTS (
      SELECT 1 FROM user_follows
      WHERE follower_id = receiver_id AND following_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their received messages"
  ON direct_messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Update profile policies to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Function to check if two users are mutual follows
CREATE OR REPLACE FUNCTION are_mutual_follows(user1_id uuid, user2_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = user1_id AND following_id = user2_id
  ) AND EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = user2_id AND following_id = user1_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM direct_messages
    WHERE receiver_id = user_id AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;