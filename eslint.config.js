export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        FormData: 'readonly',
        document: 'readonly',
        window: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: { 'no-unused-vars': 'error', 'no-undef': 'error' },
  },
];
