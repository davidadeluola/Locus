# LOCUS Project - 90-Day Implementation Roadmap
## _From Current State to Production-Ready Architecture_

**Timeline**: 12 weeks (Feb 25 - May 22, 2026)
**Team Size**: 2-3 developers recommended
**Dependency**: Complete as-is deployment optional, parallel execution preferred

---

## WEEK 1-2: FOUNDATIONAL HARDENING (P0 - Non-negotiable)

### Goal
Establish practices that prevent crashes in production

### Week 1 Tasks

#### ✅ T1.1: Error Boundary Implementation
**Effort**: 4 hours | **Owner**: Lead dev
**Deliverable**: Zero unhandled component crashes

```javascript
// src/components/shared/ErrorBoundary.jsx
// Add to critical paths:
// ├─ <ErrorBoundary><AppRoutes /></ErrorBoundary>
// ├─ <ErrorBoundary><DashboardRouter /></ErrorBoundary>
// ├─ <ErrorBoundary><LecturerDashboard /></ErrorBoundary>
```

**Testing**: 
```bash
npm test -- ErrorBoundary.test.js
# Verify error states render fallback UI
```

---

#### ✅ T1.2: Environment Validation
**Effort**: 3 hours | **Owner**: DevOps/Lead
**Deliverable**: App won't start without required env vars

```javascript
// src/utils/envValidator.js
export function validateEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_KEY',
    'VITE_API_URL',
  ];
  
  const missing = required.filter(v => !import.meta.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

// src/main.jsx
validateEnvironment().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
});
```

**Deliverables**:
- [ ] `src/.env.example` created
- [ ] Env validation on startup
- [ ] Error message if missing

---

#### ✅ T1.3: Sentry Integration (Error Tracking)
**Effort**: 2 hours | **Owner**: Lead dev
**Deliverable**: All errors logged automatically

```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

---

### Week 2 Tasks

#### ✅ T2.1: Jest + Test Infrastructure
**Effort**: 6 hours | **Owner**: Test specialist
**Deliverable**: First 10 unit tests passing

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Create:
```
src/__tests__/
├── setup.js              # Jest config & mocks
├── fixtures/
│   ├── mockData.js       # Test data
│   └── mockSupabase.js   # Supabase mock
└── services/
    └── sessionStorageManager.test.js
```

---

#### ✅ T2.2: API Input Validation Layer
**Effort**: 4 hours | **Owner**: Backend/Lead
**Deliverable**: All API responses validated

```javascript
// src/services/utils/validator.js
import { z } from 'zod';

