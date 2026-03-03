import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authRepository from "../services/repositories/authRepository.js";
import notify from "../services/notify.jsx";

const AUTH_TIMEOUT_MS = 5000;

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let isResolved = false;

    const timeoutId = setTimeout(() => {
      if (isResolved) return;
      isResolved = true;
      notify.error("Authentication failed. Please try again.");
      navigate("/login", { replace: true });
    }, AUTH_TIMEOUT_MS);

    const unsubscribe = authRepository.onAuthStateChange((_event, session) => {
      if (isResolved) return;

      if (session?.user?.id) {
        isResolved = true;
        clearTimeout(timeoutId);
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      isResolved = true;
      clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300 px-4">
      <p className="font-mono text-sm uppercase tracking-[0.2em]">
        Finalizing authentication...
      </p>
    </div>
  );
};

export default AuthCallback;
