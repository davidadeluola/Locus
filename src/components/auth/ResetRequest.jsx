import React, { useState } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../../api/supabase";

const ResetRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage("If this account supports password login, a reset link has been sent.");
    } catch {
      setError("Unable to request reset link right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRequestReset} className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
      <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">Clearance Recovery</p>

      {error && <div className="text-red-400 text-xs font-mono">[ERROR]: {error}</div>}
      {message && <div className="text-green-400 text-xs font-mono">[INFO]: {message}</div>}

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-orange-500"
          placeholder="name@institute.edu"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500 text-zinc-200 font-mono font-semibold rounded-xl transition-all disabled:opacity-50"
      >
        {loading ? "REQUESTING..." : "REQUEST RESET LINK"}
      </button>
    </form>
  );
};

export default ResetRequest;
