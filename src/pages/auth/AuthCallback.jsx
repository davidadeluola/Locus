import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint, LoaderCircle } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";

const MotionPanel = motion.div;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const hasRunRef = useRef(false);
  const { user, profile, loading } = useAuthContext();

  useEffect(() => {
    if (hasRunRef.current) return;
    if (loading) return;
    hasRunRef.current = true;

    if (!user?.id) {
      navigate("/login", { replace: true });
      return;
    }

    if (profile) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (user?.id) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setError("Identity synchronization failed. Redirecting to login...");
    setTimeout(() => navigate("/login", { replace: true }), 1500);
  }, [loading, navigate, profile, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <MotionPanel
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
          <Fingerprint className="text-orange-500" size={28} />
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight mb-2">Synchronizing Identity</h1>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-wider mb-6">Securing your LOCUS session</p>

        <div className="flex items-center justify-center gap-2 text-orange-400 font-mono text-sm">
          <LoaderCircle size={16} className="animate-spin" />
          <span>Processing OAuth callback...</span>
        </div>

        {error && <p className="mt-4 text-red-400 text-xs font-mono">{error}</p>}
      </MotionPanel>
    </div>
  );
};

export default AuthCallback;
