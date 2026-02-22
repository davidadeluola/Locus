import { useState } from "react";
import { supabase } from "../api/supabase";

export const usePasswordUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePassword = async (newPassword) => {
    setError("");
    setLoading(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return { data: null, error: updateError };
      }

      return { data, error: null };
    } catch (err) {
      const fallback = "Unable to update security cipher.";
      setError(err?.message || fallback);
      return { data: null, error: err || new Error(fallback) };
    } finally {
      setLoading(false);
    }
  };

  return {
    updatePassword,
    loading,
    error,
    setError,
  };
};
