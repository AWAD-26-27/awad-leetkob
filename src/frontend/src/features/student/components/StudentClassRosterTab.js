import { h, useState } from '../../../lib/react.js';
import { Card, Input } from '../../../components/ui/index.js';
import { StudentClassRosterRow } from './StudentClassRosterRow.js';

export function StudentClassRosterTab({ classroom }) {
  const [search, setSearch] = useState('');
  const teachers = classroom?.teachers || [];
  const primaryTeacher = teachers[0] || null;
  const students = classroom?.students || [];

  const query = search.trim().toLowerCase();
  const filteredStudents = query
    ? students.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.username && s.username.toLowerCase().includes(query)),
      )
    : students;

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
    // 1. Teacher Card at top
    h(
      Card,
      { title: '👨‍🏫 Giảng viên phụ trách' },
      primaryTeacher
        ? h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 0' } },
            h(
              'div',
              {
                style: {
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                  flexShrink: 0,
                },
              },
              (primaryTeacher.name || primaryTeacher.username).charAt(0).toUpperCase(),
            ),
            h(
              'div',
              null,
              h(
                'div',
                { style: { fontWeight: '700', fontSize: '15px', color: '#0f172a' } },
                primaryTeacher.name,
              ),
              h(
                'div',
                { style: { fontSize: '12.5px', color: '#64748b' } },
                `@${primaryTeacher.username}`,
              ),
            ),
            h(
              'span',
              {
                style: {
                  marginLeft: 'auto',
                  fontSize: '11.5px',
                  padding: '3px 9px',
                  borderRadius: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: '600',
                  border: '1px solid #bfdbfe',
                },
              },
              'Giảng viên (TA)',
            ),
          )
        : h(
            'div',
            { style: { color: '#64748b', fontSize: '13px' } },
            'Chưa có thông tin giảng viên.',
          ),
    ),
    // 2. Classmate Roster Card with Search Filter
    h(
      Card,
      { title: `👥 Danh sách sinh viên trong lớp (${filteredStudents.length}/${students.length})` },
      h(
        'div',
        { style: { marginBottom: '14px', maxWidth: '360px' } },
        h(Input, {
          placeholder: '🔍 Tìm kiếm theo tên hoặc username...',
          value: search,
          onChange: (e) => setSearch(e.target.value),
          style: { fontSize: '13px', padding: '7px 12px' },
        }),
      ),
      filteredStudents.length === 0
        ? h(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '32px 16px',
                color: '#64748b',
                fontSize: '13px',
              },
            },
            query
              ? 'Không tìm thấy sinh viên nào phù hợp với từ khóa.'
              : 'Lớp học chưa có sinh viên nào.',
          )
        : h(
            'div',
            { style: { overflowX: 'auto' } },
            h(
              'table',
              {
                style: {
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13px',
                },
              },
              h(
                'thead',
                null,
                h(
                  'tr',
                  { style: { borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' } },
                  th('STT', '50px'),
                  th('Sinh viên'),
                  th('Tài khoản'),
                  th('Vai trò'),
                  th('Trạng thái', '120px'),
                ),
              ),
              h(
                'tbody',
                null,
                filteredStudents.map((s, idx) =>
                  h(StudentClassRosterRow, {
                    key: s.id || s.username || idx,
                    student: s,
                    index: idx,
                  }),
                ),
              ),
            ),
          ),
    ),
  );
}

function th(text, width) {
  return h(
    'th',
    {
      style: {
        padding: '10px 12px',
        fontWeight: '600',
        color: '#475569',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        width: width || 'auto',
      },
    },
    text,
  );
}
