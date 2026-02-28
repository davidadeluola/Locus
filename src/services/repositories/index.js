import CourseRepository from './courseRepository.js';
import SessionRepository from './sessionRepository.js';
import AttendanceRepository from './attendanceRepository.js';
import EnrollmentRepository from './enrollmentRepository.js';
import ProfileRepository from './profileRepository.js';
import UserRepository from './userRepository.js';
import SchoolRepository from './schoolRepository.js';
import { supabase } from '../../api/supabase.js';

// Export singleton repository instances wired to the shared Supabase client.
export const courseRepository = new CourseRepository({ supabaseClient: supabase });
export const sessionRepository = new SessionRepository({ supabaseClient: supabase });
export const attendanceRepository = new AttendanceRepository({ supabaseClient: supabase });
export const enrollmentRepository = new EnrollmentRepository({ supabaseClient: supabase });
export const profileRepository = new ProfileRepository({ supabaseClient: supabase });
export const userRepository = new UserRepository({ supabaseClient: supabase });
export const schoolRepository = new SchoolRepository({ supabaseClient: supabase });

export default {
  courseRepository,
  sessionRepository,
  attendanceRepository,
  enrollmentRepository,
  profileRepository,
  userRepository,
  schoolRepository,
};
