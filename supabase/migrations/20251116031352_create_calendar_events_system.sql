/*
  # Create Calendar Events System

  1. New Tables
    - `calendar_events`
      - `id` (uuid, primary key)
      - `title` (text) - Event name
      - `description` (text) - Short description
      - `event_date` (date) - Date of the event
      - `sentiment` (text) - 'bullish' or 'bearish'
      - `created_by` (uuid) - Admin who created it
      - `approved_by` (uuid) - Admin who approved it
      - `is_approved` (boolean) - Whether event is live
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `calendar_event_submissions`
      - `id` (uuid, primary key)
      - `title` (text) - Event name
      - `description` (text) - Short description
      - `event_date` (date) - Date of the event
      - `sentiment` (text) - 'bullish' or 'bearish'
      - `user_id` (uuid) - User who submitted
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `reviewed_by` (uuid) - Admin who reviewed
      - `reviewed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can view all approved events
    - Users can submit new events
    - Only admins can approve/reject submissions
    - Only admins can create direct events

  3. Indexes
    - Add index on event_date for calendar queries
    - Add index on status for admin queries
*/

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  sentiment text NOT NULL CHECK (sentiment = ANY(ARRAY['bullish', 'bearish'])),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_event_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  sentiment text NOT NULL CHECK (sentiment = ANY(ARRAY['bullish', 'bearish'])),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status = ANY(ARRAY['pending', 'approved', 'rejected'])),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_approved ON calendar_events(is_approved);
CREATE INDEX IF NOT EXISTS idx_calendar_event_submissions_status ON calendar_event_submissions(status);
CREATE INDEX IF NOT EXISTS idx_calendar_event_submissions_date ON calendar_event_submissions(event_date);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_submissions ENABLE ROW LEVEL SECURITY;

-- Calendar events: Anyone can view approved events
CREATE POLICY "Anyone can view approved calendar events"
  ON calendar_events FOR SELECT
  USING (is_approved = true);

-- Calendar events: Only admins can create events
CREATE POLICY "Only admins can create calendar events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Calendar events: Only admins can update/delete
CREATE POLICY "Only admins can update calendar events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can delete calendar events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Calendar submissions: Users can view their own
CREATE POLICY "Users can view their own event submissions"
  ON calendar_event_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Calendar submissions: Admins can view all
CREATE POLICY "Admins can view all event submissions"
  ON calendar_event_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Calendar submissions: Users can create submissions
CREATE POLICY "Users can create event submissions"
  ON calendar_event_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Calendar submissions: Users can only update their own pending submissions
CREATE POLICY "Users can update their own pending submissions"
  ON calendar_event_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Calendar submissions: Only admins can approve/reject
CREATE POLICY "Admins can update submissions"
  ON calendar_event_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
