import { courseRepository } from '../../../services/repositories/index.js';
import courseCache from '../../../services/cache/courseCacheService.js';

export async function getAllCourses({ refresh = false } = {}) {
  if (!refresh) {
    const cached = courseCache.getAll();
    if (cached) return cached;
  }

  const data = await courseRepository.findAll();
  courseCache.setAll(data);
  return data;
}
