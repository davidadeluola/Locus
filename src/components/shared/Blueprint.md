# Locus Project Blueprint

## 📁 src/

├── 📂 api/
│ ├── supabase.js # Supabase client initialization
│ └── edge.js # Wrappers for Edge Functions (Haversine)
├── 📂 components/
│ ├── 📂 ui/ # Atomic Zinc components (Button, Input, Card)
│ └── 📂 shared/ # Navbar, ProtectedRoute, Footer
├── 📂 features/ # Feature-based logic
│ ├── 📂 auth/ # Google OAuth & Role persistence
│ ├── 📂 onboarding/ # School, Faculty, & Dept selection
│ ├── 📂 attendance/ # QR Scanner, Session Link, & GPS logic
│ └── 📂 dashboard/ # Lecturer controls & Real-time logs
├── 📂 hooks/
│ ├── useLocus.js # Shared app state (User/School/Role)
│ ├── useGeolocation.js # Browser GPS tracking logic
│ └── useRealtime.js # Live attendance log subscriptions
├── 📂 layouts/
│ ├── RootLayout.jsx # Theme wrapper (Zinc-950)
│ └── DashboardLayout.jsx # Auth wrapper with Sidebar
├── 📂 lib/
│ ├── 📂 schemas/ # Zod validation (Profile, Session)
│ ├── 📂 utils/ # Haversine math & data formatting
│ └── constants.js # Brand colors & School list
├── 📂 pages/ # Route definitions
│ ├── Login.jsx # Entry point
│ ├── Onboarding.jsx # Profile completion
│ ├── Scanner.jsx # Student scan view
│ └── SessionView.jsx # Lecturer live view
└── 📂 styles/
└── globals.css # Tailwind + JetBrains Mono
