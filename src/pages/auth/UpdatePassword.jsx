import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import PasswordInput from "../../features/auth/components/PasswordInput";
import { usePasswordUpdate } from "../../hooks/usePasswordUpdate";

const MotionPanel = motion.div;

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { updatePassword, loading, error, setError } = usePasswordUpdate();

  const isRecoveryTokenPresent = useMemo(() => {
    const hash = String(location.hash || "");
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    return Boolean(type === "recovery" && accessToken);
  }, [location.hash]);

  const effectiveError = useMemo(() => localError || error, [localError, error]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setError("");

    if (!isRecoveryTokenPresent) {
      setLocalError("Recovery token not found or expired. Request a new reset link.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Security cipher must be at least 8 characters.");
      return;
    }

    const { error: updateError } = await updatePassword(newPassword);

    if (updateError) {
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        message: "Security cipher updated successfully. Authenticate with your new cipher.",
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <MotionPanel
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <Fingerprint className="text-orange-500" size={28} />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">System Re-initialization</h1>
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-[0.2em] mt-2">Set New Security Cipher</p>
        </div>

        {effectiveError && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-mono">
            [ERROR]: {effectiveError.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider">
            <LockKeyhole size={14} />
            New Security Cipher
          </div>

          <PasswordInput
            label="New Security Cipher"
            name="newPassword"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading || !isRecoveryTokenPresent}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 font-mono uppercase tracking-wider"
          >
            {loading ? "UPDATING..." : "UPDATE CIPHER"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <ShieldCheck size={14} />
          Clearance Protocol Active
        </div>
      </MotionPanel>
    </div>
  );
};

export default UpdatePassword;
