import { neon } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Database URL is required. Make sure VITE_DATABASE_URL is set in your .env file."
  );
}

export const sql = neon(databaseUrl);
export const pool = new Pool({ connectionString: databaseUrl });

export interface QueryResult<T = any> {
  data: T | null;
  error: Error | null;
}

export const db = {
  query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return { data: result.rows as T, error: null };
      } finally {
        client.release();
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  queryOne: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return { data: result.rows[0] as T || null, error: null };
      } finally {
        client.release();
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  execute: async (text: string, params?: any[]): Promise<QueryResult<any>> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return { data: result, error: null };
      } finally {
        client.release();
      }
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
};

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || "your-secret-key-change-in-production";

function generateToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  const signature = btoa(`${header}.${payload}.${JWT_SECRET}`);
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const [header, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp < Date.now()) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export const auth = {
  signUp: async (email: string, password: string) => {
    const hashedPassword = btoa(password);
    const { data, error } = await db.queryOne<{ id: string }>(
      "INSERT INTO users (email, username) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword]
    );

    if (error || !data) {
      return { user: null, session: null, error };
    }

    const token = generateToken(data.id);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_id", data.id);

    return {
      user: { id: data.id, email },
      session: { access_token: token },
      error: null
    };
  },

  signIn: async (email: string, password: string) => {
    const hashedPassword = btoa(password);
    const { data, error } = await db.queryOne<{ id: string; email: string }>(
      "SELECT id, email FROM users WHERE email = $1 AND username = $2",
      [email, hashedPassword]
    );

    if (error || !data) {
      return { user: null, session: null, error: error || new Error("Invalid credentials") };
    }

    const token = generateToken(data.id);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_id", data.id);

    return {
      user: { id: data.id, email: data.email },
      session: { access_token: token },
      error: null
    };
  },

  signOut: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    return { error: null };
  },

  getSession: async () => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      return { session: null, error: null };
    }

    const verified = verifyToken(token);
    if (!verified) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      return { session: null, error: null };
    }

    const { data } = await db.queryOne<{ id: string; email: string }>(
      "SELECT id, email FROM users WHERE id = $1",
      [userId]
    );

    if (!data) {
      return { session: null, error: null };
    }

    return {
      session: {
        access_token: token,
        user: { id: data.id, email: data.email }
      },
      error: null
    };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      auth.getSession().then(({ session }) => {
        if (session) {
          callback("SIGNED_IN", session);
        }
      });
    }

    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  },

  getUser: async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return { user: null, error: null };
    }

    const { data, error } = await db.queryOne<{ id: string; email: string }>(
      "SELECT id, email FROM users WHERE id = $1",
      [userId]
    );

    return { user: data, error };
  }
};

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
