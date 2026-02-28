import { useState, useEffect } from "react";
import repos from '../services/repositories/index.js';
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
        const data = await repos.enrollmentRepository.findByStudent(user.id);
        setCourses(data || []);
      } catch (err) {
        console.error("Error fetching courses via repository:", err);
        setError(err?.message || String(err));
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
        const data = await repos.attendanceRepository.findByStudent(user.id, { limit: 50 });

        // No need for enrichment here because repository already joins sessions and classes
        setAttendance(data || []);

        const totalSessions = (data || []).length;
        setStats({
          totalSessions,
          attendedSessions: totalSessions,
          attendanceRate: totalSessions > 0 ? Math.round((totalSessions / totalSessions) * 100) : 0,
        });
      } catch (err) {
        console.error("Error fetching attendance via repository:", err);
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  return { attendance, loading, error, stats };
};
