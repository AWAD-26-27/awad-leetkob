import { api } from '../../../lib/apiClient.js';

export async function fetchStudentClasses() {
  return api.get('/api/my-classes');
}

export async function fetchStudentClassDetails(classId) {
  return api.get(`/api/classes/${classId}`);
}

export async function fetchClassAnnouncements(classId) {
  return api.get(`/api/classes/${classId}/announcements`);
}

export async function fetchClassLabs(classId) {
  return api.get(`/api/classes/${classId}/labs`);
}

export async function fetchClassSubmissions(classId) {
  return api.get(`/api/classes/${classId}/my-submissions`);
}
