// Placeholder validation schemas. Replace with Zod or Joi as needed.
export function validateCreateSession(data) {
  if (!data || !data.title) return { valid: false, error: 'title required' };
  return { valid: true };
}
