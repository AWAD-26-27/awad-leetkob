import { h, useState } from '../../../lib/react.js';
import { Card, Button } from '../../../components/ui/index.js';
import { ClassItemRow } from './ClassItemRow.js';

export function ClassManagementCard({
  classes,
  teachers,
  selectedTeachers,
  onSelectTeacher,
  onCreateClass,
  onAssignTeacher,
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
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'h3',
        {
          style: {
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          },
        },
        '🏫 Quản Lý Lớp Học & Phân Công Giảng Viên',
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            fontWeight: '700',
            color: '#6366f1',
            background: '#eef2ff',
            padding: '2px 8px',
            borderRadius: '6px',
          },
        },
        `${classes.length} Lớp học`,
      ),
    ),
    h(
      'form',
      {
        onSubmit: handleSubmit,
        style: {
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          backgroundColor: '#f8fafc',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        },
      },
      h('input', {
        type: 'text',
        placeholder: 'Tên lớp mới (vd: Class C, CSC13114...)',
        value: newClassName,
        onChange: (e) => setNewClassName(e.target.value),
        style: {
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          outline: 'none',
        },
      }),
      h(
        Button,
        {
          type: 'submit',
          variant: 'primary',
          disabled: creatingClass,
          style: { whiteSpace: 'nowrap' },
        },
        creatingClass ? 'Đang tạo...' : '+ Tạo Lớp',
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      classes.map((cls) =>
        h(ClassItemRow, {
          key: cls.id,
          cls,
          teachers,
          selectedTeacherId: selectedTeachers[cls.id],
          onSelectTeacher,
          onAssignTeacher,
        }),
      ),
    ),
  );
}
