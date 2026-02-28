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
      await authRepository.signInWithOAuth("google", {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      return { error: null };
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
