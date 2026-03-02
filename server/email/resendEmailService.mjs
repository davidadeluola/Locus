import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error('RESEND_API_KEY is required.');
}

const resend = new Resend(resendApiKey);
const defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendPlatformEmail({ to, subject, html }) {
  if (!to || !subject || !html) {
    throw new Error('to, subject, and html are required');
  }

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  return data;
}
