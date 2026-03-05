# Locus — Real-Time Attendance Management System

Locus is a web-based attendance management platform built for educational institutions. It enables lecturers to create time-limited attendance sessions and students to check in using a one-time password (OTP) combined with geolocation verification — all in real time.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Supabase Keep-Alive Cron](#supabase-keep-alive-cron)
- [Contributing](#contributing)

---

## Overview

Locus replaces manual paper-based or spreadsheet roll-calls with a seamless digital workflow:

1. A **lecturer** starts an attendance session for one of their courses, choosing how long the session lasts (e.g. 5 minutes). Locus generates a 6-digit OTP and displays it to the class.
2. **Students** open the attendance portal, enter the OTP, and allow the browser to capture their location.
3. Locus validates the OTP, confirms the student is within range of the classroom, and records the check-in — all in real time.

Both roles get live dashboards powered by Supabase real-time subscriptions so stats update the moment a student checks in.

---

## Features

### For Lecturers
- **Course management** — create and manage multiple courses with codes, titles, departments, and levels.
- **Session creation** — launch a timed OTP-based attendance session for any course in one click.
- **Live attendance list** — watch students check in as it happens without refreshing the page.
- **Dashboard analytics** — overall attendance rate, total sessions, active session count, and per-session performance.
- **Student roster** — view all enrolled students across all courses.
- **Attendance audit** — review full historical attendance logs per course.
- **Export** — download attendance records as CSV or Excel (`.xlsx`).

### For Students
- **OTP check-in** — enter the 6-digit code displayed by the lecturer plus allow location capture.
- **Geolocation validation** — the system confirms the student is physically present within an acceptable radius of the classroom before recording attendance.
- **Attendance history** — view all past check-ins with timestamps and locations.
- **Attendance statistics** — total classes attended, overall attendance rate, and most recent check-in details.
- **Course resources** — access course-related material shared by the lecturer.

### General
- **Role-based access** — separate lecturer and student dashboards with distinct capabilities.
- **Authentication** — email/password sign-up, login, forgot/reset password, and OAuth callback support.
- **Onboarding flow** — guided setup for new users to complete their profile and role selection.
- **Responsive design** — fully usable on desktop and mobile browsers.
- **Animated UI** — smooth transitions powered by Framer Motion.
- **Toast notifications** — non-intrusive feedback for every user action.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [Vite 7](https://vite.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Routing | [React Router v7](https://reactrouter.com) |
| State management | [Zustand](https://zustand-demo.pmnd.rs) |
| Backend / Database | [Supabase](https://supabase.com) (PostgreSQL + real-time) |
| Authentication | Supabase Auth |
| Forms & validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Icons | [Lucide React](https://lucide.dev) |
| Export | [ExcelJS](https://github.com/exceljs/exceljs) (styled `.xlsx`), [xlsx / SheetJS](https://sheetjs.com) (raw `.xlsx`), [csv](https://csv.js.org) (`.csv`) |
| Email | [Resend](https://resend.com) |
| Date utilities | [date-fns](https://date-fns.org) |
| Testing | [Vitest](https://vitest.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later (v20+ recommended; comes with npm v10)
- **npm** v8 or later
- A [Supabase](https://supabase.com) project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/davidadeluola/Locus.git
cd Locus

# 2. Install dependencies
npm install

# 3. Copy the example environment file and fill in your values
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase — required for the app to work
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Keep-alive cron (server-side only — not exposed to the browser)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Optional keep-alive overrides
KEEPALIVE_CRON=0 3 * * *
KEEPALIVE_PING_INTERVAL_SECONDS=10
KEEPALIVE_RUN_WINDOW_SECONDS=60
KEEPALIVE_TABLE=classes
```

> **Security note:** Only variables prefixed with `VITE_` are bundled into the browser build. Never put secrets (service role keys, API tokens) in `VITE_` variables.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server (hot module replacement) |
| `npm run build` | Create an optimised production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across all source files |
| `npm run test` | Run the test suite once with Vitest |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run keepalive:cron` | Start the Supabase keep-alive background worker |

---

## Project Structure

```
Locus/
├── public/               # Static assets (favicon, fonts)
├── server/
│   └── keepalive/        # Supabase keep-alive cron worker
├── src/
│   ├── api/              # Low-level API helpers
│   ├── components/       # Shared/reusable UI components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── shared/       # Layout, ProtectedRoute, etc.
│   │   └── ui/           # Generic UI primitives (buttons, badges, etc.)
│   ├── context/          # React context providers (AuthContext)
│   ├── features/         # Feature-based modules
│   │   ├── attendance/   # OTP portal, verification, attendance list
│   │   ├── auth/         # Login, Signup, ForgotPassword
│   │   ├── courses/      # Course management services
│   │   ├── dashboard/    # Lecturer & Student dashboards
│   │   ├── onboarding/   # New-user onboarding flow
│   │   └── sessions/     # Session creation & management
│   ├── hooks/            # Custom React hooks (data fetching, realtime)
│   ├── lib/
│   │   └── utils/        # Utility functions (attendance, formatting)
│   ├── pages/            # Top-level page components and auth callbacks
│   ├── repositories/     # Repository pattern wrappers (data access layer)
│   ├── routes/           # App route definitions
│   ├── services/         # Supabase client, repository implementations, realtime manager
│   ├── store/            # Zustand global stores
│   ├── styles/           # Global CSS overrides
│   └── types/            # Shared type definitions
├── supabase/             # Supabase SQL migrations and RLS policies
├── index.html
├── vite.config.js
├── vitest.config.js
├── eslint.config.js
└── vercel.json
```

---

## How It Works

### Attendance Flow

```
Lecturer creates session
        │
        ▼
Supabase generates OTP + expiry timestamp
        │
        ▼
OTP displayed in Lecturer Dashboard (live countdown timer)
        │
        ▼
Student enters OTP + allows geolocation capture
        │
        ▼
Server validates: OTP correct? Session active? Student in range?
        │
   ┌────┴────┐
  YES        NO
   │          │
Check-in   Error feedback
recorded   shown to student
   │
   ▼
Real-time update pushes new check-in to Lecturer Dashboard
```

### Real-Time Architecture

Locus uses **Supabase Postgres real-time change subscriptions** to push live updates without polling. A central `realtimeSubscriptionManager` handles channel lifecycle and deduplication, ensuring components subscribe and unsubscribe cleanly.

### Geolocation Validation

When a student submits attendance, the browser captures their GPS coordinates. Locus computes the distance between the student's location and the session's registered classroom coordinates. If the student is outside the configured radius, the check-in is rejected with an `OUT_OF_RANGE` error.

---

## Deployment

Locus is configured for one-click deployment to **Vercel**. The `vercel.json` at the project root rewrites all routes to `index.html` to support client-side routing.

**Steps:**

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add the required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Vercel will automatically run `npm run build` and serve the `dist/` output.

---

## Supabase Keep-Alive Cron

Free-tier Supabase projects pause after a period of inactivity. The keep-alive worker prevents this by sending lightweight queries on a configurable schedule.

```bash
npm run keepalive:cron
```

Optional environment variable overrides:

| Variable | Default | Description |
|---|---|---|
| `SUPABASE_URL` | — | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Service role key (preferred over anon key) |
| `SUPABASE_ANON_KEY` | — | Fallback if service role key is absent |
| `KEEPALIVE_CRON` | `0 3 * * *` | Cron schedule expression |
| `KEEPALIVE_PING_INTERVAL_SECONDS` | `10` | Interval between pings within a run window |
| `KEEPALIVE_RUN_WINDOW_SECONDS` | `60` | Duration of each cron run |
| `KEEPALIVE_TABLE` | `classes` | Table queried for the keep-alive ping |

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository and create a feature branch (`git checkout -b feat/your-feature`).
2. Make your changes and ensure the linter passes (`npm run lint`).
3. Add or update tests where applicable (`npm run test`).
4. Open a pull request describing your changes.

---

*Built with ❤️ using React, Supabase, and Tailwind CSS.*
