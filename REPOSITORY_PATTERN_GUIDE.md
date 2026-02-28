# LOCUS Repository Pattern Implementation Guide

## Overview

This guide documents the **Repository Pattern** implementation in LOCUS, which separates data access logic from business logic. This architecture enables:

✅ **Testability** - Mock dependent repositories without Supabase  
✅ **Maintainability** - Centralized data access logic  
✅ **Scalability** - Easy to add new repositories or swap implementations  
✅ **Decoupling** - Components don't know about Supabase directly  

---

## File Structure

```
src/
├── types/
│   └── index.js                          # Type definitions (JSDoc)
├── repositories/
│   ├── interfaces.js                     # Repository interfaces (contracts)
│   └── implementations.js                # Supabase implementations
├── hooks/
│   └── useDashboardRepository.js         # Custom hooks using repositories
├── components/
│   └── dashboard/
│       ├── LecturerDashboardComponents.jsx      # Reusable sub-components
│       ├── StudentDashboardComponents.jsx       # Reusable sub-components
├── features/
│   └── dashboard/
│       ├── LecturerDashboardRefactored.jsx      # 710 lines → 120 lines
│       └── StudentDashboardRefactored.jsx       # 307 lines → 100 lines
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   React Components                        │
│  (LecturerDashboardRefactored, StudentDashboardRefactored)│
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│            Custom Hooks (Composable Logic)                │
│  useLecturerDashboard, useStudentDashboard,              │
│  useUserProfile, useCourseDetails, useAttendanceRecord   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│            Repository Pattern (Abstraction)               │
│  IUserRepository, ICourseRepository,                      │
│  ISessionRepository, IAttendanceRepository, ...           │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│           Repository Implementations                      │
│  UserRepository, CourseRepository, SessionRepository,    │
│  AttendanceRepository, EnrollmentRepository, ...         │
│                  (Supabase Implementation)               │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────┐
│                  Supabase (Backend)                       │
│        PostgreSQL + Real-time Subscriptions              │
└──────────────────────────────────────────────────────────┘
```

---

## Step 1: Define Types (Type Contracts)

**File:** `src/types/index.js`

Types define the shape of data flowing through your application:

```javascript
/**
 * @typedef {Object} UserProfile
 * @property {string} id - Profile ID
 * @property {string} full_name - User's full name
 * @property {string} role - User role ('lecturer' | 'student')
 * @property {string} [matric_number] - Student matric number
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Course
 * @property {string} id - Course ID
 * @property {string} lecturer_id - Lecturer's user ID
 * @property {string} course_code - Course code (e.g., "CS101")
 * @property {string} course_title - Course title
 * @property {number} [capacity] - Expected number of students
 */
```

**Benefits:**
- IDE autocomplete in JSDoc comments
- Single source of truth for data shape
- Easy to update and maintain
- No TypeScript compilation needed

---

## Step 2: Define Repository Interfaces (Contracts)

**File:** `src/repositories/interfaces.js`

Interfaces define what methods each repository must implement:

```javascript
/**
 * User Repository - Manages user-related data access
 * @interface IUserRepository
 */
export const IUserRepository = {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<import('../types').UserProfile>}
   */
  getProfileById: async (userId) => { },

  /**
   * Batch fetch multiple user profiles
   * @param {string[]} userIds - Array of user IDs
   * @returns {Promise<import('../types').UserProfile[]>}
   */
  fetchProfilesByIds: async (userIds) => { },
};

/**
 * Course Repository - Manages course-related data access
 * @interface ICourseRepository
 */
export const ICourseRepository = {
  /**
   * Get all courses taught by lecturer
   * @param {string} lecturerId - Lecturer's user ID
   * @returns {Promise<import('../types').Course[]>}
   */
  findByLecturer: async (lecturerId) => { },

  /**
   * Get enrolled courses for student
   * @param {string} studentId - Student's user ID
   * @returns {Promise<import('../types').Course[]>}
   */
  findByStudent: async (studentId) => { },
};
```

**Benefits:**
- Clear contract: "Any CourseRepository MUST have these methods"
- Easy to create mock implementations for testing
- Changes to repository signature are obvious
- Self-documenting API

---

## Step 3: Implement Repositories (Supabase)

**File:** `src/repositories/implementations.js`

Concrete implementations that talk to Supabase:

