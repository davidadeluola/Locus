import React from "react";
import { BookOpen, Download, FileText, Video } from "lucide-react";
import { useStudentCourses } from "../hooks/useDashboardData";

const StudentResourcesPage = () => {
  const { courses, loading } = useStudentCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500 font-mono text-sm">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BookOpen className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Course Resources</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">Access study materials and resources for your courses</p>
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center py-12">
          <BookOpen className="mx-auto mb-4 text-zinc-700" size={48} />
          <p className="text-zinc-500 font-mono text-sm">No courses enrolled yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-orange-500/30 transition-all"
            >
              <div className="mb-4">
                <p className="font-mono text-sm text-orange-500 uppercase tracking-widest">
                  {enrollment.classes?.course_code}
                </p>
                <h3 className="text-lg font-bold mt-2">{enrollment.classes?.course_title}</h3>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  Lecturer: {enrollment.classes?.profiles?.full_name || "N/A"}
                </p>
              </div>

              {/* Resource Placeholders */}
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-orange-500/10 transition-all group">
                  <FileText size={18} className="text-blue-500 group-hover:text-orange-500" />
                  <span className="text-sm">Lecture Notes</span>
                  <Download size={14} className="ml-auto text-zinc-600 group-hover:text-orange-500" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-orange-500/10 transition-all group">
                  <Video size={18} className="text-purple-500 group-hover:text-orange-500" />
                  <span className="text-sm">Recorded Sessions</span>
                  <Download size={14} className="ml-auto text-zinc-600 group-hover:text-orange-500" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-orange-500/10 transition-all group">
                  <FileText size={18} className="text-emerald-500 group-hover:text-orange-500" />
                  <span className="text-sm">Assignments</span>
                  <Download size={14} className="ml-auto text-zinc-600 group-hover:text-orange-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coming Soon Note */}
      <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
        <p className="text-sm text-orange-500">
          📝 <strong>Note:</strong> Resource uploads and management coming soon. Contact your lecturer for course materials.
        </p>
      </div>
    </div>
  );
};

export default StudentResourcesPage;
