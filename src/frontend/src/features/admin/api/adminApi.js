import { api } from '../../../lib/apiClient.js';

export async function fetchAdminClasses() {
  return api.get('/api/classes');
}

export async function fetchAdminUsers() {
  return api.get('/api/users');
}

export async function createAdminClass(name) {
  return api.post('/api/classes', { name });
}

export async function assignTeacherToClass(classId, teacherId) {
  return api.post(`/api/classes/${classId}/teachers`, { teacherId });
}

export async function removeTeacherFromClass(classId, teacherId) {
  return api.delete(`/api/classes/${classId}/teachers/${teacherId}`);
}

export async function createAdminUser(userData) {
  return api.post('/api/users', userData);
}

export async function fetchClassStudents(classId) {
  return api.get(`/api/classes/${classId}/students`);
}

export async function assignStudentToClass(classId, studentId) {
  return api.post(`/api/classes/${classId}/students`, { studentId });
}

export async function removeStudentFromClass(classId, studentId) {
  return api.delete(`/api/classes/${classId}/students/${studentId}`);
}

export async function fetchAllStudents() {
  return api.get('/api/students');
}