```javascript
import { supabase } from '../api/supabase';

/**
 * User Repository Implementation
 */
export const UserRepository = {
  async getProfileById(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      throw new Error(`Failed to fetch profile for user ${userId}`);
    }

    return data;
  },

  async fetchProfilesByIds(userIds) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return [];
    }

    return data || [];
  },
};

/**
 * Course Repository Implementation
 */
export const CourseRepository = {
  async findByLecturer(lecturerId) {
    const { data, error } = await supabase
      .from('classes')
      .select('id, lecturer_id, course_code, course_title, description')
      .eq('lecturer_id', lecturerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching lecturer courses:', error);
      throw new Error('Failed to fetch courses');
    }

    return data || [];
  },

  async findByStudent(studentId) {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select('classes(id, lecturer_id, course_code, course_title)')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching student courses:', error);
      throw new Error('Failed to fetch enrolled courses');
    }

    // Flatten nested structure
    return (data || []).map(e => e.classes).filter(Boolean);
  },
};
```

**Benefits:**
- All database queries in one place
- Easy to add error handling consistently
- Can be tested with mocks
- Easy to add logging/monitoring
- Schema changes centralized

---

## Step 4: Create Custom Hooks (Business Logic)

**File:** `src/hooks/useDashboardRepository.js`

Hooks use repositories to fetch and manage data:

```javascript
import { useState, useEffect } from 'react';
import {
  CourseRepository,
  SessionRepository,
  StatisticsRepository,
} from '../repositories/implementations';

/**
 * Hook for fetching lecturer dashboard data
 * @param {string} lecturerId - Lecturer's user ID
 * @returns {{
 *   stats: import('../types').DashboardStats | null,
 *   recentSessions: import('../types').Session[],
 *   sessionPerformance: import('../types').SessionPerformance | null,
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function useLecturerDashboard(lecturerId) {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionPerformance, setSessionPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!lecturerId) {
      setError(new Error('No lecturer ID provided'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch stats, courses, and recent sessions in parallel
      const [statsData, sessionsData] = await Promise.all([
        StatisticsRepository.getLecturerStats(lecturerId),
        SessionRepository.findByLecturer(lecturerId, { limit: 5 }),
      ]);

      setStats(statsData);
      setRecentSessions(sessionsData);

      // Calculate performance for latest session
      if (sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        const sessionId = latestSession.active_session_id || latestSession.id;

        try {
          const performance = await StatisticsRepository.getSessionPerformance(
            sessionId,
            statsData?.totalStudents || 50
          );

          setSessionPerformance({
            ...performance,
            course_code: latestSession.classes?.course_code || 'N/A',
          });
        } catch (perfError) {
          console.error('⚠️ Error fetching session performance:', perfError);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lecturerId]);

  return {
    stats,
    recentSessions,
    sessionPerformance,
    loading,
    error,
    refresh: fetchData,
  };
}
```

**Benefits:**
- Composition of repository calls
- Handles loading/error states
- Parallel data fetching with `Promise.all`
- Reusable across components
- Easy to test with mock repositories

---

## Step 5: Use Hooks in Components

**File:** `src/features/dashboard/LecturerDashboardRefactored.jsx`

Components use hooks and delegate to sub-components:

```javascript
import { useLecturerDashboard } from '../../hooks/useDashboardRepository';
import { LecturerStatsGrid, RecentSessionsList } from '../dashboard/LecturerDashboardComponents';

export default function LecturerDashboard() {
  const { user } = useUser();
  
  // Single hook call gets everything
  const { stats, recentSessions, sessionPerformance, loading, error, refresh } = 
    useLecturerDashboard(user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1>Welcome back, {user.email}</h1>

      {/* Use sub-components */}
      <LecturerStatsGrid stats={stats} />
      <RecentSessionsList sessions={recentSessions} loading={loading} />
      <SessionPerformanceCard performance={sessionPerformance} loading={loading} />
    </div>
  );
}
```

**Size Reduction:**
- Before: 710 lines (8+ responsibilities)
- After: 120 lines (single responsibility: orchestration)
- 83% reduction in component code

---

## Step 6: Testing with Mock Repositories

**Example Test File:** `src/hooks/__tests__/useLecturerDashboard.test.js`

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useLecturerDashboard } from '../useDashboardRepository';

// Mock repository implementation
const MockStatisticsRepository = {
  async getLecturerStats(lecturerId) {
    return {
      totalStudents: 5,
      totalCourses: 2,
      totalSessions: 10,
      overallRate: 85,
    };
  },
};

// Mock the repository module
jest.mock('../../repositories/implementations', () => ({
  StatisticsRepository: MockStatisticsRepository,
  SessionRepository: { /* ... */ },
}));

test('useLecturerDashboard fetches data correctly', async () => {
  const { result } = renderHook(() => useLecturerDashboard('lecturer-123'));

  // Initially loading
  expect(result.current.loading).toBe(true);

  // Wait for data
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Verify data loaded
  expect(result.current.stats).toEqual({
    totalStudents: 5,
    totalCourses: 2,
    totalSessions: 10,
    overallRate: 85,
  });
});

