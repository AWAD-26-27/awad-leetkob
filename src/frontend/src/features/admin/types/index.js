/**
 * @typedef {Object} AdminClass
 * @property {number} id
 * @property {string} name
 * @property {number} [studentCount]
 * @property {Array<{id: number, name: string, username: string}>} [teachers]
 */

/**
 * @typedef {Object} AdminUser
 * @property {number} id
 * @property {string} name
 * @property {string} username
 * @property {'admin' | 'ta' | 'student'} role
 * @property {number|null} [classId]
 * @property {string} [token]
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} name
 * @property {string} username
 * @property {string} password
 * @property {'student' | 'ta'} role
 * @property {number|null} [classId]
 */
