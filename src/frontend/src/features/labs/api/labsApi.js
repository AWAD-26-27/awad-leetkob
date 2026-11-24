import { api } from '../../../lib/apiClient.js';

export async function fetchLabs() {
  return await api.get('/api/labs');
}

export async function fetchLab(id) {
  return await api.get(`/api/labs/${id}`);
}

export async function createLab(labData) {
  return await api.post('/api/labs', labData);
}

export async function publishLab(id) {
  return await api.post(`/api/labs/${id}/publish`);
}

export async function updateLab(id, labData) {
  return await api.put(`/api/labs/${id}`, labData);
}
