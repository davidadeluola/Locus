# Data Display Issues - Root Causes & Fixes

## 🔍 Problems Identified

### 1. **Lecturer Can't See Student Names/Matric Numbers in Attendance**
**Root Cause:** Attendance queries don't join with student profiles
```javascript
// BROKEN: Only gets attendance_logs, no student data
.from('attendance_logs')
.select('*')  // Missing: profiles:student_id(full_name, matric_no, ...)
```

### 2. **Students See "Unknown" Course Names**
**Root Cause:** Field name mismatch - accessing `code` instead of `course_code`
```javascript
// BROKEN: classes table doesn't have 'code' field
const courseCode = record.classes?.code || "Unknown"

// CORRECT: Should be 'course_code'
const courseCode = record.classes?.course_code || "Unknown"
```

### 3. **Student Registration - Names/Matric Not Showing**
**Root Cause:** Enrollment queries don't join with profiles
```javascript
// BROKEN: Only gets class_enrollments, no student profile data
.from('class_enrollments')
.select('*')  // Missing: profiles:student_id(full_name, matric_no, ...)
```

---

## ✅ Solutions

### Fix 1: Update Repositories to Include Profile Joins

**File:** `src/repositories/implementations.js`

All queries that return student data need to include profile joins:

```javascript
// PATTERN FOR ALL STUDENT-RELATED QUERIES:
.select(`
  ...,
  profiles:student_id(
    id,
    full_name,
    matric_no,
    email,
    department,
    level
  ),
  ...
`)
```

#### Changes Needed:

1. **AttendanceRepository.findBySession()** - Add profile join
2. **AttendanceRepository.findByStudent()** - Add profile and session joins  
3. **EnrollmentRepository.findByCourse()** - Add profile join
4. **EnrollmentRepository.findByStudent()** - Add profile and class joins

### Fix 2: Update StudentDashboard.jsx

Change field name from `code` to `course_code`:
```javascript
// BEFORE
const courseCode = record.classes?.code || "Unknown"

// AFTER
const courseCode = record.classes?.course_code || "Unknown"
```

### Fix 3: Update All Components Using This Data

Verify that components expect:
- `record.profiles.full_name` (not just undefined)
- `record.profiles.matric_no` (not just undefined)
- `record.classes.course_code` (not `code`)

---

## 📝 Implementation Steps

1. Update `repositories/implementations.js` - Add SELECT with joins
2. Update `StudentDashboard.jsx` - Fix field names
3. Test in both lecturer and student views
4. Verify real-time updates also include this data

