/**
 * @typedef {'admin' | 'ta' | 'student' | 'guest'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} name
 * @property {UserRole} role
 * @property {number|null} classId
 * @property {string} [token]
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'ta',
  STUDENT: 'student',
  GUEST: 'guest',
};
