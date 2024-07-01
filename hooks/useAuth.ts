import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { create } from "zustand";
import type { User } from "@/types";
import { AuthError, Session } from "@supabase/supabase-js";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

interface LoginParams {
  email: string;
  password: string;
}

interface SignUpParams {
  // The same as LoginParams for now
  email: string;
  password: string;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

interface UseAuth {
  user: User | null;
  logout: () => void;
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

  const { user, setUser } = useUserStore((state) => ({
    user: state.user,
    setUser: state.setUser,
  }));

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const signUp = async ({ email, password }: SignUpParams) => {
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    return { user, error, session };
  };

  const login = async ({ email, password }: LoginParams) => {
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user, error, session };
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      // Optionally, listen for authentication state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "SIGNED_IN") {
            if (session?.user) {
              const confirmedEmailDate = session.user.email_confirmed_at
                ? new Date(session.user.email_confirmed_at)
                : null;

              if (confirmedEmailDate) {
                const isNewlyVerified =
                  confirmedEmailDate.getTime() > Date.now() - 300000; // Check if verified within the last 5 minutes
                localStorage.setItem(
                  "isNewlyVerified",
                  isNewlyVerified ? "true" : "false"
                );
              }
              // Email not confirmed yet
              else {
                setUser(session.user);
              }
            }
            // There is no user in the session
            else {
              setUser(null);
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    fetchUser();
  }, [setUser]);

  return {
    user,
    logout,
    signUp,
    login,
  };
};

export default useAuth;
