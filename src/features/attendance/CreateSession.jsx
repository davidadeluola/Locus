import React, { useState, useEffect } from "react";
import { QrCode, MapPin, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../api/supabase";
import { generateOTP, getCurrentLocation } from "../../lib/utils/attendanceUtils";
import { useUser } from "../../hooks/useUser";

const MAX_SESSION_DURATION_MINUTES = 5;
const DEFAULT_SESSION_DURATION_MINUTES = 5;

const CreateSession = ({ classId, onSessionCreated }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_SESSION_DURATION_MINUTES);

  // Countdown timer
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setSession(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Generate QR Code
  useEffect(() => {
    if (session?.otp_secret) {
      QRCode.toDataURL(session.otp_secret, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [session]);

  const createSession = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get current geolocation
      const location = await getCurrentLocation();

      // 2. Generate OTP
      const otpSecret = generateOTP();

      // 3. Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      // 4. Insert session into database
      const sessionData = {
        lecturer_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        otp_secret: otpSecret,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      // Only include class_id if it's a valid UUID
      if (classId && typeof classId === 'string') {
        sessionData.class_id = classId;
      }

      const { data, error: insertError } = await supabase
        .from("sessions")
        .insert(sessionData)
        .select()
        .single();

      if (insertError) throw insertError;

      setSession(data);
      setTimeRemaining(durationMinutes * 60);

      if (onSessionCreated) {
        onSessionCreated(data);
      }
    } catch (err) {
      console.error("Session creation error:", err);
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      await supabase
        .from("sessions")
        .update({ expires_at: new Date().toISOString() })
        .eq("id", session.id);

      setSession(null);
      setTimeRemaining(0);
    } catch (err) {
      console.error("Error ending session:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <QrCode className="text-orange-500" size={24} />
              </div>
              <h3 className="font-mono text-sm uppercase tracking-widest">
                Session Control
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <XCircle className="text-red-500" size={20} />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Duration Input */}
            <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
              <label className="text-xs font-mono text-zinc-500 uppercase mb-3 block">
                Session Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max={MAX_SESSION_DURATION_MINUTES}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  disabled={loading}
                  className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="text-center bg-black/40 px-4 py-2 rounded-lg min-w-20">
                  <p className="text-2xl font-mono font-bold text-orange-500">{durationMinutes}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">min</p>
                </div>
              </div>
            </div>

            <button
              onClick={createSession}
              disabled={loading}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Acquiring Geolocation...
                </>
              ) : (
                <>
                  <MapPin size={20} />
                  Initiate Session
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center mt-4 font-mono">
              Session will be active for {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden"
          >
            {/* Live Indicator */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase text-emerald-500">
                  Live Session
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-500">
                Session Active
              </h3>
            </div>

            {/* Countdown Timer */}
            <div className="mb-6 p-6 bg-black/40 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-500" size={24} />
                  <span className="text-xs font-mono text-zinc-500 uppercase">
                    Time Remaining
                  </span>
                </div>
                <div
                  className={`text-3xl font-mono font-bold ${
                    timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-orange-500"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>

            {/* OTP Display */}
            <div className="mb-6 p-8 bg-black/60 rounded-xl border border-orange-500/30">
              <p className="text-xs font-mono text-zinc-500 uppercase mb-3 text-center">
                Access Code
              </p>
              <p className="text-6xl font-mono font-bold tracking-widest text-orange-500 text-center">
                {session.otp_secret}
              </p>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-white rounded-2xl">
                  <img src={qrCodeUrl} alt="Session QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* Location Info */}
            <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <MapPin size={16} className="text-orange-500" />
                <span>
                  {session.latitude.toFixed(6)}, {session.longitude.toFixed(6)}
                </span>
              </div>
            </div>

            {/* End Session Button */}
            <button
              onClick={endSession}
              className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-sm uppercase font-mono hover:bg-red-500/20 transition-all"
            >
              Terminate Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateSession;
