import { useState } from "react";
import { emailRepository } from '../services/repositories/index.js';
import { updatePassword as updatePasswordService } from '../features/auth/services/loginService';

export const usePasswordUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePassword = async (newPassword) => {
    setError("");
    setLoading(true);

    try {
      const result = await updatePasswordService(newPassword);
      if (!result.success) {
        throw result.error || new Error('Unable to update security cipher.');
      }

      const data = result.data;

      const updatedEmail = data?.user?.email;
      if (updatedEmail && emailRepository.isEnabled()) {
        await emailRepository.sendPasswordUpdatedNotice({ to: updatedEmail });
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
