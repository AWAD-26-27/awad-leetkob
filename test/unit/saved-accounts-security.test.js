import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSavedAccounts,
  saveAccount,
  removeSavedAccount,
} from '../../src/frontend/src/features/auth/utils/savedAccounts.js';
import { LoginDemoQuickFill } from '../../src/frontend/src/features/auth/components/LoginDemoQuickFill.js';
import { openTestApp } from '../helpers.js';

// Mock localStorage for Node.js test environment
function setupMockLocalStorage() {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

test('Saved Accounts Storage - strictly saves session token, never stores password', () => {
  setupMockLocalStorage();

  const mockUser = {
    id: 1,
    username: 'admin',
    name: 'Administrator',
    role: 'admin',
    classId: null,
    token: 'tok-admin-secret',
    password: 'super-secret-password-should-not-be-saved',
    password_hash: 'hash-value',
  };

  const accounts = saveAccount(mockUser);
  assert.equal(accounts.length, 1);
  const saved = accounts[0];

  assert.equal(saved.username, 'admin');
  assert.equal(saved.token, 'tok-admin-secret');
  assert.equal(saved.name, 'Administrator');
  assert.equal(saved.role, 'admin');

  // CRITICAL SECURITY INVARIANT: No password or hash is stored
  assert.equal(saved.password, undefined);
  assert.equal(saved.password_hash, undefined);
  assert.equal(saved.passwordHash, undefined);

  // Test retrieval
  const retrieved = getSavedAccounts();
  assert.equal(retrieved.length, 1);
  assert.equal(retrieved[0].username, 'admin');

  // Test removal
  const remaining = removeSavedAccount('admin');
  assert.equal(remaining.length, 0);
  assert.equal(getSavedAccounts().length, 0);
});

test('Saved Accounts UI - LoginDemoQuickFill renders clean empty state when no accounts saved', () => {
  const tree = LoginDemoQuickFill({ savedAccounts: [] });
  const str = JSON.stringify(tree);
  assert.match(str, /Chưa có tài khoản nào được lưu trên thiết bị/);
  // Ensure no password or default credential text is rendered
  assert.doesNotMatch(str, /password123/);
});

test('Saved Accounts UI - LoginDemoQuickFill renders direct login action for saved accounts', () => {
  const saved = [
    {
      id: 2,
      username: 'ta_a',
      name: 'TA Alice',
      role: 'ta',
      classId: 1,
      token: 'tok-ta-a',
    },
  ];

  const tree = LoginDemoQuickFill({
    savedAccounts: saved,
    onDirectLogin: () => {},
  });

  const str = JSON.stringify(tree);
  assert.match(str, /TA Alice/);
  assert.match(str, /@ta_a/);
  assert.match(str, /Đăng nhập →/);
  assert.doesNotMatch(str, /password123/);
});

test('Backend Security - GET /api/users never exposes tokens or password hashes', async () => {
  const app = await openTestApp();
  try {
    const res = await app.as('admin').get('/api/users');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));

    for (const user of res.body.items) {
      assert.equal(user.passwordHash, undefined, 'passwordHash must not be exposed');
      assert.equal(user.password_hash, undefined, 'password_hash must not be exposed');
      assert.equal(user.token, undefined, 'token must not be exposed in user directory');
    }
  } finally {
    await app.close();
  }
});
