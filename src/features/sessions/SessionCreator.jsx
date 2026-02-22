import React, { useEffect, useMemo, useState } from "react";
import { Clock, QrCode, Timer } from "lucide-react";
import { supabase } from "../../api/supabase";
import ActionButton from "../../components/ui/ActionButton";
import SystemBadge from "../../components/ui/SystemBadge";
import { useAuthContext } from "../../context/AuthContext";
import { generateOTP, getCurrentLocation } from "../../lib/utils/attendanceUtils";

const SessionCreator = () => {
  const { user, activeSession, setActiveSession } = useAuthContext();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchClasses = async () => {
      const primary = await supabase
        .from("classes")
        .select("id, course_code, course_title, level")
        .eq("lecturer_id", user.id)
        .order("course_code", { ascending: true });

      if (!primary.error) {
        const loaded = primary.data || [];
        setClasses(loaded);
        setSelectedClassId((previous) => previous || loaded[0]?.id || "");
        return;
      }

      const fallback = await supabase
        .from("classes")
        .select("id, course_code, course_title")
        .eq("lecturer_id", user.id)
        .order("course_code", { ascending: true });

      const loaded = (fallback.data || []).map((item) => ({ ...item, level: null }));
      setClasses(loaded);
      setSelectedClassId((previous) => previous || loaded[0]?.id || "");
    };

    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (!activeSession?.expires_at) {
      setTimeLeft(0);
      return;
    }
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(activeSession.expires_at) - new Date()) / 1000));
      setTimeLeft(left);
      if (left <= 0) setActiveSession(null);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeSession, setActiveSession]);

  const formatted = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }, [timeLeft]);

  const createSession = async () => {
    if (!user || classes.length === 0 || !selectedClassId) return null;

    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const now = new Date();
      const expires = new Date(now.getTime() + durationMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          class_id: selectedClassId,
          lecturer_id: user.id,
          otp_secret: generateOTP(),
          latitude: location.latitude,
          longitude: location.longitude,
          created_at: now.toISOString(),
          expires_at: expires.toISOString(),
        })
        .select("id, class_id, lecturer_id, otp_secret, latitude, longitude, expires_at, created_at")
        .single();

      if (error) throw error;
      setActiveSession(data || null);
      return data || null;
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = classes.find((item) => item.id === selectedClassId) || null;

  return (
    <section className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
      <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-500">Lecturer Control</h3>
      {classes.length === 0 ? (
        <div className="space-y-3">
          <SystemBadge label="NO COURSE" tone="warning" />
          <p className="text-xs font-mono text-zinc-400">
            Create or assign at least one class to enable session generation and OTP release.
          </p>
          <ActionButton variant="ghost" disabled className="w-full">
            <QrCode size={14} />
            CREATE SESSION
          </ActionButton>
        </div>
      ) : null}

      {classes.length > 0 &&
        (activeSession ? (
          <div className="space-y-3">
            <p className="text-xs font-mono text-zinc-400">
              {selectedCourse?.course_code || "N/A"} · Level {selectedCourse?.level ?? "N/A"}
            </p>
            <div className="flex items-center justify-between">
              <SystemBadge label="ACTIVE" tone="active" pulse />
              <span className="font-mono text-orange-500 text-lg">{activeSession.otp_secret}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-2"><Clock size={12} />Expires At</span>
              <span>{new Date(activeSession.expires_at).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="inline-flex items-center gap-2"><Timer size={12} />Countdown</span>
              <span className="text-orange-500">{formatted}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Course Code + Level</label>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-100 font-mono text-xs"
              >
                {classes.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code || "N/A"} · Level {course.level ?? "N/A"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">
                OTP Active Window ({durationMinutes} min)
              </label>
              <input
                type="range"
                min={0}
                max={5}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <ActionButton onClick={createSession} disabled={loading} className="w-full">
              <QrCode size={14} />
              {loading ? "CREATING..." : "CREATE SESSION"}
            </ActionButton>
          </div>
        ))}
    </section>
  );
};

export default SessionCreator;
