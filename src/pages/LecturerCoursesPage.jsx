import React, { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { supabase } from "../api/supabase";
import { useUser } from "../hooks/useUser";

const LecturerCoursesPage = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [level, setLevel] = useState("");

  const fetchCourses = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("classes")
      .select("id, course_code, course_title, level, created_at")
      .eq("lecturer_id", user.id)
      .order("created_at", { ascending: false });

    setCourses(data || []);
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const createCourse = async () => {
    if (!user?.id || !courseCode.trim() || !courseTitle.trim()) return;
    setLoading(true);

    const payload = {
      lecturer_id: user.id,
      course_code: courseCode.trim().toUpperCase(),
      course_title: courseTitle.trim(),
    };

    const withLevel = {
      ...payload,
      level: level ? Number(level) : null,
    };

    const attempt = await supabase.from("classes").insert(withLevel);
    if (attempt.error) {
      await supabase.from("classes").insert(payload);
    }

    setCourseCode("");
    setCourseTitle("");
    setLevel("");
    setLoading(false);
    await fetchCourses();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BookOpen className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Course Modules</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">Manage your courses and modules</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Create Course Module</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
            placeholder="Course Code (e.g CPE403)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
          />
          <input
            value={courseTitle}
            onChange={(event) => setCourseTitle(event.target.value)}
            placeholder="Course Title"
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
          />
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
          >
            <option value="">Level (Optional)</option>
            {[100, 200, 300, 400, 500].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <button
          onClick={createCourse}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest disabled:opacity-50"
        >
          <Plus size={18} />
          {loading ? "Creating..." : "Create Course"}
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center py-12">
          <BookOpen className="mx-auto mb-4 text-zinc-700" size={48} />
          <p className="text-zinc-500 font-mono text-sm">No courses created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <article key={course.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-500">{course.course_code}</p>
              <h3 className="text-lg font-bold mt-2">{course.course_title}</h3>
              <p className="text-xs font-mono text-zinc-500 mt-2">Level: {course.level ?? "N/A"}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerCoursesPage;
