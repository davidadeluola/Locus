import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../../../api/supabase.js';
import { useProfileCache } from '../../../hooks/useProfileCache';

export default function useAttendanceData(sessionId) {
  const { getProfile, cacheProfile, cacheProfiles } = useProfileCache();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgDistance: 0 });

  const fetchProfileDirectly = useCallback(async (studentId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, matric_no, email, department, level')
        .eq('id', studentId)
        .single();
      if (error) return null;
      if (profile) cacheProfile(studentId, profile);
      return profile || null;
    } catch (e) {
      return null;
    }
  }, [cacheProfile]);

  const calculateStats = useCallback((records) => {
    const total = records.length;
    const avgDistance = total > 0 ? records.reduce((s, r) => s + (r.distance_meters || 0), 0) / total : 0;
    setStats({ total, avgDistance });
  }, []);

  const fetchSessionInfo = useCallback(async () => {
    let mounted = true;
    try {
      const { data } = await supabase
        .from('sessions')
        .select(`id, class_id, created_at, expires_at, classes ( id, course_code, course_title )`)
        .eq('id', sessionId)
        .single();
      if (!mounted) return;
      setSessionInfo(data || null);
      if (!data?.class_id) return setEnrolledStudents([]);

      const { data: classEnrollments, error: enrollErr } = await supabase
        .from('class_enrollments')
        .select(`id, student_id, created_at, profiles!student_id(id, full_name, matric_no, email, department, level)`)
        .eq('class_id', data.class_id)
        .order('created_at', { ascending: true });

      if (enrollErr) {
        // fallback without explicit alias
        try {
          const { data: fallback } = await supabase
            .from('class_enrollments')
            .select(`id, student_id, created_at, profiles:student_id ( id, full_name, matric_no, email, department, level )`)
            .eq('class_id', data.class_id)
            .order('created_at', { ascending: true });
          if (!mounted) return;
          if (fallback && fallback.length) {
            const profilesWithId = fallback.map((e) => e.profiles).filter(Boolean);
            if (profilesWithId.length) cacheProfiles(profilesWithId);
            setEnrolledStudents(fallback || []);
          } else {
            setEnrolledStudents([]);
          }
        } catch (fb) {
          console.error('useAttendanceData.fetchSessionInfo (fallback)', fb);
          if (!mounted) return;
          setEnrolledStudents([]);
        }
      } else {
        if (!mounted) return;
        if (classEnrollments && classEnrollments.length) {
          const profilesWithId = classEnrollments.map((e) => e.profiles).filter(Boolean);
          if (profilesWithId.length) cacheProfiles(profilesWithId);
        }
        setEnrolledStudents(classEnrollments || []);
      }
    } catch (err) {
      console.error('useAttendanceData.fetchSessionInfo', err);
      if (mounted) setEnrolledStudents([]);
    } finally {
      mounted = false;
    }
  }, [sessionId, cacheProfiles]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data: logs } = await supabase
        .from('attendance_logs')
        .select(`id, signed_at, distance_meters, student_id, profiles:student_id ( id, full_name, matric_no, email, department, level )`)
        .eq('session_id', sessionId)
        .order('signed_at', { ascending: true });

      if (logs && logs.length) {
        const profilesWithId = logs.map((l) => l.profiles).filter(Boolean);
        if (profilesWithId.length) cacheProfiles(profilesWithId);
      }

      const enriched = await Promise.all((logs || []).map(async (log) => {
        let profileData = log.profiles || getProfile(log.student_id) || await fetchProfileDirectly(log.student_id);
        return { ...log, profiles: profileData || { id: log.student_id } };
      }));

      setAttendanceRecords(enriched);
      calculateStats(enriched);
      await fetchSessionInfo();
    } catch (err) {
      console.error('useAttendanceData.fetchAttendance', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, cacheProfiles, getProfile, fetchProfileDirectly, calculateStats, fetchSessionInfo]);

  // If there's no sessionId, ensure we show an empty state instead of a perpetual loader
  useEffect(() => {
    if (!sessionId) {
      setAttendanceRecords([]);
      setSessionInfo(null);
      setEnrolledStudents([]);
      setStats({ total: 0, avgDistance: 0 });
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    fetchAttendance();

    const channel = supabase
      .channel(`attendance_${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs', filter: `session_id=eq.${sessionId}` }, async (payload) => {
        if (!mounted) return;
        try {
          const { data: newRecord } = await supabase
            .from('attendance_logs')
            .select(`id, signed_at, distance_meters, student_id, profiles!student_id(id, full_name, matric_no, email, department, level)`)
            .eq('id', payload.new.id)
            .single();
          if (!newRecord) return;
          let profileData = newRecord.profiles || getProfile(newRecord.student_id) || await fetchProfileDirectly(newRecord.student_id);
          if (profileData && mounted) cacheProfile(newRecord.student_id, profileData);
          const enriched = { ...newRecord, profiles: profileData || { id: newRecord.student_id } };
          if (!mounted) return;
          setAttendanceRecords((prev) => { const updated = [...prev, enriched]; calculateStats(updated); return updated; });
        } catch (e) {
          console.error('attendance subscription handler', e);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  }, [sessionId, fetchAttendance, getProfile, fetchProfileDirectly, cacheProfile, calculateStats]);

  const exportSessionCsv = useCallback(() => {
    if (!sessionInfo?.id || !enrolledStudents.length) return;
    const attendanceByStudent = attendanceRecords.reduce((acc, record) => { acc[record.student_id] = record; return acc; }, {});
    const headers = [
      'course_code','course_title','department','level','session_id','session_start','session_expires','student_id','full_name','matric_no','email','student_department','student_level','signed_status','signed_at','distance_meters'
    ];
    const rows = enrolledStudents.map((enrollment) => {
      const profile = enrollment.profiles || {};
      const signedRecord = attendanceByStudent[enrollment.student_id] || null;
      return [
        sessionInfo?.classes?.course_code || 'N/A',
        sessionInfo?.classes?.course_title || 'N/A',
        '', '', sessionInfo.id, sessionInfo.created_at || '', sessionInfo.expires_at || '', enrollment.student_id || '', profile.full_name || '', profile.matric_no || '', profile.email || '', profile.department || '', profile.level ?? '', signedRecord ? 'SIGNED' : 'PENDING', signedRecord?.signed_at || '', signedRecord?.distance_meters ?? ''
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${sessionInfo?.classes?.course_code || 'session'}_${sessionInfo.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [sessionInfo, enrolledStudents, attendanceRecords]);

  return { loading, attendanceRecords, sessionInfo, enrolledStudents, stats, exportSessionCsv, refresh: fetchAttendance };
}
