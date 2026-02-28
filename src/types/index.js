x   /**
 * @fileoverview Type definitions for LOCUS application
 * Using JSDoc for type safety without TypeScript
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} role - User role ('lecturer' | 'student')
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - Profile ID (same as user id)
 * @property {string} full_name - User's full name
 * @property {string} [phone] - Phone number
 * @property {string} role - User role
 * @property {string} [matric_number] - Student matric number (if student)
 * @property {string} [department] - Student department (if student)
 * @property {string} [level] - Student level (if student)
 * @property {string} [school_id] - School ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Course
 * @property {string} id - Course ID
 * @property {string} lecturer_id - Lecturer's user ID
 * @property {string} course_code - Course code (e.g., "CS101")
 * @property {string} course_title - Course title
 * @property {string} [description] - Course description
 * @property {number} [capacity] - Expected number of students
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Session
 * @property {string} id - Session ID
 * @property {string} lecturer_id - Lecturer's user ID
 * @property {string} class_id - Course/Class ID
 * @property {string} [active_session_id] - Active session reference
 * @property {string} [otp_code] - One-time password for this session
 * @property {string} [location_requirement] - "required" | "optional" | "none"
 * @property {number} [latitude] - Target latitude
 * @property {number} [longitude] - Target longitude
 * @property {number} [radius_meters] - Allowed radius in meters
 * @property {string} created_at - Creation timestamp
 * @property {string} expires_at - Session expiry timestamp
 */

/**
 * @typedef {Object} Enrollment
 * @property {string} id - Enrollment ID
 * @property {string} student_id - Student's user ID
 * @property {string} class_id - Course/Class ID
 * @property {string} status - "active" | "withdrawn" | "completed"
 * @property {string} enrolled_at - Enrollment timestamp
 */

/**
 * @typedef {Object} AttendanceLog
 * @property {string} id - Log ID
 * @property {string} student_id - Student's user ID
 * @property {string} session_id - Session ID
 * @property {string} signed_at - Sign-in timestamp
 * @property {number} [latitude] - Sign-in latitude
 * @property {number} [longitude] - Sign-in longitude
 * @property {string} [location_status] - "within_range" | "outside_range" | "not_required"
 * @property {string} [device_info] - Device information
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} totalStudents - Total unique students
 * @property {number} totalCourses - Total courses taught
 * @property {number} totalSessions - Total sessions created
 * @property {number} overallRate - Overall attendance percentage
 */

/**
 * @typedef {Object} SessionPerformance
 * @property {number} studentsPresent - Present students count
 * @property {number} expectedStudents - Expected students count
 * @property {number} attendanceDensity - Attendance percentage
 * @property {string} [course_code] - Course code
 */

/**
 * @typedef {Object} StudentStats
 * @property {number} enrolledCourses - Number of enrolled courses
 * @property {number} attendanceRate - Overall attendance percentage
 * @property {number} totalSessions - Total sessions attended
 */

// Export for usage in JSDoc comments
export {};
