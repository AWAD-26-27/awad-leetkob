import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { useClassStudents } from '../hooks/index.js';
import { AssignStudentForm } from './AssignStudentForm.js';
import { ClassStudentTable } from './ClassStudentTable.js';

export function ClassStudentRoster({ classId, className }) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    classStudents,
    allStudents,
    loading,
    assigning,
    loadStudents,
    handleAssignStudent,
    handleRemoveStudent,
  } = useClassStudents(classId);

  if (!classId) {
    return h(
      Card,
      { style: { marginBottom: '24px', borderLeft: '4px solid #f59e0b' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('span', { style: { fontSize: '20px' } }, '⚠️'),
        h(
          'div',
          null,
          h('div', { style: { fontWeight: '700', fontSize: '14px', color: '#92400e' } }, 'Chưa Phân Công Lớp Học'),
          h(
            'div',
            { style: { fontSize: '13px', color: '#b45309' } },
            'Tài khoản Giảng viên của bạn chưa được Admin phân công phụ trách lớp học nào. Vui lòng liên hệ Admin.',
          ),
        ),
      ),
    );
  }

  const candidateStudents = allStudents.filter((s) => s.classId !== classId);

  return h(
    Card,
    { style: { marginBottom: '24px' } },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isOpen ? '1px solid #f1f5f9' : 'none',
          paddingBottom: isOpen ? '14px' : '0',
          marginBottom: isOpen ? '16px' : '0',
          cursor: 'pointer',
        },
        onClick: () => setIsOpen(!isOpen),
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('span', { style: { fontSize: '18px' } }, '👥'),
        h(
          'div',
          null,
          h(
            'h3',
            { style: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' } },
            `Quản Lý Sinh Viên — Lớp Phụ Trách: ${className || `Class ${classId}`}`,
          ),
          h(
            'p',
            { style: { margin: '3px 0 0 0', fontSize: '13.5px', color: '#64748b' } },
            `Hiện có ${classStudents.length} sinh viên đã ghi danh vào lớp.`,
          ),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h(
          'span',
          {
            style: {
              fontSize: '13px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '6px',
              background: '#e0e7ff',
              color: '#3730a3',
            },
          },
          `${classStudents.length} Sinh viên`,
        ),
        h(
          'button',
          {
            type: 'button',
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#64748b',
            },
          },
          isOpen ? '▲ Thu gọn' : '▼ Mở rộng',
        ),
      ),
    ),
    isOpen &&
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        h(AssignStudentForm, {
          candidateStudents,
          onAssign: handleAssignStudent,
          onRefresh: loadStudents,
          assigning,
          loading,
        }),
        h(ClassStudentTable, {
          classStudents,
          onRemove: handleRemoveStudent,
        }),
      ),
  );
}
