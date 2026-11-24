/**
 * @typedef {Object} Submission
 * @property {number} id
 * @property {number} labId
 * @property {number} studentId
 * @property {'queued' | 'running' | 'judged' | 'failed'} status
 * @property {'Accepted' | 'AC' | 'WA' | 'TLE' | 'MLE' | 'CE' | null} [judgeVerdict]
 * @property {string} createdAt
 * @property {string|null} [publishedAt]
 * @property {number} [grade]
 * @property {Array<{code: string, verdict: string, deduction: number, evidence: string}>} [constraints]
 */

export const SUBMISSION_STATUS = {
  QUEUED: 'queued',
  JUDGING: 'judging',
  JUDGED: 'judged',
  FAILED: 'failed',
};
