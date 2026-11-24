import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function ClassItemRow({
  cls,
  teachers,
  selectedTeacherId,
  onSelectTeacher,
  onAssignTeacher,
}) {
  const assignedTeacher = cls.teachers && cls.teachers.length > 0 ? cls.teachers[0] : null;

  return h(
    'div',
    {
      key: cls.id,
      style: {
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      },
    },
    h(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h(
        'div',
        null,
        h('span', { style: { fontWeight: '700', fontSize: '15px', color: '#0f172a' } }, cls.name),
        h('span', { style: { fontSize: '12px', color: '#64748b', marginLeft: '8px' } }, `(ID: ${cls.id})`),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '9999px',
            background: '#f1f5f9',
            color: '#475569',
            fontWeight: '600',
          },
        },
        `👥 ${cls.studentCount || 0} Sinh viên`,
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '6px',
          borderTop: '1px dashed #f1f5f9',
        },
      },
      h(
        'span',
        { style: { fontSize: '12px', fontWeight: '600', color: '#475569', minWidth: '95px' } },
        'Giảng viên:',
      ),
      assignedTeacher
        ? h(
            'span',
            {
              style: {
                fontSize: '12px',
                fontWeight: '700',
                color: '#2563eb',
                background: '#eff6ff',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
              },
            },
            `👨‍🏫 ${assignedTeacher.name} (@${assignedTeacher.username})`,
          )
        : h(
            'span',
            {
              style: {
                fontSize: '12px',
                color: '#dc2626',
                fontWeight: '600',
                background: '#fef2f2',
                padding: '3px 8px',
                borderRadius: '6px',
              },
            },
            'Chưa có giảng viên',
          ),
      h(
        'select',
        {
          value: selectedTeacherId || (assignedTeacher ? assignedTeacher.id : ''),
          onChange: (e) => onSelectTeacher(cls.id, e.target.value),
          style: {
            padding: '5px 8px',
            fontSize: '12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            marginLeft: 'auto',
            maxWidth: '150px',
          },
        },
        h('option', { value: '' }, '-- Chọn GV --'),
        teachers.map((t) =>
          h('option', { key: t.id, value: t.id }, `${t.name} (@${t.username})`),
        ),
      ),
      h(
        Button,
        {
          size: 'sm',
          variant: 'secondary',
          onClick: () => onAssignTeacher(cls.id),
          style: { fontSize: '11px', padding: '4px 10px' },
        },
        'Phân công',
      ),
    ),
  );
}
