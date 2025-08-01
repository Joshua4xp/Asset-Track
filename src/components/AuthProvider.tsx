import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always try to initialize auth, even without credentials for testing
    console.log(
      "Initializing auth, hasSupabaseCredentials:",
      hasSupabaseCredentials,
    );

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
        } else {
          console.log("Initial session:", session?.user?.email || "No session");
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to get session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth state changed:",
        event,
        session?.user?.email || "No session",
      );
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);

    if (!hasSupabaseCredentials) {
      console.warn("No Supabase credentials configured");
      return {
        data: null,
        error: {
          message:
            "Supabase not configured. Please check your environment variables.",
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
      } else {
        console.log("Sign in successful:", data.user?.email);
      }

      return { data, error };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("Attempting sign up for:", email);

    if (!hasSupabaseCredentials) {
      console.warn("No Supabase credentials configured");
      return {
        data: null,
        error: {
          message:
            "Supabase not configured. Please check your environment variables.",
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Sign up error:", error);
      } else {
        console.log("Sign up successful:", data.user?.email);
      }

      return { data, error };
    } catch (error) {
      console.error("Sign up exception:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log("Attempting sign out");

    if (!hasSupabaseCredentials) {
      console.warn("No Supabase credentials configured, clearing local state");
      setUser(null);
      setSession(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      } else {
        console.log("Sign out successful");
      }
    } catch (error) {
      console.error("Sign out exception:", error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
