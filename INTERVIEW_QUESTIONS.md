# Locus — Interview Questions

A curated set of interview questions covering the architecture, implementation decisions, and technical challenges of the Locus Real-Time Attendance Management System.

---

## Table of Contents

1. [General / Project Overview](#1-general--project-overview)
2. [React & Component Architecture](#2-react--component-architecture)
3. [State Management (Zustand)](#3-state-management-zustand)
4. [Supabase & Backend Integration](#4-supabase--backend-integration)
5. [Real-Time Subscriptions](#5-real-time-subscriptions)
6. [Authentication & Security](#6-authentication--security)
7. [Geolocation & OTP Verification](#7-geolocation--otp-verification)
8. [Routing & Access Control](#8-routing--access-control)
9. [Forms & Validation](#9-forms--validation)
10. [Data Export](#10-data-export)
11. [Performance & Optimization](#11-performance--optimization)
12. [Testing](#12-testing)
13. [Deployment & DevOps](#13-deployment--devops)
14. [Architecture & Design Decisions](#14-architecture--design-decisions)

---

## 1. General / Project Overview

1. **Can you walk me through what Locus does and the core problem it solves?**
2. **Who are the two main user roles in the system, and how do their workflows differ?**
3. **Why did you choose a web-based approach rather than a native mobile app for this attendance system?**
4. **How does the OTP-plus-geolocation combination improve the reliability of attendance verification compared to OTP alone?**
5. **If a student tries to submit attendance using a classmate's phone from outside the classroom, how does Locus prevent that?**
6. **What were the main technical challenges you encountered while building Locus, and how did you overcome them?**
7. **How would you describe the overall maturity of the project, and what would you prioritise next if you had another sprint?**

---

## 2. React & Component Architecture

8. **How is the codebase organised, and why did you choose a feature-based folder structure over a layer-based one?**
9. **What is the difference between the `components/` directory and the `features/` directory in this project?**
10. **Some components in Locus grew quite large (e.g. 700+ lines). What strategies would you use to break them down?**
11. **How does `ProtectedRoute` work, and what happens when an unauthenticated user tries to access a protected page?**
12. **How do you handle the case where a user's role (lecturer vs. student) determines which dashboard they see after login?**
13. **Explain how you used Framer Motion in the project. Where did you find it most valuable?**
14. **How did you structure the onboarding flow for new users, and how does the app know whether a user has completed onboarding?**
15. **What is the role of the `Layout` component, and how does it interact with React Router's `<Outlet>`?**

---

## 3. State Management (Zustand)

16. **Why did you choose Zustand over Redux or the React Context API for global state?**
17. **What state is stored in Zustand, and what state is kept local to individual components? How do you decide which to use?**
18. **How does `authStore` work? What information does it hold and how is it initialised on page load?**
19. **How do you keep the Zustand store in sync with Supabase Auth session changes (e.g. logout in another tab)?**
20. **If you needed to persist part of the Zustand store across page refreshes, how would you approach that?**
21. **How does `rootStore.js` relate to the other store slices in the project?**

---

## 4. Supabase & Backend Integration

22. **Why did you choose Supabase as the backend rather than building a custom Express/Node API?**
23. **How is the Supabase client initialised and shared across the application?**
24. **What is Row Level Security (RLS), and how did you use it in Locus to enforce data access rules between lecturers and students?**
25. **Describe the database schema for a session. What columns does the `sessions` (or `classes`) table have, and why?**
26. **How does the OTP get generated and stored — is it created on the client or server side, and why?**
27. **How do you validate that an OTP is still active (not expired) when a student submits it?**
28. **What is the repository pattern, and why did you introduce a `repositories/` layer on top of the raw Supabase calls?**
29. **How do you handle Supabase errors (network failures, constraint violations) in the UI?**
30. **What is the purpose of the keep-alive cron worker and why is it needed on Supabase's free tier?**

---

## 5. Real-Time Subscriptions

31. **How does Supabase real-time work under the hood? What protocol does it use to push changes to the client?**
32. **Walk me through the lifecycle of a real-time subscription in Locus — from component mount to unmount.**
33. **What is the `realtimeSubscriptionManager` and what problems does it solve compared to subscribing directly inside each component?**
34. **What is a "thundering herd" problem in the context of real-time updates, and how did you mitigate it with debouncing?**
35. **How do you prevent memory leaks from Supabase subscriptions when a component unmounts?**
36. **What happens if two components subscribe to the same Supabase channel? How do you handle deduplication?**
37. **How does the lecturer's dashboard update when a new student checks in, without the lecturer needing to refresh?**
38. **If a real-time subscription silently fails (e.g. due to a network drop), how does the app recover?**

---

## 6. Authentication & Security

39. **Describe the full sign-up flow — what happens from the moment a user submits the registration form to the point they land on the dashboard?**
40. **How does email OTP verification work during signup, and why is it important?**
41. **How does the forgot-password flow work in Locus?**
42. **How is Google OAuth implemented, and how do you handle the OAuth callback redirect?**
43. **What environment variables are required, and how do you ensure secrets like the service role key never reach the browser?**
44. **What is the difference between `VITE_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`, and when should each be used?**
45. **How do you protect API routes or Supabase queries from being called by users who don't have permission?**
46. **If a student somehow obtains another student's `user_id`, what prevents them from viewing that student's attendance records?**

---

## 7. Geolocation & OTP Verification

47. **Walk me through the full student check-in flow — from entering the OTP to receiving a success confirmation.**
48. **How does the browser capture the student's GPS coordinates, and what happens if the student denies location permission?**
49. **How do you calculate whether a student is within the acceptable radius of the classroom?**
50. **What distance formula do you use (e.g. Haversine), and why is it appropriate for this use case?**
51. **What is the `OUT_OF_RANGE` error, and what feedback does the student receive when it is triggered?**
52. **How does the lecturer register the classroom's GPS coordinates when creating a session?**
53. **What happens if a student has low GPS accuracy (e.g. indoors)? How does the app handle that uncertainty?**
54. **Could a student spoof their GPS location to fake attendance? How would you mitigate that risk?**

---

## 8. Routing & Access Control

55. **How are routes defined in Locus? Describe the structure of `AppRoutes.jsx`.**
56. **How does the app redirect a user to the correct dashboard (lecturer vs. student) after login?**
57. **What prevents a student from manually navigating to a lecturer-only route by typing the URL directly?**
58. **How do you handle deep-link navigation — e.g. a user follows an email link directly to a protected page while logged out?**
59. **How does React Router v7's `<Outlet>` pattern help organise nested routes in the app?**

---

## 9. Forms & Validation

60. **Why did you use React Hook Form instead of managing form state manually with `useState`?**
61. **How does Zod integrate with React Hook Form in Locus? Give an example of a validation schema you defined.**
62. **How do you display validation errors to the user in a consistent way across different forms?**
63. **How do you prevent a form from being submitted multiple times while an async operation is in progress?**
64. **What schema do you use to validate course creation, and what are the rules for each field?**

---

## 10. Data Export

65. **What export formats does Locus support, and which library handles each?**
66. **Why did you choose ExcelJS for styled `.xlsx` exports rather than the raw SheetJS library?**
67. **What data is included in an exported attendance report, and how is it formatted?**
68. **How do you trigger a file download from the browser without a server-side endpoint?**
69. **How would you extend the export feature to support PDF reports?**

---

## 11. Performance & Optimization

70. **How does Vite improve the development and build experience compared to Create React App / Webpack?**
71. **Are there any code-splitting or lazy-loading strategies in place? If not, how would you implement them?**
72. **How do you avoid unnecessary re-renders when real-time data updates arrive?**
73. **Recharts is used for dashboard analytics. What considerations did you have when choosing a charting library?**
74. **The `profileCacheService.js` file exists in the services layer — what does it cache and why?**
75. **How would you add pagination or infinite scrolling to the attendance history list?**

---

## 12. Testing

76. **What testing framework does Locus use, and how do you run the tests?**
77. **What is the current test coverage, and which parts of the codebase are most critical to test?**
78. **How would you write a unit test for the geolocation distance calculation function?**
79. **How would you test a React component that depends on Supabase data? What would you mock?**
80. **How would you test the real-time subscription logic without a live Supabase connection?**
81. **What would an integration test for the student check-in flow look like?**

---

## 13. Deployment & DevOps

82. **How is Locus deployed to Vercel, and what does `vercel.json` do?**
83. **Why is the SPA rewrite rule in `vercel.json` necessary, and what would break without it?**
84. **How do you manage environment variables between local development and the Vercel production environment?**
85. **How does the keep-alive cron worker prevent the free-tier Supabase project from pausing?**
86. **What would a CI/CD pipeline for Locus look like — what checks would you run on every pull request?**
87. **How would you set up a staging environment that uses a separate Supabase project?**

---

## 14. Architecture & Design Decisions

88. **What is the repository pattern, and why is having a `repositories/` layer valuable in this project?**
89. **How would you describe the separation of concerns between `api/`, `services/`, `repositories/`, and `features/`?**
90. **If Supabase were replaced with a different backend (e.g. Firebase or a custom REST API), which parts of the codebase would need to change, and which would stay the same?**
91. **The codebase includes an `Audited_Blueprint.md` and an `IMPLEMENTATION_ROADMAP.md`. What does that tell you about the project's development approach?**
92. **What trade-offs did you make by putting business logic in custom hooks rather than in a dedicated service layer?**
93. **How would you approach adding a new feature — for example, allowing lecturers to send push notifications to students?**
94. **If this project needed to scale to 10,000 concurrent students checking in at the same time, what changes would be required?**
95. **What is your overall assessment of the project's architecture, and what is the single most important refactor you would make?**

---

*Good luck with your interview! Review the codebase alongside these questions to give concrete, example-driven answers.*
