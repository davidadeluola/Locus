import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.');

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must include at least one letter.')
  .regex(/\d/, 'Password must include at least one number.');

const resetWithOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit OTP.'),
  newPassword: passwordStrengthSchema,
});

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateLoginInput(email, password) {
  const parsed = loginSchema.safeParse({ email, password });
  return parsed.success
    ? { valid: true, data: parsed.data }
    : { valid: false, error: parsed.error.issues[0]?.message || 'Invalid login input.' };
}

export function validateResetEmail(email) {
  const parsed = emailSchema.safeParse(email);
  return parsed.success
    ? { valid: true, data: parsed.data }
    : { valid: false, error: parsed.error.issues[0]?.message || 'Invalid email.' };
}

export function validateResetOtpAndPassword(email, otp, newPassword) {
  const parsed = resetWithOtpSchema.safeParse({ email, otp, newPassword });
  return parsed.success
    ? { valid: true, data: parsed.data }
    : { valid: false, error: parsed.error.issues[0]?.message || 'Invalid reset payload.' };
}

export function validateNewPassword(newPassword) {
  const parsed = passwordStrengthSchema.safeParse(newPassword);
  return parsed.success
    ? { valid: true, data: parsed.data }
    : { valid: false, error: parsed.error.issues[0]?.message || 'Invalid password.' };
}
