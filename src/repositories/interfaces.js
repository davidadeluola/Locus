/**
 * @fileoverview Repository pattern interfaces for LOCUS
 * Abstracts data access layer from business logic
 * Enables easy testing with mock implementations
 */

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
  getProfileById: async (userId) => { throw new Error('Not implemented'); },

  /**
   * Fetch user with profile details
   * @param {string} userId - User ID
   * @returns {Promise<{user: import('../types').User, profile: import('../types').UserProfile}>}
   */
  fetchUserWithProfile: async (userId) => { throw new Error('Not implemented'); },

  /**
   * Batch fetch multiple user profiles
   * @param {string[]} userIds - Array of user IDs
   * @returns {Promise<import('../types').UserProfile[]>}
   */
  fetchProfilesByIds: async (userIds) => { throw new Error('Not implemented'); },
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
  findByLecturer: async (lecturerId) => { throw new Error('Not implemented'); },

  /**
   * Get enrolled courses for student
   * @param {string} studentId - Student's user ID
   * @returns {Promise<import('../types').Course[]>}
   */
  findByStudent: async (studentId) => { throw new Error('Not implemented'); },

  /**
   * Get single course with details
   * @param {string} courseId - Course ID
   * @returns {Promise<import('../types').Course>}
   */
  getById: async (courseId) => { throw new Error('Not implemented'); },

  /**
   * Create new course
   * @param {Omit<import('../types').Course, 'id' | 'created_at'>} data - Course data
   * @returns {Promise<import('../types').Course>}
   */
  create: async (data) => { throw new Error('Not implemented'); },
};

/**
 * Session Repository - Manages session-related data access
 * @interface ISessionRepository
 */
export const ISessionRepository = {
  /**
   * Get all sessions by lecturer
   * @param {string} lecturerId - Lecturer's user ID
   * @param {Object} options - Fetch options
   * @param {number} [options.limit] - Limit results
   * @param {string} [options.orderBy] - Order by field
   * @returns {Promise<import('../types').Session[]>}
   */
  findByLecturer: async (lecturerId, options = {}) => { throw new Error('Not implemented'); },

  /**
   * Get session details
   * @param {string} sessionId - Session ID
   * @returns {Promise<import('../types').Session>}
   */
  getById: async (sessionId) => { throw new Error('Not implemented'); },

  /**
   * Create new session
   * @param {Omit<import('../types').Session, 'id' | 'created_at'>} data - Session data
   * @returns {Promise<import('../types').Session>}
   */
  create: async (data) => { throw new Error('Not implemented'); },

  /**
   * Get active session for lecturer
   * @param {string} lecturerId - Lecturer's user ID
   * @returns {Promise<import('../types').Session | null>}
   */
  getActiveByLecturer: async (lecturerId) => { throw new Error('Not implemented'); },
};

/**
 * Attendance Repository - Manages attendance-related data access
 * @interface IAttendanceRepository
 */
export const IAttendanceRepository = {
  /**
   * Get attendance logs for session
   * @param {string} sessionId - Session ID
   * @returns {Promise<import('../types').AttendanceLog[]>}
   */
  findBySession: async (sessionId) => { throw new Error('Not implemented'); },

  /**
   * Get attendance logs for student
   * @param {string} studentId - Student ID
   * @param {Object} options - Fetch options
   * @param {number} [options.limit] - Limit results
   * @returns {Promise<import('../types').AttendanceLog[]>}
   */
  findByStudent: async (studentId, options = {}) => { throw new Error('Not implemented'); },

  /**
   * Count attendance in session
   * @param {string} sessionId - Session ID
   * @returns {Promise<number>}
   */
  countBySession: async (sessionId) => { throw new Error('Not implemented'); },

  /**
   * Record attendance
   * @param {Omit<import('../types').AttendanceLog, 'id'>} data - Attendance data
   * @returns {Promise<import('../types').AttendanceLog>}
   */
  create: async (data) => { throw new Error('Not implemented'); },

  /**
   * Check if student already marked attendance
   * @param {string} studentId - Student ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>}
   */
  exists: async (studentId, sessionId) => { throw new Error('Not implemented'); },
};

/**
 * Enrollment Repository - Manages enrollment-related data access
 * @interface IEnrollmentRepository
 */
export const IEnrollmentRepository = {
  /**
   * Get enrollments for course
   * @param {string} courseId - Course ID
   * @returns {Promise<import('../types').Enrollment[]>}
   */
  findByCourse: async (courseId) => { throw new Error('Not implemented'); },

  /**
   * Get enrollments for student
   * @param {string} studentId - Student ID
   * @returns {Promise<import('../types').Enrollment[]>}
   */
  findByStudent: async (studentId) => { throw new Error('Not implemented'); },

  /**
   * Get unique students count in course
   * @param {string} courseId - Course ID
   * @returns {Promise<number>}
   */
  countStudentsByCourse: async (courseId) => { throw new Error('Not implemented'); },

  /**
   * Enroll student in course
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   * @returns {Promise<import('../types').Enrollment>}
   */
  create: async (studentId, courseId) => { throw new Error('Not implemented'); },
};

/**
 * Statistics Repository - Manages dashboard statistics
 * @interface IStatisticsRepository
 */
export const IStatisticsRepository = {
  /**
   * Get lecturer dashboard statistics
   * @param {string} lecturerId - Lecturer ID
   * @returns {Promise<import('../types').DashboardStats>}
   */
  getLecturerStats: async (lecturerId) => { throw new Error('Not implemented'); },

  /**
   * Get session performance metrics
   * @param {string} sessionId - Session ID
   * @param {number} [expectedStudents] - Expected students count
   * @returns {Promise<import('../types').SessionPerformance>}
   */
  getSessionPerformance: async (sessionId, expectedStudents = 0) => { throw new Error('Not implemented'); },

  /**
   * Get student statistics
   * @param {string} studentId - Student ID
   * @returns {Promise<import('../types').StudentStats>}
   */
  getStudentStats: async (studentId) => { throw new Error('Not implemented'); },

  /**
   * Get attendance trend data
   * @param {string} studentId - Student ID
   * @param {number} months - Number of months back
   * @returns {Promise<Array<{month: string, attendance: number}>>}
   */
  getAttendanceTrendData: async (studentId, months = 6) => { throw new Error('Not implemented'); },
};
