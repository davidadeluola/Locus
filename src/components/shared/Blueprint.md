# Locus Project Blueprint

## 📁 Project Structure

```
src/
├── 📂 api/
│   └── supabase.js                 # Supabase client initialization
│
├── 📂 assets/                      # Static assets (images, icons)
│
├── 📂 components/
│   ├── 📂 auth/                    # Auth-specific UI components
│   │   ├── ResetRequest.jsx        # Password reset request component
│   │   └── SocialAuth.jsx          # Google OAuth button component
│   │
│   ├── 📂 Landing/                 # Landing page sections
│   │   ├── HeroSection.jsx         # Hero with geolocation intro & animations
│   │   ├── Process.jsx             # How-it-works section with animated QR scanner
│   │   ├── Features.jsx            # Core capabilities showcase with animations
│   │   ├── Faqs.jsx                # FAQ accordion with smooth expand/collapse
│   │   └── index.jsx               # Landing page container
│   │
│   ├── 📂 shared/                  # Shared/global components
│   │   ├── Navbar.jsx              # Navigation with scroll-based active section
│   │   ├── Footer.jsx              # Footer with geolocation widget
│   │   ├── Layout.jsx              # Root layout wrapper (Navbar + Outlet + Footer)
│   │   ├── ProtectedRoute.jsx      # Auth guard for protected routes
│   │   ├── Blueprint.md            # This file
│   │   └── Rules.md                # Development rules and conventions
│   │
│   └── 📂 ui/                      # Atomic/reusable UI components
│       └── Preloader.jsx           # App initialization preloader with scanner animation
│
├── 📂 features/                    # Feature-based modules
│   ├── 📂 auth/                    # Authentication feature
│   │   ├── Login.jsx               # Login page orchestrator
│   │   ├── Signup.jsx              # Signup page orchestrator
│   │   ├── ForgotPassword.jsx      # Password recovery page
│   │   ├── 📂 components/          # Auth UI components
│   │   │   ├── login/
│   │   │   │   └── LoginFormCard.jsx    # Login form UI with Google OAuth
│   │   │   ├── OtpVerificationCard.jsx  # OTP input screen
│   │   │   ├── PasswordInput.jsx        # Password field with show/hide toggle
│   │   │   ├── RoleQuestionsCard.jsx    # Role-specific onboarding questions
│   │   │   └── SignupFormCard.jsx       # Signup form with role selection
│   │   ├── 📂 hooks/               # Auth-specific hooks
│   │   │   ├── useLoginFlow.js          # Login state & password/Google login
│   │   │   ├── useSignupFlow.js         # Signup state, OTP verification, profile upsert
│   │   │   └── useUser.js               # User profile hook (deprecated - moved to src/hooks)
│   │   └── 📂 services/            # Auth service layer
│   │       ├── loginService.js          # Login API calls
│   │       └── signupService.js         # Signup, OTP, profile upsert logic
│   │
│   ├── 📂 attendance/              # Attendance tracking feature (future)
│   │
│   ├── 📂 dashboard/               # Dashboard feature
│   │   ├── DashboardRouter.jsx     # Routes to Student/Lecturer dashboard based on role
│   │   ├── DashboardLayout.jsx     # Dashboard layout wrapper (Sidebar + Header + Content)
│   │   ├── Sidebar.jsx             # Role-based navigation sidebar
│   │   ├── StudentDashboard.jsx    # Student dashboard with class code entry & stats
│   │   └── LecturerDashboard.jsx   # Lecturer dashboard with session management
│   │
│   └── 📂 onboarding/              # Onboarding feature
│       └── OnboardingFlow.jsx      # Role selection & profile completion for new users
│
├── 📂 hooks/                       # Global/shared hooks
│   ├── useActiveSection.js         # Scroll-based nav section highlighting
│   ├── useForm.js                  # Form state management helper
│   ├── useGeolocation.js           # Browser GPS tracking with loading/error states
│   ├── useGoogleAuth.js            # Google OAuth sign-in hook
│   ├── useMouseGlow.js             # Mouse glow interaction effect
│   ├── usePasswordUpdate.js        # Password reset/update logic
│   └── useUser.js                  # User profile & logout hook (uses authStore)
│
├── 📂 layouts/                     # Layout wrappers (currently empty)
│
├── 📂 lib/                         # Utilities and data
│   ├── 📂 constants/
│   │   └── brands.js
│   ├── 📂 data/
│   │   ├── features.jsx            # Features section data
│   │   ├── howitworks.jsx          # Process section data
│   │   ├── howitworks.js
│   │   ├── schools.json            # Schools data for signup
│   │   ├── faqData.jsx             # FAQ section data
│   │   └── footerGeo.jsx           # Footer geolocation data
│   ├── 📂 schemas/                 # Validation schemas
│   └── 📂 utils/                   # Utility functions
│
├── 📂 pages/                       # Top-level page components
│   └── 📂 auth/
│       ├── AuthCallback.jsx        # OAuth callback handler (Google sign-in redirect)
│       └── UpdatePassword.jsx      # Password update page (after reset link)
│
├── 📂 routes/
│   └── AppRoutes.jsx               # Main app routing configuration
│
├── 📂 store/
│   └── authStore.jsx               # Zustand auth state (user, profile, loading, signOut)
│
├── 📂 styles/
│   ├── animations.css              # CSS animations (scanner effect for preloader)
│   └── author.css                  # Custom font styles
│
├── App.jsx                         # Root app component with preloader integration
├── App.css                         # Global app styles
├── index.css                       # Tailwind imports + global styles + animations
└── main.jsx                        # React entry point
```

