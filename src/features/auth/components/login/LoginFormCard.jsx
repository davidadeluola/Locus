import React from "react";
import { Lock, Mail, ArrowRight, Fingerprint, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../PasswordInput";
import SocialAuth from "../../../../components/auth/SocialAuth";
import ResetRequest from "../../../../components/auth/ResetRequest";

const LoginFormCard = ({
  email,
  password,
  error,
  loading,
  setEmail,
  setPassword,
  onSubmit,
  onSignup,
  onForgotPassword,
  onGoogle,
}) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-100 font-author selection:bg-orange-500/30">
      <div className="w-full max-w-md p-4">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-mono uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <Fingerprint className="text-[#FF4D00]" size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            LOCUS<span className="text-[#FF4D00]">.</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-2">
            System Identity Verification
          </p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#FF4D00]/20 rounded-tr-2xl" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-mono mb-6">
              [ERROR]: {error.toUpperCase()}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono ml-1">
                Access Identifier
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#FF4D00] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/20 transition-all"
                  placeholder="name@institute.edu"
                />
              </div>
            </div>

            <PasswordInput
              label="Security Cipher"
              name="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={onForgotPassword}
              className="w-full text-right text-xs font-mono text-orange-400 hover:text-orange-300 transition-colors"
            >
              FORGOT PASSWORD?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden py-4 bg-[#FF4D00] hover:bg-[#e64500] text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? "INITIALIZING..." : "AUTHENTICATE"}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>

            <SocialAuth onGoogleClick={onGoogle} disabled={loading} />
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col items-center gap-4">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">
              No clearance level?{" "}
              <button
                onClick={onSignup}
                className="text-[#FF4D00] hover:text-white transition-colors font-bold ml-1"
              >
                REQUEST ACCESS
              </button>
            </p>
          </div>

          <ResetRequest />
        </div>
      </div>
    </div>
  );
};

export default LoginFormCard;
