/**
 * useCourses - Custom hook for course operations
 * Fetches, creates, and subscribes to real-time course updates
 * Applies DRY principle by extracting course logic from LecturerCoursesPage
 * 
 * Usage:
 * const { courses, loading, error, createCourse, deleteCourse } = useCourses(lecturerId);
 */

import { useState, useEffect, useCallback } from "react";
import { courseRepository } from '../services/repositories/index.js';
import { subscribeToCourseChanges } from '../services/subscriptions/courseSubscription.js';
import notify from '../services/notify.jsx';
// Migrated: use `courseRepository` for data and subscription helper for realtime.

export const useCourses = (lecturerId) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses from repository
  const fetchCourses = useCallback(async () => {
    if (!lecturerId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await courseRepository.findByLecturer(lecturerId);
      setCourses(data || []);
    } catch (err) {
      notify.error(err?.message || 'Failed to fetch courses');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lecturerId]);

  // Setup real-time subscription
  useEffect(() => {
    if (!lecturerId) return;

    fetchCourses();

    const cleanup = subscribeToCourseChanges({ onDataChange: fetchCourses });
    return cleanup;
  }, [lecturerId, fetchCourses]);

  // Create new course
  const createCourse = useCallback(
    async (courseData) => {
      try {
        setError(null);

        if (
          !courseData.course_code ||
          !courseData.course_title ||
          !lecturerId
        ) {
          throw new Error(
            "Missing required fields: course_code, course_title"
          );
        }

        const payload = {
          course_code: courseData.course_code,
          course_title: courseData.course_title,
          level: courseData.level || 100,
          department: courseData.department || '',
          lecturer_id: lecturerId,
        };

        const data = await courseRepository.create(payload);
        notify.success('Course created');
        return data;
      } catch (err) {
        console.error("❌ Error in createCourse:", err);
        setError(err.message);
        throw err;
      }
    },
    [lecturerId]
  );

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      setError(null);

      await courseRepository.delete(courseId);
      notify.info('Course deleted');
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      return true;
    } catch (err) {
      console.error("❌ Error in deleteCourse:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    courses,
    loading,
    error,
    createCourse,
    deleteCourse,
    refetch: fetchCourses,
  };
};

export default useCourses;
