import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordResetOtp, verifyPasswordResetOtpAndUpdate } from "./services/loginService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await requestPasswordResetOtp(email);
      if (resetError) {
        console.error("Reset password error:", resetError);
        setError(resetError.message);
        return;
      }
      setOtpSent(true);
      setMessage("If this email has a password account, a 6-digit OTP has been sent. Check inbox and spam.");
    } catch {
      setError("Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (String(otp).trim().length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await verifyPasswordResetOtpAndUpdate(email, otp, newPassword);
      if (resetError) {
        console.error("OTP verify/reset error:", resetError);
        setError(resetError.message);
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successful. Log in with your new password.",
        },
      });
    } catch {
      setError("Unable to verify OTP or update password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <form onSubmit={otpSent ? handleVerifyAndReset : handleSendOtp} className="w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl p-8 space-y-5">
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-zinc-400 text-sm">
          {otpSent ? "Enter OTP and your new password." : "Enter your email to receive a reset OTP."}
        </p>
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
          disabled={otpSent}
          className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#FF4D00]"
          placeholder="name@institute.edu"
        />

        {otpSent && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#FF4D00]"
              placeholder="6-digit OTP"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-[#FF4D00]"
              placeholder="New password (min 8 chars)"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FF4D00] text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "PROCESSING..." : otpSent ? "VERIFY OTP & RESET" : "SEND OTP"}
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
