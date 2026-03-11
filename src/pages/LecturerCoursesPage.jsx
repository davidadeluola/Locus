import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, AlertCircle, Check } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { useCourses } from "../hooks/useCourses";

const LecturerCoursesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { courses, loading: coursesLoading, createCourse: createCourseAPI } = useCourses(user?.id);
  
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createCourse = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!courseCode.trim()) {
      setError("Course code is required");
      return;
    }
    if (!courseTitle.trim()) {
      setError("Course title is required");
      return;
    }

    setLoading(true);

    try {
      const courseData = {
        course_code: courseCode.trim().toUpperCase(),
        course_title: courseTitle.trim(),
        department: department.trim() || null,
        level: level ? Number(level) : null,
      };

      const data = await createCourseAPI(courseData);

      if (data) {
        console.log("✅ Course created successfully:", data);

        // Clear form and show success
        setCourseCode("");
        setCourseTitle("");
        setDepartment("");
        setLevel("");
        setSuccess(`Course '${courseTitle.trim()}' created successfully!`);

        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(""), 2000);

        // Auto-route to dashboard to create session for this course
        console.log("📍 Auto-routing to dashboard to create session...");
        navigate("/dashboard", { 
          state: { 
            newCourseId: data.id,
            newCourseCode: data.course_code,
            focusSession: true,
            autoSelectCourse: true
          } 
        });
      }
    } catch (err) {
      console.error("❌ Error creating course:", err);
      setError(err.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && courseCode.trim() && courseTitle.trim()) {
      createCourse();
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString();
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
          <AlertCircle size={18} />
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500">
          <Check size={18} />
          <p className="text-sm font-mono">{success}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Create Course Module</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Course Code (e.g CPE403)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            disabled={loading}
          />
          <input
            value={courseTitle}
            onChange={(event) => setCourseTitle(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Course Title"
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            disabled={loading}
          />
          <input
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Department (Optional)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            disabled={loading}
          />
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
            disabled={loading}
          >
            <option value="">Level (Optional)</option>
            {[100, 200, 300, 400, 500].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <button
          onClick={createCourse}
          disabled={loading || !courseCode.trim() || !courseTitle.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest disabled:opacity-40 disabled:cursor-not-allowed w-full justify-center"
        >
          <Plus size={18} />
          {loading ? "Creating..." : "Create Course"}
        </button>
        <p className="text-xs text-zinc-500 font-mono text-center">
          Press Enter to create or click the button above (Code & Title required)
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="mb-5">
          <h6 className="text-sm font-semibold text-zinc-100">Created Modules / Classes</h6>
          <p className="text-xs text-zinc-500 font-mono mt-1">Classes that you have created</p>
        </div>

        {coursesLoading ? (
          <div className="text-center py-10">
            <div className="text-zinc-500 font-mono text-sm">Loading created modules...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="mx-auto mb-4 text-zinc-700" size={40} />
            <p className="text-zinc-500 font-mono text-sm">No classes created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-230">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">S/N</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Course Code</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Course Title</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Department</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Level</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Created</th>
                  <th className="py-3 px-4 text-left font-mono text-xs uppercase text-zinc-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all">
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{index + 1}</td>
                    <td className="py-3 px-4 font-mono text-xs text-orange-500">{course.course_code || "N/A"}</td>
                    <td className="py-3 px-4 text-sm text-zinc-100">{course.course_title || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{course.department || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{course.level ?? "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{formatDate(course.created_at)}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/dashboard", {
                            state: {
                              newCourseId: course.id,
                              newCourseCode: course.course_code,
                              focusSession: true,
                              autoSelectCourse: true,
                            },
                          });
                        }}
                        className="px-3 py-2 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-400 text-[10px] font-mono uppercase tracking-widest hover:bg-orange-600/30"
                      >
                        Create Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerCoursesPage;
