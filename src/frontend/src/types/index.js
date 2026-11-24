/**
 * @typedef {Object} ProblemDetails
 * @property {string} [type]
 * @property {string} title
 * @property {number} status
 * @property {string} [detail]
 * @property {string} [instance]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array<any>} items
 * @property {number} [total]
 */

export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