## 🔑 Key Patterns & Conventions

### Feature-Based Architecture
- **Features** (`src/features/`) are self-contained modules with components, hooks, and services
- Each feature owns its business logic and UI components
- Shared components live in `src/components/`

### Authentication Flow
1. **Signup**: Email + password → OTP verification → profile upsert → dashboard
2. **Google OAuth**: Redirect → AuthCallback → check onboarding → route to onboarding or dashboard
3. **Login**: Email + password OR Google → dashboard (if onboarded) OR onboarding
4. **Password Recovery**: Request reset → email link → UpdatePassword page

### Dashboard Architecture
- **DashboardRouter**: Determines which dashboard to render based on `profile.role`
- **DashboardLayout**: Wraps dashboard content with Sidebar + Header
  - Sidebar management: `isCollapsed` state, toggle button (desktop), overlay menu (mobile)
  - Time-based greeting: "Good Morning/Afternoon/Evening, {firstName}" (updates every 60s)
  - Responsive design: Mobile menu overlay, desktop sidebar, hide/show sidebar
- **Sidebar**: Role-based navigation (student vs lecturer menus)
  - Collapsible: Shows icons only when collapsed, full labels when expanded
  - Toggle button: ChevronLeft/Right icon positioned at right edge
  - Active route highlighting: Orange left border and background tint
  - User footer: Avatar, name, logout (responsive to collapse state)
  - Mobile: Tooltips for all menu items when collapsed
- **StudentDashboard**: Class code entry, stats, recent check-ins
  - **Charts (recharts)**: AreaChart for attendance trend (6 weeks with gradient fill)
  - **Course Performance**: Progress bars with percentage completion
  - **Stats Grid**: 4-column desktop (Today, Rate, Sessions, Target), 2-column mobile
  - **Responsive**: Text sizes, padding, grid columns adjust for mobile/tablet/desktop
- **LecturerDashboard**: Session management, live session code, analytics
  - **Charts (recharts)**: LineChart for attendance trend (6 weeks), BarChart for course comparison
  - **Live Session**: Access code display, student count, action buttons (End/Regenerate)
  - **Quick Actions**: Export CSV, Email students, View analytics
  - **Recent Sessions**: Timeline of last 3 sessions with attendance rates
  - **Stats Grid**: 4-column (Students, Courses, Avg Rate, Sessions)

### State Management
- **Zustand** (`authStore.jsx`): Global auth state (user, profile, loading, signOut)
- **Local hooks**: Feature-specific state management (e.g., `useSignupFlow`, `useLoginFlow`)

