"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const MOCK_USER_ID = "mock-user-00000000-0000-0000-0000-000000000001";
const MOCK_USER_EMAIL = "testuser@mock.local";
const MOCK_AUTH_STORAGE_KEY = "mock-auth-logged-in";

function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

function getMockUser(): User {
  return {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    aud: "authenticated",
    role: "authenticated",
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "mock", providers: ["mock"] },
    user_metadata: { full_name: "Test User", avatar_url: null },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
}

function getMockSession(): Session {
  const user = getMockUser();
  return {
    access_token: "mock-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "mock-refresh-token",
    user,
  };
}

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

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const user = session?.user ?? null;

  const signIn = useCallback(() => {
    // Real auth uses supabase.auth methods directly
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, supabase, session, loading, isMockMode: false, signIn, signOut }}>
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

  if (isLoggedIn === null) {
    return null;
  }

  const mockSession = isLoggedIn ? getMockSession() : null;
  const mockUser = isLoggedIn ? getMockUser() : null;

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
    setIsMock(isMockModeEnabled());
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isMock) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return <RealAuthProvider>{children}</RealAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
