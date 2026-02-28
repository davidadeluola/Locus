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
