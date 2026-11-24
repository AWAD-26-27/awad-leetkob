import { h, useState } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function AssignStudentForm({
  candidateStudents,
  onAssign,
  onRefresh,
  assigning,
  loading,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedStudentId) return;
    const ok = await onAssign(selectedStudentId);
    if (ok) setSelectedStudentId('');
  };

  return h(
    'form',
    {
      onSubmit: handleSubmit,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
      },
    },
    h(
      'span',
      { style: { fontSize: '13px', fontWeight: '600', color: '#334155' } },
      'Thêm sinh viên vào lớp:',
    ),
    h(
      'select',
      {
        value: selectedStudentId,
        onChange: (e) => setSelectedStudentId(e.target.value),
        style: {
          flex: 1,
          minWidth: '220px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          backgroundColor: '#ffffff',
        },
      },
      h('option', { value: '' }, '-- Chọn sinh viên để gán vào lớp --'),
      candidateStudents.map((s) =>
        h(
          'option',
          { key: s.id, value: s.id },
          `${s.name} (@${s.username}) ${s.classId ? `[Đang ở: ${s.className || `Class ${s.classId}`}]` : '[Chưa có lớp]'}`,
        ),
      ),
    ),
    h(
      Button,
      {
        type: 'submit',
        variant: 'primary',
        disabled: assigning || !selectedStudentId,
        size: 'sm',
      },
      assigning ? 'Đang thêm...' : '+ Thêm vào lớp',
    ),
    h(
      Button,
      {
        type: 'button',
        variant: 'secondary',
        onClick: onRefresh,
        disabled: loading,
        size: 'sm',
      },
      '🔄 Làm mới',
    ),
  );
}
