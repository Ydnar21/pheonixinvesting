import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, Profile } from '../lib/supabase';

type User = {
  id: string;
  email: string;
};

type Session = {
  access_token: string;
  user?: User;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.getSession().then(({ session }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await db.queryOne<Profile>(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      const { data: existingUser } = await db.queryOne<{ username: string }>(
        'SELECT username FROM users WHERE username = $1',
        [username]
      );

      if (existingUser) {
        return { error: { message: 'Username is already taken. Please choose a different username.' } };
      }

      const email = `${username}@liquidphoenix.local`;
      const hashedPassword = btoa(password);

      const { data, error } = await db.queryOne<{ id: string }>(
        'INSERT INTO users (email, username, display_name) VALUES ($1, $2, $3) RETURNING id',
        [hashedPassword, username, username]
      );

      if (error) {
        return { error: { message: 'Failed to create account. Please try again.' } };
      }

      if (data) {
        const token = localStorage.getItem("auth_token");
        setSession({ access_token: token || '', user: { id: data.id, email } });
        setUser({ id: data.id, email });
        await loadProfile(data.id);
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred.' } };
    }
  };

  const signIn = async (username: string, password: string) => {
    const email = `${username}@liquidphoenix.local`;
    const hashedPassword = btoa(password);

    const { data, error } = await db.queryOne<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE username = $1 AND email = $2',
      [username, hashedPassword]
    );

    if (error || !data) {
      return { error: { message: 'Invalid username or password.' } };
    }

    const token = btoa(JSON.stringify({ userId: data.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_id", data.id);

    setSession({ access_token: token, user: { id: data.id, email: `${username}@liquidphoenix.local` } });
    setUser({ id: data.id, email: `${username}@liquidphoenix.local` });
    await loadProfile(data.id);

    return { error: null };
  };

  const signOut = async () => {
    await auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
