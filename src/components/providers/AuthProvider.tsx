"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  isMockMode,
  getMockUser,
  getMockSession,
} from "@/lib/config";

// REMOVED: MOCK_USER_ID, MOCK_USER_EMAIL, isMockModeEnabled, getMockUser, getMockSession
// all now imported from @/lib/config which is the single source of truth

const MOCK_AUTH_STORAGE_KEY = "mock-auth-logged-in";

type AuthContextType = {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const user = session?.user ?? null;

  const signIn = useCallback(() => {}, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, supabase, session, loading, isMockMode: false, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    setIsLoggedIn(stored !== "false");
  }, []);

  const signIn = useCallback(() => {
    sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, "true");
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.setItem(MOCK_AUTH_STORAGE_KEY, "false");
    setIsLoggedIn(false);
  }, []);

  if (isLoggedIn === null) return null;

  // getMockUser and getMockSession now come from @/lib/config
  const mockSession = isLoggedIn ? getMockSession() as Session : null;
  const mockUser = isLoggedIn ? getMockUser() as User : null;

  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        supabase: null,
        session: mockSession,
        loading: false,
        isMockMode: true,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isMock, setIsMock] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsMock(isMockMode()); // now uses imported isMockMode from config
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isMock) return <MockAuthProvider>{children}</MockAuthProvider>;

  return <RealAuthProvider>{children}</RealAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}