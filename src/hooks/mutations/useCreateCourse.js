import { useState } from 'react';
import { courseRepository } from '../../services/repositories/index.js';

export default function useCreateCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function mutate(payload) {
    setLoading(true);
    setError(null);
    try {
      const res = await courseRepository.create(payload);
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { mutate, loading, error };
}