export const schemas = {
  Session: z.object({
    id: z.string().uuid(),
    otp_secret: z.string().length(6),
    expires_at: z.string().datetime(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  
  Attendance: z.object({
    id: z.string().uuid(),
    session_id: z.string().uuid(),
    student_id: z.string().uuid(),
    signed_at: z.string().datetime(),
    distance_meters: z.number().positive(),
  }),
};

// Usage in service:
export async function fetchSession(sessionId) {
  const { data } = await supabase.from('sessions').select().eq('id', sessionId).single();
  return schemas.Session.parse(data);  // Throws if invalid
}
```

---

#### ✅ T2.3: Monitoring & Observability
**Effort**: 3 hours | **Owner**: DevOps
**Deliverable**: Metrics dashboard

Setup:
- [ ] Sentry dashboard accessible
- [ ] Performance monitoring enabled
- [ ] Release tracking ready

---

### Week 1-2 Validation Checklist
```
✓ App starts even if env vars missing (shows error, doesn't crash)
✓ Any unhandled error caught by boundary, logged to Sentry
✓ 10 unit tests passing (run `npm test`)
✓ All API responses validated
✓ Env example documented
✓ P0 code review process documented
✓ Deployment checklist created
```

---

## WEEK 3-6: SEPARATION OF CONCERNS (P1 - Architecture)

### Goal
Break large components, extract services, establish repository pattern

### Week 3: Component Analysis & Planning

#### ✅ T3.1: Audit Large Components
**Effort**: 4 hours | **Owner**: Lead architect
**Output**: Breakdown plan for each

```
LecturerDashboard.jsx (710 lines)
├─ Problem 1: Fetches 5 data sources
├─ Problem 2: Calculates 3 different stats
├─ Problem 3: Manages session state
├─ Problem 4: Renders 4+ features
│
└─ Solution: Split into 5 components
   ├─ DashboardContainer (80 lines - layout + orchestration)
   ├─ SessionCard (80 lines - session display)
   ├─ StatsGrid (60 lines - stats only)
   ├─ PerformanceChart (100 lines - chart rendering)
   └─ CoursePerformance (80 lines - course stats)
   
   Plus hooks:
   ├─ useDashboardData (fetch all data)
   ├─ useAttendanceStats (calculate stats)
   └─ useSubscriptionManager (manage subscriptions)
```

---

#### ✅ T3.2: Create Service Layer Foundation
**Effort**: 6 hours | **Owner**: Backend/Lead
**Output**: Directory structure + 2 services

```
src/services/
├── api/
│   ├── index.js              # Export all services
│   ├── courseService.js      # Course CRUD + fetch
│   ├── sessionService.js     # Session CRUD + logic
│   └── attendanceService.js  # Attendance CRUD + logic
│
├── data/
│   ├── supabaseAdapter.js    # Wrapper around Supabase queries
│   └── localStorageAdapter.js
│
└── subscriptions/
    ├── subscriptionManager.js # Centralize all subscriptions
    └── eventBus.js            # Event emission for updates
```

---

### Week 4: Component Refactoring Batch 1

#### ✅ T4.1: Refactor LecturerDashboard
**Effort**: 16 hours | **Owner**: 2 devs | **Parallel**: T4.2-4.3
**Output**: 5 components <100 lines each

Breaking down phase:
```javascript
// Before: All in LecturerDashboard
├─ Fetch courses/students/sessions
├─ Calculate performance
├─ Set up subscriptions
├─ Render dashboard
└─ Render session list (2 different displays)

// After: Modular with clear responsibilities
DashboardContainer.jsx
  ├─ Use useDashboardData hook
  ├─ Use useSubscriptionManager
  ├─ Render grid layout
  └─ Pass data to children

SessionCard.jsx
  ├─ Props: session, stats
  ├─ Render only
  └─ <150 lines

StatsGrid.jsx
  ├─ Props: stats object
  ├─ Render metrics
  └─ <100 lines

PerformanceChart.jsx
  ├─ Props: attendanceTrendData
  ├─ Render Recharts component
  └─ <100 lines

useDashboardData.js
  ├─ Fetch courses
  ├─ Fetch students
  ├─ Fetch sessions
  ├─ Setup subscriptions
  └─ Return { courses, students, sessions, loading, error }
```

**Testing**:
```bash
npm test -- DashboardContainer.test.js
npm test -- SessionCard.test.js
npm test -- useDashboardData.test.js
# Verify each component renders in isolation
```

---

#### ✅ T4.2: Create First Service Layer (Parallel)
**Effort**: 12 hours | **Owner**: 1 dev | **Parallel**: T4.1
**Output**: courseService.js + sessionService.js complete

```javascript
// src/services/api/courseService.js
export const courseService = {
  async fetchCourses(lecturerId) {
    // Query
    // Validate
    // Cache
    // Return
  },
  
  async createCourse(courseData) {
    // Validate
    // Mutate
    // Invalidate cache
    // Return
  },
  
  async deleteCourse(courseId) {
    // Check permissions
    // Mutate
    // Return
  },
};
```

---

#### ✅ T4.3: Create Repository Pattern (Parallel)
**Effort**: 10 hours | **Owner**: 1 dev | **Parallel**: T4.1-4.2
**Output**: supabaseAdapter.js with all queries

```javascript
// src/services/data/supabaseAdapter.js
class SupabaseRepository {
  async query(table, { select, filters, order }) {
    let query = this.client.from(table).select(select || '*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (order) {
      query = query.order(order.column, { ascending: order.asc });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
```

---

### Week 5: Component Refactoring Batch 2

#### ✅ T5.1: Refactor AttendanceList
**Effort**: 14 hours | **Owner**: 1 dev | **Parallel**: T5.2
**Output**: 4 components <120 lines each

```javascript
// Before: 612 lines in one component
AttendanceList.jsx
├─ Fetch session info
├─ Fetch enrolled students  
├─ Fetch attendance logs
├─ Setup 2 subscriptions
├─ Calculate stats
├─ Render tables
└─ Handle exports

// After: Modular architecture
AttendanceContainer.jsx        (80 lines - layout)
SessionHeader.jsx              (60 lines - session info)
AttendanceTable.jsx            (120 lines - table only)
EnrolledStudentsList.jsx       (100 lines - enrollments)

useAttendanceData.js           (70 lines - fetch logic)
useEnrolledStudents.js         (50 lines - student fetching)
attendanceExportService.js     (60 lines - CSV export)
```

---

#### ✅ T5.2: Create Subscription Manager (Parallel)
**Effort**: 10 hours | **Owner**: 1 dev  
**Output**: Centralized subscriptions

```javascript
// src/services/subscriptions/subscriptionManager.js
class SubscriptionManager {
  subscriptions = new Map();
  
  subscribe(key, { table, filter, callback }) {
    // Prevent duplicates
    if (this.subscriptions.has(key)) {
      return; // Already subscribed
    }
    
    const channel = supabase
      .channel(key)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter,
      }, callback)
      .subscribe();
    
    this.subscriptions.set(key, channel);
  }
  
  unsubscribe(key) {
    const channel = this.subscriptions.get(key);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(key);
    }
  }
  
  unsubscribeAll() {
    this.subscriptions.forEach((channel, key) => {
      this.unsubscribe(key);
    });
  }
}

export const subscriptionManager = new SubscriptionManager();
```

---

### Week 6: Testing & Documentation

#### ✅ T6.1: Write Component Tests
**Effort**: 12 hours | **Owner**: Test specialist
**Output**: Tests for all refactored components

```javascript
// src/__tests__/components/DashboardContainer.test.js
describe('DashboardContainer', () => {
  it('renders loading state', () => {
    const { getByText } = render(
      <DashboardContainer />
    );
    expect(getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('renders data when loaded', async () => {
    useDashboardData.mockReturnValue({
      courses: mockCourses,
      loading: false,
    });
    
    const { getByText } = render(
      <DashboardContainer />
    );
    
    expect(getByText(mockCourses[0].course_code)).toBeInTheDocument();
  });
});
```

---

#### ✅ T6.2: Create Service Documentation
**Effort**: 4 hours | **Owner**: Tech writer
**Output**: Service API docs

```javascript
// src/services/api/README.md
# Service Layer Documentation

## courseService

### fetchCourses(lecturerId)
Fetches all courses for a lecturer

**Parameters**:
- lecturerId (string, UUID): The lecturer's user ID

**Returns**:
```typescript
Promise<Course[]>

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  level?: number;
  department?: string;
  created_at: string;
}
```

**Errors**:
- Throws if lecturerId invalid
- Throws if DB call fails

**Example**:
```javascript
const courses = await courseService.fetchCourses(user.id);
```
```

---

### Week 3-6 Validation Checklist
```
Phase 1 Completion Criteria:
✓ LecturerDashboard: 710 → 5 components (<100 lines each)
✓ AttendanceList: 612 → 4 components (<120 lines each)
✓ SessionCreator: 300 → 3 components
✓ All Supabase queries in services only (not in components)
✓ Repository pattern established
✓ 10+ component tests passing
✓ Service documentation complete
✓ No component >200 lines
✓ Code review: SOLID score improved 4.2 → 6.5
```

---

## WEEK 7-8: STATE MANAGEMENT UNIFICATION (P2)

### Goal
Single source of truth, reactive updates, consistent data flow

### Week 7: Store Architecture & Implementation

#### ✅ T7.1: Unified Zustand Store
**Effort**: 8 hours | **Owner**: Lead dev
**Output**: Centralized state management

```javascript
// src/store/rootStore.js
import { create } from 'zustand';

export const useRootStore = create((set, get) => ({
  // Auth state
  user: null,
  profile: null,
  activeSession: null,
  
  // Dashboard state
  courses: [],
  students: [],
  sessions: [],
  
  // Attendance state
  attendanceLogs: [],
  enrolledStudents: [],
  
  // Loading/Error states
  loading: { courses: false, sessions: false },
  errors: { courses: null, sessions: null },
  
  // Actions
  setUser: (user) => set({ user }),
  setCourses: (courses) => set({ courses }),
  addAttendanceLog: (log) => set((state) => ({
    attendanceLogs: [...state.attendanceLogs, log],
  })),
  
  // Side effects
  initialize: async () => {
    // Load auth
    // Load courses
    // Setup subscriptions
  },
}));

// Selectors for memoization
export const selectCourses = (state) => state.courses;
export const selectActiveSession = (state) => state.activeSession;
```

---

#### ✅ T7.2: Real-time Stream Integration
**Effort**: 6 hours | **Owner**: Real-time specialist
**Output**: Event-driven updates to store

```javascript
// src/store/subscriptionSlice.js
export const createSubscriptionSlice = (set) => ({
  setupSubscriptions: async () => {
    // Attendance subscription
    subscriptionManager.subscribe('attendance', {
      table: 'attendance_logs',
      filter: `session_id=eq.${activeSessionId}`,
      callback: (payload) => {
        if (payload.eventType === 'INSERT') {
          set((state) => ({
            attendanceLogs: [...state.attendanceLogs, payload.new],
          }));
        }
      },
    });
    
    // Course subscription
    subscriptionManager.subscribe('courses', {
      table: 'classes',
      filter: `lecturer_id=eq.${userId}`,
      callback: (payload) => {
        // Handle INSERT/UPDATE/DELETE
      },
    });
  },
  
  teardownSubscriptions: () => {
    subscriptionManager.unsubscribeAll();
  },
});
```

---

### Week 8: Query Caching & Validation

#### ✅ T8.1: React Query Integration (Optional)
**Effort**: 8 hours | **Owner**: Data specialist
**Output**: Automatic caching + refetch

```bash
npm install @tanstack/react-query
```

```javascript
// src/hooks/useQuery.js wrapper around React Query
import { useQuery } from '@tanstack/react-query';

export function useCourses(lecturerId) {
  return useQuery({
    queryKey: ['courses', lecturerId],
    queryFn: () => courseService.fetchCourses(lecturerId),
    staleTime: 5 * 60 * 1000,             // 5 minutes
    gcTime: 10 * 60 * 1000,               // 10 minutes
    refetchOnWindowFocus: false,
  });
}
```

**Benefits**:
- No manual cache invalidation
- Automatic background refetch
- Request deduplication

---

#### ✅ T8.2: Output Validation Pipeline
**Effort**: 4 hours | **Owner**: QA
**Output**: All data validated before store

```javascript
// src/store/middleware/validationMiddleware.js
export const withValidation = (schema) => (action) => (state) => {
  const result = action(state);
  
  // Validate result
  try {
    schema.parse(result);
  } catch (error) {
    console.error('Schema validation failed:', error);
    Sentry.captureException(error);
    return state; // Don't update if invalid
  }
  
  return result;
};

// Usage
setCourses: withValidation(CourseSchema.array()),
```

---

### Week 7-8 Validation Checklist
```
✓ Single Zustand store as source of truth
✓ All real-time actions go through store
✓ No component directly calls Supabase
✓ Selectors created for memoization
✓ React Query cache working (optional)
✓ All state validated before storage
✓ Store tests passing (50+ test cases)
✓ Subscription manager preventing duplicates
```

---

## WEEK 9-12: TESTING COVERAGE & HARDENING

### Goal
80%+ test coverage, production readiness

### Testing Strategy by Layer

```
Unit Tests (60% effort)
├─ Services (100% coverage)
├─ Hooks (90% coverage)
└─ Utils (100% coverage)

Integration Tests (30% effort)
├─ Store interactions (80% coverage)
├─ Service + Hook combos
└─ End-to-end flows (critical paths)

E2E Tests (10% effort)
├─ Critical user flows only
├─ Course creation → Session creation
└─ Student check-in → Attendance record
```

### Week 9-10: Unit & Integration Tests

#### ✅ T9.1: Service Layer Tests (60+ tests)
**Effort**: 20 hours | **Owner**: Test specialists (2)

```javascript
// src/__tests__/services/courseService.test.js
describe('courseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.reset();
  });
  
  describe('fetchCourses', () => {
    it('returns courses for valid lecturer', async () => {
      mockSupabase.from('classes').select.mockResolvedValue({
        data: mockCourses,
      });
      
      const result = await courseService.fetchCourses(LECTURER_ID);
      
      expect(result).toEqual(mockCourses);
    });
    
    it('throws on invalid lecturer ID', async () => {
      await expect(
        courseService.fetchCourses('invalid')
      ).rejects.toThrow();
    });
    
    it('validates response schema', async () => {
      const invalidData = [{ id: 'uuid', /* missing required fields */ }];
      mockSupabase.from('classes').select.mockResolvedValue({
        data: invalidData,
      });
      
      await expect(
        courseService.fetchCourses(LECTURER_ID)
      ).rejects.toThrow();
    });
  });
});
```

---

#### ✅ T9.2: Hook Tests (40+ tests)
**Effort**: 12 hours | **Owner**: Test specialist

```javascript
// src/__tests__/hooks/useCourses.test.js
describe('useCourses', () => {
  it('fetches and returns courses', async () => {
    const { result } = renderHook(() => useCourses(LECTURER_ID));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.courses).toEqual(mockCourses);
  });
  
  it('creates course and updates state', async () => {
    const { result } = renderHook(() => useCourses(LECTURER_ID));
    
    act(() => {
      result.current.createCourse(newCourse);
    });
    
    await waitFor(() => {
      expect(result.current.courses).toContain(newCourse);
    });
  });
});
```

---

#### ✅ T9.3: Store Tests (30+ tests)
**Effort**: 10 hours | **Owner**: Test specialist

```javascript
// src/__tests__/store/rootStore.test.js
describe('rootStore', () => {
  it('updates courses and maintains consistency', () => {
    const { getState, setState } = useRootStore;
    
    setState({ courses: mockCourses });
    
    expect(getState().courses).toEqual(mockCourses);
    expect(getState().courses.length).toBe(3);
  });
  
  it('handles subscription updates', () => {
    const { getState, getSubscriptions } = useRootStore;
    
    // Simulate new attendance log
    getState().addAttendanceLog(mockLog);
    
    expect(getState().attendanceLogs).toContain(mockLog);
  });
});
```

---

### Week 11: Component & E2E Tests

#### ✅ T10.1: Component Snapshot & Interaction Tests
**Effort**: 14 hours | **Owner**: Test specialist

```javascript
// src/__tests__/components/SessionCard.test.js
describe('SessionCard', () => {
  it('renders correctly', () => {
    const { container } = render(
      <SessionCard session={mockSession} stats={mockStats} />
    );
    expect(container).toMatchSnapshot();
  });
  
  it('displays session countdown', async () => {
    const { getByText } = render(
      <SessionCard session={mockSession} />
    );
    
    expect(getByText(/04:59/)).toBeInTheDocument(); // 5 min
  });
  
  it('calls onTerminate when terminate button clicked', async () => {
    const onTerminate = jest.fn();
    const { getByText } = render(
      <SessionCard 
        session={mockSession} 
        onTerminate={onTerminate} 
      />
    );
    
    fireEvent.click(getByText(/terminate/i));
    expect(onTerminate).toHaveBeenCalled();
  });
});
```

---

#### ✅ T10.2: Critical E2E Flows
**Effort**: 8 hours | **Owner**: QA

```javascript
// src/__tests__/e2e/courseToSession.test.js
describe('Course Creation to Session Flow (E2E)', () => {
  it('creates course then session in one workflow', async () => {
    // 1. Login
    const user = await loginAs(LECTURER);
    
    // 2. Navigate to courses
    navigate('/dashboard/courses');
    
    // 3. Create course  
    fillForm({ code: 'CPE403', title: 'Database Systems' });
    clickButton('Create Course');
    
    // 4. Verify course created
    expect(screen.getByText('CPE403')).toBeInTheDocument();
    
    // 5. Auto-route to dashboard happens
    expect(location.pathname).toBe('/dashboard');
    
    // 6. SessionCreator should have course pre-selected
    expect(screen.getByValue('CPE403')).toBeInTheDocument();
    
    // 7. Create session
    clickButton('Initiate Session');
    
    // 8. Verify session created and persisted
    expect(screen.getByText(/live session/i)).toBeVisible();
    
    // 9. Refresh page
    location.reload();
    
    // 10. Session still there (restored from localStorage)
    expect(screen.getByText(/live session/i)).toBeVisible();
  });
});
```

---

### Week 12: Testing Summary & Metrics

#### ✅ T11.1: Coverage Report
**Output**: Coverage analysis

```bash
npm test -- --coverage

# Target output:
Statements   : 82.3%  ( >80% target )
Branches     : 78.1%  ( >75% target )
Functions    : 85.4%  ( >80% target )
Lines        : 83.7%  ( >80% target )
```

---

### Week 9-12 Validation Checklist
```
✓ >200 test files created
✓ >80% overall coverage
✓ All services 100% tested
✓ All hooks 90%+ tested
✓ Critical E2E flows passing
✓ 0 test flakiness issues
✓ CI/CD pipeline running tests
✓ Test documentation complete
```

---

## FINAL METRICS & GO-LIVE CHECKLIST

### Code Quality Scorecard

| Metric | Target | Achieved | Pass |
|--------|--------|----------|------|
| **Avg Component Size** | <150 lines | ? | 🎯 |
| **Test Coverage** | >80% | ? | 🎯 |
| **SOLID Score** | 7.5+/10 | ? | 🎯 |
| **Bundle Size** | <400KB | ? | 🎯 |
| **Lighthouse** | >85 | ? | 🎯 |
| **Error Rate** | <0.1% | ? | 🎯 |

### Deployment Readiness

```
Pre-Launch Checklist:
├─ Error boundaries installed ...................... [ ]
├─ Environment validation in place ................. [ ]
├─ Sentry actively monitoring errors .............. [ ]
├─ Components refactored (<200 lines) ............. [ ]
├─ Services layer complete ........................ [ ]
├─ Repository pattern implemented ................. [ ]
├─ Tests passing (>80% coverage) .................. [ ]
├─ Performance optimized (<300KB gzipped) ......... [ ]
├─ Documentation complete ......................... [ ]
├─ Security audit completed ....................... [ ]
└─ Stakeholder sign-off obtained .................. [ ]
```

---

## POST-LAUNCH: CONTINUOUS IMPROVEMENT

### Month 4-6 (Ongoing)
- [ ] TypeScript migration (phased)
- [ ] Advanced caching strategies
- [ ] Geofencing algorithm hardening
- [ ] TOTP security improvements
- [ ] Offline-first architecture
- [ ] Multi-institutional support

### Metrics Dashboard
```
Weekly Report:
- Build time (target: <45s)
- Bundle size growth (target: <2% weekly)
- Error rate (target: <0.05%)
- Test execution time (target: <3m)
- Customer satisfaction (target: >4.5/5)
```

---

## Leadership Decisions Needed

### Decision 1: React Query vs Zustand Only?
- **Zustand Only**: Simpler, fewer deps (~6 weeks)
- **+ React Query**: Better caching, auto-refetch (~8 weeks)
- **Recommendation**: React Query (future-proof at scale)

### Decision 2: TypeScript Timeline?
- **Phased (File-by-file)**: Parallel with features (Weeks 9+)
- **Big Bang**: After Phase 1 complete (Week 7)
- **Recommendation**: Phased (don't block features)

### Decision 3: Deployment Strategy?
- **Blue/Green**: Zero-downtime (recommended)
- **Canary**: Gradual rollout with monitoring
- **Rolling**: Sequential instance updates

---

**End of 90-Day Roadmap**

_Questions on implementation? Timeline adjustable based on team capacity._