### Routing
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/auth/callback` - OAuth callback handler
- `/forgot-password` - Password reset request
- `/update-password` - Password update page
- `/onboarding` - New user onboarding (role selection + profile details)
- `/dashboard` - Role-based dashboard (protected route)

### Protected Routes
- **ProtectedRoute** component checks:
  1. User authentication
  2. Onboarding completion (`profile.is_onboarded`)
  3. Role authorization (if `allowedRoles` specified)

### Styling
- **Tailwind CSS**: Utility-first styling
- **Design System**: 
  - Primary: Orange (#FF4D00)
  - Background: Zinc-950 (#09090b)
  - Cards: Zinc-900 with zinc-800 borders
  - Mono font for technical labels
  - Rounded-2xl for cards, rounded-xl for buttons/inputs

## 📝 Development Notes

### Onboarding Logic
- Skip role selection if `profile.role` already exists (OAuth users with pre-filled role)
- Collect role-specific fields:
  - **Student**: Matric number
  - **Lecturer**: Staff ID
- Redirect to dashboard after completion

### Auth Store Initialization
- `App.jsx` shows preloader while `authStore.loading === true`
- Auth store fetches user + profile on mount
- Listens to Supabase auth state changes (login, logout, token refresh)

### Geolocation
- `useGeolocation` hook provides `{ latitude, longitude, loading, error }`
- Used in HeroSection and Footer for live location display

### Scripts
- `scripts/transform-schools.mjs` - Process and deduplicate schools data
- `scripts/uploadData.js` - Upload schools to Supabase
- `scripts/fix-duplicate-schools.mjs` - Fix duplicate school entries

## 🚀 Next Steps / TODOs
- [ ] Implement real attendance tracking (QR code generation, geofencing)
- [ ] Build lecturer session management (create, end, regenerate codes)
- [ ] Add analytics/reporting dashboards
- [ ] Implement real-time attendance updates (Supabase Realtime)
- [ ] Add course management UI
- [ ] Build student attendance history view
- [ ] Add notification system
- [ ] Implement search functionality in dashboards

## 📁 src/

```
├── 📂 api/
│ └── supabase.js # Supabase client initialization
├── 📂 assets/ # Static assets
├── 📂 components/
│ ├── 📂 Landing/ # Landing page sections
│ │ ├── HeroSection.jsx # Hero with geolocation intro & animations
│ │ ├── Process.jsx # How-it-works section with animated QR scanner visual
│ │ ├── Features.jsx # Core capabilities showcase with smooth animations
│ │ ├── Faqs.jsx # FAQ accordion section with smooth expand/collapse
│ │ └── index.jsx # Landing page container
│ ├── 📂 shared/ # Shared components
│ │ ├── Navbar.jsx # Navigation with active section highlighting on scroll
│ │ ├── Footer.jsx # Footer with geolocation widget
│ │ ├── Layout.jsx # Root layout wrapper
│ │ ├── ProtectedRoute.jsx # Auth guard for protected routes
│ │ └── Blueprint.md # This file
│ └── 📂 ui/ # Atomic UI components
├── 📂 features/ # Feature modules
│ ├── 📂 auth/
│ ├── 📂 onboarding/
│ ├── 📂 attendance/
│ └── 📂 dashboard/
├── 📂 hooks/
│ ├── useGeolocation.js # Browser GPS tracking with loading/error states
│ ├── useActiveSection.js # Scroll-based nav section highlighting
│ └── useMouseGlow.js # Mouse glow interaction hook
├── 📂 layouts/
├── 📂 lib/
│ ├── 📂 constants/
│ │ └── brands.js
│ ├── 📂 data/
│ │ ├── features.jsx
│ │ ├── howitworks.jsx
│ │ ├── howitworks.js
│ │ ├── schools.json
│ │ ├── faqData.jsx
│ │ └── footerGeo.jsx
│ ├── 📂 schemas/
│ └── 📂 utils/
├── 📂 pages/
├── 📂 routes/
│ └── AppRoutes.jsx
├── 📂 styles/
│ └── author.css
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Notes

- Landing page is assembled in `components/Landing/index.jsx`.
- Section navigation highlighting is powered by `hooks/useActiveSection.js` and `components/shared/Navbar.jsx`.
- Geolocation logic is centralized in `hooks/useGeolocation.js` and consumed by hero/footer visuals.
