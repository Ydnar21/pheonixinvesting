import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and anon key are required. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type StockPost = {
  id: string;
  user_id: string;
  stock_symbol: string;
  stock_name: string;
  title: string;
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  submission_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type StockSubmission = {
  id: string;
  user_id: string;
  stock_symbol: string;
  stock_name: string;
  title: string;
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type PostLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type StockVote = {
  id: string;
  post_id: string;
  user_id: string;
  short_term_sentiment: 'bullish' | 'bearish' | 'neutral';
  long_term_sentiment: 'bullish' | 'bearish' | 'neutral';
  created_at: string;
  updated_at: string;
};