test('useLecturerDashboard handles errors', async () => {
  const MockErrorRepository = {
    async getLecturerStats() {
      throw new Error('Network error');
    },
  };

  jest.mock('../../repositories/implementations', () => ({
    StatisticsRepository: MockErrorRepository,
  }));

  const { result } = renderHook(() => useLecturerDashboard('lecturer-123'));

  await waitFor(() => {
    expect(result.current.error).toBeDefined();
  });

  expect(result.current.error.message).toContain('Failed to load dashboard');
});
```

**Benefits:**
- No Supabase credentials needed
- Tests run in milliseconds
- Can test error scenarios easily
- Components isolated from backend

---

## Complete User Tracking Example

### Scenario: Track lecturer creating a session and students attending

```javascript
// 1. Lecturer Dashboard (uses hook)
export default function LecturerDashboard() {
  const { stats, recentSessions, refresh } = useLecturerDashboard(lecturerId);
  // stats = { totalStudents: 50, totalCourses: 3, ... }
  // recentSessions = [{ id, class_id, attendance_count, ... }]
}

// 2. Student Dashboard (uses hook)
export default function StudentDashboard() {
  const { stats, courses, trendData, refresh } = useStudentDashboard(studentId);
  // stats = { enrolledCourses: 3, attendanceRate: 92%, totalSessions: 45 }
  // courses = [{ id, course_code, course_title, ... }]
  // trendData = [{ month: "Jan", attendance: 5 }, ...]
}

// 3. Data Flow
UserRepository
  ↓
├── getProfileById(userId)
└── fetchProfilesByIds([userIds])
    ↓
    Profile loaded with full details

CourseRepository
  ├── findByLecturer(lecturerId)
  └── findByStudent(studentId)
    ↓
    Courses loaded with proper filtering

SessionRepository
  ├── findByLecturer(lecturerId)
  └── getActiveByLecturer(lecturerId)
    ↓
    Sessions loaded for tracking

AttendanceRepository
  ├── findBySession(sessionId)
  ├── findByStudent(studentId)
  └── create(attendanceData)
    ↓
    Attendance recorded with location/time

StatisticsRepository
  ├── getLecturerStats(lecturerId)
  ├── getStudentStats(studentId)
  ├── getSessionPerformance(sessionId)
  └── getAttendanceTrendData(studentId)
    ↓
    Aggregated statistics calculated
```

---

## Migration Path: Convert Old Component to New Architecture

### Before (Old Code - 710 lines):
```javascript
// ❌ Direct Supabase, mixed responsibilities
export default function LecturerDashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    // Fetch courses
    const { data: courses } = await supabase.from('classes').select('*');
    
    // Fetch enrollments
    const { data: enrollments } = await supabase.from('class_enrollments').select('*');
    
    // Calculate stats
    setStats({ ... });
  }, []);

  return <div>{/* Render everything */}</div>;
}
```

### After (New Code - 120 lines):
```javascript
// ✅ Clean separation of concerns
export default function LecturerDashboard() {
  const { stats, courses, loading, error } = useLecturerDashboard(user?.id);

  return (
    <div>
      <LecturerStatsGrid stats={stats} />
      <RecentSessionsList sessions={courses} loading={loading} />
    </div>
  );
}

// Hook handles all data fetching
function useLecturerDashboard(lecturerId) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      // Use repositories instead of direct Supabase
      const data = await StatisticsRepository.getLecturerStats(lecturerId);
      setStats(data);
    };
    fetchData();
  }, [lecturerId]);

  return { stats, loading, error, refresh };
}
```

---

## Key Principles

| Principle | Before | After |
|-----------|--------|-------|
| **Data Access** | Scattered across components | Centralized in repositories |
| **Testability** | Need Supabase + credentials | Mock repositories easily |
| **Component Size** | 700+ lines | 100-150 lines |
| **Error Handling** | Inconsistent | Centralized in repositories |
| **Reusability** | Hardcoded queries | Composable hooks |
| **Maintenance** | Change schema = update everywhere | Change schema = update repository |

---

## Summary

The repository pattern in LOCUS provides:

✅ **Clear Separation**: Data access ≠ Business logic ≠ Presentation  
✅ **Testability**: Mock any repository for unit tests  
✅ **Maintainability**: Single source of truth for each entity  
✅ **Scalability**: Easy to add new repositories or swap implementations  
✅ **Type Safety**: JSDoc types provide IDE autocomplete  
✅ **Error Handling**: Consistent error management  

---

## Next Steps

1. Update `src/routes/AppRoutes.jsx` to use refactored components:
   ```javascript
   import LecturerDashboard from '../features/dashboard/LecturerDashboardRefactored';
   import StudentDashboard from '../features/dashboard/StudentDashboardRefactored';
   ```

2. Add mock repositories for unit tests

3. Implement remaining repositories (e.g., FileRepository for exports)

4. Add loading skeletons and error boundaries

5. Setup Sentry for production error tracking
