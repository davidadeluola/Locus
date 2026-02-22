import { useState } from "react";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import { loginWithPassword } from "../services/loginService";

export const useLoginFlow = ({ onSuccess }) => {
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await loginWithPassword(email, password);

      if (authError) {
        setError(authError.message);
        return;
      }

      onSuccess();
    } catch {
      setError("SYSTEM_AUTH_FAILURE: Check connection parameters");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const { error: authError } = await signInWithGoogle();

    if (authError || googleError) {
      setError(authError?.message || googleError || "SYSTEM_AUTH_FAILURE: Unable to start Google login");
    }
  };

  return {
    email,
    password,
    error,
    loading: loading || googleLoading,
    setEmail,
    setPassword,
    handleLogin,
    handleGoogleLogin,
  };
};
