import { api } from '../../../lib/apiClient.js';

export async function fetchClasses() {
  return api.get('/api/classes');
}

export async function createClassApi(name) {
  return api.post('/api/classes', { name });
}

export async function assignTeacherApi(classId, teacherId) {
  return api.post(`/api/classes/${classId}/teachers`, { teacherId });
}

export async function fetchClassStudents(classId) {
  return api.get(`/api/classes/${classId}/students`);
}

export async function assignStudentApi(classId, studentId) {
  return api.post(`/api/classes/${classId}/students`, { studentId });
}

export async function removeStudentApi(classId, studentId) {
  return api.delete(`/api/classes/${classId}/students/${studentId}`);
}

export async function fetchAllStudents() {
  return api.get('/api/students');
}
