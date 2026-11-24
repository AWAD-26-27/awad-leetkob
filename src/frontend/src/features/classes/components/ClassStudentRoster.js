import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { useClassStudents } from '../hooks/index.js';
import { AssignStudentForm } from './AssignStudentForm.js';
import { ClassStudentTable } from './ClassStudentTable.js';

export function ClassStudentRoster({ classId, className, onRosterChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const {
    classStudents,
    filteredStudents,
    allStudents,
    loading,
    assigning,
    searchQuery,
    setSearchQuery,
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

  // Safe numerical comparison so string vs number type mismatches are impossible
  const targetId = Number(classId);
  const candidateStudents = allStudents.filter((s) => Number(s.classId) !== targetId);

  const onAssignWrapper = async (studentId) => {
    const ok = await handleAssignStudent(studentId);
    if (ok && onRosterChange) onRosterChange();
    return ok;
  };

  const onRemoveWrapper = async (studentId, studentName) => {
    const ok = await handleRemoveStudent(studentId, studentName);
    if (ok && onRosterChange) onRosterChange();
    return ok;
  };

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
            { style: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' } },
            `Quản Lý Sinh Viên — Lớp Phụ Trách: ${className || `Class ${classId}`}`,
          ),
          h(
            'p',
            { style: { margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' } },
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
              fontSize: '12px',
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
              fontSize: '13px',
              color: '#64748b',
              fontWeight: '600',
            },
          },
          isOpen ? '▲ Thu gọn' : '▼ Mở rộng',
        ),
      ),
    ),
    isOpen &&
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h(AssignStudentForm, {
          candidateStudents,
          onAssign: onAssignWrapper,
          onRefresh: loadStudents,
          assigning,
          loading,
        }),
        classStudents.length > 3 &&
          h('input', {
            type: 'text',
            placeholder: '🔍 Tìm kiếm sinh viên theo tên hoặc username...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            style: {
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
            },
          }),
        h(ClassStudentTable, {
          classStudents: filteredStudents,
          onRemove: onRemoveWrapper,
        }),
      ),
  );
}
