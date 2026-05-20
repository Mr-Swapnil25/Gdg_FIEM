"use client";

import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {auth} from "@/lib/firebase/config";
import {ensureUserProfile} from "@/lib/firebase/firestore-db";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        await ensureUserProfile(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserProfile(result.user);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") return null;
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({user, loading, loginWithGoogle, logout}),
    [user, loading, loginWithGoogle, logout]
  );

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
