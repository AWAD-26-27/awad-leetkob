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

export async function createAdminUser(userData) {
  return api.post('/api/users', userData);
}
