import { supabase } from "../../../api/supabase";
import authRepository from '../../../services/repositories/authRepository.js';
// TODO(MIGRATE): Move auth calls to `authRepository` so domain code uses repository interface.

export const loginWithPassword = async (email, password) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
};

export const loginWithGoogle = async () => {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/login`,
  });
};

export const requestPasswordResetOtp = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
    },
  });
};

export const verifyPasswordResetOtpAndUpdate = async (email, otp, newPassword) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedOtp = String(otp || "").trim();

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedOtp,
    type: "email",
  });

  if (verifyError) {
    return { data: null, error: verifyError };
  }

  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { data: null, error: updateError };
  }

  return {
    data: {
      verifyData,
      updateData,
    },
    error: null,
  };
};
