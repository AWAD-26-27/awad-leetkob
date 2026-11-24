import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createElement as h,
  useState,
  useRef,
  resetComponentState,
  evalComponent,
} from '../../src/frontend/src/lib/react.js';
import { DEMO_USERS, GUEST_USER, ALL_USERS } from '../../src/frontend/src/config/constants.js';
import { StudentSubmissionsTable } from '../../src/frontend/src/features/submissions/components/StudentSubmissionsTable.js';
import { ReviewQueueTable } from '../../src/frontend/src/features/reviews/components/ReviewQueueTable.js';
import { ClassStudentTable } from '../../src/frontend/src/features/classes/components/ClassStudentTable.js';

test('Frontend Stage 3 - React runtime persistent state across re-renders', () => {
  resetComponentState();

  let capturedSetState;

  function Counter() {
    const [count, setCount] = useState(10);
    capturedSetState = setCount;
    return h('div', { id: 'count' }, `Count: ${count}`);
  }

  // 1st render
  const tree1 = evalComponent(h(Counter, { key: 'c1' }));
  assert.equal(tree1.props.children[0], 'Count: 10');

  // Update state
  capturedSetState(42);

  // 2nd render
  const tree2 = evalComponent(h(Counter, { key: 'c1' }));
  assert.equal(tree2.props.children[0], 'Count: 42', 'State must persist after setState');
});

test('Frontend Stage 3 - useRef returns mutable ref object', () => {
  const ref = useRef('initial');
  assert.equal(ref.current, 'initial');
  ref.current = 'updated';
  assert.equal(ref.current, 'updated');
});

test('Frontend Stage 3 - Student FAQ Privacy Invariant: zero constraint leakage before publish', () => {
  const submissions = [
    {
      id: 1,
      status: 'judged',
      judgeVerdict: 'AC',
      createdAt: '2026-11-24T00:00:00Z',
      publishedAt: null, // NOT PUBLISHED
      grade: null,
      constraints: [
        { code: 'C1', verdict: 'VIOLATED', deduction: 3.0, evidence: 'std::sort used' },
      ],
    },
  ];

  const tree = evalComponent(h(StudentSubmissionsTable, { submissions }));
  const tableStr = JSON.stringify(tree);

  // Assert: Status and verdict are visible
  assert.match(tableStr, /AC/, 'Judge verdict AC should be present');
  assert.match(tableStr, /JUDGED/, 'Status JUDGED should be present');

  // Assert: Hidden until TA publishes
  assert.match(tableStr, /Hidden until TA publishes/, 'Privacy guard message must be present');

  // Assert: Zero leakage of constraint code, deduction, or evidence
  assert.doesNotMatch(tableStr, /VIOLATED/, 'Constraint verdict VIOLATED must NOT be rendered');
  assert.doesNotMatch(tableStr, /std::sort used/, 'Evidence text must NOT be rendered');
  assert.doesNotMatch(tableStr, /-3 pts/, 'Deduction points must NOT be rendered before publish');
});

test('Frontend Stage 3 - ReviewQueueTable renders Confirm button with student name for CI', () => {
  const queue = [
    {
      id: 1,
      student: 'stu1',
      verdict: 'WA',
      constraintCode: 'C1',
      deduction: 3.0,
      evidence: 'Forbidden loop pattern detected on line 12',
      decision: null,
    },
  ];

  const tree = evalComponent(h(ReviewQueueTable, { queue }));
  const queueStr = JSON.stringify(tree);

  // Assert: Confirm stu1 button is rendered to satisfy Playwright getByRole('button', { name: 'Confirm stu1' })
  assert.match(queueStr, /Confirm stu1/, 'Button "Confirm stu1" must be rendered');
  assert.match(queueStr, /Overturn/, 'Overturn button must be rendered');
  assert.match(queueStr, /Rule C1/, 'Constraint code badge must be rendered');
  assert.match(queueStr, /Forbidden loop pattern/, 'Evidence snippet must be rendered for TA');
});

test('Frontend Stage 3 - Demo Users configuration includes all roles and legacy accounts', () => {
  assert.equal(GUEST_USER.username, '');
  assert.equal(GUEST_USER.role, 'guest');

  assert.equal(DEMO_USERS.length, 5, 'Canonical DEMO_USERS must contain exactly 5 users');

  const taA = DEMO_USERS.find((u) => u.username === 'ta_a');
  assert.ok(taA, 'ta_a must exist');
  assert.equal(taA.role, 'ta');
  assert.equal(taA.token, 'tok-ta-a');

  const student1 = DEMO_USERS.find((u) => u.username === 'student_1');
  assert.ok(student1, 'student_1 must exist');
  assert.equal(student1.role, 'student');

  const stu1 = ALL_USERS.find((u) => u.username === 'stu1');
  assert.ok(stu1, 'stu1 must exist in ALL_USERS for legacy test compatibility');
  assert.equal(stu1.role, 'student');
  assert.equal(stu1.token, 'tok-stu1');
});

test('Frontend Stage 3 - ClassStudentTable renders students and handles empty state gracefully', () => {
  // 1. Empty state
  const emptyTree = evalComponent(h(ClassStudentTable, { classStudents: [] }));
  const emptyStr = JSON.stringify(emptyTree);
  assert.match(emptyStr, /Chưa có sinh viên nào trong lớp này/);

  // 2. Populated state
  const students = [
    { id: 4, name: 'Student One', username: 'student_1' },
    { id: 5, name: 'Student Two', username: 'student_2' },
  ];
  const populatedTree = evalComponent(h(ClassStudentTable, { classStudents: students, onRemove: () => {} }));
  const populatedStr = JSON.stringify(populatedTree);
  assert.match(populatedStr, /Student One/);
  assert.match(populatedStr, /@student_1/);
  assert.match(populatedStr, /Student Two/);
  assert.match(populatedStr, /Xóa khỏi lớp/);
});

