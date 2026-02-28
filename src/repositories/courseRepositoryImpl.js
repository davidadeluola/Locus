import { supabase } from '../api/supabase';

export const CourseRepository = {
  async findByLecturer(lecturerId) {
    const { data, error } = await supabase
      .from('classes')
      .select('id, lecturer_id, course_code, course_title, description, capacity, created_at')
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
      .select('classes(id, lecturer_id, course_code, course_title, description, capacity, created_at)')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching student courses:', error);
      throw new Error('Failed to fetch enrolled courses');
    }

    return (data || []).map(e => e.classes).filter(Boolean);
  },

  async getById(courseId) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('❌ Error fetching course:', error);
      throw new Error(`Failed to fetch course ${courseId}`);
    }

    return data;
  },

  async create(data) {
    const { data: course, error } = await supabase
      .from('classes')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating course:', error);
      throw new Error('Failed to create course');
    }

    return course;
  },
};
