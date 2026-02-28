import { AppError } from './customErrors.js';

export function handleError(err, { capture = () => {} } = {}) {
  // Normalize error to AppError
  let out = err;
  if (!(err instanceof AppError)) {
    out = new AppError(err.message || 'Unknown error', { details: err });
  }

  // Capture to monitoring (Sentry stub or provided capture fn)
  try {
    capture(out);
  } catch (_) {
    // ignore capture errors
  }

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[AppError]', out);
  }

  return out;
}
// Simple error handler skeleton
export function handleError(err) {
  // Integrate with Sentry or other logging here
  console.error(err);
}
