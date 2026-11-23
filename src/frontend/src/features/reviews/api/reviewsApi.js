import { api } from '../../../lib/apiClient.js';

export async function fetchReviewQueue(labId) {
  return await api.get(`/api/labs/${labId}/queue`);
}

export async function reviewConstraint(submissionId, code, decision) {
  return await api.post(`/api/submissions/${submissionId}/constraints/${code}/review`, {
    decision,
  });
}

export async function reviewSubmissionLegacy(submissionId, decision) {
  return await api.post(`/api/submissions/${submissionId}/review`, {
    decision,
  });
}
