/**
 * @typedef {Object} TestCase
 * @property {number} ordinal
 * @property {string} inputText
 * @property {string} expectedOutput
 */

/**
 * @typedef {Object} Constraint
 * @property {string} code
 * @property {string} text
 * @property {number} deduction
 */

/**
 * @typedef {Object} Lab
 * @property {number} id
 * @property {string} title
 * @property {string} statement
 * @property {string} [statementMd]
 * @property {number} classId
 * @property {string|null} [publishedAt]
 * @property {Array<TestCase>} [tests]
 * @property {Array<Constraint>} [constraints]
 */

export const LAB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};
