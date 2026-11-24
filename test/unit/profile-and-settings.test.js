import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';
import { h } from '../../src/frontend/src/lib/react.js';
import { UserDropdownMenu } from '../../src/frontend/src/features/auth/components/UserDropdownMenu.js';
import { UserSettingsTab } from '../../src/frontend/src/features/auth/components/UserSettingsTab.js';
import { ProfileDetailsTab } from '../../src/frontend/src/features/auth/components/ProfileDetailsTab.js';

test('Profile & Settings API - GET /api/me returns avatar and phone', async () => {
  const app = await startApp();
  try {
    const res = await app.as('student_1').get('/api/me');
    assert.equal(res.status, 200);
    assert.equal(res.body.username, 'student_1');
    assert.equal('avatar' in res.body, true);
    assert.equal('phone' in res.body, true);
  } finally {
    await app.close();
  }
});

test('Profile & Settings API - PUT /api/users/profile updates name, avatar, and phone', async () => {
  const app = await startApp();
  try {
    const updateRes = await app.as('student_1').put('/api/users/profile', {
      name: 'Nguyen Van Sinh Vien 1',
      avatar: '👨‍💻',
      phone: '0912345678',
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.name, 'Nguyen Van Sinh Vien 1');
    assert.equal(updateRes.body.avatar, '👨‍💻');
    assert.equal(updateRes.body.phone, '0912345678');

    // Verify GET /api/me reflects changes
    const meRes = await app.as('student_1').get('/api/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.name, 'Nguyen Van Sinh Vien 1');
    assert.equal(meRes.body.avatar, '👨‍💻');
    assert.equal(meRes.body.phone, '0912345678');
  } finally {
    await app.close();
  }
});

test('Profile & Settings API - PUT /api/users/profile rejects empty name', async () => {
  const app = await startApp();
  try {
    const updateRes = await app.as('student_1').put('/api/users/profile', {
      name: '   ',
    });
    assert.equal(updateRes.status, 400);
  } finally {
    await app.close();
  }
});

test('Profile & Settings API - PUT /api/users/profile validates and changes password', async () => {
  const app = await startApp();
  try {
    // Fails on incorrect current password
    const failRes = await app.as('student_1').put('/api/users/profile', {
      currentPassword: 'wrongpassword',
      newPassword: 'newpassword123',
    });
    assert.equal(failRes.status, 400);

    // Fails on new password too short (< 6 chars)
    const shortRes = await app.as('student_1').put('/api/users/profile', {
      currentPassword: 'password123',
      newPassword: '123',
    });
    assert.equal(shortRes.status, 400);

    // Succeeds with correct password
    const okRes = await app.as('student_1').put('/api/users/profile', {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    });
    assert.equal(okRes.status, 200);

    // Verify login with new password succeeds
    const loginRes = await app.as(null).post('/api/login', {
      username: 'student_1',
      password: 'newpassword123',
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.user.username, 'student_1');
  } finally {
    await app.close();
  }
});

test('UI Components - UserDropdownMenu renders Profile, Setting, and Logout items', () => {
  let openedTab = null;
  let loggedOut = false;
  let closed = false;

  const vnode = UserDropdownMenu({
    user: {
      name: 'Test User',
      username: 'testuser',
      role: 'student',
      avatar: '🚀',
      phone: '0987654321',
    },
    safeName: 'Test User',
    roleLabel: 'Sinh viên',
    roleColor: '#10b981',
    roleBadgeBg: '#ecfdf5',
    onOpenProfile: (tab) => {
      openedTab = tab;
    },
    onLogout: () => {
      loggedOut = true;
    },
    onClose: () => {
      closed = true;
    },
  });

  assert.ok(vnode, 'Dropdown menu renders vnode');
  assert.equal(openedTab, null);
  assert.equal(loggedOut, false);
  assert.equal(closed, false);
});

test('UI Components - UserSettingsTab and ProfileDetailsTab instantiate cleanly', () => {
  const settingsVnode = h(UserSettingsTab, {
    user: {
      name: 'Test User',
      username: 'testuser',
      role: 'student',
      avatar: '👨‍💻',
      phone: '0912345678',
    },
    onUpdateProfile: async () => {},
    onChangePassword: async () => {},
    onSuccess: () => {},
  });
  assert.ok(settingsVnode, 'UserSettingsTab creates valid vnode');
  assert.equal(settingsVnode.type, UserSettingsTab);

  const profileVnode = h(ProfileDetailsTab, {
    user: {
      name: 'Test User',
      username: 'testuser',
      role: 'student',
      avatar: '👨‍💻',
      phone: '0912345678',
    },
    roleColor: '#10b981',
    onLogout: () => {},
    onGoToSettings: () => {},
  });
  assert.ok(profileVnode, 'ProfileDetailsTab creates valid vnode');
  assert.equal(profileVnode.type, ProfileDetailsTab);
});
