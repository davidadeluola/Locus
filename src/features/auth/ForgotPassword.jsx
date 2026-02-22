import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "./services/loginService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await requestPasswordReset(email);
      if (resetError) {
        console.error("Reset password error:", resetError);
        setError(resetError.message);
        return;
      }
      setMessage("If this email has a password account, a reset link has been sent. Check inbox and spam.");
    } catch {
      setError("Unable to send reset email right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <form onSubmit={handleReset} className="w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl p-8 space-y-5">
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-zinc-400 text-sm">Enter your email to receive a reset link.</p>
        <p className="text-zinc-500 text-xs">
          If you signed up with Google OAuth, use Google login instead of password reset.
        </p>

        {error && <div className="text-red-400 text-xs">{error}</div>}
        {message && <div className="text-green-400 text-xs">{message}</div>}

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#FF4D00]"
          placeholder="name@institute.edu"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FF4D00] text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "SENDING..." : "SEND RESET LINK"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full py-3 border border-zinc-700 text-zinc-200 rounded-xl"
        >
          BACK TO LOGIN
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
