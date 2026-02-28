import React, { useEffect, useState } from 'react';
import { EnrollmentRepository } from '../../repositories/implementations';

export default function CourseRoomsList({ courses = [] }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const results = await Promise.all(
          (courses || []).map(async (c) => {
            const count = await EnrollmentRepository.countStudentsByCourse(c.id);
            return { id: c.id, count };
          })
        );

        if (!mounted) return;

        const map = {};
        results.forEach(r => { map[r.id] = r.count; });
        setCounts(map);
      } catch (e) {
        console.error('⚠️ Error fetching course counts:', e);
      }
    };

    if (courses && courses.length > 0) fetchCounts();

    return () => { mounted = false; };
  }, [courses]);

  if (!courses || courses.length === 0) {
    return null;
  }
  const occupied = (courses || []).filter(c => (counts[c.id] ?? 0) > 0);
  if (!occupied || occupied.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs text-zinc-400 uppercase mb-3">Active Course Rooms</h4>
      <ul className="space-y-2">
        {occupied.map(c => (
          <li key={c.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded-md">
            <div className="text-sm">{c.course_code} — {c.course_title}</div>
            <div className="text-xs text-zinc-300 bg-zinc-900 px-2 py-1 rounded-md">{counts[c.id]} students</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
