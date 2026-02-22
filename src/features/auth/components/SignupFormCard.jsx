import React from "react";
import { User, Mail, Fingerprint, GraduationCap, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import SocialAuth from "../../../components/auth/SocialAuth";

const SignupFormCard = ({
  error,
  googleError,
  loading,
  googleLoading,
  formData,
  schools,
  selectedSchool,
  onChange,
  onRoleChange,
  onSchoolChange,
  onSubmit,
  onGoogleAuth,
  onSignIn,
}) => {
  const navigate = useNavigate();
  const displayError = error || googleError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-8">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-mono uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <Fingerprint className="text-[#FF4D00]" size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            LOCUS<span className="text-[#FF4D00]">.</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-2">Complete Your Profile</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 bg-[#18181b] p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="space-y-4">
            <SocialAuth
              onGoogleClick={onGoogleAuth}
              disabled={loading || googleLoading}
            />
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">
              <span className="h-px flex-1 bg-zinc-800" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-mono">
              [ERROR]: {String(displayError).toUpperCase()}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={onChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                  placeholder="name@institute.edu"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput
              label="Security Cipher"
              name="password"
              required
              value={formData.password}
              onChange={onChange}
              placeholder="••••••••"
            />
            <PasswordInput
              label="Confirm Cipher"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={onChange}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono text-zinc-500">Select School</label>
            <select
              value={selectedSchool?.id || ""}
              onChange={(event) => onSchoolChange(event.target.value)}
              required
              className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
            >
              <option value="">-- Select your school --</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono text-zinc-500">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onRoleChange("student")}
                className={`p-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
                  formData.role === "student" ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-zinc-800 text-zinc-500"
                }`}
              >
                <GraduationCap size={18} /> STUDENT
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("lecturer")}
                className={`p-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
                  formData.role === "lecturer" ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-zinc-800 text-zinc-500"
                }`}
              >
                <Briefcase size={18} /> LECTURER
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Faculty</label>
              <input
                name="faculty"
                required
                value={formData.faculty}
                onChange={onChange}
                className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Department</label>
              <input
                name="department"
                required
                value={formData.department}
                onChange={onChange}
                className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                placeholder="Computer Science"
              />
            </div>
          </div>

          {formData.role === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Matric Number</label>
                <input
                  name="matricNo"
                  required
                  value={formData.matricNo}
                  onChange={onChange}
                  className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                  placeholder="e.g. 2021/001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Academic Level</label>
                <select
                  name="level"
                  required
                  value={formData.level}
                  onChange={onChange}
                  className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-400"
                >
                  <option value="">Select Level</option>
                  {[100, 200, 300, 400, 500].map((level) => (
                    <option key={level} value={level}>
                      {level} Level
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.role === "lecturer" && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-zinc-500">Staff ID</label>
              <input
                name="staffId"
                required
                value={formData.staffId}
                onChange={onChange}
                className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-xl focus:border-orange-500 outline-none text-zinc-100"
                placeholder="e.g. STF-001"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedSchool || !formData.role || !formData.faculty || !formData.department}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest font-mono"
          >
            {loading ? "INITIALIZING..." : "REQUEST ACCESS CODE"}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs mt-6">
          Already have an account?{" "}
          <button onClick={onSignIn} className="text-orange-500 hover:text-orange-400 font-bold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupFormCard;
