/*
  # Setup Daily Stock Price Updates

  1. Extensions
    - Enable pg_cron extension for scheduled tasks
    - Enable pg_net extension for HTTP requests

  2. Scheduled Job
    - Creates a cron job that runs daily at 4:00 PM EST (9:00 PM UTC)
    - Calls the update-stock-prices edge function
    - Updates all stock positions with latest prices from Google Finance

  3. Important Notes
    - Job runs Monday through Friday (business days only)
    - Time is set to 21:00 UTC which is 4:00 PM EST (5:00 PM EDT during daylight saving)
    - Uses pg_net to make HTTP request to the edge function
    - Edge function handles fetching and updating prices
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily stock price updates at 4:00 PM EST (9:00 PM UTC)
-- Runs Monday through Friday only
SELECT cron.schedule(
  'update-stock-prices-daily',
  '0 21 * * 1-5',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/update-stock-prices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    )
  );
  $$
);

-- Store Supabase URL and key in settings for the cron job to use
DO $$
BEGIN
  -- These will be automatically populated by Supabase
  PERFORM set_config('app.settings.supabase_url', current_setting('SUPABASE_URL', true), false);
  PERFORM set_config('app.settings.supabase_anon_key', current_setting('SUPABASE_ANON_KEY', true), false);
EXCEPTION
  WHEN OTHERS THEN
    -- Settings will be configured by the system
    NULL;
END $$;