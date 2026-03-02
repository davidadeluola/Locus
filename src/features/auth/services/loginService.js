import { supabase } from "../../../api/supabase";
import {
  normalizeEmail,
  validateLoginInput,
  validateResetEmail,
  validateResetOtpAndPassword,
} from '../../../lib/schemas/authSchemas';
import { emailRepository } from '../../../services/repositories/index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mapLoginError(error) {
  const rawMessage = String(error?.message || '').toLowerCase();

  if (rawMessage.includes('invalid login credentials')) {
    return new Error('Invalid email or password. If you use Google, sign in with Google.');
  }

  if (rawMessage.includes('email not confirmed')) {
    return new Error('Email not confirmed. Please verify your email first.');
  }

  if (rawMessage.includes('captcha')) {
    return new Error('Login blocked by security check. Refresh and try again.');
  }

  return error || new Error('Unable to sign in right now.');
}

export const loginWithPassword = async (email, password) => {
  const validation = validateLoginInput(email, password);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  const normalizedEmail = normalizeEmail(email);
  const firstAttempt = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (!firstAttempt?.error) {
    return firstAttempt;
  }

  const firstErrorMessage = String(firstAttempt.error?.message || '').toLowerCase();
  const shouldRetry = firstErrorMessage.includes('invalid login credentials');

  if (!shouldRetry) {
    return { data: null, error: mapLoginError(firstAttempt.error) };
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  await sleep(350);

  const secondAttempt = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (!secondAttempt?.error) {
    return secondAttempt;
  }

  return { data: null, error: mapLoginError(secondAttempt.error) };
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
  const validation = validateResetEmail(email);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  const normalizedEmail = normalizeEmail(email);
  return supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/login`,
  });
};

export const requestPasswordResetOtp = async (email) => {
  const validation = validateResetEmail(email);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  const normalizedEmail = normalizeEmail(email);
  const result = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (!result?.error && emailRepository.isEnabled()) {
    await emailRepository.requestForgotPasswordOtpEmail({ to: normalizedEmail });
  }

  return result;
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Update Error:", error.message);
    return { success: false, error };
  }

  return { success: true, data };
};

export const verifyPasswordResetOtpAndUpdate = async (email, otp, newPassword) => {
  const validation = validateResetOtpAndPassword(email, otp, newPassword);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.error) };
  }

  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedOtp,
    type: "email",
  });

  if (verifyError) {
    return { data: null, error: verifyError };
  }

  const updateResult = await updatePassword(newPassword);
  if (!updateResult.success) {
    return { data: null, error: updateResult.error };
  }

  const updateData = updateResult.data;

  const { data: loginVerificationData, error: loginVerificationError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: newPassword,
  });

  if (loginVerificationError) {
    return {
      data: null,
      error: new Error(
        `Password updated, but login verification failed. ${loginVerificationError.message || 'Try signing in with Google if this account was created with OAuth.'}`
      ),
    };
  }

  await supabase.auth.signOut();

  if (emailRepository.isEnabled()) {
    await Promise.all([
      emailRepository.requestResetPasswordOtpEmail({ to: normalizedEmail }),
      emailRepository.sendPasswordUpdatedNotice({ to: normalizedEmail }),
    ]);
  }

  return {
    data: {
      verifyData,
      updateData,
      loginVerificationData,
    },
    error: null,
  };
};
