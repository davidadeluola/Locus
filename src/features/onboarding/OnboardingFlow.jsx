// src/features/onboarding/OnboardingFlow.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import repos from '../../services/repositories/index.js';
// TODO(MIGRATE): Replace direct Supabase calls with appropriate repository calls (use `repos`).
import { useAuthStore } from '../../store/authStore';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { user, profile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: null,
    matricNo: null,
    staffId: null,
  });

  useEffect(() => {
    if (profile?.is_onboarded) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  if (profile?.is_onboarded) {
    return null;
  }

  const resolvedForm = {
    role: formData.role ?? profile?.role ?? '',
    matricNo: formData.matricNo ?? profile?.matric_no ?? '',
    staffId: formData.staffId ?? profile?.staff_id ?? '',
  };

  const activeStep = resolvedForm.role ? 2 : step;

  const setFieldValue = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!resolvedForm.role) return 'Select your role to continue.';
    if (resolvedForm.role === 'student' && !resolvedForm.matricNo) {
      return 'Student matric number is required.';
    }
    if (resolvedForm.role === 'lecturer' && !resolvedForm.staffId) {
      return 'Staff ID is required for lecturers.';
    }
    return '';
  };

  const handleComplete = async () => {
    if (!user?.id) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      id: user.id,
      email: profile?.email || user.email || null,
      full_name: profile?.full_name || user.user_metadata?.full_name || null,
      role: resolvedForm.role,
      school_id: profile?.school_id ?? null,
      faculty: profile?.faculty ?? null,
      department: profile?.department ?? null,
      level: profile?.level ?? null,
      matric_no: resolvedForm.role === 'student' ? resolvedForm.matricNo || null : profile?.matric_no ?? null,
      staff_id: resolvedForm.role === 'lecturer' ? resolvedForm.staffId || null : profile?.staff_id ?? null,
      is_onboarded: true,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id' });

    if (profileError) {
      setError(profileError.message || 'Failed to save onboarding details.');
    } else {
      await fetchProfile();
      navigate('/dashboard', { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        {activeStep === 1 && !profile?.role && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-100">Select your role</h2>
            <div className="grid gap-4">
              <button 
                onClick={() => { setFieldValue('role', 'student'); setStep(2); }}
                className="p-4 border border-zinc-800 hover:border-orange-500 rounded-xl text-left transition-all"
              >
                <h3 className="text-orange-500 font-semibold">Student</h3>
                <p className="text-zinc-400 text-sm">Join classes and track your 75% goal.</p>
              </button>
              <button 
                onClick={() => { setFieldValue('role', 'lecturer'); setStep(2); }}
                className="p-4 border border-zinc-800 hover:border-orange-500 rounded-xl text-left transition-all"
              >
                <h3 className="text-orange-500 font-semibold">Lecturer</h3>
                <p className="text-zinc-400 text-sm">Create classes and export logs.</p>
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-zinc-100">Almost there!</h2>
              {resolvedForm.role && (
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                  Role: {resolvedForm.role}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-mono">
                [ERROR]: {error.toUpperCase()}
              </div>
            )}

            {resolvedForm.role === 'student' && (
              <div className="space-y-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono text-zinc-500">Matric Number</label>
                  <input
                    type="text"
                    placeholder="2022/1234"
                    value={resolvedForm.matricNo}
                    onChange={(e) => setFieldValue('matricNo', e.target.value)}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-zinc-100 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {resolvedForm.role === 'lecturer' && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-zinc-500">Staff ID</label>
                <input
                  type="text"
                  placeholder="STF-1001"
                  value={resolvedForm.staffId}
                  onChange={(e) => setFieldValue('staffId', e.target.value)}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-zinc-100 focus:ring-orange-500"
                />
              </div>
            )}

            <button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;