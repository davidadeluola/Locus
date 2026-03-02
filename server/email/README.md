# Resend Email Service

This folder contains a server-side Resend service used by your platform to send OTP and auth notification emails.

## Important

- Never expose `RESEND_API_KEY` in frontend code.
- Set secrets in your backend runtime environment.
- Rotate any key that has ever been committed or shared in client code.

## Environment Variables

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (optional, defaults to `onboarding@resend.dev`)

## Suggested endpoint contract

Create a backend endpoint (`POST /api/email/send`) that receives:

```json
{
  "type": "signup-otp | forgot-password-otp | reset-password-otp | password-updated",
  "to": "user@example.com",
  "subject": "...",
  "html": "..."
}
```

For the new feature-flagged auth triggers, support lightweight event payloads too:

```json
{
  "type": "signup-otp-requested | forgot-password-otp-requested | reset-password-otp-requested",
  "to": "user@example.com"
}
```

Your backend can then generate/fetch OTP server-side and send via Resend securely.

Then call `sendPlatformEmail` from `resendEmailService.mjs`.

The frontend `emailRepository` already posts to this endpoint and can be configured with:

- `VITE_EMAIL_ENDPOINT` (default: `/api/email/send`)
- `VITE_ENABLE_PLATFORM_EMAIL` (`true` to enable client-side trigger calls)
