import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OtpVerificationCard = ({ email, error, otp, onOtpChange, onSubmit, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/signup")}
          className="mb-4 flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-mono uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Signup
        </button>
        <div className="min-h-100 flex flex-col items-center justify-center space-y-6 bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-2xl w-full">
        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-2">
          <ShieldCheck className="text-orange-500" size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white uppercase font-mono">System Clearance Authorization</h2>
          <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-mono">Enter your 6-digit security cipher</p>
          <p className="text-zinc-600 text-[10px] mt-2 font-mono">Code sent to {email}</p>
        </div>

        {error && (
          <div className="text-red-400 font-mono text-[10px] bg-red-500/10 border border-red-500/30 p-3 rounded w-full text-center">
            [ERROR]: {error}
          </div>
        )}

        <input
          type="text"
          maxLength="6"
          inputMode="numeric"
          value={otp}
          onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#09090b] border border-zinc-800 rounded-xl py-4 text-center text-4xl font-bold tracking-[0.5em] text-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
          placeholder="······"
        />

        <button
          onClick={onSubmit}
          disabled={loading || otp.length < 6}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 uppercase font-mono tracking-widest"
        >
          {loading ? "AUTHORIZING..." : "FINALIZE CLEARANCE"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationCard;
