import { attendanceRepository } from '../repositories/index.js';

export async function markAttendance(payload) {
  // basic validation could go here
  const res = await attendanceRepository.log(payload);
  return res;
}
