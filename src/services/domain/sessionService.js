import { sessionRepository } from '../../services/repositories/index.js';
import { courseRepository } from '../../services/repositories/index.js';
import { attendanceRepository } from '../../services/repositories/index.js';
import { profileRepository } from '../../services/repositories/index.js';
import { generateOTP } from '../../lib/utils/attendanceUtils.js';

const sessionService = {
  // Build a room snapshot payload for a session id
  async buildRoom(sessionId) {
    if (!sessionId) return null;

    const session = await sessionRepository.findById(sessionId);
    if (!session) return null;

    const klass = session.class_id ? await courseRepository.findById(session.class_id) : null;
    const lecturerProfile = session.lecturer_id ? await profileRepository.findById(session.lecturer_id) : null;

    // Attendance logs (each log should include student_id)
    const logs = await attendanceRepository.findBySession(sessionId) || [];
    const uniqueStudentIds = Array.from(new Set(logs.map(l => l.student_id).filter(Boolean)));

    // Fetch student profiles in parallel
    const studentProfiles = await Promise.all(
      uniqueStudentIds.map(async (sid) => {
        try {
          const p = await profileRepository.findById(sid);
          return {
            id: sid,
            name: p?.full_name || p?.name || sid,
            matric: p?.matric_number || p?.matric || null,
          };
        } catch (e) {
          return { id: sid, name: sid, matric: null };
        }
      })
    );

    const presentCount = studentProfiles.length;
    const totalStudents = klass?.total_students ?? klass?.enrolled_count ?? 0;
    const percentagePresent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return {
      session: {
        id: session.id,
        otp: session.otp_secret,
        latitude: session.latitude,
        longitude: session.longitude,
        expires_at: session.expires_at,
      },
      class: {
        id: klass?.id || null,
        title: klass?.course_title || klass?.title || null,
        code: klass?.course_code || null,
        level: klass?.level ?? null,
        department: klass?.department || null,
        total_students: totalStudents,
      },
      lecturer: {
        id: lecturerProfile?.id || session.lecturer_id || null,
        name: lecturerProfile?.full_name || lecturerProfile?.name || null,
      },
      students: studentProfiles,
      metrics: {
        present: presentCount,
        total: totalStudents,
        percentage_present: percentagePresent,
      },
    };
  },

  // Regenerate OTP but keep session id the same (persisted update)
  async regenerateOtp(sessionId) {
    if (!sessionId) throw new Error('sessionId required');
    const newOtp = generateOTP();
    const updated = await sessionRepository.update(sessionId, { otp_secret: newOtp });
    return updated;
  }
};

export default sessionService;
// Domain logic skeleton for sessions
import { validateCreateSession } from '../../lib/schemas/sessionSchemas.js';

export async function createSession(repo, payload) {
  const valid = validateCreateSession(payload);
  if (!valid.valid) throw new Error(valid.error);
  return repo.create(payload);
}
