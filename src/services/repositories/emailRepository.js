const EMAIL_ENDPOINT = import.meta.env.VITE_EMAIL_ENDPOINT || '/api/email/send';
const EMAIL_FEATURE_ENABLED = import.meta.env.VITE_ENABLE_PLATFORM_EMAIL === 'true';

function renderOtpTemplate({ title, intro, otp, footer }) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-inline-size: 560px; margin: 0 auto; color: #18181b;">
      <h2 style="margin-block-end: 8px;">${title}</h2>
      <p style="margin: 0 0 16px; color: #3f3f46;">${intro}</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 10px; padding: 12px 16px; text-align: center; color: #9a3412;">
        ${otp}
      </div>
      <p style="margin-block-start: 16px; color: #52525b; font-size: 14px;">${footer}</p>
    </div>
  `;
}

async function sendEmail(payload) {
  if (!EMAIL_FEATURE_ENABLED) {
    return { skipped: true, reason: 'feature-disabled' };
  }

  const response = await fetch(EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error || 'Failed to send email.';
    throw new Error(message);
  }

  return data;
}

async function safeSend(payload) {
  try {
    return await sendEmail(payload);
  } catch (error) {
    console.warn('emailRepository: email dispatch failed', error?.message || error);
    return { skipped: true, reason: 'dispatch-failed' };
  }
}

const emailRepository = {
  isEnabled() {
    return EMAIL_FEATURE_ENABLED;
  },

  requestSignupOtpEmail({ to }) {
    return safeSend({
      type: 'signup-otp-requested',
      to,
    });
  },

  requestForgotPasswordOtpEmail({ to }) {
    return safeSend({
      type: 'forgot-password-otp-requested',
      to,
    });
  },

  requestResetPasswordOtpEmail({ to }) {
    return safeSend({
      type: 'reset-password-otp-requested',
      to,
    });
  },

  sendSignupOtp({ to, otp }) {
    return safeSend({
      type: 'signup-otp',
      to,
      subject: 'Your Locus signup OTP',
      html: renderOtpTemplate({
        title: 'Verify your account',
        intro: 'Use this one-time code to complete your sign up.',
        otp,
        footer: 'This OTP expires shortly. If you did not request this, ignore this email.',
      }),
    });
  },

  sendForgotPasswordOtp({ to, otp }) {
    return safeSend({
      type: 'forgot-password-otp',
      to,
      subject: 'Your Locus password reset OTP',
      html: renderOtpTemplate({
        title: 'Reset your password',
        intro: 'Use this one-time code to continue your password reset.',
        otp,
        footer: 'If this request was not made by you, secure your account immediately.',
      }),
    });
  },

  sendPasswordResetOtp({ to, otp }) {
    return safeSend({
      type: 'reset-password-otp',
      to,
      subject: 'Your Locus reset confirmation OTP',
      html: renderOtpTemplate({
        title: 'Confirm password reset',
        intro: 'Use this OTP to confirm your new password change.',
        otp,
        footer: 'Never share this code with anyone.',
      }),
    });
  },

  sendPasswordUpdatedNotice({ to }) {
    return safeSend({
      type: 'password-updated',
      to,
      subject: 'Your Locus password was changed',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-inline-size: 560px; margin: 0 auto; color: #18181b;">
          <h2>Password updated</h2>
          <p style="color: #3f3f46;">Your password was changed successfully.</p>
          <p style="color: #52525b; font-size: 14px;">If you did not perform this action, contact support immediately.</p>
        </div>
      `,
    });
  },
};

export default emailRepository;
