import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { useMyClass } from '../hooks/index.js';
import { ClassStudentTable } from './ClassStudentTable.js';

export function StudentClassroomBanner({ classId }) {
  const [showRoster, setShowRoster] = useState(false);
  const { classroom, loading } = useMyClass(classId);

  if (!classId) return null;

  const className = classroom?.name || `Class ${classId}`;
  const teachers = classroom?.teachers || [];
  const teacherText =
    teachers.length > 0
      ? teachers.map((t) => `${t.name} (@${t.username})`).join(', ')
      : 'Đang cập nhật';
  const studentCount = classroom?.studentCount ?? (classroom?.students ? classroom.students.length : 0);

  return h(
    Card,
    {
      style: {
        marginBottom: '20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        h(
          'div',
          {
            style: {
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              border: '1px solid #bfdbfe',
            },
          },
          '🏫',
        ),
        h(
          'div',
          null,
          h(
            'div',
            { style: { fontSize: '16px', fontWeight: '800', color: '#0f172a' } },
            `Lớp Học Của Bạn: ${className}`,
          ),
          h(
            'div',
            { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
            h('span', { style: { fontWeight: '600', color: '#334155' } }, 'Giảng viên phụ trách: '),
            teacherText,
          ),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h(
          'span',
          {
            style: {
              fontSize: '12.5px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            },
          },
          `👥 Sĩ số: ${studentCount} Sinh viên`,
        ),
        classroom?.students &&
          classroom.students.length > 0 &&
          h(
            'button',
            {
              type: 'button',
              onClick: () => setShowRoster(!showRoster),
              style: {
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              },
            },
            showRoster ? '▲ Ẩn danh sách bạn cùng lớp' : '👥 Xem bạn cùng lớp',
          ),
      ),
    ),
    showRoster &&
      classroom?.students &&
      h(
        'div',
        { style: { marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' } },
        h(ClassStudentTable, {
          classStudents: classroom.students,
          onRemove: null, // Students cannot remove classmates
        }),
      ),
  );
}
