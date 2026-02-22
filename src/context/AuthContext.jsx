import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../api/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data || null);
    return data || null;
  };

  const fetchActiveSession = async (userId) => {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from("sessions")
      .select("id, class_id, lecturer_id, otp_secret, latitude, longitude, expires_at, created_at")
      .eq("lecturer_id", userId)
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveSession(data || null);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setActiveSession(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      const nextProfile = await fetchProfile(session.user.id);
      if (nextProfile?.role === "lecturer") {
        await fetchActiveSession(session.user.id);
      }
      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setActiveSession(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      const nextProfile = await fetchProfile(session.user.id);
      if (nextProfile?.role === "lecturer") {
        await fetchActiveSession(session.user.id);
      } else {
        setActiveSession(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setActiveSession(null);
  };

  const value = useMemo(
    () => ({ user, profile, activeSession, setActiveSession, loading, signOut }),
    [user, profile, activeSession, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
