/*
  # Investment Tracking Platform Schema

  ## Overview
  Creates a complete database schema for an investment tracking and social platform
  with user authentication, stock discussions, and social interactions.

  ## New Tables
  
  ### 1. profiles
  Stores extended user profile information
  - `id` (uuid, primary key) - References auth.users
  - `username` (text, unique) - Display name for the user
  - `avatar_url` (text, nullable) - Profile picture URL
  - `bio` (text, nullable) - User biography
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. stock_posts
  Main posts about specific stocks
  - `id` (uuid, primary key) - Unique post identifier
  - `user_id` (uuid) - Author reference to profiles
  - `stock_symbol` (text) - Stock ticker symbol (e.g., AAPL, TSLA)
  - `stock_name` (text) - Full company name
  - `title` (text) - Post title
  - `content` (text) - Post body content
  - `sentiment` (text) - bullish, bearish, or neutral
  - `created_at` (timestamptz) - Post creation time
  - `updated_at` (timestamptz) - Last edit time

  ### 3. post_comments
  Comments on stock posts
  - `id` (uuid, primary key) - Unique comment identifier
  - `post_id` (uuid) - Reference to stock_posts
  - `user_id` (uuid) - Commenter reference to profiles
  - `content` (text) - Comment text
  - `created_at` (timestamptz) - Comment creation time
  - `updated_at` (timestamptz) - Last edit time

  ### 4. post_likes
  Like interactions on posts
  - `id` (uuid, primary key) - Unique like identifier
  - `post_id` (uuid) - Reference to stock_posts
  - `user_id` (uuid) - User who liked
  - `created_at` (timestamptz) - When the like occurred
  - Unique constraint on (post_id, user_id) to prevent duplicate likes

  ### 5. comment_likes
  Like interactions on comments
  - `id` (uuid, primary key) - Unique like identifier
  - `comment_id` (uuid) - Reference to post_comments
  - `user_id` (uuid) - User who liked
  - `created_at` (timestamptz) - When the like occurred
  - Unique constraint on (comment_id, user_id) to prevent duplicate likes

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Profiles: Users can read all, but only update their own
  - Posts: Anyone can read, authenticated users can create, authors can update/delete
  - Comments: Anyone can read, authenticated users can create, authors can update/delete
  - Likes: Users can manage their own likes only

  ## Important Notes
  1. All tables use UUIDs for primary keys
  2. Foreign key constraints ensure data integrity
  3. Cascading deletes handle cleanup when posts/comments are removed
  4. Timestamps track creation and modification times
  5. RLS policies enforce strict data access control
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create stock_posts table
CREATE TABLE IF NOT EXISTS stock_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  stock_name text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON stock_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON stock_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON stock_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON stock_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES stock_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES stock_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own post likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own post likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comment likes"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_posts_user_id ON stock_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_posts_stock_symbol ON stock_posts(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_posts_created_at ON stock_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);