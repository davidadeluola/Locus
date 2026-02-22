import { useState, useEffect } from "react";
import { supabase } from "../api/supabase";
import { useUser } from "./useUser";

export const useStudentCourses = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        // Fetch courses for this student from class_enrollments
        const { data, error: fetchError } = await supabase
          .from("class_enrollments")
          .select(
            `
            id,
            class_id,
            created_at,
            classes (
              id,
              course_code,
              course_title,
              lecturer_id,
              profiles:lecturer_id (full_name)
            )
          `
          )
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return { courses, loading, error };
};

export const useStudentAttendance = () => {
  const { user } = useUser();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    attendedSessions: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      try {
        // Fetch attendance logs for this student
        const { data, error: fetchError } = await supabase
          .from("attendance_logs")
          .select(
            `
            id,
            signed_at,
            distance_meters,
            session_id,
            sessions (
              id,
              otp_secret,
              expires_at,
              created_at,
              class_id,
              classes (
                course_code,
                course_title
              )
            )
          `
          )
          .eq("student_id", user.id)
          .order("signed_at", { ascending: false });

        if (fetchError) throw fetchError;
        setAttendance(data || []);

        // Calculate stats
        const totalSessions = data?.length || 0;
        setStats({
          totalSessions,
          attendedSessions: totalSessions,
          attendanceRate: 100, // Since they only see sessions they attended
        });
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  return { attendance, loading, error, stats };
};
