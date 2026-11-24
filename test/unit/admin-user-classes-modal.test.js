import test from 'node:test';
import assert from 'node:assert/strict';
import { open } from '../../src/backend/db.js';
import { createApp } from '../../src/backend/app.js';
import {
  createElement as h,
  evalComponent,
  resetComponentState,
} from '../../src/frontend/src/lib/react.js';
import {
  UserClassesModal,
  getUserClasses,
} from '../../src/frontend/src/features/admin/components/UserClassesModal.js';
import { UserTableRow } from '../../src/frontend/src/features/admin/components/UserTableRow.js';
import { UserDirectoryTable } from '../../src/frontend/src/features/admin/components/UserDirectoryTable.js';

test('Admin User Management - GET /api/users enriches users with class enrollment details', async () => {
  const db = open({ seedUnassigned: false });
  const app = createApp(db);

  function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        const port = server.address().port;
        const url = `http://localhost:${port}${path}`;
        fetch(url, options)
          .then(async (res) => {
            const type = res.headers.get('content-type') || '';
            const isJson = type.includes('json');
            const body = isJson ? await res.json() : await res.text();
            server.close(() => resolve({ status: res.status, body }));
          })
          .catch((err) => {
            server.close(() => reject(err));
          });
      });
    });
  }

  const res = await request('/api/users', {
    headers: { authorization: 'Bearer tok-admin' },
  });

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));

  const admin = res.body.items.find((u) => u.username === 'admin');
  assert.ok(admin);
  assert.ok(Array.isArray(admin.classes));
  assert.ok(admin.classes.length >= 2, 'Admin should have access to system classes');
  assert.equal(admin.classes[0].role, 'Quản trị viên');
  assert.equal(admin.classes[0].status, 'Đang hoạt động');

  const ta = res.body.items.find((u) => u.username === 'ta_a');
  assert.ok(ta);
  assert.ok(Array.isArray(ta.classes));
  assert.equal(ta.classes.length, 1);
  assert.equal(ta.classes[0].id, 1);
  assert.equal(ta.classes[0].role, 'Giảng viên');
  assert.equal(ta.classes[0].status, 'Đang giảng dạy');

  const student = res.body.items.find((u) => u.username === 'student_1');
  assert.ok(student);
  assert.ok(Array.isArray(student.classes));
  assert.equal(student.classes.length, 1);
  assert.equal(student.classes[0].id, 1);
  assert.equal(student.classes[0].role, 'Học viên');
  assert.equal(student.classes[0].status, 'Đang học');

  // Verify security invariant: no token or passwordHash exposed
  for (const user of res.body.items) {
    assert.equal(user.passwordHash, undefined);
    assert.equal(user.token, undefined);
  }
});

test('Frontend UI - getUserClasses helper correctly derives class metadata', () => {
  const mockClasses = [
    { id: 1, name: 'Class A', teachers: [{ id: 2 }] },
    { id: 2, name: 'Class B', teachers: [{ id: 3 }] },
  ];

  // 1. Admin gets all classes
  const adminClasses = getUserClasses({ id: 1, role: 'admin' }, mockClasses);
  assert.equal(adminClasses.length, 2);
  assert.equal(adminClasses[0].role, 'Quản trị viên');

  // 2. TA gets assigned classes
  const taClasses = getUserClasses({ id: 2, role: 'ta' }, mockClasses);
  assert.equal(taClasses.length, 1);
  assert.equal(taClasses[0].name, 'Class A');
  assert.equal(taClasses[0].role, 'Giảng viên');

  // 3. Student gets enrolled class
  const studentClasses = getUserClasses({ id: 4, role: 'student', classId: 1 }, mockClasses);
  assert.equal(studentClasses.length, 1);
  assert.equal(studentClasses[0].name, 'Class A');
  assert.equal(studentClasses[0].role, 'Học viên');

  // 4. Unassigned user gets empty list
  const unassignedClasses = getUserClasses({ id: 9, role: 'student', classId: null }, mockClasses);
  assert.equal(unassignedClasses.length, 0);
});

test('Frontend UI - UserClassesModal renders dialog table and empty state', () => {
  resetComponentState();

  // 1. Closed state returns null
  const closedTree = evalComponent(
    h(UserClassesModal, {
      user: { id: 2, name: 'Teacher A', username: 'ta_a', role: 'ta' },
      classes: [],
      isOpen: false,
      onClose: () => {},
    }),
  );
  assert.equal(closedTree, null);

  // 2. Open state with classes renders table
  const openTree = evalComponent(
    h(UserClassesModal, {
      user: {
        id: 2,
        name: 'Teacher A',
        username: 'ta_a',
        role: 'ta',
        classes: [
          {
            id: 1,
            name: 'Class A',
            role: 'Giảng viên',
            term: 'Học kỳ 1 / 2026',
            status: 'Đang giảng dạy',
          },
        ],
      },
      classes: [],
      isOpen: true,
      onClose: () => {},
    }),
  );
  const openJson = JSON.stringify(openTree);
  assert.match(openJson, /Danh sách lớp học đã tham gia/);
  assert.match(openJson, /Teacher A/);
  assert.match(openJson, /Class A/);
  assert.match(openJson, /Giảng viên/);
  assert.match(openJson, /Đang giảng dạy/);

  // 3. Open state with 0 classes renders empty state
  const emptyTree = evalComponent(
    h(UserClassesModal, {
      user: {
        id: 9,
        name: 'New Student',
        username: 'new_stu',
        role: 'student',
        classes: [],
      },
      classes: [],
      isOpen: true,
      onClose: () => {},
    }),
  );
  const emptyJson = JSON.stringify(emptyTree);
  assert.match(emptyJson, /Chưa tham gia lớp học nào/);
  assert.match(emptyJson, /Đóng/);
});

test('Frontend UI - UserDirectoryTable places "Lớp học đã tham gia" in the last column with "Xem thêm" button', () => {
  resetComponentState();

  const mockUsers = [
    {
      id: 2,
      name: 'Teacher A',
      username: 'ta_a',
      role: 'ta',
      classId: 1,
      classes: [{ id: 1, name: 'Class A' }],
    },
  ];
  const mockClasses = [{ id: 1, name: 'Class A' }];

  const tableTree = evalComponent(
    h(UserDirectoryTable, {
      users: mockUsers,
      classes: mockClasses,
    }),
  );
  const tableJson = JSON.stringify(tableTree);

  // Check headers: "Lớp học đã tham gia" is in headers
  assert.match(tableJson, /Lớp học đã tham gia/);
  // Check button: "Xem thêm" exists in row
  assert.match(tableJson, /Xem thêm/);

  // Check single row component directly
  const rowTree = evalComponent(
    h(UserTableRow, {
      user: mockUsers[0],
      classes: mockClasses,
      onOpenClassesModal: () => {},
    }),
  );
  const rowJson = JSON.stringify(rowTree);
  assert.match(rowJson, /Xem thêm/);
  assert.match(rowJson, /Teacher A/);
});
