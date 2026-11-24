import { problem } from './rfc7807.js';

export function isStaff(user, classId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'ta') return false;
  const targetId = Number(classId);
  if (Number(user.classId) === targetId) return true;
  if (Array.isArray(user.classIds) && user.classIds.map(Number).includes(targetId)) return true;
  return false;
}

export function enforceStaffOrCrossClass(req, res, classId) {
  const me = req.user;
  if (isStaff(me, classId)) return true;

  // Student in the same class is forbidden (403) from staff actions
  if (me.role === 'student' && Number(me.classId) === Number(classId)) {
    problem(res, 403, 'forbidden', 'Only staff of this class may perform this action');
    return false;
  }

  // Cross-class access is 404 (does not disclose existence of resource)
  problem(res, 404, 'not-found', 'No such lab');
  return false;
}
