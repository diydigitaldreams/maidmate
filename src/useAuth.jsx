import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zfxmztccpyrepbmchvig.supabase.co",
  "sb_publishable_FOpwk8eKErGMVcDxR3nJlg__-iXm0fm"
);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUpWithEmail = (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` });

  const signOut = () => supabase.auth.signOut();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Maria";
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <AuthContext.Provider value={{ user, loading, displayName, avatarUrl, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
