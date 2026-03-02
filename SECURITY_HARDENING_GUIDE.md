# Security Hardening Guide (Auth)

This project uses a Vite frontend with Supabase Auth. The client-side hardening below is implemented in code. For full protection, backend/edge controls must also be enforced.

## Implemented in this repo

- Input validation for login and reset flows using `zod` schemas:
  - `src/lib/schemas/authSchemas.js`
- Client-side request throttling (best-effort) for:
  - Login attempts
  - Forgot-password OTP requests
  - OTP verify/reset attempts
  - Implemented in `src/lib/security/rateLimiter.js`
- Stronger password validation for reset/update (min length + letter + number)

## Required backend controls (must enforce server-side)

## 1) JWT hardening

- Validate JWT on every protected endpoint using Supabase JWT verification or your API gateway.
- Enforce audience/issuer checks and token expiry.
- Prefer short-lived access tokens and refresh-token rotation.
- Never trust role/permission from client state alone; enforce RBAC from claims or DB checks server-side.

## 2) Rate limiting (authoritative)

- Add server-side/IP + account-based rate limits for:
  - Login
  - Forgot password request
  - OTP verification/reset
- Recommended baseline:
  - Login: 10 attempts / 15 minutes per email+IP
  - Forgot password request: 3 attempts / 15 minutes per email+IP
  - Reset verification: 5 attempts / 15 minutes per email+IP
- Add lockout/backoff and monitoring alerts.

## 3) CSRF protection

- If using cookie-based auth on custom backend endpoints:
  - Use SameSite=Lax or Strict cookies
  - Add anti-CSRF token (double-submit token or synchronizer token)
  - Validate Origin and Referer headers on state-changing requests
- For pure bearer token APIs, CSRF risk is lower, but still validate Origin for browser calls.

## 4) CORS policy

- Restrict allowed origins to production frontend domains only.
- Restrict methods/headers to required minimum.
- Do not use wildcard origins with credentials.
- Keep separate CORS configs for dev/staging/prod.

## 5) Validation and sanitization

- Re-validate all inputs server-side (never rely on client checks).
- Canonicalize emails and enforce password policy on backend.
- Avoid user enumeration in forgot/reset responses.

## Suggested next implementation target

If you add a backend/edge service (Express, Supabase Edge Function, or API gateway), implement:

1. Server-side rate limiter middleware
2. JWT verification middleware
3. Strict CORS allowlist
4. CSRF middleware for cookie-auth endpoints
5. Central schema validation (zod/joi) on all auth handlers
