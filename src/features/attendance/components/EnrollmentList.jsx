import React from 'react';

const EnrollmentList = ({ enrolledStudents }) => {
  if (!enrolledStudents || enrolledStudents.length === 0) return (
    <p className="text-xs text-zinc-500 font-mono">No enrolled students found for this class.</p>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">S/N</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Full Name</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Matric No</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Department</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Level</th>
            <th className="text-left py-3 px-4 font-mono text-xs uppercase text-zinc-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {enrolledStudents.map((student, index) => (
            <tr key={student.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all">
              <td className="py-3 px-4 font-mono text-xs text-zinc-500">{String(index + 1).padStart(2, '0')}</td>
              <td className="py-3 px-4 text-sm text-zinc-200">{student.profiles?.full_name || 'Unknown Student'}</td>
              <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.matric_no || 'N/A'}</td>
              <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.department || 'N/A'}</td>
              <td className="py-3 px-4 font-mono text-xs text-zinc-400">{student.profiles?.level || 'N/A'}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-500 uppercase font-mono">Pending</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentList;
