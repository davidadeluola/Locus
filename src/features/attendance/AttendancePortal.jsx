import React, { useState, useRef, useEffect } from "react";
import { QrCode, MapPin, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAttendance } from "../../hooks/useAttendance";
import { getCurrentLocation, formatDistance } from "../../lib/utils/attendanceUtils";

const AttendancePortal = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [result, setResult] = useState(null);

  const inputRefs = useRef([]);
  const { submitAttendance, loading, reset } = useAttendance();

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];

    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Get current location
  const captureLocation = async () => {
    setGettingLocation(true);
    setLocationError(null);

    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setLocationError(err.message || "Failed to get location");
    } finally {
      setGettingLocation(false);
    }
  };

  // Auto-capture location on mount
  useEffect(() => {
    captureLocation();
  }, []);

  // Submit attendance
  const handleSubmit = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      return;
    }

    if (!location) {
      await captureLocation();
      return;
    }

    const response = await submitAttendance(otpCode, location);
    setResult(response);

    // Clear OTP after submission
    if (response.success) {
      setTimeout(() => {
        setOtp(["", "", "", "", "", ""]);
        reset();
        setResult(null);
        inputRefs.current[0]?.focus();
      }, 3000);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <QrCode className="text-orange-500" size={24} />
          </div>
          <h3 className="font-mono text-sm uppercase tracking-widest">
            Attendance Clearance Portal
          </h3>
        </div>

        {/* Location Status */}
        <div className="mb-6 p-4 bg-black/40 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin
                className={
                  location
                    ? "text-emerald-500"
                    : locationError
                    ? "text-red-500"
                    : "text-orange-500"
                }
                size={20}
              />
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Geolocation</p>
                <p className="text-sm font-mono">
                  {gettingLocation ? (
                    <span className="text-zinc-400">Acquiring coordinates...</span>
                  ) : location ? (
                    <span className="text-emerald-500">Position Locked</span>
                  ) : locationError ? (
                    <span className="text-red-500">Access Denied</span>
                  ) : (
                    <span className="text-zinc-400">Standby</span>
                  )}
                </p>
              </div>
            </div>
            {!location && !gettingLocation && (
              <button
                onClick={captureLocation}
                className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-xs uppercase font-mono hover:bg-orange-500/20 transition-all"
              >
                Retry
              </button>
            )}
          </div>
          {locationError && (
            <p className="mt-3 text-xs text-red-400 font-mono">{locationError}</p>
          )}
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <p className="text-xs font-mono text-zinc-500 uppercase mb-4 text-center">
            Enter 6-Digit Access Code
          </p>
          <div className="flex gap-2 md:gap-3 justify-center" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-16 md:w-16 md:h-20 bg-black border border-zinc-800 rounded-xl text-center text-2xl md:text-3xl font-mono font-bold text-orange-500 focus:border-orange-500 focus:outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isOtpComplete || !location || loading}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Verifying Clearance...
            </>
          ) : (
            <>
              <QrCode size={20} />
              Authenticate Attendance
            </>
          )}
        </button>
      </section>

      {/* Result Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-2xl border ${
              result.success
                ? "bg-emerald-500/10 border-emerald-500/20"
                : result.error === "OUT_OF_RANGE"
                ? "bg-orange-500/10 border-orange-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={32} />
              ) : result.error === "OUT_OF_RANGE" ? (
                <AlertTriangle className="text-orange-500 shrink-0" size={32} />
              ) : (
                <XCircle className="text-red-500 shrink-0" size={32} />
              )}
              <div className="flex-1">
                <h4
                  className={`font-mono text-sm uppercase mb-2 ${
                    result.success
                      ? "text-emerald-500"
                      : result.error === "OUT_OF_RANGE"
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  {result.success
                    ? "✓ Clearance Granted"
                    : result.error === "OUT_OF_RANGE"
                    ? "⚠ Outside Classroom Radius"
                    : "✗ Authentication Failed"}
                </h4>
                <p className="text-sm text-zinc-300 mb-2">
                  {result.success
                    ? "Your attendance has been successfully recorded."
                    : result.error === "OUT_OF_RANGE"
                    ? "You are too far from the classroom. Please move closer and try again."
                    : result.error || "An error occurred during verification."}
                </p>
                {result.distance !== undefined && (
                  <div className="flex items-center gap-2 mt-3">
                    <MapPin size={14} className="text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-500">
                      Distance: {formatDistance(result.distance)}
                      {result.error === "OUT_OF_RANGE" && " (Max: 100m)"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePortal;
