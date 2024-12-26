import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";
import type { User } from "@/types";
import { AuthError, Session } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

interface LoginParams {
  email: string;
  password: string;
}

interface SignUpParams {
  email: string;
  password: string;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

interface UseAuth {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  signUp: ({ email, password }: SignUpParams) => Promise<{
    user: User | null;
    error: AuthError | null;
    session: Session | null;
  }>;
  login: ({ email, password }: LoginParams) => Promise<{
    user: User | null;
    error: AuthError | null;
    session: Session | null;
  }>;
}

const useAuth = (): UseAuth => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, clearUser } = useUserStore();

  const handleAuthStateChange = useCallback(
    (event: string, session: Session | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        const isNewlyVerified =
          session.user.email_confirmed_at &&
          new Date(session.user.email_confirmed_at).getTime() > Date.now() - 300000; // Verificado en los últimos 5 minutos

        localStorage.setItem("isNewlyVerified", isNewlyVerified ? "true" : "false");
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        clearUser();
      }
    },
    [setUser, clearUser]
  );

  const signUp = useCallback(
    async ({ email, password }: SignUpParams) => {
      setError(null);
      setIsLoading(true);
      try {
        const {
          data: { session, user },
          error,
        } = await supabase.auth.signUp({ email, password });

        if (error) {
          setError(error.message);
        }
        return { user, error, session };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const login = useCallback(
    async ({ email, password }: LoginParams) => {
      setError(null);
      setIsLoading(true);
      try {
        const {
          data: { session, user },
          error,
        } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setError(error.message);
        }
        return { user, error, session };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
      clearUser();
    } finally {
      setIsLoading(false);
    }
  }, [supabase, clearUser]);

  useEffect(() => {
    const fetchInitialUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        supabase.auth.onAuthStateChange(handleAuthStateChange);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialUser();

    return () => {
      const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase, setUser, handleAuthStateChange]);

  return {
    user,
    logout,
    signUp,
    login,
    isLoading,
    error,
  };
};

export default useAuth;
