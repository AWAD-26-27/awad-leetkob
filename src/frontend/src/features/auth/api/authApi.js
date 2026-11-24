import { api } from '../../../lib/apiClient.js';

export async function loginApi(username, password) {
  return api.post('/api/login', { username, password });
}

export async function fetchMe() {
  return api.get('/api/me');
}

export async function logoutApi() {
  return api.post('/api/logout');
}

export async function changePasswordApi(currentPassword, newPassword) {
  return api.post('/api/users/change-password', { currentPassword, newPassword });
}

export async function fetchUsersList() {
  return api.get('/api/users');
}

export async function createUserApi(payload) {
  return api.post('/api/users', payload);
}
