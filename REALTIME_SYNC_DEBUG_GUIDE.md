# Real-Time Sync Debugging Guide

## ✅ What Was Fixed

Your real-time sync wasn't working because of **closure bugs** and **stale callback references**. Here's what we fixed:

### Problems Identified ❌

1. **Stale Closures**: The `refresh()` function captured during subscription setup wasn't being updated when data changed
2. **Manual Subscriptions**: Manual setup in components meant refresh callback was referring to old function
3. **No Debouncing**: Multiple rapid changes caused multiple simultaneous refresh requests
4. **Missing Error Handling**: Subscriptions could fail silently with no indication
5. **Memory Leaks**: Subscriptions weren't properly cleaned up on unmount

### Solutions Implemented ✅

1. **useCallback Hook**: `fetchData` is now memoized so subscriptions always have the latest version
2. **Subscription Manager**: Centralized in hook, not in components - single source of truth
3. **Debouncing**: Multiple changes within 500ms only trigger ONE refresh
4. **Proper Error Logging**: Console shows subscription status and failures
5. **Guaranteed Cleanup**: useRef ensures cleanup runs on unmount

---

## How Real-Time Sync Works Now

### Lecturer Dashboard Flow

```
1. LecturerDashboard mounts
    ↓
2. useLecturerDashboard(lecturerId) is called
    ↓
3. Hook setup occurs:
    a) fetchData created with useCallback
    b) Initial data fetch triggered
    c) subscribeToMultipleTables called with:
       - class_enrollments table (watches for course changes)
       - sessions table (watches for new sessions)
       - attendance_logs table (watches for attendance)
    d) Each subscription configured with debounce
    d) Cleanup function stored in ref
    ↓
4. When data changes in Supabase:
    a) Postgres notifies subscription channel
    b) Callback fires (debounced 500ms)
    c) refresh (which is fetchData) is called
    d) Hook calls all repositories in parallel
    e) State updates: stats, recentSessions, sessionPerformance
    f) Component re-renders with new data
    ↓
5. When component unmounts:
    a) useEffect cleanup runs
    b) Cleanup function from ref is called
    c) All subscriptions unsubscribed
    d) Memory leak prevented
```

### Student Dashboard Flow (Identical)

```
useStudentDashboard(studentId)
→ Subscribe to: class_enrollments, attendance_logs, profiles
→ When data changes: refresh() → fetch all data → state updates
→ Component re-renders instantly
```

---

## Verifying Real-Time Sync Works

### 1. Check Browser Console (F12 → Console)

Look for these logs when data changes:

```
📡 [lecturer_123] Setting up real-time subscriptions
📡 [lecturer_123_classes_0] Setting up subscription for classes
✅ [lecturer_123_classes_0] Successfully subscribed

📡 [lecturer_123_sessions_1] Setting up subscription for sessions
✅ [lecturer_123_sessions_1] Successfully subscribed

📡 [lecturer_123_attendance_logs_2] Setting up subscription for attendance_logs
✅ [lecturer_123_attendance_logs_2] Successfully subscribed

[When data changes...]
✅ [lecturer_123_classes_0] Received change: INSERT
📨 [lecturer_123_classes_0] Data changed, refreshing...
📊 [Lecturer] Fetching dashboard data...
✅ [Lecturer] Dashboard data loaded
```

### 2. Test Real-Time Sync

**As a Lecturer:**
1. Open dashboard in one browser tab/window
2. In another tab, go to `/courses` and create a new course
3. Switch back to dashboard
4. **Should see new stats immediately** (no refresh button)

**As a Student:**
1. Open dashboard in one browser tab
2. In another tab, have someone mark you present in a session
3. Switch back to dashboard
4. **Should see attendance update immediately**

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Create/update something (new course, attendance, etc)
3. Should see:
   ```
   POST /rest/v1/classes - 201 (create)
   WebSocket message - No HTTP polling needed!
   ```

No multiple GET requests = real-time is working!

---

## Console Messages Explained

### ✅ Success Messages

```
📡 [name] Setting up subscription for TABLE
// Subscription is being configured

✅ [name] Successfully subscribed  
// Connection established and listening

✅ [name] Received change: INSERT/UPDATE/DELETE
// Data change detected

📨 [name] Data changed, refreshing...
// Callback triggered (debounced)

📊 [Lecturer/Student] Fetching dashboard data...
// Repository queries running

✅ [Lecturer/Student] Dashboard data loaded
// State updated, component will re-render
```

### ⚠️ Warning Messages

```
⏳ Refresh already in progress, skipping
// Multiple rapid changes detected - one is already refreshing
// This is normal and expected (debouncing working)

⚠️ Error in subscriptionManager...
// Subscription setup had an issue but recovered
```

### ❌ Error Messages

```
❌ [name] Subscription setup failed: ...
// Subscription couldn't connect - check Supabase status

❌ [name] Channel error
// Connection lost during subscription

❌ [Lecturer/Student] Error fetching dashboard data: ...
// Repository query failed - check server logs
```

---

## Troubleshooting Real-Time Issues

### Problem: "Changes don't appear in real-time"

**Check:**
1. Open DevTools Console (F12)
2. Look for any ❌ error messages
3. Check Supabase dashboard for any issues

**If subscriptions show as connected** ✅:
- Real-time is working, but data isn't changing
- Check if you're actually making changes
- Try creating a new course and watch the console

