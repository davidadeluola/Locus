import React, { useMemo, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import ActionButton from "../../components/ui/ActionButton";
import SystemBadge from "../../components/ui/SystemBadge";
import { useAttendance } from "../../hooks/useAttendance";
import { getCurrentLocation } from "../../lib/utils/attendanceUtils";

const AttendanceVerification = () => {
  const [otp, setOtp] = useState("");
  const [location, setLocation] = useState(null);
  const { submitAttendance, loading, success, error, previewDistance } = useAttendance();

  const badge = useMemo(() => {
    if (success) return <SystemBadge label="VERIFIED" tone="active" />;
    if (error === "OUT_OF_RANGE") return <SystemBadge label="OUT_OF_RANGE" tone="warning" />;
    if (error) return <SystemBadge label="FAILED" tone="depleted" />;
    return <SystemBadge label="READY" tone="depleted" />;
  }, [success, error]);

  const captureLocation = async () => {
    const coords = await getCurrentLocation();
    setLocation(coords);
  };

  const verify = async () => {
    if (!location) await captureLocation();
    if (otp.length !== 6 || !location) return;
    await submitAttendance(otp, location);
  };

  return (
    <section className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500">Student Terminal</h3>
        {badge}
      </div>

      <input
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="ENTER 6-DIGIT OTP"
        className="w-full h-12 bg-black border border-zinc-800 rounded-lg px-3 font-mono text-sm tracking-widest text-orange-500"
      />

      <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
        <span className="inline-flex items-center gap-2"><MapPin size={12} />GPS</span>
        <span>{location ? "LOCKED" : "NOT_LOCKED"}</span>
      </div>

      {previewDistance !== null && (
        <p className="text-xs font-mono text-zinc-400">PREVIEW_DISTANCE: {previewDistance}m</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <ActionButton variant="ghost" onClick={captureLocation}>LOCK GPS</ActionButton>
        <ActionButton onClick={verify} disabled={loading || otp.length !== 6}>
          <ShieldCheck size={14} />
          {loading ? "VERIFYING..." : "VERIFY"}
        </ActionButton>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-orange-500">
          {error}
        </motion.p>
      )}
    </section>
  );
};

export default AttendanceVerification;
