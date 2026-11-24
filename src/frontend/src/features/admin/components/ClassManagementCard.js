import { h, useState } from '../../../lib/react.js';
import { Card, Button } from '../../../components/ui/index.js';
import { ClassItemRow } from './ClassItemRow.js';
import { PlusIcon } from './AdminIcons.js';

export function ClassManagementCard({
  classes,
  teachers,
  allStudents = [],
  selectedTeachers,
  onSelectTeacher,
  onCreateClass,
  onAssignTeacher,
  onRemoveTeacher,
  onAssignStudent,
  onRemoveStudent,
  onRosterChange,
}) {
  const [newClassName, setNewClassName] = useState('');
  const [creatingClass, setCreatingClass] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newClassName.trim()) return;
    setCreatingClass(true);
    const ok = await onCreateClass(newClassName);
    if (ok) setNewClassName('');
    setCreatingClass(false);
  };

  return h(
    Card,
    null,
    h(
      'div',
      {
        style: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        },
      },
      h(
        'div',
        null,
        h(
          'h2',
          {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#0f172a',
            },
          },
          'Danh sách lớp học',
        ),
        h(
          'p',
          { style: { margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' } },
          'Tạo mới lớp học, phân công giảng viên và quản lý danh sách sinh viên ghi danh.',
        ),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            background: '#f1f5f9',
            padding: '2px 9px',
            borderRadius: '9999px',
          },
        },
        `${classes.length} lớp học`,
      ),
    ),
    h(
      'form',
      {
        onSubmit: handleSubmit,
        style: {
          display: 'flex',
          gap: '8px',
          marginBottom: '18px',
          backgroundColor: '#f8fafc',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        },
      },
      h('input', {
        type: 'text',
        placeholder: 'Nhập tên lớp học mới (vd: Lớp C++ 01, CS103...)',
        value: newClassName,
        onChange: (e) => setNewClassName(e.target.value),
        style: {
          flex: 1,
          padding: '7px 12px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          outline: 'none',
          backgroundColor: '#ffffff',
        },
      }),
      h(
        Button,
        {
          type: 'submit',
          variant: 'primary',
          size: 'sm',
          disabled: creatingClass,
          style: {
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
          },
        },
        h(PlusIcon, { size: 13 }),
        creatingClass ? 'Đang tạo...' : 'Tạo lớp',
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      classes.map((cls) =>
        h(ClassItemRow, {
          key: cls.id,
          cls,
          teachers,
          allStudents,
          selectedTeacherId: selectedTeachers[cls.id],
          onSelectTeacher,
          onAssignTeacher,
          onRemoveTeacher,
          onAssignStudent,
          onRemoveStudent,
          onRosterChange,
        }),
      ),
    ),
  );
}