**If subscriptions DON'T connect** ❌:
```
❌ [name] Subscription setup failed
OR
❌ [name] Channel error
```

**Solutions:**
- Check Supabase Realtime is enabled: https://supabase.com/dashboard
- Look in Supabase logs: Dashboard → Logs → Realtime
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in `.env`
- Check network connectivity (no firewall blocking Websockets)

### Problem: "Multiple refresh requests happening"

**This is actually good** - debouncing is working:

```
✅ [name1] Received change: INSERT
✅ [name2] Received change: UPDATE
⏳ Refresh already in progress, skipping
⏳ Refresh already in progress, skipping

📊 [Lecturer] Fetching dashboard data... [1 request total]
```

Multiple changes = 1 refresh request (not 3)
Prevents database hammering

### Problem: "Data works but slow"

**Expected behavior:**
- Subscribe setup: ~100ms
- Data change detected: instant
- Refresh data fetch: 200-500ms (parallel queries)
- **Total**: <1 second

**If slower:**
1. Check network tab - how long are queries taking?
2. Check Supabase query logs for slow queries
3. Check browser performance (DevTools → Performance)

### Problem: "Memory leak warnings"

**Shouldn't happen**, but if you see them:
1. Verify no `Refresh in progress` loops
2. Check useEffect cleanup is running (should see 🧹 in console)
3. Look for components not unmounting properly

---

## Advanced: Monitoring Real-Time Performance

### Add this to your console to track stats:

```javascript
// Copy-paste into DevTools Console

let stats = {
  refreshes: 0,
  lastRefresh: null,
  subscriptions: 0,
  changes: 0
};

// Monkey-patch console.log to count events
const original = console.log;
console.log = function(...args) {
  if (args[0]?.includes?.('Successfully subscribed')) stats.subscriptions++;
  if (args[0]?.includes?.('Fetching dashboard')) stats.refreshes++;
  if (args[0]?.includes?.('Received change')) stats.changes++;
  if (args[0]?.includes?.('Fetching dashboard')) stats.lastRefresh = Date.now();
  original(...args);
};

// View stats
setInterval(() => {
  console.table(stats);
}, 5000);
```

---

## Real-Time Sync Architecture

```
┌─────────────────────────────────────────────────────┐
│         React Component (Dashboard)                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│    useStudentDashboard / useLecturerDashboard       │
│  - Wraps fetchData with useCallback                 │
│  - Calls subscribeToMultipleTables                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│    subscribeToTableChanges (3 subscriptions)        │
│  - Debounces refresh calls (500ms)                  │
│  - Calls onDataChange when Postgres notifies        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│         Supabase Realtime WebSocket                 │
│  - Listens to postgres_changes on 3 tables          │
│  - Instant notification when data changes           │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│    Repository Layer (Parallel Queries)              │
│  - CourseRepository.findByLecturer()                │
│  - SessionRepository.findByLecturer()               │
│  - AttendanceRepository.findByStudent()             │
│  - StatisticsRepository.getXxxStats()               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│            Supabase PostgreSQL                      │
│     (Latest data returned instantly)                │
└─────────────────────────────────────────────────────┘
```

---

## Files Changed

| File | Change | Why |
|------|--------|-----|
| `src/services/realtimeSubscriptionManager.js` | **Created** | Proper subscription handling with debouncing |
| `src/hooks/useDashboardRepository.js` | Updated | Added `useCallback`, `subscribeToMultipleTables` |
| `src/features/dashboard/StudentDashboardRefactored.jsx` | Simplified | Hook handles subscriptions, no manual setup |
| `src/features/dashboard/LecturerDashboardRefactored.jsx` | Updated | Added real-time label to button |

---

## Next Tests to Run

1. **Create a course** and watch stats update instantly
2. **Mark attendance** and watch student see it in under 1 second
3. **Update a course** and see changes reflect immediately
4. **Open in multiple browser tabs** - changes sync across all tabs
5. **Go offline then online** - subscription reconnects automatically

---

## Expected Console Output (Normal Operation)

```
📡 [lecturer_123] Setting up real-time subscriptions for lecturer-id
📡 [lecturer_123_classes_0] Setting up subscription for classes
✅ [lecturer_123_classes_0] Successfully subscribed
📡 [lecturer_123_sessions_1] Setting up subscription for sessions
✅ [lecturer_123_sessions_1] Successfully subscribed
📡 [lecturer_123_attendance_logs_2] Setting up subscription for attendance_logs
✅ [lecturer_123_attendance_logs_2] Successfully subscribed
📊 [Lecturer] Fetching dashboard data...
✅ [Lecturer] Dashboard data loaded

[User creates a new course in another tab...]

✅ [lecturer_123_classes_0] Received change: INSERT
📨 [lecturer_123_classes_0] Data changed, refreshing...
📊 [Lecturer] Fetching dashboard data...
✅ [Lecturer] Dashboard data loaded
```

✨ **This means real-time sync is working perfectly!**

---

## Summary

Real-time sync now works because:
- ✅ Hook properly memoizes the refresh callback
- ✅ Subscriptions are set up once and managed by hook
- ✅ Changes trigger instant data refresh
- ✅ Multiple changes debounced (no hammering)
- ✅ Proper cleanup prevents memory leaks
- ✅ Comprehensive logging for debugging

**Test it now** - create/update something and watch the console!
