import { describe, expect, test } from 'vitest';
import { consumeRateLimit, resetRateLimit } from './rateLimiter';

describe('rateLimiter', () => {
  test('allows within limit and blocks when exceeded', () => {
    const key = 'unit-rate-limit';
    resetRateLimit(key);

    const first = consumeRateLimit(key, { maxAttempts: 2, windowMs: 60_000 });
    const second = consumeRateLimit(key, { maxAttempts: 2, windowMs: 60_000 });
    const third = consumeRateLimit(key, { maxAttempts: 2, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });
});
