import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "../api/supabase";
import { useUser } from "../hooks/useUser";

const LecturerStudentsPage = () => {
  const { user } = useUser();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("class_enrollments")
        .select(
          `
            id,
            class_id,
            student_id,
            created_at,
            classes!inner(id, course_code, course_title, lecturer_id),
            profiles:student_id(id, full_name, matric_no, email, department, level)
          `
        )
        .eq("classes.lecturer_id", user.id)
        .order("created_at", { ascending: false });

      setStudents(data || []);
    };

    fetchStudents();
  }, [user?.id]);

  const uniqueStudents = useMemo(() => {
    const map = new Map();
    students.forEach((record) => {
      if (!map.has(record.student_id)) {
        map.set(record.student_id, record);
      }
    });
    return Array.from(map.values());
  }, [students]);

  const exportList = () => {
    if (!uniqueStudents.length) return;
    const headers = ["full_name", "matric_no", "email", "department", "level", "course_code"];
    const rows = uniqueStudents.map((item) => [
      item.profiles?.full_name || "",
      item.profiles?.matric_no || "",
      item.profiles?.email || "",
      item.profiles?.department || "",
      item.profiles?.level ?? "",
      item.classes?.course_code || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "lecturer_students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="text-orange-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Manage Students</h1>
        </div>
        <p className="text-zinc-500 font-mono text-sm">View and manage your enrolled students</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={exportList}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all uppercase text-xs tracking-widest"
        >
          Export List
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-zinc-700" size={48} />
            <p className="text-zinc-500 font-mono text-sm">No students enrolled yet</p>
            <p className="text-xs text-zinc-600 mt-2">Students will appear here once they enroll in your courses</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Matric No
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {uniqueStudents.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-800/50">
                    <td className="py-3 px-4 font-mono text-xs">{student.profiles?.matric_no || "N/A"}</td>
                    <td className="py-3 px-4">{student.profiles?.full_name || "Unknown"}</td>
                    <td className="py-3 px-4 font-mono text-xs">{student.profiles?.email || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500 uppercase font-mono">
                        Enrolled
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.classes?.course_code || "N/A"}</td>
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

export default LecturerStudentsPage;
