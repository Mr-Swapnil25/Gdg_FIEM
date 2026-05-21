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

import {auth, firebaseInitError} from "@/lib/firebase/config";
import {ensureUserProfile} from "@/lib/firebase/firestore-db";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(firebaseInitError);

  useEffect(() => {
    if (firebaseInitError || !auth) {
      setLoading(false);
      setError(firebaseInitError ?? "Firebase Auth is unavailable. Check configuration.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setError(null);

      if (firebaseUser) {
        try {
          await ensureUserProfile(firebaseUser);
        } catch (profileError) {
          console.error("Failed to ensure user profile:", profileError);
          setError("Failed to load your profile. Please refresh and try again.");
        }
      }
    });

    return () => unsubscribe();
  }, [firebaseInitError, auth]);

  const loginWithGoogle = useCallback(async () => {
    if (firebaseInitError || !auth) {
      const message = firebaseInitError ?? "Firebase Auth is unavailable. Check configuration.";
      setError(message);
      throw new Error(message);
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserProfile(result.user);
      setError(null);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") return null;
      setError(error?.message ?? "Google sign-in failed.");
      throw error;
    }
  }, [firebaseInitError, auth]);

  const logout = useCallback(async () => {
    if (firebaseInitError || !auth) {
      const message = firebaseInitError ?? "Firebase Auth is unavailable. Check configuration.";
      setError(message);
      throw new Error(message);
    }
    await signOut(auth);
  }, [firebaseInitError, auth]);

  const value = useMemo(
    () => ({user, loading, error, loginWithGoogle, logout}),
    [user, loading, error, loginWithGoogle, logout]
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
