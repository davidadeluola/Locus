import { useState } from "react";
import authRepository from '../services/repositories/authRepository.js';
// Migrated to use `authRepository`.

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
      }

      return { error: authError };
    } catch (err) {
      const fallback = "Unable to start Google sign-in.";
      setError(err?.message || fallback);
      return { error: err || new Error(fallback) };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    error,
    setError,
  };
};
