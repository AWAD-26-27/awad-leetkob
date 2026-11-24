/**
 * @typedef {Object} ReviewQueueItem
 * @property {number} id
 * @property {string} student
 * @property {number} [studentId]
 * @property {string} verdict
 * @property {string} constraintCode
 * @property {number} deduction
 * @property {string|Object} evidence
 * @property {'confirm' | 'overturn' | null} [decision]
 * @property {'confirmed' | 'overturned' | 'pending' | null} [reviewStatus]
 */

export const REVIEW_DECISIONS = {
  CONFIRM: 'confirm',
  OVERTURN: 'overturn',
};
