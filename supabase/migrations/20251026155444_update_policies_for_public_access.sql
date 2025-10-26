/*
  # Update Policies for Public Access

  ## Overview
  Updates RLS policies to allow public read access while maintaining admin-only write access.
  
  ## Changes
  
  ### 1. Stock Posts
  - Allow anyone (including anonymous users) to view posts
  - Only authenticated users can create/update/delete posts (admin access)
  
  ### 2. Comments
  - Allow anyone to view comments
  - Only authenticated users can create/update/delete comments (admin access)
  
  ### 3. Likes
  - Allow anyone to view likes
  - Only authenticated users can create/delete likes (admin access)
  
  ### 4. Profiles
  - Allow anyone to view profiles
  - Keep existing profile management policies

  ## Security Notes
  - Public users can read all content
  - Only admin (authenticated users) can modify content
  - This allows the portfolio owner to post while visitors can view
*/

-- Drop existing policies for stock_posts
DROP POLICY IF EXISTS "Anyone can view posts" ON stock_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON stock_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON stock_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON stock_posts;

-- Create new policies for stock_posts with public read access
CREATE POLICY "Public can view posts"
  ON stock_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON stock_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own posts"
  ON stock_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own posts"
  ON stock_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for post_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

-- Create new policies for post_comments with public read access
CREATE POLICY "Public can view comments"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for post_likes
DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can create own post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete own post likes" ON post_likes;

-- Create new policies for post_likes with public read access
CREATE POLICY "Public can view post likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create post likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own post likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for comment_likes
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can create own comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users can delete own comment likes" ON comment_likes;

-- Create new policies for comment_likes with public read access
CREATE POLICY "Public can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comment likes"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own comment likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies for profiles with public read access
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);