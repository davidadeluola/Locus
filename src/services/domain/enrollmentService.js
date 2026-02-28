import { enrollmentRepository } from '../repositories/index.js';

export async function enrollStudent(payload) {
  const res = await enrollmentRepository.create(payload);
  return res;
}
