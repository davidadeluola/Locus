import React from "react";

const ROLE_FIELDS = {
  student: ["semester", "entry_mode", "grad_year", "interests"],
  lecturer: ["rank", "office_location", "admin_role", "office_hours"],
};

const labels = {
  semester: "Semester",
  entry_mode: "Entry Mode",
  grad_year: "Graduation Year",
  interests: "Interests",
  rank: "Rank",
  office_location: "Office Location",
  admin_role: "Administrative Role",
  office_hours: "Office Hours",
};

const placeholders = {
  semester: "e.g. First Semester",
  entry_mode: "e.g. UTME / Direct Entry",
  grad_year: "e.g. 2028",
  interests: "e.g. AI, Robotics, UI/UX",
  rank: "e.g. Senior Lecturer",
  office_location: "e.g. Block B, Room 204",
  admin_role: "e.g. Head of Department",
  office_hours: "e.g. Mon-Fri, 10AM-2PM",
};

const RoleQuestionsCard = ({ role, values, onChange, onContinue }) => {
  const fields = ROLE_FIELDS[role] || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-8">
      <div className="w-full max-w-xl space-y-6 bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Additional Questions</h2>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mt-2">
            {role === "student" ? "Student Profile Questions" : "Lecturer Profile Questions"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field}>
              <label className="text-[10px] uppercase font-mono text-zinc-500">{labels[field]}</label>
              <input
                value={values[field] || ""}
                onChange={(event) => onChange(field, event.target.value)}
                className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                placeholder={placeholders[field]}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all uppercase tracking-widest font-mono"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleQuestionsCard;
