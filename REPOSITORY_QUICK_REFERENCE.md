# Repository Pattern - Quick Reference & Examples

## Quick Start

### 1. Basic Repository Usage in a Component

```javascript
import { useLecturerDashboard } from '../../hooks/useDashboardRepository';

export function MyComponent() {
  const { stats, recentSessions, loading, error, refresh } = useLecturerDashboard(lecturerId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Total Students: {stats?.totalStudents}</h2>
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

---

## Repository Methods Reference

### UserRepository

```javascript
import { UserRepository } from '../repositories/implementations';

// Get single profile
const profile = await UserRepository.getProfileById('user-123');
// Returns: { id, full_name, email, role, matric_number, ... }

// Get with user data
const { user, profile } = await UserRepository.fetchUserWithProfile('user-123');

// Batch fetch profiles (efficient for lists)
const profiles = await UserRepository.fetchProfilesByIds(['id1', 'id2', 'id3']);
// Returns: Array of profiles
```

### CourseRepository

```javascript
import { CourseRepository } from '../repositories/implementations';

// Lecturer's courses
const courses = await CourseRepository.findByLecturer('lecturer-123');
// Returns: [{ id, course_code, course_title, capacity, ... }]

// Student's enrolled courses
const enrolledCourses = await CourseRepository.findByStudent('student-456');
// Returns: [{ id, course_code, course_title, ... }]

// Single course details
const course = await CourseRepository.getById('course-789');

// Create new course
const newCourse = await CourseRepository.create({
  lecturer_id: 'lecturer-123',
  course_code: 'CS401',
  course_title: 'Advanced Algorithms',
  description: 'Deep dive into DSA',
  capacity: 50
});
```

### SessionRepository

```javascript
import { SessionRepository } from '../repositories/implementations';

// Recent sessions (with pagination)
const sessions = await SessionRepository.findByLecturer('lecturer-123', {
  limit: 10,
  orderBy: 'created_at'
});
// Returns: [{ id, class_id, otp_code, expires_at, ... }]

// Single session
const session = await SessionRepository.getById('session-456');

// Active session for lecturer
const activeSession = await SessionRepository.getActiveByLecturer('lecturer-123');
// Returns: First non-expired session or null

// Create session
const newSession = await SessionRepository.create({
  lecturer_id: 'lecturer-123',
  class_id: 'course-789',
  otp_code: '123456',
  expires_at: new Date(Date.now() + 3600000).toISOString(),
  location_requirement: 'required',
  latitude: 6.5244,
  longitude: 3.3792,
  radius_meters: 100
});
```

### AttendanceRepository

```javascript
import { AttendanceRepository } from '../repositories/implementations';

// Get session attendance logs
const logs = await AttendanceRepository.findBySession('session-456');
// Returns: [{ id, student_id, signed_at, latitude, longitude, ... }]

// Get student's attendance history
const history = await AttendanceRepository.findByStudent('student-456', { limit: 50 });

// Count attendance in session
const count = await AttendanceRepository.countBySession('session-456');
// Returns: Number

// Record attendance
const log = await AttendanceRepository.create({
  student_id: 'student-456',
  session_id: 'session-456',
  signed_at: new Date().toISOString(),
  latitude: 6.5244,
  longitude: 3.3792,
  location_status: 'within_range'
});

// Check if already attended
const hasAttended = await AttendanceRepository.exists('student-456', 'session-456');
// Returns: boolean
```

### EnrollmentRepository

```javascript
import { EnrollmentRepository } from '../repositories/implementations';

// Course enrollments
const enrollments = await EnrollmentRepository.findByCourse('course-789');
// Returns: [{ id, student_id, class_id, status, enrolled_at, ... }]

// Student enrollments
const courseEnrollments = await EnrollmentRepository.findByStudent('student-456');

// Count students in course
const studentCount = await EnrollmentRepository.countStudentsByCourse('course-789');
// Returns: Number

// Enroll student
const enrollment = await EnrollmentRepository.create('student-456', 'course-789');
```

### StatisticsRepository

```javascript
import { StatisticsRepository } from '../repositories/implementations';

// Lecturer stats
const lecturerStats = await StatisticsRepository.getLecturerStats('lecturer-123');
// Returns: { totalStudents, totalCourses, totalSessions, overallRate }

// Session performance
const performance = await StatisticsRepository.getSessionPerformance('session-456', 50);
// Returns: { studentsPresent, expectedStudents, attendanceDensity }

// Student stats
const studentStats = await StatisticsRepository.getStudentStats('student-456');
// Returns: { enrolledCourses, attendanceRate, totalSessions }

