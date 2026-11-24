import { api } from '../../../lib/apiClient.js';

export async function fetchMyClasses() {
  return api.get('/api/my-classes');
}

export async function fetchClassDetails(classId) {
  return api.get(`/api/classes/${classId}`);
}

export async function fetchClassLabs(classId) {
  return api.get(`/api/classes/${classId}/labs`);
}

export async function fetchClassStudents(classId) {
  return api.get(`/api/classes/${classId}/students`);
}

export async function fetchClassAnnouncements(classId) {
  return api.get(`/api/classes/${classId}/announcements`);
}

export async function createAnnouncementApi(classId, { title, content }) {
  return api.post(`/api/classes/${classId}/announcements`, { title, content });
}

export async function fetchLabGrades(labId) {
  return api.get(`/api/labs/${labId}/grades`);
}
