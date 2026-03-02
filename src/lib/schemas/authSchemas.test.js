import { describe, expect, test } from 'vitest';
import {
  validateLoginInput,
  validateResetEmail,
  validateResetOtpAndPassword,
} from './authSchemas';

describe('authSchemas', () => {
  test('validates login payload', () => {
    const result = validateLoginInput('user@example.com', 'password123');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid email for reset', () => {
    const result = validateResetEmail('bad-email');
    expect(result.valid).toBe(false);
  });

  test('validates reset otp payload', () => {
    const result = validateResetOtpAndPassword('user@example.com', '123456', 'abc12345');
    expect(result.valid).toBe(true);
  });
});
