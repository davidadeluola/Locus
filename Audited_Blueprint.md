# LOCUS PROJECT - AUDITED ARCHITECTURE BLUEPRINT
**Version**: 1.0 | **Date**: February 22, 2026  
**Based on**: Comprehensive Architectural Audit & SOLID Principles  
**Purpose**: File & Folder Structure Guide for 90-Day Hardening Roadmap

---

## ARCHITECTURAL OVERVIEW

This blueprint outlines a **3-Layer Architecture** that enforces:
- ✅ **SOLID Principles** (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- ✅ **DRY** (Don't Repeat Yourself) - Centralized utilities and services
- ✅ **YAGNI** (You Aren't Gonna Need It) - Only what's needed now
- ✅ **KISS** (Keep It Simple, Stupid) - Simple, clear structure

```
DATA ACCESS LAYER (Closest to external systems)
    ↓ (One-way dependency)
BUSINESS LOGIC LAYER (Domain operations & state)
    ↓
PRESENTATION LAYER (React components & UI)
    ↓
ROUTING LAYER (Application entry point)

Each layer is independently testable and replaceable.
```

---

## COMPLETE FILE STRUCTURE

```
locus/
│
├── index.html                              # App entry point
├── vite.config.js                          # Vite build config
├── eslint.config.js                        # Linting rules
├── package.json                            # Dependencies
├── .env.example                            # Environment template
├── .env.local                              # Local secrets (git-ignored)
│
├── public/                                 # Static assets
│   └── fonts/
│       └── author/
│           ├── OTF/
│           ├── TTF/
│           └── WEB/
│               ├── css/
│               └── fonts/
│
├── src/                                    # Application source code
│   │
│   ├── main.jsx                            # React app mount point
│   ├── App.jsx                             # Root app component
│   ├── App.css                             # Root styles
│   ├── index.css                           # Global styles
│   │
│   │
│   │ ╔════════════════════════════════════════════════════════════╗
│   │ ║ LAYER 1: DATA ACCESS LAYER                                 ║
│   │ ║ (Interfaces with Supabase, external APIs, storage)         ║
│   │ ╚════════════════════════════════════════════════════════════╝
│   │
│   ├── api/                                # External service connectors
│   │   ├── supabaseClient.js               # Supabase config & initialization
│   │   └── httpClient.js                   # HTTP client (if using REST APIs)
│   │
│   ├── services/
│   │   │
│   │   ├── repositories/                   # Repository Pattern - Decouples from Supabase
│   │   │   ├── baseRepository.js           # Abstract base for all repos
│   │   │   ├── courseRepository.js         # All courses queries
│   │   │   ├── sessionRepository.js        # All sessions queries
│   │   │   ├── attendanceRepository.js     # All attendance queries
│   │   │   ├── enrollmentRepository.js     # All enrollments queries
│   │   │   ├── profileRepository.js        # All profiles queries
│   │   │   ├── userRepository.js           # All user/auth queries
│   │   │   └── README.md                   # Repository pattern docs
│   │   │
│   │   ├── subscriptions/                  # Real-time Subscriptions (DRY pattern)
│   │   │   ├── subscriptionManager.js      # Centralized subscription handler
│   │   │   ├── courseSubscription.js       # Courses real-time logic
│   │   │   ├── sessionSubscription.js      # Sessions real-time logic
│   │   │   ├── attendanceSubscription.js   # Attendance real-time logic
│   │   │   ├── enrollmentSubscription.js   # Enrollments real-time logic
│   │   │   └── README.md                   # Subscription pattern docs
│   │   │
│   │   └── persistence/                    # Storage abstraction
│   │       ├── storageManager.js           # localStorage vs sessionStorage
│   │       └── cacheManager.js             # In-memory cache with TTL
│   │
│   │
│   │ ╔════════════════════════════════════════════════════════════╗
│   │ ║ LAYER 2: BUSINESS LOGIC & STATE LAYER                      ║
│   │ ║ (Domain operations, calculations, validation, state mgmt)  ║
│   │ ╚════════════════════════════════════════════════════════════╝
│   │
│   ├── services/
│   │   │
│   │   ├── domain/                         # Domain-specific business logic
│   │   │   ├── attendanceService.js        # Attendance calculations & validation
│   │   │   ├── sessionService.js           # Session lifecycle rules
│   │   │   ├── courseService.js            # Course business rules
│   │   │   ├── authService.js              # Auth logic & permissions
│   │   │   ├── enrollmentService.js        # Enrollment rules
│   │   │   ├── geoService.js               # Geolocation calculations
│   │   │   └── README.md                   # Business logic docs
│   │   │
│   │   ├── errors/                         # Error handling (DRY)
│   │   │   ├── errorHandler.js             # Centralized error handling
│   │   │   ├── errorBoundary.js            # React error boundary logic
│   │   │   ├── errorLogger.js              # Error logging & Sentry integration
│   │   │   ├── customErrors.js             # Custom error classes
│   │   │   └── errorMessages.js            # Error message constants
│   │   │
│   │   └── cache/                          # INC: Profile & data caching
│   │       ├── profileCacheService.js      # Profile caching with TTL
│   │       ├── sessionCacheService.js      # Session state caching
│   │       └── courseCacheService.js       # Course data caching
│   │
│   ├── store/                              # State management (Zustand)
│   │   ├── rootStore.js                    # Single source of truth
│   │   ├── slices/
│   │   │   ├── authSlice.js                # Auth state
│   │   │   ├── courseSlice.js              # Course state
│   │   │   ├── sessionSlice.js             # Session state
│   │   │   ├── attendanceSlice.js          # Attendance state
│   │   │   ├── enrollmentSlice.js          # Enrollment state
│   │   │   └── uiSlice.js                  # UI state (modals, notifications)
│   │   ├── selectors/
│   │   │   ├── authSelectors.js            # Auth state selectors
│   │   │   ├── courseSelectors.js          # Course state selectors
│   │   │   ├── sessionSelectors.js         # Session state selectors
│   │   │   └── README.md                   # Selector pattern docs
│   │   └── README.md                       # Store architecture docs
│   │
│   ├── types/                              # Type definitions (interfaces, JSDoc)
│   │   ├── auth.types.js                   # Auth types & interfaces
│   │   ├── course.types.js                 # Course types
│   │   ├── session.types.js                # Session types
│   │   ├── attendance.types.js             # Attendance types
│   │   ├── enrollment.types.js             # Enrollment types
│   │   ├── user.types.js                   # User types
│   │   └── common.types.js                 # Shared types (enums, constants)
│   │
│   ├── lib/                                # Utility functions & helpers
│   │   │
│   │   ├── utils/                          # Pure utility functions (DRY)
│   │   │   ├── dateUtils.js                # Date/time operations
│   │   │   ├── geoUtils.js                 # Geolocation calculations
│   │   │   ├── csvUtils.js                 # CSV export/import
│   │   │   ├── formatters.js               # Data formatters
│   │   │   ├── validators.js               # Common validators
│   │   │   ├── arrayUtils.js               # Array operations
│   │   │   ├── objectUtils.js              # Object operations
│   │   │   ├── stringUtils.js              # String operations
│   │   │   └── README.md                   # Utils reference
│   │   │
│   │   ├── constants/                      # Global constants
│   │   │   ├── apiEndpoints.js             # API endpoints
│   │   │   ├── errorMessages.js            # Error messages
│   │   │   ├── validationRules.js          # Form validation rules
│   │   │   ├── permissions.js              # User role permissions
│   │   │   ├── geoLimits.js                # Geolocation limits
│   │   │   ├── sessionConfig.js            # Session configuration
│   │   │   ├── brands.js                   # Brand constants
│   │   │   ├── env.js                      # Environment config
│   │   │   └── README.md                   # Constants guide
│   │   │
│   │   ├── schemas/                        # Data validation schemas (Zod)
│   │   │   ├── authSchemas.js              # Auth validation schemas
│   │   │   ├── courseSchemas.js            # Course validation schemas
│   │   │   ├── sessionSchemas.js           # Session validation schemas
│   │   │   ├── attendanceSchemas.js        # Attendance validation schemas
│   │   │   ├── enrollmentSchemas.js        # Enrollment validation schemas
│   │   │   ├── formSchemas.js              # Form submission schemas
│   │   │   └── README.md                   # Schema validation guide
│   │   │
│   │   └── data/                           # Static data files
│   │       ├── schools.json                # Schools list
│   │       ├── departments.json            # Departments list
│   │       ├── faqData.jsx                 # FAQ data
│   │       ├── featuresData.jsx            # Features list
│   │       ├── footerGeoData.jsx           # Footer geodata
│   │       └── navigationData.js           # Nav menu structure
│   │
│   │
│   │ ╔════════════════════════════════════════════════════════════╗
│   │ ║ LAYER 3: PRESENTATION LAYER                                ║
│   │ ║ (React components, UI, routing)                            ║
│   │ ╚════════════════════════════════════════════════════════════╝
│   │
│   ├── hooks/                              # Custom React hooks
│   │   │
│   │   ├── queries/                        # Data fetching hooks
│   │   │   ├── useCourses.js               # Fetch courses (uses repo)
│   │   │   ├── useEnrollments.js           # Fetch enrollments
│   │   │   ├── useSessions.js              # Fetch sessions
│   │   │   ├── useAttendanceLogs.js        # Fetch attendance logs
│   │   │   ├── useProfileCache.js          # Profile caching hook
│   │   │   └── useUser.js                  # Fetch current user
│   │   │
│   │   ├── mutations/                      # Data mutation hooks
│   │   │   ├── useCreateCourse.js          # Create course hook
│   │   │   ├── useCreateSession.js         # Create session hook
│   │   │   ├── useMarkAttendance.js        # Mark attendance hook
│   │   │   ├── useUpdateProfile.js         # Update profile hook
│   │   │   └── useUpdatePassword.js        # Update password hook
│   │   │
│   │   ├── subscriptions/                  # Real-time subscription hooks
│   │   │   ├── useCoursesSubscription.js   # Subscribe to courses changes
│   │   │   ├── useSessionsSubscription.js  # Subscribe to sessions changes
│   │   │   ├── useAttendanceSubscription.js # Subscribe to attendance updates
│   │   │   └── useEnrollmentSubscription.js # Subscribe to enrollments
│   │   │
│   │   ├── state/                          # State management hooks
│   │   │   ├── useAuthStore.js             # Access auth state
│   │   │   ├── useCourseStore.js           # Access course state
│   │   │   ├── useSessionStore.js          # Access session state
│   │   │   └── useUIStore.js               # Access UI state
│   │   │
│   │   ├── ui/                             # UI interaction hooks
│   │   │   ├── useForm.js                  # Form handling (existing, keep)
│   │   │   ├── useActiveSession.js         # Track active session
│   │   │   ├── useModal.js                 # Modal state management
│   │   │   ├── useToast.js                 # Toast notifications
│   │   │   ├── useGeolocation.js           # Geolocation hook
│   │   │   ├── useMouseGlow.js             # Mouse glow effect (remove from critical path)
│   │   │   └── useLocalStorage.js          # localStorage hook
│   │   │
│   │   ├── context/                        # Context for prop drilling avoidance
│   │   │   ├── useAuthContext.js           # Auth context hook
│   │   │   ├── useSessionContext.js        # Session context hook
│   │   │   └── README.md                   # Context usage guide
│   │   │
│   │   └── README.md                       # Hooks organization guide
│   │
│   ├── context/                            # React Context (for provider setup)
│   │   ├── AuthContext.jsx                 # Auth context provider (keep minimal)
│   │   ├── SessionContext.jsx              # Session context provider
│   │   └── README.md                       # Context architecture docs
│   │
│   ├── components/                         # Reusable UI components (DUMB)
│   │   │                                    # These are PRESENTATIONAL ONLY
│   │   │                                    # No data fetching, no subscriptions
│   │   │                                    # Receive data via props only
│   │   │
│   │   ├── shared/                         # Shared components across features
│   │   │   ├── ErrorBoundary.jsx           # React error boundary
│   │   │   ├── ErrorFallback.jsx           # Error UI fallback
│   │   │   ├── Layout.jsx                  # Main app layout wrapper
│   │   │   ├── Navbar.jsx                  # Navigation bar (dumb)
│   │   │   ├── Footer.jsx                  # Footer (dumb)
│   │   │   ├── Sidebar.jsx                 # Sidebar navigation (dumb)
│   │   │   ├── ProtectedRoute.jsx          # Route protection wrapper
│   │   │   ├── LoadingSpinner.jsx          # Loading indicator
│   │   │   ├── EmptyState.jsx              # Empty state display
│   │   │   ├── ConfirmDialog.jsx           # Confirmation modal
│   │   │   └── README.md                   # Shared components docs
│   │   │
│   │   ├── ui/                             # Atomic UI components (base building blocks)
│   │   │   ├── Button.jsx                  # Button component
│   │   │   ├── Card.jsx                    # Card component
│   │   │   ├── Modal.jsx                   # Modal wrapper
│   │   │   ├── Input.jsx                   # Text input
│   │   │   ├── Select.jsx                  # Select dropdown
│   │   │   ├── Checkbox.jsx                # Checkbox
│   │   │   ├── Toast.jsx                   # Toast notification
│   │   │   ├── Badge.jsx                   # Badge component
│   │   │   ├── Preloader.jsx               # Preloader (existing, keep)
│   │   │   ├── SystemBadge.jsx             # System badge (existing, keep)
│   │   │   ├── ActionButton.jsx            # Action button (existing, keep)
│   │   │   └── README.md                   # UI components guide
│   │   │
│   │   ├── forms/                          # Form components
│   │   │   ├── LoginForm.jsx               # Dumb login form
│   │   │   ├── SignupForm.jsx              # Dumb signup form
│   │   │   ├── PasswordForm.jsx            # Dumb password form
│   │   │   ├── SessionForm.jsx             # Dumb session form
│   │   │   ├── OtpForm.jsx                 # Dumb OTP form
│   │   │   └── README.md                   # Form components guide
│   │   │
│   │   └── utils/                          # Component utilities
│   │       └── componentHelpers.js         # Helper functions for components
│   │
│   ├── features/                           # Feature modules (SMART containers + dumb components)
│   │   │
│   │   ├── auth/                           # Authentication feature
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx           # Login page (route destination)
│   │   │   │   ├── SignupPage.jsx          # Signup page
│   │   │   │   ├── ForgotPasswordPage.jsx  # Forgot password page
│   │   │   │   └── ResetPasswordPage.jsx   # Password reset page
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   ├── LoginContainer.jsx      # Smart container (data fetching)
│   │   │   │   ├── SignupContainer.jsx     # Smart container
│   │   │   │   ├── OtpVerificationContainer.jsx  # OTP verification
│   │   │   │   └── SocialAuthContainer.jsx # Google auth container
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── LoginFormCard.jsx       # Dumb login form
│   │   │   │   ├── SignupFormCard.jsx      # Dumb signup form
│   │   │   │   ├── OtpVerificationCard.jsx # Dumb OTP card
│   │   │   │   ├── SocialAuth.jsx          # Dumb social auth buttons
│   │   │   │   └── AuthCallback.jsx        # OAuth callback handler
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuthForm.js          # Auth form hook
│   │   │   │   ├── useOtpValidation.js     # OTP validation hook
│   │   │   │   ├── useGoogleAuth.js        # Google auth hook
│   │   │   │   └── usePasswordUpdate.js    # Password update hook
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── authService.js          # Auth business logic (sign up, login, etc.)
│   │   │   │
│   │   │   └── README.md                   # Auth feature guide
│   │   │
│   │   ├── courses/                        # Courses feature
│   │   │   ├── pages/
│   │   │   │   ├── CoursesIndexPage.jsx    # Courses list page
│   │   │   │   └── CourseDetailPage.jsx    # Course detail page
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   ├── CoursesContainer.jsx    # Smart container
│   │   │   │   └── CourseDetailContainer.jsx # Smart container
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── CourseCard.jsx          # Dumb course card
│   │   │   │   ├── CourseList.jsx          # Dumb course list
│   │   │   │   ├── CourseForm.jsx          # Dumb course form
│   │   │   │   └── CourseHeader.jsx        # Dumb course header
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useCourses.js           # Fetch courses
│   │   │   │   ├── useCreateCourse.js      # Create course mutation
│   │   │   │   ├── useCourseDetail.js      # Fetch single course
│   │   │   │   └── useCoursesSubscription.js # Subscribe to courses
│   │   │   │
│   │   │   └── README.md                   # Courses feature guide
│   │   │
│   │   ├── sessions/                       # Sessions feature
│   │   │   ├── pages/
│   │   │   │   ├── SessionsIndexPage.jsx   # Sessions list
│   │   │   │   └── SessionDetailPage.jsx   # Session detail
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   ├── SessionsContainer.jsx   # Smart container
│   │   │   │   ├── SessionDetailContainer.jsx # Smart container
│   │   │   │   └── SessionCreatorContainer.jsx # Smart creator
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── SessionCard.jsx         # Dumb session card
│   │   │   │   ├── SessionList.jsx         # Dumb session list
│   │   │   │   ├── SessionForm.jsx         # Dumb session form
│   │   │   │   ├── SessionHeader.jsx       # Dumb header
│   │   │   │   ├── SessionStats.jsx        # Dumb stats display
│   │   │   │   ├── OTPDisplay.jsx          # Dumb OTP display
│   │   │   │   └── QRDisplay.jsx           # Dumb QR display
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useSessions.js          # Fetch sessions
│   │   │   │   ├── useCreateSession.js     # Create session
│   │   │   │   ├── useSessionDetail.js     # Fetch session detail
│   │   │   │   ├── useSessionsPersistence.js # Persist session state
│   │   │   │   └── useSessionsSubscription.js # Subscribe to updates
│   │   │   │
│   │   │   └── README.md                   # Sessions feature guide
│   │   │
│   │   ├── attendance/                     # Attendance feature
│   │   │   ├── pages/
│   │   │   │   ├── AttendanceIndexPage.jsx # Attendance view
│   │   │   │   └── AttendanceDetailPage.jsx # Detail view
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   ├── AttendanceContainer.jsx # Smart container
│   │   │   │   ├── AttendanceListContainer.jsx # Smart list
│   │   │   │   └── AttendancePortalContainer.jsx # Smart portal
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── AttendanceTable.jsx     # Dumb table
│   │   │   │   ├── AttendanceList.jsx      # Dumb list
│   │   │   │   ├── SessionHeader.jsx       # Dumb session header
│   │   │   │   ├── StudentRow.jsx          # Dumb student row
│   │   │   │   ├── StudentNameDisplay.jsx  # Dumb name display
│   │   │   │   ├── AttendanceExport.jsx    # Dumb export component
│   │   │   │   └── VerificationDisplay.jsx # Dumb verification UI
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAttendanceLogs.js    # Fetch logs
│   │   │   │   ├── useMarkAttendance.js    # Mark attendance
│   │   │   │   ├── useEnrollments.js       # Fetch enrollments
│   │   │   │   ├── useProfileCache.js      # Cache profiles
│   │   │   │   ├── useGeolocation.js       # Get location
│   │   │   │   └── useAttendanceSubscription.js # Subscribe
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── attendanceService.js    # Attendance business logic
│   │   │   │
│   │   │   └── README.md                   # Attendance feature guide
│   │   │
│   │   ├── dashboard/                      # Dashboard feature
│   │   │   ├── pages/
│   │   │   │   ├── DashboardPage.jsx       # Main dashboard page
│   │   │   │   ├── LecturerDashboard Page.jsx # Lecturer variant
│   │   │   │   └── StudentDashboardPage.jsx # Student variant
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   ├── DashboardContainer.jsx  # Smart main container
│   │   │   │   ├── LecturerDashboardContainer.jsx # Smart lecturer
│   │   │   │   └── StudentDashboardContainer.jsx # Smart student
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── DashboardLayout.jsx     # Dumb layout
│   │   │   │   ├── StatsGrid.jsx           # Dumb stats
│   │   │   │   ├── StatsCard.jsx           # Dumb stat card
│   │   │   │   ├── SessionCard.jsx         # Dumb session card
│   │   │   │   ├── PerformanceChart.jsx    # Dumb chart
│   │   │   │   ├── RecentActivity.jsx      # Dumb activity list
│   │   │   │   └── QuickActions.jsx        # Dumb action buttons
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboardData.js     # Fetch all dashboard data
│   │   │   │   ├── useDashboardStats.js    # Calculate stats
│   │   │   │   └── useDashboardSubscription.js # Subscribe to updates
│   │   │   │
│   │   │   └── README.md                   # Dashboard feature guide
│   │   │
│   │   ├── enrollments/                    # Enrollments feature
│   │   │   ├── pages/
│   │   │   │   └── EnrollmentsPage.jsx
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   └── EnrollmentsContainer.jsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── EnrollmentList.jsx
│   │   │   │   ├── EnrollmentCard.jsx
│   │   │   │   └── EnrollmentForm.jsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useEnrollments.js
│   │   │   │   └── useCreateEnrollment.js
│   │   │   │
│   │   │   └── README.md
│   │   │
│   │   ├── onboarding/                     # Onboarding feature
│   │   │   ├── pages/
│   │   │   │   └── OnboardingPage.jsx
│   │   │   │
│   │   │   ├── containers/
│   │   │   │   └── OnboardingContainer.jsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── OnboardingForm.jsx
│   │   │   │   ├── RoleSelector.jsx
│   │   │   │   ├── SchoolSelector.jsx
│   │   │   │   └── TutorialWizard.jsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   └── useOnboarding.js
│   │   │   │
│   │   │   └── README.md
│   │   │
│   │   └── landing/                        # Landing page feature
│   │       ├── pages/
│   │       │   └── LandingPage.jsx
│   │       │
│   │       ├── containers/
│   │       │   └── LandingContainer.jsx
│   │       │
│   │       ├── components/
│   │       │   ├── HeroSection.jsx
│   │       │   ├── FeaturesSection.jsx
│   │       │   ├── ProcessSection.jsx
│   │       │   ├── FaqSection.jsx
│   │       │   ├── CtaSection.jsx
│   │       │   └── TestimonialSection.jsx
│   │       │
│   │       └── README.md
│   │
│   ├── pages/                              # Page-level components (route destinations)
│   │   ├── Home.jsx                        # Home page
│   │   ├── Dashboard.jsx                   # Dashboard page
│   │   ├── NotFound.jsx                    # 404 page
│   │   ├── Loading.jsx                     # Loading page
│   │   ├── ServerError.jsx                 # Error page
│   │   └── Maintenance.jsx                 # Maintenance page
│   │
│   ├── routes/                             # Routing configuration
│   │   ├── AppRoutes.jsx                   # Main routes definition
│   │   ├── ProtectedRoutes.jsx             # Protected route wrappers
│   │   ├── routeConfig.js                  # Route constants & meta info
│   │   └── README.md                       # Routing architecture docs
│   │
│   ├── styles/                             # Global styles
│   │   ├── base.css                        # Base/reset styles
│   │   ├── typography.css                  # Font & text styles
│   │   ├── animations.css                  # Animation library (existing)
│   │   ├── author.css                      # Author styles (existing)
│   │   ├── components.css                  # Component-specific styles
│   │   ├── utilities.css                   # Utility classes
│   │   ├── tailwind.config.js              # Tailwind config
│   │   └── README.md                       # Styling guide
│   │
│   ├── config/                             # Configuration files
│   │   ├── env.js                          # Environment variables
│   │   ├── constants.js                    # App constants
│   │   └── feature-flags.js                # Feature flags (for rollout)
│   │
│   └── assets/                             # Application assets
│       ├── images/
│       ├── icons/
│       ├── svg/
│       └── videos/
│
├── supabase/                               # Supabase configurations
│   ├── migrations/                         # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_setup.sql
│   │   ├── 003_rls_policies.sql
│   │   └── README.md
│   │
│   ├── functions/                          # Edge functions
│   │   ├── verify-otp/
│   │   ├── send-email/
│   │   └── README.md
│   │
│   ├── attendance_logs_rls.sql             # RLS policies (existing, review)
│   └── README.md
│
├── scripts/                                # Utility scripts
│   ├── fix-duplicate-schools.mjs           # Data fix script (existing)
│   ├── transform-schools.mjs               # Data transform (existing)
│   ├── uploadData.js                       # Data upload script
│   ├── seed-db.js                          # Database seeding
│   └── README.md
│
└── docs/                                   # Documentation
    ├── ARCHITECTURE.md                     # Architecture overview
    ├── SETUP.md                            # Setup instructions
    ├── CONTRIBUTING.md                     # Contribution guide
    ├── API_REFERENCE.md                    # API reference
    ├── COMPONENT_GUIDE.md                  # Component development guide
    ├── HOOK_GUIDE.md                       # Custom hooks guide
    ├── SERVICE_GUIDE.md                    # Service development guide
    ├── TESTING_GUIDE.md                    # Testing guidelines
    ├── DEPLOYMENT.md                       # Deployment guide
    └── STYLE_GUIDE.md                      # Coding style guide
```

---

## KEY ARCHITECTURAL DECISIONS

### 1. **Layered Architecture** (Dependency Inversion)
- **Layer 1**: Data Access (Repositories, Subscriptions, API)
- **Layer 2**: Business Logic (Services, State, Types, Utils)
- **Layer 3**: Presentation (Components, Pages, Features)
- **Layer 4**: Routing (App routes, navigation)

**Benefit**: Each layer independently testable and replaceable

### 2. **Repository Pattern** (Open/Closed + DIP)
```javascript
// All Supabase queries isolated in repositories
courseRepository.findByLecturer(lecturerId)
sessionRepository.create(data)
attendanceRepository.log(attendance)

// Easy to:
// ✅ Test with mock repositories
// ✅ Swap backends (PostgreSQL → GraphQL)
// ✅ Add caching layer
```

### 3. **Smart/Dumb Component Split** (SRP)
```
Smart Components (Containers):
├─ Fetch data from hooks
├─ Handle subscriptions
├─ Manage complex state
├─ Orchestrate child components
└─ Located in: features/*/containers/

Dumb Components (Presentational):
├─ Receive data via props only
├─ No data fetching
├─ No subscriptions
├─ Pure rendering functions
└─ Located in: features/*/components/ or components/
```

### 4. **Single Source of Truth** (State Management)
```javascript
// Zustand rootStore is the ONLY source of truth
const { user, courses, sessions } = useRootStore(state => ({
  user: state.user,
  courses: state.courses,
  sessions: state.sessions,
}));

// Store syncs with:
// ✅ localStorage (persistence)
// ✅ sessionStorage (metadata)
// ✅ Supabase (via subscriptions - automatically updated)
```

### 5. **Feature-Based Organization** (SoC)
```
Each feature is self-contained:
├─ pages/        (Route destinations)
├─ containers/   (Smart components - data logic)
├─ components/   (Dumb components - UI only)
├─ hooks/        (Feature-specific custom hooks)
├─ services/     (Feature business logic)
└─ README.md     (Feature documentation)

Easy to:
✅ Find all related code
✅ Lazy-load entire features
✅ Test in isolation
✅ Manage team workflows
```

### 6. **DRY Pattern Implementations**
```javascript
// Subscriptions (eliminate duplication)
src/services/subscriptions/subscriptionManager.js

// Utilities (pure functions reused everywhere)
src/lib/utils/dateUtils.js
src/lib/utils/geoUtils.js
src/lib/utils/validators.js

// Constants (no magic strings)
src/lib/constants/*.js

// Types/Schemas (single source of validation)
src/lib/schemas/*.js
src/types/*.types.js

// Services (no copy-paste logic)
src/services/domain/*.js
```

### 7. **Error Handling** (Consistency)
```javascript
// Centralized error handling
src/services/errors/errorHandler.js
src/services/errors/errorBoundary.js
src/services/errors/customErrors.js

// Every error:
// ✅ Logged to Sentry
// ✅ Shown to user via toast
// ✅ Tracked in app state
// ✅ Gracefully handled
```

---

## CRITICAL CONSTRAINTS

### Component Size Limits (SRP)
```
❌ NEVER: >200 lines
⚠️  WARNING: 150-200 lines (refactor)
✅ TARGET: <100 lines (ideal)

How to split:
├─ Extract sub-components
├─ Extract custom hooks
├─ Extract services
└─ Extract utilities
```

### Prop Drilling Limits (ISP)
```
❌ NEVER: >10 props
⚠️  WARNING: 8-10 props (consider reducer)
✅ TARGET: <5 props (ideal)

How to reduce:
├─ Use context for related props
├─ Pass objects instead of spread
├─ Create variant components
└─ Use compound components
```

### Direct Supabase Access
```
❌ NO direct supabase imports in components!
❌ NO direct supabase imports in hooks!
✅ ONLY in: src/services/repositories/

Data flow:
Component 
  ↓
Hook (uses repository interface)
  ↓
Repository (implements Supabase)
  ↓
Supabase
```

### State Management
```
❌ NO multiple Zustand stores
❌ NO useState for shared state
✅ ONLY: rootStore (single source of truth)

All state goes through:
rootStore → selectors → useRootStore() → components
```

---

## FILE NAMING CONVENTIONS

### Components
```javascript
// Smart components (containers)
CourseContainer.jsx    // Smart, handles logic

// Dumb components (presentational)
CourseCard.jsx         // Dumb, receives props
CourseList.jsx         // Dumb, receives props
CourseForm.jsx         // Dumb, receives props
```

### Hooks
```javascript
// Query hooks (fetch data)
useCourses.js          // Returns { data, loading, error }
useEnrollments.js      // Returns { data, loading, error }

// Mutation hooks (modify data)
useCreateCourse.js     // Returns { mutate, loading, error }
useUpdateSession.js    // Returns { mutate, loading, error }

// Subscription hooks (real-time)
useCoursesSubscription.js // Returns subscription state

// Store hooks
useAuthStore.js        // Returns { user, logout, ... }
```

### Services
```javascript
// Repositories (data access)
courseRepository.js    // export { findByLecturer, create, ... }

// Domain services (business logic)
attendanceService.js   // export { calculateAttendance, verify, ... }
sessionService.js      // export { createSession, expireSession, ... }

// Utility services
errorHandler.js        // export { handle, captureException, ... }
cacheManager.js        // export { set, get, invalidate, ... }
```

### Types/Schema
```javascript
// Type definitions
auth.types.js          // export { User, AuthState, ... }
course.types.js        // export { Course, CourseData, ... }

// Validation schemas
authSchemas.js         // export { loginSchema, signupSchema, ... }
courseSchemas.js       // export { courseCreateSchema, ... }
```

### Utils
```javascript
dateUtils.js           // Date/time operations
geoUtils.js            // Geolocation math
csvUtils.js            // CSV export/import
formatters.js          // Data formatting
validators.js          // Validation functions
```

### Constants
```javascript
errorMessages.js       // All error messages
validationRules.js     // Form validation configs
permissions.js         // Role-based access
sessionConfig.js       // Session parameters
apiEndpoints.js        // API endpoints (deprecated, use repos)
```

---

## MIGRATION CHECKLIST (From Current → This Blueprint)

### Phase 1: Foundation (Weeks 1-2)
```
☐ Create src/lib/utils/ (dateUtils, geoUtils, etc.)
☐ Create src/lib/constants/ (split from current)
☐ Create src/lib/schemas/ (Zod validators)
☐ Create src/services/errors/ (error handling)
☐ Create src/types/ (type definitions)
☐ Add Error Boundaries to src/components/shared/
☐ Create src/config/ (env, feature flags)
☐ Setup Sentry integration
```

### Phase 2: Data Access Layer (Weeks 3-5)
```
☐ Create src/services/repositories/
├─ baseRepository.js
├─ courseRepository.js
├─ sessionRepository.js
├─ attendanceRepository.js
├─ enrollmentRepository.js
└─ profileRepository.js

☐ Create src/services/subscriptions/
├─ subscriptionManager.js
├─ courseSubscription.js
├─ sessionSubscription.js
└─ attendanceSubscription.js

☐ Create src/services/persistence/
├─ storageManager.js
└─ cacheManager.js

☐ Migrate all components away from direct Supabase
```

### Phase 3: Business Logic Layer (Weeks 5-7)
```
☐ Create src/services/domain/
├─ attendanceService.js
├─ sessionService.js
├─ courseService.js
├─ authService.js
└─ enrollmentService.js

☐ Create unified src/store/rootStore.js
├─ Merge all Zustand slices
├─ Create src/store/slices/
└─ Create src/store/selectors/

☐ Extract all custom hooks to proper locations
├─ src/hooks/queries/
├─ src/hooks/mutations/
├─ src/hooks/subscriptions/
├─ src/hooks/state/
└─ src/hooks/ui/
```

### Phase 4: Presentation Layer (Weeks 8-10)
```
☐ Refactor all components to Smart/Dumb split
☐ Move components to features/**/containers/
☐ Extract dumb components to features/**/components/
☐ Split large components (<150 line rule)
☐ Create proper page/ components
☐ Organize src/components/shared/ properly
☐ Organize src/components/ui/ properly
```

### Phase 5: Routing & Navigation (Weeks 10-11)
```
☐ Create src/routes/AppRoutes.jsx
☐ Create src/routes/routeConfig.js
☐ Create src/pages/ for route destinations
☐ Setup lazy route loading
☐ Create ProtectedRoute wrapper
```

### Phase 6: Testing & Documentation (Weeks 11-12)
```
☐ Setup Jest + React Testing Library
☐ Unit tests for src/services/
☐ Unit tests for src/hooks/
☐ Component tests for src/components/
☐ Integration tests for features/
☐ Create comprehensive documentation
├─ src/*/README.md files
├─ docs/ARCHITECTURE.md
├─ docs/COMPONENT_GUIDE.md
└─ docs/API_REFERENCE.md
```

---

## DEPENDENCY FLOW DIAGRAM

```
Route/Page Component
    ↓ (uses hooks)
    ├─→ useAuthStore() → rootStore.authSlice
    ├─→ useCourses() → courseRepository → supabase
    ├─→ useCoursesSubscription() → subscriptionManager
    └─→ (passed as props to)
    
Feature Container Component (Smart)
    ↓ (manages state, passes props)
    └─→ Feature UI Components (Dumb)
        ├─ Receive data via props only
        ├─ No fetching
        ├─ No subscriptions
        └─ Pure rendering

Services:
- Repositories ← supabase
- Subscriptions ← supabase & store
- Domain Services ← repositories & calculations
- Error Handler ← Sentry & UI

Utils & Constants:
- Pure functions
- No side effects
- Reusable everywhere
```

---

## QUICK REFERENCE: WHERE THINGS GO

| What | Where | Why |
|------|-------|-----|
| Component state | `rootStore.slices/*.js` | Single source of truth |
| Supabase queries | `services/repositories/*.js` | Testable, replaceable |
| Real-time subscriptions | `services/subscriptions/*.js` | Centralized, reusable |
| Business logic | `services/domain/*.js` | Testable, shareable |
| Data fetching | `hooks/queries/*.js` | Component integration |
| Data mutations | `hooks/mutations/*.js` | Component integration |
| UI interaction | `hooks/ui/*.js` | Component logic |
| Pure functions | `lib/utils/*.js` | Reusable, testable |
| Magic strings | `lib/constants/*.js` | Single definition |
| Data validation | `lib/schemas/*.js` | Consistent, testable |
| Type definitions | `types/*.types.js` | Documentation, validation |
| Atomic UI | `components/ui/*.jsx` | Reusable building blocks |
| Shared components | `components/shared/*.jsx` | Cross-feature reuse |
| Feature UI | `features/*/components/*.jsx` | Feature-specific |
| Feature pages | `features/*/pages/*.jsx` | Route destinations |
| Route definition | `routes/AppRoutes.jsx` | Navigation |

---

## EXPECTED OUTCOMES

### Code Quality
```
✅ All components <150 lines
✅ 80%+ test coverage
✅ 0 direct Supabase imports in components
✅ Single source of truth (rootStore)
✅ Clear layer separation
✅ Consistent error handling
✅ No code duplication
```

### Developer Experience
```
✅ Faster bug fixes (<1 hour vs 4 hours)
✅ Easier feature development (<16 hours vs 24 hours)
✅ Faster code reviews (<30 min vs 2 hours)
✅ Quicker onboarding (<4 hours vs 2 days)
✅ Higher confidence in deployments (>95%)
✅ Better code navigation (find code in <2 min)
```

### System Quality
```
✅ <0.1% error rate (fewer production issues)
✅ <2s load time (better UX)
✅ 99.9% uptime (fewer crashes)
✅ Sub-100ms subscriptions (better responsiveness)
✅ Scalable to 100K+ students
```

---

## NOTES

- This blueprint is the **target architecture** for the 90-day hardening roadmap
- Phased migration is recommended (see Migration Checklist)
- Each feature folder is self-contained (can be lazy-loaded)
- All documentation should be in `README.md` files within each folder
- Type safety can be added gradually (JSDoc now, TypeScript later)
- Testing should start from Layer 1 (data access) upward

---

**Document Version**: 1.0  
**Created**: February 22, 2026  
**For**: LOCUS - Real-time Attendance Management System  
**References**: ARCHITECTURAL_AUDIT_REPORT.md, IMPLEMENTATION_ROADMAP.md
