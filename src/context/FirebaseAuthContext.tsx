import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_admin: boolean;
  profile_picture_url?: string;
  created_at: Date;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function loadProfile(userId: string) {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      setProfile({
        id: userId,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url,
        bio: data.bio,
        is_admin: data.is_admin || false,
        profile_picture_url: data.profile_picture_url,
        created_at: data.created_at?.toDate() || new Date(),
      });
    }
  }

  async function signUp(email: string, password: string, username: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'profiles', user.uid), {
      username,
      email,
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await loadProfile(user.uid);
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setProfile(null);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return;

    const profileRef = doc(db, 'profiles', user.uid);
    await updateDoc(profileRef, {
      ...updates,
      updated_at: new Date(),
    });

    await loadProfile(user.uid);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
