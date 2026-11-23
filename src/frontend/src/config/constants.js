// Application-wide constants & demo configurations

export const GUEST_USER = {
  id: 0,
  username: '',
  name: 'Select user…',
  role: 'guest',
  classId: null,
  className: '',
  token: '',
};

export const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    name: 'Admin',
    role: 'admin',
    classId: null,
    className: 'All Classes',
    token: 'tok-admin',
  },
  {
    id: 2,
    username: 'ta_a',
    name: 'TA Alice',
    role: 'ta',
    classId: 1,
    className: 'Class A',
    token: 'tok-ta-a',
  },
  {
    id: 3,
    username: 'ta_b',
    name: 'TA Bob',
    role: 'ta',
    classId: 2,
    className: 'Class B',
    token: 'tok-ta-b',
  },
  {
    id: 4,
    username: 'student_1',
    name: 'Student 1',
    role: 'student',
    classId: 1,
    className: 'Class A',
    token: 'tok-student-1',
  },
  {
    id: 5,
    username: 'student_2',
    name: 'Student 2',
    role: 'student',
    classId: 1,
    className: 'Class A',
    token: 'tok-student-2',
  },
];

export const LEGACY_USERS = [
  {
    id: 101,
    username: 'stu1',
    name: 'Student 1 (stu1)',
    role: 'student',
    classId: 1,
    className: 'Class A',
    token: 'tok-stu1',
  },
  {
    id: 102,
    username: 'stu2',
    name: 'Student 2 (stu2)',
    role: 'student',
    classId: 1,
    className: 'Class A',
    token: 'tok-stu2',
  },
  {
    id: 103,
    username: 'stu3',
    name: 'Student 3 (stu3)',
    role: 'student',
    classId: 2,
    className: 'Class B',
    token: 'tok-stu3',
  },
];

export const ALL_USERS = [...DEMO_USERS, ...LEGACY_USERS];

export const STATUS_CONFIG = {
  queued: { label: 'Queued', variant: 'warning', icon: '⏳' },
  judging: { label: 'Judging', variant: 'info', icon: '⚙️' },
  judged: { label: 'Judged', variant: 'success', icon: '✅' },
  failed: { label: 'Failed', variant: 'danger', icon: '❌' },
};

export const VERDICT_CONFIG = {
  Accepted: { label: 'Accepted', variant: 'success' },
  AC: { label: 'Accepted', variant: 'success' },
  WA: { label: 'Wrong Answer', variant: 'danger' },
  TLE: { label: 'Time Limit Exceeded', variant: 'danger' },
  MLE: { label: 'Memory Limit Exceeded', variant: 'danger' },
  CE: { label: 'Compilation Error', variant: 'danger' },
  RE: { label: 'Runtime Error', variant: 'danger' },
  OLE: { label: 'Output Limit Exceeded', variant: 'danger' },
  pass: { label: 'Pass', variant: 'success' },
  violation: { label: 'Violation', variant: 'danger' },
  unsure: { label: 'Unsure', variant: 'warning' },
};

export const REVIEW_STATUS_CONFIG = {
  pending: { label: 'Pending Review', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  overturned: { label: 'Overturned', variant: 'neutral' },
};
