import { useState } from "react";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import { loginWithPassword } from "../services/loginService";
import { consumeRateLimit, resetRateLimit } from '../../../lib/security/rateLimiter';
import { normalizeEmail, validateLoginInput } from '../../../lib/schemas/authSchemas';

const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 20;

export const useLoginFlow = ({ onSuccess }) => {
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const validation = validateLoginInput(email, password);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const rateKey = `login:${normalizedEmail}`;
    const rateCheck = consumeRateLimit(rateKey, {
      maxAttempts: LOGIN_MAX_ATTEMPTS,
      windowMs: LOGIN_RATE_WINDOW_MS,
    });

    if (!rateCheck.allowed) {
      const waitMinutes = Math.max(1, Math.ceil(rateCheck.retryAfterSeconds / 60));
      setError(`Too many login attempts. Try again in about ${waitMinutes} minute(s).`);
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await loginWithPassword(email, password);

      if (authError) {
        setError(authError.message);
        return;
      }

      resetRateLimit(rateKey);
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
