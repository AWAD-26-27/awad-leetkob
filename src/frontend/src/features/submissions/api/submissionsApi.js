import { api } from '../../../lib/apiClient.js';

export async function submitCode(labId, code) {
  return await api.post(`/api/labs/${labId}/submissions`, { code, sourceCode: code });
}

export async function getSubmissionStatus(submissionId) {
  return await api.get(`/api/submissions/${submissionId}`);
}

export async function listSubmissions(labId) {
  return await api.get(`/api/labs/${labId}/submissions`);
}