// Attendance trend
const trendData = await StatisticsRepository.getAttendanceTrendData('student-456', 6);
// Returns: [{ month: "Jan", attendance: 5 }, ...]
```

---

## Common Patterns

### Pattern 1: Fetch Related Data in Parallel

```javascript
export function useMultipleData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [profile, courses, stats] = await Promise.all([
          UserRepository.getProfileById(userId),
          CourseRepository.findByStudent(userId),
          StatisticsRepository.getStudentStats(userId)
        ]);

        setData({ profile, courses, stats });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { data, loading };
}
```

### Pattern 2: Filter & Transform Data

```javascript
export function useLecturerCoursesWithStats(lecturerId) {
  const [coursesWithStats, setCoursesWithStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get courses
      const courses = await CourseRepository.findByLecturer(lecturerId);

      // Enrich with stats
      const enriched = await Promise.all(
        courses.map(async (course) => ({
          ...course,
          studentCount: await EnrollmentRepository.countStudentsByCourse(course.id)
        }))
      );

      setCoursesWithStats(enriched);
    };

    fetchData();
  }, [lecturerId]);

  return coursesWithStats;
}
```

### Pattern 3: Paginated Data Fetching

```javascript
export function usePaginatedSessions(lecturerId, pageSize = 10) {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      const data = await SessionRepository.findByLecturer(lecturerId, {
        limit: pageSize,
        offset: page * pageSize
      });

      setSessions(prev => [...prev, ...data]);
      setHasMore(data.length === pageSize);
    };

    fetchPage();
  }, [lecturerId, page, pageSize]);

  return {
    sessions,
    loadMore: () => setPage(p => p + 1),
    hasMore
  };
}
```

### Pattern 4: Real-time Sync After Actions

```javascript
export function useLiveAttendance(sessionId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AttendanceRepository.findBySession(sessionId);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Setup real-time subscription
    const channel = supabase
      .channel(`attendance_${sessionId}`)
      .on('postgres_changes', 
        { event: 'INSERT', table: 'attendance_logs', filter: `session_id=eq.${sessionId}` },
        () => {
          // Refetch when new attendance added
          loadData();
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [sessionId]);

  return { logs, loading };
}
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch with User Feedback

```javascript
export function useAttendanceRecord(studentId, sessionId) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);

  const recordAttendance = async (data) => {
    try {
      setRecording(true);
      setError(null);

      const result = await AttendanceRepository.create({
        student_id: studentId,
        session_id: sessionId,
        signed_at: new Date().toISOString(),
        ...data
      });

      return result;
    } catch (err) {
      const message = err.message === 'Failed to record attendance'
        ? 'Unable to mark attendance. Please try again.'
        : 'An unexpected error occurred.';
      
      setError(new Error(message));
      return null;
    } finally {
      setRecording(false);
    }
  };

  return { recordAttendance, recording, error };
}
```

### Pattern 2: Fallback Data

```javascript
export function useStudentStatsWithFallback(studentId) {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    attendanceRate: 0,
    totalSessions: 0
  });

  useEffect(() => {
    StatisticsRepository.getStudentStats(studentId)
      .then(setStats)
      .catch(error => {
        console.error('Failed to fetch stats:', error);
        // Keep default values instead of showing error
      });
  }, [studentId]);

  return stats;
}
```

---

## Mock Repository Example (Testing)

```javascript
// __mocks__/repositories.js
export const MockUserRepository = {
  async getProfileById(userId) {
    return {
      id: userId,
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      matric_number: '2024/001',
      created_at: '2024-01-15'
    };
  }
};

export const MockCourseRepository = {
  async findByLecturer(lecturerId) {
    return [
      {
        id: 'course-1',
        course_code: 'CS101',
        course_title: 'Introduction to CS',
        capacity: 50
      }
    ];
  }
};

// Test file
import { renderHook, waitFor } from '@testing-library/react';
import { useLecturerDashboard } from '../hooks/useDashboardRepository';
import { MockCourseRepository } from '../__mocks__/repositories';

jest.mock('../repositories/implementations', () => ({
  CourseRepository: MockCourseRepository,
  // ... other mocks
}));

test('fetches lecturer courses', async () => {
  const { result } = renderHook(() => useLecturerDashboard('lecturer-1'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.courses).toHaveLength(1);
  expect(result.current.courses[0].course_code).toBe('CS101');
});
```

---

## Performance Tips

### 1. Use Batch Operations
```javascript
// ❌ Bad: Multiple calls
const profile1 = await UserRepository.getProfileById(id1);
const profile2 = await UserRepository.getProfileById(id2);
const profile3 = await UserRepository.getProfileById(id3);

// ✅ Good: Single batch call
const profiles = await UserRepository.fetchProfilesByIds([id1, id2, id3]);
```

### 2. Parallel Fetching with Promise.all
```javascript
// ❌ Bad: Sequential (slow)
const courses = await CourseRepository.findByLecturer(lecturerId);
const stats = await StatisticsRepository.getLecturerStats(lecturerId);

// ✅ Good: Parallel (fast)
const [courses, stats] = await Promise.all([
  CourseRepository.findByLecturer(lecturerId),
  StatisticsRepository.getLecturerStats(lecturerId)
]);
```

### 3. Memoize Repository Results
```javascript
export function useCachedCourses(lecturerId) {
  const [courses, setCourses] = useState([]);
  const cacheRef = useRef({});

  useEffect(() => {
    if (cacheRef.current[lecturerId]) {
      setCourses(cacheRef.current[lecturerId]);
      return;
    }

    CourseRepository.findByLecturer(lecturerId)
      .then(data => {
        cacheRef.current[lecturerId] = data;
        setCourses(data);
      });
  }, [lecturerId]);

  return courses;
}
```

---

## Summary

| Concept | Use Case | Example |
|---------|----------|---------|
| **Repository** | Data access logic | `CourseRepository.findByLecturer()` |
| **Hook** | State + repository logic | `useLecturerDashboard(id)` |
| **Component** | Render + interact | `<LecturerDashboard />` |
| **Type** | Data shape | `@typedef Course` |

All files are located in:
- **Types**: `src/types/index.js`
- **Repositories**: `src/repositories/` 
- **Hooks**: `src/hooks/useDashboardRepository.js`
- **Components**: `src/features/dashboard/` and `src/components/dashboard/`
