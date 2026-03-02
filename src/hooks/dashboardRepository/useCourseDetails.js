import { useState, useEffect } from 'react';
import {
  CourseRepository,
  EnrollmentRepository,
} from '../../repositories/implementations';

/**
 * Hook for fetching course details with enrollments
 * @param {string} courseId - Course ID
 * @returns {{
 *   course: import('../../types').Course | null,
 *   enrollments: import('../../types').Enrollment[],
 *   studentCount: number,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useCourseDetails(courseId) {
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);

        const [courseData, enrollmentsData, count] = await Promise.all([
          CourseRepository.getById(courseId),
          EnrollmentRepository.findByCourse(courseId),
          EnrollmentRepository.countStudentsByCourse(courseId),
        ]);

        setCourse(courseData);
        setEnrollments(enrollmentsData);
        setStudentCount(count);
      } catch (err) {
        console.error('❌ Error fetching course details:', err);
        setError(err instanceof Error ? err : new Error('Failed to load course'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  return {
    course,
    enrollments,
    studentCount,
    loading,
    error,
  };
}
