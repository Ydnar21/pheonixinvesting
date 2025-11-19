/*
  # Update Calendar System for Admin Events and User Voting

  1. Changes
    - Drop calendar_event_submissions table (no longer needed)
    - Add voting system to calendar_events
    - Create calendar_event_votes table for user votes

  2. New Tables
    - `calendar_event_votes`
      - User votes on sentiment (bullish/bearish/neutral)
      - One vote per user per event
      
  3. Security
    - Only admins can create/edit/delete calendar events
    - All authenticated users can vote on events
    - Users can change their vote
*/

-- Drop the submissions table as admin will directly create events
DROP TABLE IF EXISTS calendar_event_submissions CASCADE;

-- Create table for user votes on calendar events
CREATE TABLE IF NOT EXISTS calendar_event_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sentiment text NOT NULL CHECK (sentiment = ANY(ARRAY['bullish', 'bearish', 'neutral'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_event_votes_event ON calendar_event_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_votes_user ON calendar_event_votes(user_id);

ALTER TABLE calendar_event_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Anyone can view event votes"
  ON calendar_event_votes FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own vote
CREATE POLICY "Users can vote on events"
  ON calendar_event_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own vote
CREATE POLICY "Users can update their own vote"
  ON calendar_event_votes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own vote
CREATE POLICY "Users can delete their own vote"
  ON calendar_event_votes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
